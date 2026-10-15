import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {

    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const getProfile = async () => {
            try {

                const response = await api.get("/customers/me");

                setCustomer(response.data);

            } catch (error) {

                navigate("/login");

            } finally {

                setLoading(false);

            }
        };

        getProfile();

    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600 text-lg">
                    Loading...
                </p>
            </div>
        );
    }

    if (!customer) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">

            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-10">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Welcome, {customer.fullName}! 👋
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Welcome to your ShopKart account.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6">

                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        Your Profile
                    </h3>

                    <div className="space-y-5">

                        <div>
                            <p className="text-sm text-gray-500">
                                Full Name
                            </p>

                            <p className="text-lg font-medium text-gray-900">
                                {customer.fullName}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Email
                            </p>

                            <p className="text-lg font-medium text-gray-900">
                                {customer.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Phone Number
                            </p>

                            <p className="text-lg font-medium text-gray-900">
                                {customer.phone}
                            </p>
                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Home;