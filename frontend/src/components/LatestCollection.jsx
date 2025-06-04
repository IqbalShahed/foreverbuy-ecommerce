import React, { useEffect, useState } from "react";
import { useShop } from '../context/ShopContex';
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
    const { products } = useShop();
    const [latestProducts, setLatestProducts] = useState([]);
    useEffect(() => {
        setLatestProducts(products.slice(0, 10));
    }, [products])

    return (
        <div className="my-10">
            <div className="text-center py-8 text-3xl">
                <Title text1='LATEST' text2='COLLECTION' />
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">Shop the latest collection at ForeverBuy! Find all our newest products in one place. Don't miss out on the freshest arrivals and hottest items.</p>
            </div>

            {/** Rendering Products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {
                    latestProducts.map((item, index)=>(
                        <ProductItem key={index} id={item._id} name={item.name} image={item.image} price={item.price}/>
                    ))
                }
            </div>
        </div>
    )
};

export default LatestCollection;