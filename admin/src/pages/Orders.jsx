import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/admin_assets/assets.js";

const Orders = () => {
    const currency = "$";
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all orders for admin
    const fetchAllOrders = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/order/list`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setOrders(res.data.orders);
            } else {
                toast.error(res.data.message || "Failed to fetch orders.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // Handle order status update
    const statusHandler = async (newStatus, orderId) => {
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/order/status`,
                { orderId, status: newStatus },
                { withCredentials: true }
            );

            if (res.data.success) {
                // Update order status in state
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === orderId ? { ...order, status: newStatus } : order
                    )
                );
                toast.success("Order status updated successfully.");
            } else {
                toast.error(res.data.message || "Failed to update order status.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Something went wrong while updating the order status.");
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    if (loading) return <p className="p-4 text-center text-gray-500">Loading orders...</p>;
    if (!orders.length) return <p className="p-4 text-center text-gray-500">No orders found.</p>;

    return (
        <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Orders</h3>
            <div>
                {orders.map((order) => (
                    <article
                        key={order._id}
                        className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 text-xs sm:text-sm text-gray-700 rounded-md"
                    >
                        <img className="w-12" src={assets.parcel_icon} alt="Parcel Icon" />

                        <div>
                            <div>
                                {order.items.map((item, index) => (
                                    <p className="p-0.5" key={index}>
                                        {item.name} x {item.quantity} <span>{item.size}</span>
                                        {index !== order.items.length - 1 && ","}
                                    </p>
                                ))}
                            </div>
                            <p className="mt-3 mb-2 font-medium">{order.userId?.name}</p>
                            <address className="not-italic">
                                <p>{order.address.street},</p>
                                <p>
                                    {order.address.city}, {order.address.zip}, {order.address.state},{" "}
                                    {order.address.country}
                                </p>
                            </address>
                            <p>{order.phone}</p>
                        </div>

                        <div>
                            <p className="text-sm sm:text-base">Items: {order.items.length}</p>
                            <p className="mt-3">Method: {order.paymentMethod}</p>
                            <p>Payment: {order.payment ? "Done" : "Pending"}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div>
                            <p className="text-sm sm:text-base">
                                {currency} {order.amount}
                            </p>
                        </div>

                        <div>
                            <select
                                value={order.status}
                                onChange={(e) => statusHandler(e.target.value, order._id)}
                                className="p-2 font-semibold border border-gray-300 rounded-md"
                            >
                                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Orders;
