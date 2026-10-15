
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { cartCount, fetchCart } = useCart();

    const [loggedIn, setLoggedIn] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                await api.get("/customers/me");
                setLoggedIn(true);

                const wishlistResponse = await api.get("/wishlist");
                setWishlistCount(wishlistResponse.data.count);

                await fetchCart();
            } catch (error) {
                setLoggedIn(false);
                setWishlistCount(0);

                // Clear stale cart data if the session is no longer valid.
                await fetchCart();
            }
        };

        checkLogin();
    }, [location.pathname, fetchCart]);

    useEffect(() => {
        const updateWishlistCount = async () => {
            try {
                const response = await api.get("/wishlist");
                setWishlistCount(response.data.count);
            } catch (error) {
                setWishlistCount(0);
            }
        };

        window.addEventListener("wishlistUpdated", updateWishlistCount);

        return () => {
            window.removeEventListener(
                "wishlistUpdated",
                updateWishlistCount
            );
        };
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/customers/logout");
            await fetchCart();

            setLoggedIn(false);
            setWishlistCount(0);

            navigate("/login");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <h1
                className="text-2xl font-bold cursor-pointer"
                onClick={() => navigate("/home")}
            >
                ShopKart
            </h1>

            <div className="flex items-center gap-4">
                {location.pathname !== "/home" && loggedIn && (
                    <button
                        onClick={() => navigate("/home")}
                        className="hover:text-gray-200"
                    >
                        Home
                    </button>
                )}

                {location.pathname !== "/products" && (
                    <button
                        onClick={() => navigate("/products")}
                        className="hover:text-gray-200"
                    >
                        Products
                    </button>
                )}

                {loggedIn && (
                    <>
                        {location.pathname !== "/wishlist" && (
                            <button
                                onClick={() => navigate("/wishlist")}
                                className="hover:text-gray-200"
                            >
                                ♥ Wishlist ({wishlistCount})
                            </button>
                        )}

                        {location.pathname !== "/orders" &&
                            !location.pathname.startsWith("/orders/") && (
                                <button
                                    onClick={() => navigate("/orders")}
                                    className="hover:text-gray-200"
                                >
                                    My Orders
                                </button>
                            )}

                        <button
                            onClick={() => navigate("/cart")}
                            className="hover:text-gray-200"
                        >
                            🛒 Cart ({cartCount})
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Logout
                        </button>
                    </>
                )}

                {!loggedIn && (
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
