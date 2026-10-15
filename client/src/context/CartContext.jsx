import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [addingProductId, setAddingProductId] = useState(null);


    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/cart");
            setCartItems(response.data.cart || []);
        } catch (err) {
            if (err.response?.status === 401) {
                setCartItems([]);
            }

            setError(err.response?.data?.message || "Failed to fetch cart");
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = async (productId) => {
        setError("");
        setAddingProductId(productId);

        try {
            const response = await api.post(`/cart/${productId}`);
            setCartItems(response.data.cart || []);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add product");
            return false;
        } finally {
            setAddingProductId(null);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        setError("");

        try {
            const response = await api.patch(`/cart/${productId}`, {
                quantity
            });

            setCartItems(response.data.cart || []);
            return true;
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to update quantity"
            );
            try {
                const response = await api.get("/cart");
                setCartItems(response.data.cart || []);
            } catch (refreshError) {
                console.error("Failed to refresh cart:", refreshError);
            }

            return false;
        }

    };


    const removeFromCart = async (productId) => {
        setError("");

        try {
            const response = await api.delete(`/cart/${productId}`);
            setCartItems(response.data.cart || []);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove product");
            return false;
        }
    };

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartSubtotal = cartItems.reduce(
        (total, item) => total + (item.product?.price || 0) * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                loading,
                error,
                addingProductId,
                cartCount,
                cartSubtotal,
                fetchCart,
                addToCart,
                updateQuantity,
                removeFromCart
            }}
        >
            {children}
        </CartContext.Provider>
    );


};

export const useCart = () => useContext(CartContext);
