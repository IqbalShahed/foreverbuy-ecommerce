import React, { useEffect, useState } from "react";
import Title from "./Title";
import { useShop } from '../context/ShopContex';
import ProductItem from "./ProductItem";

const BestSeller = () => {
    const { products } = useShop();
    const [bestSeller, setBestSeller] = useState([]);

    useEffect(() => {
        const bestProducts = products.filter((item) => (item.bestseller));
        setBestSeller(bestProducts.slice(0, 5))
    }, [products])
    return (
        <div className="my-10">
            <div className="text-center text-3xl py-8">
                <Title text1="BEST" text2="SELLERS"></Title>
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
                    Discover ForeverBuy's most popular products! Shop top-rated best sellers. See what's trending now.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {
                    bestSeller.map((item, index) => (
                        <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                    ))
                }
            </div>
        </div>
    );
};

export default BestSeller;