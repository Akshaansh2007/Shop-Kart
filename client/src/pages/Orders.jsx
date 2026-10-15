
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Orders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/orders");

                setOrders(response.data.orders || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load your orders. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(amount);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PLACED":
            case "CONFIRMED":
            case "DELIVERED":
                return "bg-green-100 text-green-700";

            case "SHIPPED":
                return "bg-blue-100 text-blue-700";

            case "PENDING_PAYMENT":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-lg text-gray-600">
                    Loading your orders...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
                <p className="text-red-600 text-center">{error}</p>

                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                    Try Again
                </button>

                <button
                    onClick={() => navigate("/home")}
                    className="text-blue-600 hover:underline"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-5xl">

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Orders
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View your order history and payment details.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/products")}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                    >
                        Continue Shopping
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800">
                            No orders yet
                        </h2>

                        <p className="mt-3 text-gray-600">
                            Your completed orders will appear here.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                        >
                            Explore Products
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="overflow-hidden rounded-2xl bg-white shadow-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-5">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Order ID
                                        </p>

                                        <p className="mt-1 break-all font-semibold text-gray-800">
                                            {order._id}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Order Date
                                        </p>

                                        <p className="mt-1 font-medium text-gray-800">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Status
                                        </p>

                                        <span
                                            className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(order.status)}`}
                                        >
                                            {order.status.replaceAll("_", " ")}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 p-5">
                                    {order.items?.map((item, index) => (
                                        <div
                                            key={`${item.product}-${index}`}
                                            className="flex items-center gap-4"
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-20 w-20 rounded-lg border border-gray-200 object-contain"
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

                                                <p className="mt-1 text-sm text-gray-700">
                                                    {formatPrice(item.price)} each
                                                </p>
                                            </div>

                                            <p className="shrink-0 font-semibold text-gray-800">
                                                {formatPrice(
                                                    item.price * item.quantity
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 p-5">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Payment Status:{" "}
                                            <span className="font-medium text-gray-800">
                                                {order.paymentStatus}
                                            </span>
                                        </p>

                                        <p className="mt-2 text-lg font-bold text-gray-900">
                                            Total: {formatPrice(order.totalAmount)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            navigate(`/orders/${order._id}`)
                                        }
                                        className="rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-600 hover:bg-blue-50"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => navigate("/home")}
                    className="mt-8 text-blue-600 hover:underline"
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default Orders;
