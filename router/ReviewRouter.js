const express = require("express");
const ReviewRouter = express.Router();
const ReviewModel = require("../model/ReviewModel");
const { protectRouteMiddleWare } = require("../controller/AuthController");
const ProductModel = require("../model/ProductModel");

const createReviewController = async function (req, res) {
    try {
        const userId = req.userId;
        const productId = req.params.productId;
        const { review, rating } = req.body;

        const reviewObject = await ReviewModel.create({
            review,
            rating,
            product: productId,
            user: userId
        });

        const productObject = await ProductModel.findById(productId);
        const averageRating = productObject.averageRating;

        if (averageRating) {
            let sum = productObject.averageRating * productObject.reviews.length;
            let finalAvgRating = (sum + reviewObject.rating) / (productObject.reviews.length + 1);
            productObject.averageRating = finalAvgRating;
        } else {
            productObject.averageRating = reviewObject.rating;
        }

        productObject.reviews.push(reviewObject["_id"]);
        await productObject.save();

        res.status(200).json({
            status: "success",
            message: reviewObject
        });

    } catch (err) {
        res.status(500).json({
            status: "failure",
            message: err.message
        });
    }
};

const getAllReviewForAProductController = async function (req, res) {
    // Implementation needed
};

ReviewRouter.post("/:productId", protectRouteMiddleWare, createReviewController);
ReviewRouter.get("/:productId", getAllReviewForAProductController);

module.exports = ReviewRouter;
