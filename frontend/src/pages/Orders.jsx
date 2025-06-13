import React, { useCallback, useEffect, useState } from 'react';
import { useShop } from '../context/ShopContex';
import { useAuth } from '../context/AuthContext';
import Title from '../components/Title';
import axios from 'axios';

function Orders() {
    const { backendUrl, currency } = useShop();
    const { user } = useAuth();
    const [orderData, setOrderData] = useState([]);

    const loadOrderData = useCallback(async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/order/userOrders`, { withCredentials: true });
            if (res.data.success) {
                let allOrdersItem = [];
                res.data.orders.forEach((order) => {
                    order.items.forEach((item) => {
                        item.status = order.status;
                        item.payment = order.payment;
                        item.paymentMethod = order.paymentMethod;
                        item.date = order.createdAt;
                        allOrdersItem.push(item);
                    });
                });
                setOrderData(allOrdersItem.reverse());
            } else {
                console.log(res.data.message);
            }
        } catch (error) {
            console.error("Error loading order data:", error);
        }
    }, [backendUrl]);

    useEffect(() => {
        if (user) {
            loadOrderData();
        }
    }, [user, loadOrderData]);

    return (
        <div className='border-t-2 border-gray-300 pt-16'>
            <div className='text-2xl'>
                <Title text1='MY' text2='ORDERS' />
            </div>
            <div>
                {orderData?.map((product, index) => (
                    <div key={index} className='py-4 border-y border-gray-300 text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                        <div className='flex items-start gap-6 text-sm'>
                            <img
                                className='w-16 sm:w-20 object-cover border border-gray-200 bg-gray-50'
                                src={product.productId?.image?.[0]?.url || '/no-image.jpg'}
                                alt={product.name}
                            />
                            <div>
                                <p className='sm:text-base font-medium'>{product.name}</p>
                                <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                                    <p>{currency}{product.price.toFixed(2)}</p>
                                    <p>Quantity: {product.quantity}</p>
                                    <p>Size: {product.size}</p>
                                </div>
                                <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(product.date).toLocaleDateString()}</span></p>
                            </div>
                        </div>
                        <div className='flex justify-between md:w-1/2'>
                            <div className='flex items-center gap-2'>
                                <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                                <p className='text-sm md:text-base'>{product.status}</p>
                            </div>
                            <button className='border border-gray-300 px-4 py-2 text-sm font-medium rounded-sm cursor-pointer'>
                                Track Order
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Orders;
