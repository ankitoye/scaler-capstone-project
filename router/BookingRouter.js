const express = require("express");
const BookingRouter = express.Router();
const BookingModel = require("../model/BookingModel");
const { protectRouteMiddleWare } = require("../controller/AuthController");
const Razorpay = require("razorpay");
const UserModel = require("../model/UserModel");
const crypto = require("crypto");

const { PUBLIC_KEY, PRIVATE_KEY, WEBHOOK_SECRET } = process.env;
const razorpayInstance = new Razorpay({
  key_id: PUBLIC_KEY,
  key_secret: PRIVATE_KEY,
});

const initialBookingController = async (req, res) => {
  const userId = req.userId;
  const { priceAtThatTime } = req.body;
  const { productId } = req.params;
  const status = "pending";

  try {
    // Create a booking document
    const bookingObject = await BookingModel.create({
      user: userId,
      product: productId,
      priceAtThatTime,
      status,
    });

    // Update user bookings
    const userObject = await UserModel.findById(userId);
    userObject.bookings.push(bookingObject._id);
    await userObject.save();

    // Initiate the payment
    const amount = bookingObject.priceAtThatTime * 100; // Convert to paise
    const options = {
      amount,
      currency: "INR",
      receipt: bookingObject._id.toString(),
      payment_capture: 1,
    };

    const orderObject = await razorpayInstance.orders.create(options);
    bookingObject.payment_order_id = orderObject.id;
    await bookingObject.save();

    // Send the order to frontend
    res.status(200).json({
      status: "success",
      message: {
        id: orderObject.id,
        currency: orderObject.currency,
        amount: orderObject.amount,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: err.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const allBookings = await BookingModel.find()
      .populate({ path: "user", select: "name email" })
      .populate({ path: "product", select: "name brand productImages" });

    res.status(200).json({
      status: "success",
      message: allBookings,
    });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: err.message,
    });
  }
};

const verifyPaymentController = async (req, res) => {
  try {
    const shasum = crypto.createHmac("sha256", WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const freshSignature = shasum.digest("hex");
    const razorPaySign = req.headers["x-razorpay-signature"];

    if (freshSignature === razorPaySign) {
      const orderId = req.body.payload.payment.entity.order_id;
      const bookingObject = await BookingModel.findOne({ payment_order_id: orderId });

      if (bookingObject) {
        bookingObject.status = "success";
        bookingObject.payment_order_id = undefined;
        await bookingObject.save();

        res.status(200).json({ message: "OK" });
      } else {
        res.status(404).json({ message: "Booking not found" });
      }
    } else {
      res.status(403).json({ message: "Invalid signature" });
    }
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: err.message,
    });
  }
};

BookingRouter.use(protectRouteMiddleWare);

BookingRouter.post("/:productId", initialBookingController);
BookingRouter.post("/verify", verifyPaymentController);
BookingRouter.get("/", getAllBookings);

module.exports = BookingRouter;
