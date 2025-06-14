import React, { useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/frontend_assets/assets';
import { toast } from 'react-toastify';
import { useShop } from '../context/ShopContex';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function PlaceOrder() {
    const {user} = useAuth();    
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const {
        products,
        deliveryFee,
        cartItems,
        getCartAmount,
        navigate,
        backendUrl,
        setCartItems
    } = useShop();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let orderItems = [];

            for (const productId in cartItems) {
                for (const size in cartItems[productId]) {
                    const quantity = cartItems[productId][size];
                    if (quantity > 0) {
                        const product = products.find(p => p._id === productId);
                        if (product) {
                            orderItems.push({
                                productId: product._id,
                                name: product.name,
                                size,
                                quantity,
                                price: product.price
                            });
                        }
                    }
                }
            }

            const orderPayload = {
                phone: formData.phone,
                items: orderItems,
                amount: getCartAmount() + deliveryFee,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zipcode,
                    country: formData.country
                }
            };

            switch (paymentMethod) {
                case 'cod':
                    {
                        const res = await axios.post(`${backendUrl}/api/order/place-cod`, orderPayload, {
                            withCredentials: true
                        });

                        if (res.data.success) {
                            setCartItems({});
                            navigate("/orders");
                            toast.success(res.data.message);
                        } else {
                            toast.error(res.data.message || "Order failed.");
                        }
                        break;
                    }
                default:
                    toast.error("Please select a valid payment method.");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={onSubmitHandler}
            className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t-2 border-gray-300'
        >
            {/* Left Side */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl py-3'>
                    <Title text1='DELIVERY' text2='INFORMATION' />
                </div>
                {/* <div className='flex gap-3'>
                    <input required name='firstName' value={formData.firstName} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='First name' type="text" />
                    <input required name='lastName' value={formData.lastName} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Last name' type="text" />
                </div> */}
                <input required name='name' value={user?.name || ''} readOnly onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Name' type="name" />
                <input required name='email' value={user?.email || ""} readOnly onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Email address' type="email" />
                <input required name='street' value={formData.street} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Street' type="text" />
                <div className='flex gap-3'>
                    <input required name='city' value={formData.city} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='City' type="text" />
                    <input required name='state' value={formData.state} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='State' type="text" />
                </div>
                <div className='flex gap-3'>
                    <input required name='zipcode' value={formData.zipcode} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Zipcode' type="number" />
                    <input required name='country' value={formData.country} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Country' type="text" />
                </div>
                <input required name='phone' value={formData.phone} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Phone number' type="number" />
            </div>

            {/* Right Side */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1='PAYMENT' text2='METHOD' />
                    <div className='flex flex-col gap-3 lg:flex-row'>
                        <div
                            onClick={() => toast.warning('Cash on delivery only')}
                            className='flex items-center gap-3 border border-gray-300 p-2 px-3 cursor-pointer'
                        >
                            <p className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${paymentMethod === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe Logo" />
                        </div>
                        <div
                            onClick={() => setPaymentMethod('cod')}
                            className='flex items-center gap-3 border border-gray-300 p-2 px-3 cursor-pointer'
                        >
                            <p className={`min-w-3.5 h-3.5 border border-gray-300 rounded-full ${paymentMethod === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button
                            type='submit'
                            disabled={loading}
                            className='bg-black text-white px-16 py-3 text-sm cursor-pointer disabled:opacity-50'
                        >
                            {loading ? "Placing Order..." : "PLACE ORDER"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default PlaceOrder;
