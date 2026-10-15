import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess";
import { CartProvider } from "./context/CartContext";

function App() {
  return (<BrowserRouter> <CartProvider> <Routes>
    <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/home" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetails />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/cart" element={<Cart />} /> 
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/orders/:id" element={<OrderDetails />} />
    <Route path="/order-success" element={<OrderSuccess />} />  </Routes> </CartProvider> </BrowserRouter>
    
  );
}

export default App;
