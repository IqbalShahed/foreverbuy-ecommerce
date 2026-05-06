import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
    const [recommendationVersion, setRecommendationVersion] = useState(0);
    const recommendationCacheRef = useRef(new Map());
    const recommendationRequestRef = useRef(new Map());
    const navigate = useNavigate();
    const { user } = useAuth();

    // Clear cart when user logs out
    useEffect(() => {
        if (!user) {
            setCartItems({});
        }
    }, [user]);

    // Fetch the full product catalogue page by page without triggering a render loop.
    const fetchProducts = useCallback(async () => {
        try {
            let lastId = null;
            let hasMoreProducts = true;
            const allProducts = [];

            while (hasMoreProducts) {
                const res = await axios.get(`${backendUrl}/api/product/list`, {
                    params: {
                        lastId,
                        limit: 50
                    }
                });

                if (!res.data.success) {
                    toast.error(res.data.message);
                    return;
                }

                allProducts.push(...res.data.products);
                hasMoreProducts = res.data.hasMore;
                lastId = res.data.nextCursor;
            }

            setProducts(allProducts);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch products");
        }
    }, []);

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
    }, [fetchProducts]);

    useEffect(() => {
        if (user) {
            userCartData();
        }
    }, [user, userCartData]);

    const addToCart = useCallback(async (itemId, size) => {
        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        const previousCartItems = cartItems;

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
                setCartItems(previousCartItems);
                console.error(error);
                toast.error(error?.response?.data?.message || error.message);
            }
        }
    }, [cartItems, user]);



    const getCartCount = useCallback(() => {
        return Object.values(cartItems).reduce(
            (totalCount, sizes) =>
                totalCount + Object.values(sizes).reduce((sum, count) => sum + count, 0),
            0
        );
    }, [cartItems]);

    const updateQuantity = useCallback(async (itemId, size, quantity) => {
        const previousCartItems = cartItems;

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
                setCartItems(previousCartItems);
                console.error(error);
                toast.error(error?.response?.data?.message || error.message);
            }
        }
    }, [cartItems, user]);

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

    const trackUserActivity = useCallback(async (payload) => {
        if (!user) return;

        try {
            await axios.post(`${backendUrl}/api/ai/activity`, payload, { withCredentials: true });
            recommendationCacheRef.current.clear();
            setRecommendationVersion(version => version + 1);
        } catch (error) {
            console.error("Track activity failed:", error);
        }
    }, [user]);

    const refreshRecommendations = useCallback(() => {
        recommendationCacheRef.current.clear();
        recommendationRequestRef.current.clear();
        setRecommendationVersion(version => version + 1);
    }, []);

    const fetchRecommendations = useCallback(async (message = "") => {
        const normalizedMessage = message.trim().toLowerCase();
        const cacheKey = `${user?._id || "guest"}:${normalizedMessage}`;
        const cachedEntry = recommendationCacheRef.current.get(cacheKey);

        if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
            return cachedEntry.products;
        }

        if (recommendationRequestRef.current.has(cacheKey)) {
            return recommendationRequestRef.current.get(cacheKey);
        }

        const request = (async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/ai/recommendations`, {
                    params: normalizedMessage ? { message: normalizedMessage } : undefined,
                    withCredentials: true,
                });
                const recommendedProducts = res.data.products || [];

                recommendationCacheRef.current.set(cacheKey, {
                    expiresAt: Date.now() + 60 * 1000,
                    products: recommendedProducts,
                });

                return recommendedProducts;
            } catch (error) {
                console.error(error);
                return [];
            } finally {
                recommendationRequestRef.current.delete(cacheKey);
            }
        })();

        recommendationRequestRef.current.set(cacheKey, request);

        try {
            return await request;
        } finally {
            if (recommendationCacheRef.current.size > 20) {
                const oldestKey = recommendationCacheRef.current.keys().next().value;
                recommendationCacheRef.current.delete(oldestKey);
            }
        }
    }, [user]);

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
        setCartItems,
        trackUserActivity,
        fetchRecommendations,
        refreshRecommendations,
        recommendationVersion,
    }), [search, showSearch, cartItems, addToCart, getCartCount, updateQuantity, getCartAmount, navigate, products, trackUserActivity, fetchRecommendations, refreshRecommendations, recommendationVersion]);

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopProvider;
