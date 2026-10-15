
import { useLocation, useNavigate } from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-5xl text-green-600">✓</span>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Order Placed Successfully!
        </h1>

        <p className="mb-6 text-gray-600">
          Thank you for shopping with ShopKart. Your payment has been
          processed and your order is confirmed.
        </p>

        {order && (
          <div className="mb-6 rounded-lg bg-gray-50 p-5 text-left">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Order Details
            </h2>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-900">
                  Order ID:
                </span>{" "}
                {order._id || order.id || "Confirmed"}
              </p>

              <p>
                <span className="font-medium text-gray-900">
                  Payment Status:
                </span>{" "}
                {order.paymentStatus || "PAID"}
              </p>

              <p>
                <span className="font-medium text-gray-900">
                  Total Amount:
                </span>{" "}
                ₹{Number(order.totalAmount || 0).toFixed(2)}
              </p>
            </div>

            {order.items?.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="mb-2 font-medium text-gray-900">
                  Items Ordered
                </h3>

                {order.items.map((item, index) => (
                  <div
                    key={item.product || item._id || index}
                    className="flex justify-between gap-3 py-2 text-sm"
                  >
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/products")}
            className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate("/home")}
            className="flex-1 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
