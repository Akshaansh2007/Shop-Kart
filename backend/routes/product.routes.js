import express from "express";
import {
    createProduct,
    getProducts,
    getProduct
} from "../controllers/product.controller.js";

const productRoutes = express.Router();

productRoutes.post("/", createProduct);
productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProduct);

export default productRoutes;