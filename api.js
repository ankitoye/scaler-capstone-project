const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();
const { PORT, DB_PASSWORD, DB_USER } = process.env;

const dbURL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.drcvhxp.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(dbURL)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

const app = express();
const UserRouter = require("./router/UserRouter");
const ProductRouter = require("./router/ProductRouter");
const AuthRouter = require("./router/AuthRouter");
const BookingRouter = require("./router/BookingRouter");
const ReviewRouter = require("./router/ReviewRouter");

const corsConfig = {
    origin: true,
    credentials: true,
};
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", UserRouter);
app.use("/api/product", ProductRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/booking", BookingRouter);
app.use("/api/review", ReviewRouter);

app.use((req, res) => {
    res.status(404).json({
        status: "failure",
        message: "Route not found"
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
