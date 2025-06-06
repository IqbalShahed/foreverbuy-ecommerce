import React from "react";
import { assets } from "../assets/admin_assets/assets";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { logout } = useAuth();
    return (
        <div className="flex items-center py-2 px-[4%] justify-between">
            <img className="w-[max(10%,80px)]" src={assets.logo} alt="Forever Logo" />
            <button onClick={logout} className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer">Logout</button>
        </div>
    )
};

export default Navbar;