import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    useEffect(() => {

    const checkLogin = async () => {
        try {

            await api.get("/customers/me");

            navigate("/home");

        } catch (error) {

            // User is not logged in
        }
    };

    checkLogin();

}, [navigate]);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Email and password are required");
            return;
        }

        try {

            await api.post("/customers/login", formData);

            navigate("/home");

        } catch (error) {

            setError(
                error.response?.data?.message || "Invalid Credentials"
            );

        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-gray-900">
                        ShopKart
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Welcome back
                    </p>

                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Login
                    </button>

                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Create Account
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;