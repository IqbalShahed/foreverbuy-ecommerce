import React, { useEffect, useState } from "react";
import { useShop } from "../context/ShopContex";
import ProductItem from "./ProductItem";
import Title from "./Title";

const RecommendedProducts = () => {
    const { fetchRecommendations, recommendationVersion } = useShop();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadRecommendations = async () => {
            setLoading(true);
            const items = await fetchRecommendations();
            if (!active) return;

            setProducts(items);
            setLoading(false);
        };

        loadRecommendations();

        return () => {
            active = false;
        };
    }, [fetchRecommendations, recommendationVersion]);

    if (loading) {
        return (
            <section className="my-16">
                <div className="text-center text-3xl py-8">
                    <Title text1="SMART" text2="PICKS FOR YOU" />
                    <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 mt-3">
                        Curated picks based on trending products and your recent activity.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="aspect-[3/4] bg-gray-100 rounded-sm" />
                            <div className="h-4 bg-gray-100 rounded mt-3" />
                            <div className="h-4 bg-gray-100 rounded mt-2 w-1/2" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!products.length) {
        return null;
    }

    return (
        <section className="my-16">
            <div className="text-center text-3xl py-8">
                <Title text1="SMART" text2="PICKS FOR YOU" />
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 mt-3">
                    Curated picks based on trending products and your recent activity.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {products.map((item) => (
                    <ProductItem
                        key={item._id}
                        id={item._id}
                        image={item.image}
                        name={item.name}
                        price={item.price}
                    />
                ))}
            </div>
        </section>
    );
};

export default RecommendedProducts;
