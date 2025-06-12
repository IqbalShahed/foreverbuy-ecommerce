import React, { useState } from 'react';
import { assets } from '../assets/frontend_assets/assets';
import { Link, NavLink } from 'react-router';
import { useShop } from '../context/ShopContex';
import { useAuth } from '../context/AuthContext';
const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const { setShowSearch, getCartCount } = useShop();
    const { logout, user, navigate } = useAuth();
    return (
        // Top navigation
        <div className='flex items-center justify-between py-5 font-medium'>
            <Link to='/'><img src={assets.logo} className='w-36' alt="ForeverBuy Logo" /></Link>

            {/* Desktop navigation */}
            <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
                <NavLink to="/" className="flex flex-col items-center gap-1">
                    {({ isActive }) => (
                        <>
                            <p>HOME</p>
                            <hr
                                className={`${isActive ? 'w-2/4 border-none h-[1.5px] bg-gray-700' : 'hidden'}`}
                            />
                        </>
                    )}
                </NavLink>
                <NavLink to="/collection" className="flex flex-col items-center gap-1">
                    {({ isActive }) => (
                        <>
                            <p>COLLECTION</p>
                            <hr
                                className={`${isActive ? 'w-2/4 border-none h-[1.5px] bg-gray-700' : 'hidden'}`}
                            />
                        </>
                    )}
                </NavLink>
                <NavLink to="/about" className="flex flex-col items-center gap-1">
                    {({ isActive }) => (
                        <>
                            <p>ABOUT</p>
                            <hr
                                className={`${isActive ? 'w-2/4 border-none h-[1.5px] bg-gray-700' : 'hidden'}`}
                            />
                        </>
                    )}
                </NavLink>
                <NavLink to="/contact" className="flex flex-col items-center gap-1">
                    {({ isActive }) => (
                        <>
                            <p>CONTACT</p>
                            <hr
                                className={`${isActive ? 'w-2/4 border-none h-[1.5px] bg-gray-700' : 'hidden'}`}
                            />
                        </>
                    )}
                </NavLink>
            </ul>
            {/* Icons - Search, Profile, Cart, Hamburger */}
            <div className='flex items-center gap-6'>
                <img className='w-5 cursor-pointer' onClick={() => {
                    setShowSearch(true);
                    navigate("/collection");
                }} src={assets.search_icon} alt="search icon" />
                <div className='group relative'>
                    <img
                        onClick={() => {
                            if(!user) navigate("/login");
                        }}
                        className='w-5 cursor-pointer'
                        src={assets.profile_icon}
                        alt="profile icon"
                    />
                    {/** Drop down */}
                    {
                        user &&
                            <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                                <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                                    <p className="cursor-pointer hover:text-black">My Profile</p>
                                    <p onClick={()=> navigate("/orders")} className="cursor-pointer hover:text-black">Orders</p>
                                    <p onClick={async () => await logout()} className="cursor-pointer hover:text-black">Logout</p>
                                </div>
                            </div>
                    }
                </div>
                <Link to="/cart" className="relative">
                    <img className='w-5 min-w-5 cursor-pointer' src={assets.cart_icon} alt="cart icon" />
                    <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
                </Link>
                <img onClick={() => setVisible(true)} src={assets.menu_icon} alt="menu icon" className='w-5 cursor-pointer sm:hidden' />
            </div>
            {/** Sidebar menu for small screens */}
            <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className="flex flex-col text-gray-600">
                    <div onClick={() => setVisible(false)} className="flex gap-4 p-3 items-center cursor-pointer">
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border-t' to="/">HOME</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border-t' to="/collection">COLLECTION</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border-t' to='/about'>ABOUT</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
                </div>
            </div>
        </div>
    );
}

export default Navbar;