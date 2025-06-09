import React from "react";
import { useShop } from '../context/ShopContex';
import { Link } from "react-router";

const ProductItem = ({ id, image, name, price }) => {
    const { currency } = useShop();
    return (
        <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
            <div className="overflow-hidden">
                <img className="hover:scale-110 transition ease-in-out" src={image[0].url} alt={name} />
                <p className="text-sm pt-3 pb-1">{name}</p>
                <p className="text-sm font-medium">{currency}{price}</p>
            </div>
        </Link>
    )
};

export default ProductItem;