
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        loading,
        error,
        cartCount,
        cartSubtotal,
        fetchCart,
        updateQuantity,
        removeFromCart
    } = useCart();

    const [updatingProductId, setUpdatingProductId] = useState(null);
    const [removingProductId, setRemovingProductId] = useState(null);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleQuantityChange = async (productId, quantity) => {
        setActionError("");
        setUpdatingProductId(productId);

        const success = await updateQuantity(productId, quantity);

        if (!success) {
            setActionError("Unable to update quantity. Please try again.");
        }

        setUpdatingProductId(null);
    };

    const handleRemove = async (productId) => {
        setActionError("");
        setRemovingProductId(productId);

        const success = await removeFromCart(productId);

        if (!success) {
            setActionError("Unable to remove product. Please try again.");
        }

        setRemovingProductId(null);
    };

    const handleCheckout = () => {
        navigate("/checkout");
    };

    return (
        <>
            <Navbar />

            <main className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">
                    My Cart
                </h1>

                {loading ? (
                    <p className="text-gray-600">
                        Loading your cart...
                    </p>
                ) : error ? (
                    <div>
                        <p className="text-red-500 mb-3">
                            Unable to load your cart.
                        </p>

                        <button
                            onClick={fetchCart}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Try Again
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold">
                            Your cart is empty 🛒
                        </h2>

                        <p className="text-gray-600 mt-2">
                            Looks like you haven't added anything yet.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                            className="mt-5 bg-blue-600 text-white px-5 py-2 rounded"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <section className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const product = item.product;

                                if (!product) {
                                    return (
                                        <div
                                            key={item._id || "missing-product"}
                                            className="border rounded-lg p-4"
                                        >
                                            <p className="text-red-500">
                                                This product is no longer available.
                                            </p>
                                        </div>
                                    );
                                }

                                const busy =
                                    updatingProductId === product._id ||
                                    removingProductId === product._id;

                                return (
                                    <div
                                        key={product._id}
                                        className="border rounded-lg p-4 flex flex-col sm:flex-row gap-5"
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full sm:w-36 h-36 object-contain"
                                        />

                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold">
                                                {product.name}
                                            </h2>

                                            <p className="text-gray-600 mt-1">
                                                ₹{formatPrice(product.price)}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {product.stock} units available
                                            </p>

                                            <div className="flex items-center gap-3 mt-4">
                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            product._id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={busy || item.quantity <= 1}
                                                    className="border rounded px-3 py-1 disabled:opacity-40"
                                                >
                                                    −
                                                </button>

                                                <span className="font-semibold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            product._id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    disabled={
                                                        busy ||
                                                        item.quantity >= product.stock
                                                    }
                                                    className="border rounded px-3 py-1 disabled:opacity-40"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleRemove(product._id)
                                                }
                                                disabled={busy}
                                                className="text-red-600 mt-4 hover:underline disabled:opacity-40"
                                            >
                                                {removingProductId === product._id
                                                    ? "Removing..."
                                                    : "Remove"}
                                            </button>

                                            {Number(item.quantity) > Number(product.stock) && (
                                                <p className="text-red-600 text-sm font-semibold mt-2">
                                                    ⚠️ Only {product.stock} unit(s)
                                                    currently available. Please reduce
                                                    your quantity.
                                                </p>
                                            )}
                                        </div>

                                        <div className="font-bold text-lg sm:text-right">
                                            ₹{formatPrice(
                                                product.price * item.quantity
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </section>

                        <aside className="border rounded-lg p-5 h-fit">
                            <h2 className="text-xl font-bold mb-5">
                                Order Summary
                            </h2>

                            <div className="flex justify-between mb-3">
                                <span>Items</span>
                                <span>{cartCount}</span>
                            </div>

                            <div className="flex justify-between mb-4">
                                <span>Subtotal</span>
                                <span className="font-semibold">
                                    ₹{formatPrice(cartSubtotal)}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 mb-4">
                                Your final order amount will be calculated
                                using current product prices during checkout.
                            </p>

                            <button
                                onClick={handleCheckout}
                                disabled={
                                    cartItems.length === 0 ||
                                    cartItems.some(
                                        (item) =>
                                            !item.product ||
                                            item.quantity > item.product.stock
                                    )
                                }
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Proceed to Checkout
                            </button>
                        </aside>
                    </div>
                )}

                {actionError && (
                    <p className="text-red-500 mt-5">
                        {actionError}
                    </p>
                )}
            </main>
        </>
    );
}

export default Cart;
