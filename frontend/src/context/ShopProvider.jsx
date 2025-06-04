import { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { ShopContext } from "./ShopContex";
import { products } from "../assets/frontend_assets/assets";
import { currency, deliveryFee } from "../config/shopConfig";
import { useNavigate } from "react-router";

const ShopProvider = ({ children }) => {
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const navigate = useNavigate();

    const addToCart = useCallback((itemId, size) => {
        if (!size) {
            toast.error('Select Product Size');
            return;
        }
        setCartItems(prev => {
            const updated = { ...prev };
            if (!updated[itemId]) updated[itemId] = {};
            updated[itemId][size] = (updated[itemId][size] || 0) + 1;
            return updated;
        });
    }, []);

    const getCartCount = useCallback(() => {
        return Object.values(cartItems).reduce(
            (totalCount, sizes) =>
                totalCount + Object.values(sizes).reduce((sum, count) => sum + count, 0),
            0
        );
    }, [cartItems]);

    const updateQuantity = useCallback((itemId, size, quantity) => {
    setCartItems(prev => {
        const updated = { ...prev };
        if (quantity === 0) {
            delete updated[itemId]?.[size];
            if (updated[itemId] && Object.keys(updated[itemId]).length === 0) {
                delete updated[itemId];
            }
        } else {
            if (!updated[itemId]) updated[itemId] = {};
            updated[itemId][size] = quantity;
        }
        return updated;
    });
}, []);

const getCartAmount = useCallback(() => {
    let totalAmount = 0;
    for (const productId in cartItems) {
        const product = products.find(p => p._id === productId);
        if (!product) continue;
        for (const size in cartItems[productId]) {
            const quantity = cartItems[productId][size];
            if (quantity) {
                totalAmount += product.price * quantity;
            }
        }
    }
    return totalAmount;
}, [cartItems]);

    const contextValue = useMemo(() => ({
        products,
        currency,
        deliveryFee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate
    }), [search, showSearch, cartItems, addToCart, getCartCount, updateQuantity, getCartAmount, navigate]);

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopProvider;
