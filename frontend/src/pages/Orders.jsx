import React from 'react';
import { useShop } from '../context/ShopContex';
import Title from '../components/Title';

function Orders() {
    const {products, currency} = useShop();
    return (
        <div className='border-t-2 border-gray-300 pt-16'>
            <div className='text-2xl'>
                <Title text1='MY' text2='ORDERS' />
            </div>
            <div>
                {
                    products.slice(1, 4).map((product) => (
                        <div key={product._id} className='py-4 border-y border-gray-300 text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                            <div className='flex items-start gap-6 text-sm'>
                                <img className='w-16 sm:w-20' src={product.image?.[0] || ''} />
                                <div>
                                    <p className='sm:text-base font-medium'>{product.name}</p>
                                    <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                                        <p className='text-lg'>{currency}{product.price.toFixed(2)}</p>
                                        <p>Quantity: 1</p>
                                        <p>Size: M</p>
                                    </div>
                                    <p className='mt-2'>Date: <span className='text-gray-400'>25 Juty, 2025</span></p>
                                </div>
                            </div>
                            <div className='flex justify-between md:w-1/2'>
                                <div className='flex items-center gap-2'>
                                    <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                                    <p className='text-sm md:text-base'>Ready to ship</p>
                                </div>
                                <button className='border border-gray-300 px-4 py-2 text-sm font-medium rounded-sm cursor-pointer'>Track Order</button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default Orders;