import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Products() {

    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const productsResponse = await api.get("/products", {
                params: {
                    search: searchQuery,
                    category: category
                }
            });

            setProducts(productsResponse.data.products);

            try {
                const wishlistResponse = await api.get("/wishlist");
                setWishlist(wishlistResponse.data.wishlist);
            } catch (error) {
                setWishlist([]);
            }

        } catch (error) {
            setError("Something went wrong while loading products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, category]);

    const handleSearch = (e) => {
        if (e.key === "Enter") {
            setSearchQuery(search);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="flex justify-center mt-10">
                    <h2 className="text-xl font-semibold">
                        Loading products...
                    </h2>
                </div>
            </div>
        );
    }

    if (error) {
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
                    Products
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-52 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Books">Books</option>
                        <option value="Home">Home</option>
                    </select>

                </div>

                {products.length === 0 ? (
                    <div className="text-center mt-10">
                        <h2 className="text-xl font-semibold">
                            No products found.
                        </h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                isWishlisted={wishlist.some(
                                    (item) => item._id === product._id
                                )}
                            />
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Products;