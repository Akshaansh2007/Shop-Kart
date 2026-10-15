
import mongoose from "mongoose";
import crypto from "crypto";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import razorpay from "../config/razorpay.js";

// POST /orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
    let savedOrder = null;

    try {
        const { shippingAddress } = req.body;

        const requiredFields = [
            "fullName",
            "phone",
            "addressLine1",
            "city",
            "state",
            "pincode"
        ];

        if (
            !shippingAddress ||
            typeof shippingAddress !== "object" ||
            Array.isArray(shippingAddress)
        ) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        // Validate required shipping fields.
        for (const field of requiredFields) {
            if (
                typeof shippingAddress[field] !== "string" ||
                !shippingAddress[field].trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        const phone = shippingAddress.phone.trim();
        const pincode = shippingAddress.pincode.trim();

        if (!/^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid Indian phone number"
            });
        }

        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: "Pincode must contain 6 digits"
            });
        }

        const cleanAddress = {
            fullName: shippingAddress.fullName.trim(),
            phone,
            addressLine1: shippingAddress.addressLine1.trim(),
            city: shippingAddress.city.trim(),
            state: shippingAddress.state.trim(),
            pincode
        };

        // Find the authenticated customer.
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        // Re-fetch products and calculate the total on the server.
        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = await Product.findById(cartItem.product);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart no longer exists"
                });
            }

            if (
                !Number.isInteger(cartItem.quantity) ||
                cartItem.quantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for ${product.name}`
                });
            }

            if (
                !Number.isInteger(product.stock) ||
                product.stock < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid stock for ${product.name}`
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            if (
                !Number.isFinite(product.price) ||
                product.price <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price for ${product.name}`
                });
            }

            // Save a purchase-time snapshot of the product.
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });

            totalAmount += product.price * cartItem.quantity;
        }

        // Round to two decimal places.
        totalAmount = Math.round(
            (totalAmount + Number.EPSILON) * 100
        ) / 100;

        const amountInPaise = Math.round(totalAmount * 100);

        if (
            !Number.isSafeInteger(amountInPaise) ||
            amountInPaise <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order amount"
            });
        }

        // Create the ShopKart order in pending-payment status.
        savedOrder = await Order.create({
            user: customer._id,
            items: orderItems,
            shippingAddress: cleanAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        // Create the corresponding Razorpay order on the backend.
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: savedOrder._id.toString()
        });

        savedOrder.razorpayOrderId = razorpayOrder.id;
        await savedOrder.save();

        return res.status(201).json({
            success: true,
            message: "Payment order created",
            shopKartOrderId: savedOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        // Clean up the pending order if Razorpay order creation fails.
        if (savedOrder) {
            try {
                await Order.findByIdAndDelete(savedOrder._id);
            } catch (cleanupError) {
                console.error("Pending order cleanup failed");
            }
        }

        console.error("Create payment order failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create payment order"
        });
    }
};


// POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
            typeof razorpay_order_id !== "string" ||
            !razorpay_order_id ||
            typeof razorpay_payment_id !== "string" ||
            !razorpay_payment_id ||
            typeof razorpay_signature !== "string" ||
            !/^[a-f0-9]{64}$/i.test(razorpay_signature)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment verification data"
            });
        }

        // Only the owner can verify this order.
        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order ID does not match"
            });
        }

        // Make repeated verification requests safe.
        if (order.paymentStatus === "PAID") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order
            });
        }

        if (
            order.paymentStatus !== "PENDING" ||
            order.status !== "PENDING_PAYMENT"
        ) {
            return res.status(400).json({
                success: false,
                message: "Order is not awaiting payment"
            });
        }

        // Verify the signature using the trusted order ID from MongoDB.
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${order.razorpayOrderId}|${razorpay_payment_id}`
            )
            .digest("hex");

        const expectedBuffer = Buffer.from(
            expectedSignature,
            "hex"
        );

        const receivedBuffer = Buffer.from(
            razorpay_signature,
            "hex"
        );

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(
                expectedBuffer,
                receivedBuffer
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Mark the order as paid only after signature verification.
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;

        await order.save();

        // Clear the database cart after successful verification.
        const customer = await Customer.findById(req.user._id);

        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed",
            order
        });

    } catch (error) {
        console.error("Payment verification failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to verify payment"
        });
    }
};


// GET /orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Get orders failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};


// GET /orders/:id
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order details failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch order details"
        });
    }
};
