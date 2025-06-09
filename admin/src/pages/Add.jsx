import React, { useState } from "react";
import { assets } from "../assets/admin_assets/assets";
import axios from "axios";
import { toast } from 'react-toastify';

const CATEGORIES = ["Men", "Women", "Kids"];
const SUBCATEGORIES = ["Topwear", "Bottomwear", "Winterwear"];
const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];
const MAX_IMAGE_SIZE_MB = 2;

const Add = () => {
    const [images, setImages] = useState([null, null, null, null]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [subCategory, setSubCategory] = useState(SUBCATEGORIES[0]);
    const [bestseller, setBestseller] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [loading, setLoading] = useState(false);

    const isValidImage = (file) =>
        file && file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024;

    const handleImageChange = (index, file) => {
        if (!isValidImage(file)) {
            toast.error(`Invalid file: Must be image and < ${MAX_IMAGE_SIZE_MB}MB`);
            return;
        }
        setImages((prev) => {
            const newImages = [...prev];
            newImages[index] = file;
            return newImages;
        });
    };

    const toggleSizes = (size) => {
        setSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("subCategory", subCategory);
            formData.append("bestseller", bestseller);
            formData.append("sizes", JSON.stringify(sizes));

            images.forEach((img, index) => {
                if (img) formData.append(`image${index + 1}`, img);
            });

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/product/add`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                setImages([null, null, null, null]);
                setName("");
                setDescription("");
                setPrice("");
                setCategory(CATEGORIES[0]);
                setSubCategory(SUBCATEGORIES[0]);
                setBestseller(false);
                setSizes([]);
            } else{
                toast.error(res.data.message);
            }

        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
            <div>
                <p className="mb-2">Upload Images</p>
                <div className="flex gap-2">
                    {images.map((img, index) => (
                        <label key={index} htmlFor={`image${index}`}>
                            <img
                                className="w-20 h-20 object-cover border"
                                src={img ? URL.createObjectURL(img) : assets.upload_area}
                                alt={`Image ${index + 1}`}
                            />
                            <input
                                type="file"
                                id={`image${index}`}
                                hidden
                                accept="image/*"
                                onChange={(e) => handleImageChange(index, e.target.files[0])}
                            />
                        </label>
                    ))}
                </div>
            </div>

            <div className="w-full">
                <p className="mb-2">Product Name</p>
                <input
                    type="text"
                    className="w-full max-w-[500px] px-3 py-2"
                    placeholder="Type here"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="w-full">
                <p className="mb-2">Product Description</p>
                <textarea
                    className="w-full max-w-[500px] px-3 py-2"
                    placeholder="Write content here"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
                <div>
                    <p className="mb-2">Product Category</p>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <p className="mb-2">Sub Category</p>
                    <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="w-full px-3 py-2"
                    >
                        {SUBCATEGORIES.map((sub) => (
                            <option key={sub} value={sub}>
                                {sub}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <p className="mb-2">Price</p>
                    <input
                        type="number"
                        className="w-full px-3 py-2 sm:w-[120px]"
                        placeholder="25"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div>
                <p className="mb-2">Product Size</p>
                <div className="flex gap-3">
                    {SIZE_OPTIONS.map((size) => (
                        <div key={size} onClick={() => toggleSizes(size)}>
                            <p
                                className={`${sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"
                                    } px-3 py-1 cursor-pointer rounded`}
                            >
                                {size}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <input
                    type="checkbox"
                    id="bestseller"
                    checked={bestseller}
                    onChange={() => setBestseller((prev) => !prev)}
                />
                <label htmlFor="bestseller" className="cursor-pointer">
                    Add to bestseller
                </label>
            </div>
            <button
                type="submit"
                className="w-28 py-3 mt-4 bg-black text-white"
                disabled={loading}
            >
                {loading ? "ADDING..." : "ADD"}
            </button>
        </form>
    );
};

export default Add;