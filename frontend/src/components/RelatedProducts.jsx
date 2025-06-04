import React, { useEffect, useState } from "react";
import { useShop } from '../context/ShopContex';
import Title from "./Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ category, subcategory }) => {
  const { products } = useShop();
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length) {
      const filtered = products.filter(item =>
        item.category === category && item.subcategory === subcategory
      );
      setRelated(filtered.slice(0, 5));
    }
  }, [products, category, subcategory]);

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1="RELATED" text2="PRODUCTS" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map(item => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
