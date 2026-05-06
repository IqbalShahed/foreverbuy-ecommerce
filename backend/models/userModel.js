import mongoose from "mongoose";

const viewedProductSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    viewedAt: { type: Date, default: Date.now }
}, { _id: false });

const searchHistorySchema = new mongoose.Schema({
    query: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    viewedProducts: { type: [viewedProductSchema], default: [] },
    searchHistory: { type: [searchHistorySchema], default: [] },
}, { minimize: false, timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
