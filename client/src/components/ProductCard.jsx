import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product, isWishlisted }) {

    const [saving, setSaving] = useState(false);
    const [added, setAdded] = useState(isWishlisted);
    const [error, setError] = useState("");
    const { addToCart, addingProductId } = useCart();
    const [cartError, setCartError] = useState("");

    const handleAddToCart = async () => {
        setCartError("");

        const success = await addToCart(product._id);

        if (!success) {
            setCartError("Unable to add product. Please try again.");
        }
    };

    const handleWishlist = async () => {

        if (saving) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            if (added) {

                await api.delete(`/wishlist/${product._id}`);

                setAdded(false);

            } else {

                await api.post(`/wishlist/${product._id}`);

                setAdded(true);
            }

            window.dispatchEvent(new Event("wishlistUpdated"));

        } catch (error) {

            if (error.response?.status === 409) {
                setAdded(true);
            } else {
                setError("Unable to update wishlist. Please try again.");
            }

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 shadow-sm">

            <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-contain"
            />

            <h2 className="text-xl font-semibold mt-3">
                {product.name}
            </h2>

            <p className="text-gray-600 mt-1">
                {product.category}
            </p>

            <p className="text-lg font-bold mt-2">
                ₹{product.price}
            </p>

            <p className="text-gray-600 mt-1">
                {product.stock} units left
            </p>

            <Link
                to={`/products/${product._id}`}
                className="inline-block mt-3 bg-black text-white px-4 py-2 rounded"
            >
                View Details
            </Link>

            <button
                onClick={handleAddToCart}
                disabled={
                    addingProductId === product._id ||
                    product.stock <= 0
                }
                className="block mt-3 bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
            >
                {addingProductId === product._id
                    ? "Adding..."
                    : product.stock <= 0
                        ? "Out of Stock"
                        : "Add to Cart"}
            </button>

            {cartError && (
                <p className="text-red-500 text-sm mt-2">
                    {cartError}
                </p>
            )}
            <button
                onClick={handleWishlist}
                disabled={saving}
                className="block mt-3 border border-black px-4 py-2 rounded w-full"
            >
                {saving
                    ? "⏳ Updating..."
                    : added
                        ? "♥ Remove from Wishlist"
                        : "♡ Add to Wishlist"
                }
            </button>

            {error && (
                <p className="text-red-500 text-sm mt-2">
                    {error}
                </p>
            )}

        </div>
    );
}

export default ProductCard;