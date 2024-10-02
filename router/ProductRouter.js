const express = require("express");
const ProductRouter = express.Router();
const {
    createProductHandler,

    getProductById,
    deleteProductById,
} = require("../controller/ProductController");
const { checkInput } = require("../controller/middleWares");
const ProductModel = require("../model/ProductModel");
const {
    protectRouteMiddleWare,
    isAuthorizedMiddleWare,
} = require("../controller/AuthController");
/***********products***********/
ProductRouter.post(
    "/",
    checkInput,
    protectRouteMiddleWare,
    isAuthorizedMiddleWare(["Admin", "Seller"]),
    createProductHandler
);
ProductRouter.get("/", getAllProductHandler);
ProductRouter.get("/:productId", getProductById);
ProductRouter.delete(
    "/:productId",
    isAuthorizedMiddleWare(["Admin", "Seller"]),
    deleteProductById
);
module.exports = ProductRouter;

async function getAllProductHandler(req, res) {
    try {
        let query = req.query;
        let selectQuery = query.select;
        let sortQuery = query.sort;

        let queryResPromise = ProductModel.find();

        if (sortQuery) {
            let order = sortQuery.split(" ")[1];
            let sortParam = sortQuery.split(" ")[0];
            if (order == "inc") {
                queryResPromise = queryResPromise.sort(sortParam);
            } else {
                queryResPromise = queryResPromise.sort(-sortParam);
            }
        }
        if (selectQuery) {
            queryPromise = queryResPromise.select(selectQuery);
        }
        const result = await queryResPromise;

        res.status(200).json({
            message: result,
            status: "success",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message,
            status: "failure",
        });
    }
}
