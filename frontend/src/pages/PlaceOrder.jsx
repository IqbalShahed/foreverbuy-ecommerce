import React, { useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/frontend_assets/assets';
import { toast } from 'react-toastify';
import { useShop } from '../context/ShopContex';

function PlaceOrder() {
    const [payemntMethod, setPaymentMethod] = useState('cod');
    const { navigate } = useShop();
    return (
        <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t-2 border-gray-300'>
            {/**Left Side */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl py-3'>
                    <Title text1='DELIVERY' text2='INFORMATION' />
                </div>
                <div className='flex gap-3'>
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='First name' type="text" />
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Last name' type="text" />
                </div>
                <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Email address' type="email" />
                <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Street' type="text" />
                <div className='flex gap-3'>
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='City' type="text" />
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='State' type="text" />
                </div>
                <div className='flex gap-3'>
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Zipcode' type="number" />
                    <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Country' type="text" />
                </div>
                <input className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Phone number' type="number" />
            </div>
            {/** Right Side */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>
                <div className='mt-12'>
                    <Title text1='PAYMENT' text2='METHOD' />
                    <div className='flex flex-col gap-3 lg:flex-row'>
                        <div onClick={() => toast.warning('Cash on delivey only')} className='flex items-center gap-3 border border-gray-300 p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${payemntMethod === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} />
                        </div>
                        <div onClick={() => setPaymentMethod('cod')} className='flex items-center gap-3 border border-gray-300 p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${payemntMethod === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button onClick={()=> navigate('orders')} className='bg-black text-white px-16 py-3 text-sm cursor-pointer'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlaceOrder;