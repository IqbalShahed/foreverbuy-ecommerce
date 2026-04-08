import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

const DELIVERY_FEE = Number(process.env.DELIVERY_FEE ?? 10);

const buildValidatedOrderItems = async (items) => {
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
        if (!item?.productId || !item?.size || !Number.isInteger(item.quantity) || item.quantity < 1) {
            const error = new Error("Each order item must include a valid product, size, and quantity.");
            error.statusCode = 400;
            throw error;
        }

        const product = await Product.findById(item.productId).lean();
        if (!product) {
            const error = new Error(`Product not found for item ${item.name || item.productId}`);
            error.statusCode = 404;
            throw error;
        }

        if (!product.sizes.includes(item.size)) {
            const error = new Error(`Size ${item.size} is not available for ${product.name}`);
            error.statusCode = 400;
            throw error;
        }

        validatedItems.push({
            productId: product._id,
            name: product.name,
            size: item.size,
            quantity: item.quantity,
            price: product.price,
        });

        subtotal += product.price * item.quantity;
    }

    return {
        validatedItems,
        totalAmount: subtotal + DELIVERY_FEE,
    };
};

// Place order using COD Method
const placeOrderCOD = async (req, res) => {
    try {
        const userId = req.user._id;
        const { phone, items, address } = req.body;

        // Basic validation
        if (!phone || !items || !Array.isArray(items) || items.length === 0 || !address) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        const { street, city, state, zip, country } = address;
        if (!street || !city || !state || !zip || !country) {
            return res.status(400).json({ success: false, message: "Complete address is required." });
        }

        const { validatedItems, totalAmount } = await buildValidatedOrderItems(items);

        // Create new order
        const newOrder = new Order({
            userId,
            phone,
            items: validatedItems,
            amount: totalAmount,
            address,
            status: "Pending",
            paymentMethod: "CashOnDelivery",
            payment: false
        });

        await newOrder.save();
        await User.findByIdAndUpdate(userId, { cartData: {} }, { new: true });

        return res.status(201).json({ success: true, message: "Order placed successfully with Cash on Delivery." });
    } catch (err) {
        console.error("Error placing COD order:", err);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }
};

// Place order using Stripe Method
const placeOrderStripe = async (req, res) => {
    return res.status(501).json({
        success: false,
        message: "Stripe payments are not configured yet.",
    });
};

// All orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name email")
            .populate("items.productId", "image name");

        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// User Order Data
const userOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find orders by user ID, sorted by most recent first
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .populate("items.productId", "image");

        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// Update order status
const orderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Validate input
        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and status are required." });
        }

        const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate("userId", "name email");

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            order: updatedOrder,
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export { placeOrderCOD, placeOrderStripe, allOrders, userOrders, orderStatus };
