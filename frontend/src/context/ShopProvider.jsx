import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { ShopContext } from "./ShopContex";
import { backendUrl, currency, deliveryFee } from "../config/shopConfig";
import { useNavigate } from "react-router";
import axios from 'axios';
import { useAuth } from "./AuthContext";

const ShopProvider = ({ children }) => {
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const limit = 10;
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const { user } = useAuth();

    // Clear cart when user logs out
    useEffect(() => {
        if (!user) {
            setCartItems({});
        }
    }, [user]);

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

    // Get user cart data from DB
    const userCartData = useCallback(async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/cart/get`, { withCredentials: true });
            setCartItems(res.data.cartData);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || error.message);
        }
    }, []);


    useEffect(() => {
        fetchProducts();
        if (user) {
            userCartData();
        }
    }, [fetchProducts, user, userCartData]);

    const addToCart = useCallback(async (itemId, size) => {
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
        if (user) {
            try {
                await axios.post(
                    `${backendUrl}/api/cart/add`,
                    { itemId, size },
                    { withCredentials: true }
                );
            } catch (error) {
                console.error(error);
                toast.error(error?.response?.data?.message || error.message);
            }
        }
    }, [user]);



    const getCartCount = useCallback(() => {
        return Object.values(cartItems).reduce(
            (totalCount, sizes) =>
                totalCount + Object.values(sizes).reduce((sum, count) => sum + count, 0),
            0
        );
    }, [cartItems]);

    const updateQuantity = useCallback(async (itemId, size, quantity) => {
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
        if (user) {
            try {
                await axios.put(
                    `${backendUrl}/api/cart/update`,
                    { itemId, size, quantity },
                    { withCredentials: true }
                );
            } catch (error) {
                console.error(error);
                toast.error(error?.response?.data?.message || error.message);
            }
        }
    }, [user]);

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
        token,
        setToken,
        setCartItems
    }), [search, showSearch, cartItems, addToCart, getCartCount, updateQuantity, getCartAmount, navigate, products, token, setToken]);

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopProvider;
