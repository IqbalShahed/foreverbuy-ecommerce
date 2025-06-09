import React, { useMemo } from 'react';
import { useShop } from '../context/ShopContex';
import Title from '../components/Title';
import { assets } from '../assets/frontend_assets/assets';
import CartTotal from '../components/CartTotal';
import { toast } from 'react-toastify';

function Cart() {
    const { products, currency, cartItems, updateQuantity, navigate, getCartAmount } = useShop();
    const cartData = useMemo(() => {
        const result = [];
        for (const productId in cartItems) {
            const sizes = cartItems[productId];
            for (const size in sizes) {
                const quantity = sizes[size];
                if (quantity) {
                    result.push({ _id: productId, size, quantity });
                }
            }
        }
        return result;
    }, [cartItems]);

    return (
        <div className='border-t-2 border-gray-300 pt-14'>
            <div className='text-2xl mb-3'>
                <Title text1='YOUR' text2='CART' />
            </div>
            <div>
                {
                    cartData.map((item) => {
                        const productData = products.find(product => product._id === item._id);
                        return (
                            <div key={`${item._id}-${item.size}`} className='py-4 border-y border-gray-300 text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                                <div className='flex items-start gap-6'>
                                    <img className='w-16 sm:w-20 ' src={productData.image[0]?.url} />
                                    <div className=''>
                                        <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                                        <div className='flex items-center gap-5 mt-2'>
                                            <p>{`${currency} ${productData.price}`}</p>
                                            <p className='px-2 sm:px-3 sm:py-1 border border-gray-300 bg-slate-50'>{item.size}</p>
                                        </div>
                                    </div>
                                </div>
                                <input onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                        updateQuantity(item._id, item.size, val);
                                    }
                                }} type="number" min={1} value={item.quantity} className='border border-gray-300 max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' />
                                <img onClick={() => updateQuantity(item._id, item.size, 0)} src={assets.bin_icon} className='w-4 mr-4 sm:w-5 cursor-pointer' />
                            </div>
                        )
                    })
                }
            </div>
            <div className='flex justify-end my-20'>
                <div className='w-full sm:w-[450px]'>
                    <CartTotal />
                    <div className='w-full text-end'>
                        <button onClick={() => getCartAmount() === 0 ? toast.error('Empty Cart!') : navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;