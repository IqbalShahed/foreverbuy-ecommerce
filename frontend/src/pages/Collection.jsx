import React, { useEffect, useReducer, useMemo } from 'react';
import { useShop } from '../context/ShopContex';
import { assets } from '../assets/frontend_assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

// ---------- State Management ----------
const initialState = {
    category: [],
    subCategory: [],
    showFilter: false,
    filterProducts: [],
    sortOrder: 'relevant',
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'TOGGLE_CATEGORY':
            return { ...state, category: toggleItem(state.category, action.payload) };
        case 'TOGGLE_SUBCATEGORY':
            return { ...state, subCategory: toggleItem(state.subCategory, action.payload) };
        case 'SET_FILTER_PRODUCTS':
            return { ...state, filterProducts: action.payload };
        case 'SET_SHOW_FILTER':
            return { ...state, showFilter: action.payload };
        case 'SET_SORT_ORDER':
            return { ...state, sortOrder: action.payload };
        default:
            return state;
    }
};

const toggleItem = (list, value) =>
    list.includes(value) ? list.filter(item => item !== value) : [...list, value];

const sortProducts = (productsToSort, sortOrder) => {
    switch (sortOrder) {
        case 'low-high':
            return [...productsToSort].sort((a, b) => a.price - b.price);
        case 'high-low':
            return [...productsToSort].sort((a, b) => b.price - a.price);
        case 'relevant':
        default:
            return productsToSort;
    }
};

// ---------- Main Component ----------
function Collection() {
    const { products, search, showSearch } = useShop();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { category, subCategory, showFilter, filterProducts, sortOrder } = state;

    const memoizedProducts = useMemo(() => products, [products]);

    const handleToggle = (type, value) => {
        dispatch({ type, payload: value });
    };

    const handleSortChange = (e) => {
        dispatch({ type: 'SET_SORT_ORDER', payload: e.target.value });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            let filtered = memoizedProducts;
            if (category.length) {
                filtered = filtered.filter(item => category.includes(item.category));
            }
            if (subCategory.length) {
                filtered = filtered.filter(item => subCategory.includes(item.subCategory));
            }
            if (showSearch && search) {
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(search.toLowerCase())
                );
            }
            const sorted = sortProducts(filtered, sortOrder);
            dispatch({ type: 'SET_FILTER_PRODUCTS', payload: sorted });
        }, 100); // debounce delay

        return () => clearTimeout(timeout);
    }, [memoizedProducts, category, subCategory, sortOrder, search, showSearch]);

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-10 pt-10 border-t-2 border-gray-300">
            {/* Left: Filter Options */}
            <div className="min-w-60">
                <p
                    onClick={() => handleToggle('SET_SHOW_FILTER', !showFilter)}
                    className="text-xl flex items-center gap-2 my-2 cursor-pointer sm:cursor-default"
                >
                    FILTERS
                    <img
                        className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
                        src={assets.dropdown_icon}
                        alt="Toggle"
                    />
                </p>

                {/* Category Filter */}
                <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className="mb-3 font-medium text-sm">CATEGORIES</p>
                    <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                        {['Men', 'Women', 'Kids'].map(label => {
                            const id = `category-${label}`;
                            return (
                                <div key={label} className="flex gap-2 items-center">
                                    <input
                                        id={id}
                                        type="checkbox"
                                        value={label}
                                        onChange={(e) => handleToggle('TOGGLE_CATEGORY', e.target.value)}
                                        className="w-3"
                                    />
                                    <label htmlFor={id}>{label}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SubCategory Filter */}
                <div className={`border border-gray-300 pl-5 py-3 mt-6 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
                    <p className="mb-3 text-sm font-medium">TYPE</p>
                    <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                        {['Topwear', 'Bottomwear', 'Winterwear'].map(label => {
                            const id = `subcategory-${label}`;
                            return (
                                <div key={label} className="flex gap-2 items-center">
                                    <input
                                        id={id}
                                        type="checkbox"
                                        value={label}
                                        onChange={(e) => handleToggle('TOGGLE_SUBCATEGORY', e.target.value)}
                                        className="w-3"
                                    />
                                    <label htmlFor={id}>{label}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right: Product List */}
            <div className="flex-1">
                <div className="flex justify-between text-base sm:text-2xl mb-4">
                    <Title text1="ALL" text2="COLLECTIONS" />

                    {/* Sort Dropdown */}
                    <select
                        onChange={handleSortChange}
                        className="border-2 border-gray-300 text-sm px-2"
                        value={sortOrder}
                    >
                        <option value="relevant">Sort by: Relevant</option>
                        <option value="high-low">Sort by: High to Low</option>
                        <option value="low-high">Sort by: Low to High</option>
                    </select>
                </div>

                {/* Product Grid or Fallback Message */}
                {filterProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                        {filterProducts.map(item => (
                            <ProductItem
                                key={item._id}
                                id={item._id}
                                image={item.image}
                                name={item.name}
                                price={item.price}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-600 py-10">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Collection;
