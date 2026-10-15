import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /cart/:productId
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const customer = await Customer.findById(req.user._id);

        const cartItem = customer.cart.find(
            item => item.product.toString() === productId
        );

        if (product.stock < 1) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock"
            });
        }

        if (cartItem) {
            if (cartItem.quantity >= product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Requested quantity exceeds available stock"
                });
            }

            cartItem.quantity += 1;
        } else {
            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(req.user._id)
            .populate("cart.product", "name price category image stock");

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add product to cart"
        });
    }

};

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id)
            .populate("cart.product", "name price category image stock");

        return res.status(200).json({
            success: true,
            cart: customer.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart"
        });
    }


};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;


        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be an integer greater than or equal to 1"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        const customer = await Customer.findById(req.user._id);

        const cartItem = customer.cart.find(
            item => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart"
            });
        }

        cartItem.quantity = quantity;

        await customer.save();

        const updatedCustomer = await Customer.findById(req.user._id)
            .populate("cart.product", "name price category image stock");

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update cart quantity"
        });
    }

};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;


        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const customer = await Customer.findById(req.user._id);

        const cartItemExists = customer.cart.some(
            item => item.product.toString() === productId
        );

        if (!cartItemExists) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart"
            });
        }

        customer.cart = customer.cart.filter(
            item => item.product.toString() !== productId
        );

        await customer.save();

        const updatedCustomer = await Customer.findById(req.user._id)
            .populate("cart.product", "name price category image stock");

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: updatedCustomer.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to remove product from cart"
        });
    }


};
