import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Wishlist() {

    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchWishlist = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/wishlist");

                setWishlist(response.data.wishlist);

            } catch (error) {

                if (error.response?.status === 401) {
                    navigate("/login");
                    return;
                }

                setError("Something went wrong while loading your wishlist.");

            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();

    }, [navigate]);

    const handleRemove = async (productId) => {
        try {
            setError("");

            await api.delete(`/wishlist/${productId}`);

            setWishlist((currentWishlist) =>
                currentWishlist.filter(
                    (product) => product._id !== productId
                )
            );

        } catch (error) {

            if (error.response?.status === 401) {
                navigate("/login");
                return;
            }

            setError("Unable to remove product from wishlist.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex justify-center mt-10">
                    <h2 className="text-xl font-semibold">
                        Loading wishlist...
                    </h2>
                </div>

            </div>
        );
    }

    if (error && wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex justify-center mt-10">
                    <h2 className="text-red-500 text-xl">
                        {error}
                    </h2>
                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">

            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">

                <h1 className="text-3xl font-bold mb-6">
                    My Wishlist ({wishlist.length})
                </h1>

                {error && (
                    <p className="text-red-500 mb-4">
                        {error}
                    </p>
                )}

                {wishlist.length === 0 ? (
                    <div className="text-center mt-10">
                        <h2 className="text-xl font-semibold">
                            Your wishlist is empty.
                        </h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {wishlist.map((product) => (
                            <div
                                key={product._id}
                                className="border rounded-lg p-4 shadow-sm bg-white"
                            >

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
                                    state={{ from: "wishlist" }}
                                    className="block mt-4 w-full bg-black text-white text-center px-4 py-2 rounded hover:bg-gray-800"
                                >
                                    View Details
                                </Link>
                                <button
                                    onClick={() => handleRemove(product._id)}
                                    className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Remove from Wishlist
                                </button>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Wishlist;