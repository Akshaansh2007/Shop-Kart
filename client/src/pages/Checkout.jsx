
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
}

function Checkout() {
    const navigate = useNavigate();

    const {
        cartItems,
        cartSubtotal,
        fetchCart
    } = useCart();

    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch the logged-in customer's profile
    useEffect(() => {
        const fetchCustomerInfo = async () => {
            try {
                const response = await api.get("/customers/me");

                const customer =
                    response.data.customer ||
                    response.data.user ||
                    response.data;

                setShippingAddress((previous) => ({
                    ...previous,
                    fullName: customer.fullName || previous.fullName,
                    phone: customer.phone || previous.phone
                }));
            } catch (err) {
                console.error(
                    "Unable to load customer information:",
                    err
                );
            } finally {
                setProfileLoading(false);
            }
        };

        fetchCustomerInfo();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setShippingAddress((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleCheckout = async (event) => {
        event.preventDefault();
        setError("");

        if (profileLoading) {
            setError("Please wait while your profile loads.");
            return;
        }

        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        setLoading(true);

        try {
            // 1. Load Razorpay Checkout
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                setError(
                    "Unable to load Razorpay checkout. Please try again."
                );
                setLoading(false);
                return;
            }

            // 2. Create the order on our backend
            const response = await api.post(
                "/orders/create-payment-order",
                { shippingAddress }
            );

            const {
                shopKartOrderId,
                razorpayOrderId,
                amount,
                currency,
                key
            } = response.data;

            // 3. Configure Razorpay Checkout
            const options = {
                key,
                amount,
                currency,
                name: "ShopKart",
                description: "Purchase from ShopKart",
                order_id: razorpayOrderId,

                // Prefill customer's details in Razorpay
                prefill: {
                    name: shippingAddress.fullName.trim(),
                    contact: shippingAddress.phone.trim()
                },

                handler: async (paymentResponse) => {
                    try {
                        // 4. Verify payment on our backend
                        const verification = await api.post(
                            "/orders/verify-payment",
                            {
                                shopKartOrderId,
                                razorpay_order_id:
                                    paymentResponse.razorpay_order_id,
                                razorpay_payment_id:
                                    paymentResponse.razorpay_payment_id,
                                razorpay_signature:
                                    paymentResponse.razorpay_signature
                            }
                        );

                        if (verification.data.success) {
                            // Refresh cart after verified payment
                            await fetchCart();

                            // Navigate to the success page
                            navigate("/order-success", {
                                state: {
                                    order: verification.data.order
                                }
                            });
                        } else {
                            setError(
                                "Payment verification was unsuccessful."
                            );
                        }
                    } catch (verificationError) {
                        setError(
                            verificationError.response?.data?.message ||
                            "Payment verification failed. Check your order before retrying."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                },

                theme: {
                    color: "#2563eb"
                }
            };

            // 5. Open Razorpay Checkout
            const paymentObject = new window.Razorpay(options);

            paymentObject.on("payment.failed", (failure) => {
                setError(
                    failure.error?.description ||
                    "Payment failed. Please try again."
                );

                setLoading(false);
            });

            paymentObject.open();
        } catch (checkoutError) {
            setError(
                checkoutError.response?.data?.message ||
                "Unable to start checkout. Please try again."
            );

            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-10">
            <div className="mx-auto max-w-6xl">
                <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    ← Back to Cart
                </button>

                <h1 className="mb-8 text-3xl font-bold text-gray-900">
                    Checkout
                </h1>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleCheckout}>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="mb-5 text-xl font-semibold text-gray-900">
                                    Shipping Address
                                </h2>

                                {profileLoading && (
                                    <p className="mb-4 text-sm text-gray-500">
                                        Loading your profile...
                                    </p>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {[
                                        ["fullName", "Full Name"],
                                        ["phone", "Phone Number"],
                                        ["addressLine1", "Address"],
                                        ["city", "City"],
                                        ["state", "State"],
                                        ["pincode", "PIN Code"]
                                    ].map(([field, label]) => (
                                        <div
                                            key={field}
                                            className="flex flex-col gap-2"
                                        >
                                            <label
                                                htmlFor={field}
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                {label}
                                            </label>

                                            <input
                                                id={field}
                                                name={field}
                                                type="text"
                                                required
                                                value={shippingAddress[field]}
                                                onChange={handleChange}
                                                placeholder={`Enter ${label.toLowerCase()}`}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                                    Payment
                                </h2>

                                <p className="text-sm text-gray-600">
                                    You'll be redirected to Razorpay's secure
                                    checkout to complete your payment.
                                </p>
                            </div>
                        </div>

                        <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-xl font-semibold text-gray-900">
                                Order Summary
                            </h2>

                            <div className="mb-4 space-y-4">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.product?._id}
                                        className="flex justify-between gap-4 text-sm"
                                    >
                                        <span className="text-gray-600">
                                            {item.product?.name || "Product"} ×{" "}
                                            {item.quantity}
                                        </span>

                                        <span className="font-medium text-gray-900">
                                            ₹
                                            {(
                                                (item.product?.price || 0) *
                                                item.quantity
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹{cartSubtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    profileLoading ||
                                    cartItems.length === 0
                                }
                                className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {loading
                                    ? "Processing..."
                                    : profileLoading
                                        ? "Loading Profile..."
                                        : "Proceed to Payment"}
                            </button>

                            <p className="mt-3 text-center text-xs text-gray-500">
                                Payment is handled securely by Razorpay.
                            </p>
                        </aside>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Checkout;
