import express from "express";

import {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} from "../controllers/wishlist.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const wishlistRoutes = express.Router();

wishlistRoutes.post("/:productId", authMiddleware, addToWishlist);

wishlistRoutes.get("/", authMiddleware, getWishlist);

wishlistRoutes.delete("/:productId", authMiddleware, removeFromWishlist);

export default wishlistRoutes;

