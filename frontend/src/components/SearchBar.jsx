import React, { useEffect, useState } from "react";
import { useShop } from '../context/ShopContex';
import { assets } from "../assets/frontend_assets/assets";
import { useLocation } from "react-router";

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch } = useShop();
    const [visible, setVisible] = useState(false);
    const location = useLocation();
    useEffect(() => {
        if(location.pathname.includes('collection')){
            setVisible(true);
        }
        else{
            setVisible(false);
        }
    }, [location])

    return showSearch && visible && (
        <div className="bordert-t border-b bg-gray-50 text-center">
            <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2 ">
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none bg-inherit text-sm" type="text" placeholder="Search" />
                <img className="w-4 cursor-pointer" src={assets.search_icon} alt="Search Icon" />
            </div>
            <img onClick={() => setShowSearch(false)} className="inline w-3 cursor-pointer" src={assets.cross_icon} />
        </div>
    )
}

export default SearchBar;