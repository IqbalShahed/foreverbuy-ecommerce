import { createContext, useContext } from "react";

export const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);
