import axios from "axios";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";

const List = () => {
    const [products, setProducts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef(null);
    const limit = 10;
    const currency = "$";

    const fetchProducts = useCallback(async () => {
        if (!hasMore || loading) return;
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }, [nextCursor, hasMore, loading]);

    const removeProduct = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/product/remove/${id}`, {
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setProducts(prev => prev.filter(p => p._id !== id));
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const lastProductRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchProducts();
            }
        });

        if (node) observer.current.observe(node);
    }, [fetchProducts, hasMore, loading]);

    return (
        <>
            <p className="mb-2">All Products List</p>
            <div className="flex flex-col gap-2">
                <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border border-gray-200 bg-gray-100 text-sm">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b>Price</b>
                    <b className="text-center">Action</b>
                </div>

                {products.map((product, index) => {
                    const isLast = index === products.length - 1;
                    return (
                        <div
                            key={product._id}
                            ref={isLast ? lastProductRef : null}
                            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border border-gray-200 text-sm"
                        >
                            <img className="w-12" src={product.image[0]?.url} alt={product.name} />
                            <p>{product.name}</p>
                            <p>{product.category}</p>
                            <p>{currency + product.price}</p>
                            <p
                                onClick={() => removeProduct(product._id)}
                                className="text-right md:text-center cursor-pointer text-lg"
                            >
                                X
                            </p>
                        </div>
                    );
                })}
            </div>

            {loading && <p className="text-center mt-4">Loading...</p>}
            {!loading && products.length === 0 && <p className="text-center mt-4">No products found.</p>}
        </>
    );
};

export default List;
