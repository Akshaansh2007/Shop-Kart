
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/orders/${id}`);
                setOrder(response.data.order);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load this order."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const formatPrice = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(amount);

    const formatDate = (date) =>
        new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-600">Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
                <p className="text-center text-red-600">
                    {error || "Order not found."}
                </p>

                <button
                    onClick={() => navigate("/orders")}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                    Back to My Orders
                </button>
            </div>
        );
    }

    const address = order.shippingAddress || {};

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-4xl">

                <button
                    onClick={() => navigate("/orders")}
                    className="mb-6 text-blue-600 hover:underline"
                >
                    ← Back to My Orders
                </button>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Order Details
                    </h1>

                    <p className="mt-2 break-all text-sm text-gray-500">
                        Order ID: {order._id}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Placed on: {formatDate(order.createdAt)}
                    </p>
                </div>

                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Order Status
                    </h2>

                    <div className="flex flex-wrap gap-3">
                        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                            Order: {order.status?.replaceAll("_", " ")}
                        </span>

                        <span
                            className={`rounded-full px-4 py-2 text-sm font-medium ${
                                order.paymentStatus === "PAID"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                            Payment: {order.paymentStatus}
                        </span>
                    </div>
                </div>

                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold text-gray-900">
                        Items Ordered
                    </h2>

                    <div className="space-y-5">
                        {order.items?.map((item, index) => (
                            <div
                                key={`${item.product}-${index}`}
                                className="flex items-center gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                            >
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-20 w-20 rounded-lg border object-contain"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
                                        No image
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-gray-800">
                                        {item.name}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Quantity: {item.quantity}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-600">
                                        {formatPrice(item.price)} each
                                    </p>
                                </div>

                                <p className="shrink-0 font-semibold text-gray-900">
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-5 text-right">
                        <p className="text-sm text-gray-500">
                            Total Amount
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                        </p>
                    </div>
                </div>

                <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Shipping Address
                    </h2>

                    <div className="space-y-2 text-gray-700">
                        <p className="font-semibold">{address.fullName}</p>
                        <p>{address.phone}</p>
                        <p>{address.addressLine1}</p>
                        <p>
                            {[address.city, address.state]
                                .filter(Boolean)
                                .join(", ")}
                        </p>
                        <p>{address.pincode}</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/products")}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default OrderDetails;
