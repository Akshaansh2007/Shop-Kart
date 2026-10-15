import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import api from "../services/api";

function ProductDetails() {

    const { id } = useParams();
    const location = useLocation();

    const fromWishlist = location.state?.from === "wishlist";

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);

                setProduct(response.data);

            } catch (error) {
                setError("Something went wrong while loading the product.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center mt-10">
                <h2 className="text-xl font-semibold">
                    Loading product...
                </h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center mt-10">
                <h2 className="text-red-500 text-xl">
                    {error}
                </h2>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">

            <Link
                to={fromWishlist ? "/wishlist" : "/products"}
                className="text-blue-600 hover:underline"
            >
                {fromWishlist ? "Back to Wishlist" : "Back to Products"}
            </Link>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">

                <div className="border rounded-lg p-6 flex justify-center items-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full max-h-96 object-contain"
                    />
                </div>

                <div>

                    <h1 className="text-4xl font-bold">
                        {product.name}
                    </h1>

                    <p className="text-gray-500 mt-3">
                        {product.category}
                    </p>

                    <p className="text-3xl font-bold mt-6">
                        ₹{product.price}
                    </p>

                    <p className="text-gray-700 mt-6">
                        {product.description}
                    </p>

                    <p className="mt-6 font-semibold">
                        {product.stock} units available
                    </p>

                    <button
                        className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ProductDetails;