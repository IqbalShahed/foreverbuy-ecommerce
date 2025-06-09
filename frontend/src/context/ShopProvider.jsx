import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { ShopContext } from "./ShopContex";
import { backendUrl, currency, deliveryFee } from "../config/shopConfig";
import { useNavigate } from "react-router";
import axios from 'axios';

const ShopProvider = ({ children }) => {
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const limit = 10;
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    // Fetch Products
    const fetchProducts = useCallback(async () => {
        if (!hasMore) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/list`, {
                params: {
                    lastId: nextCursor,
                    limit
                }
            });
            if (res.data.success) {
                setProducts(prev => [...prev, ...res.data.products]);
                setNextCursor(res.data.nextCursor);
                setHasMore(res.data.hasMore);
            } else {
                toast.error(res.data.message);
            }
            
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch products");
        }
    }, [nextCursor, hasMore]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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
    }, [cartItems, products]);

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
        navigate,
        backendUrl,
    }), [search, showSearch, cartItems, addToCart, getCartCount, updateQuantity, getCartAmount, navigate, products]);

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopProvider;
