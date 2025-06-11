import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/productModel.js';
import { productSchema } from "../validation/productValidation.js";

// Function to add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        // Validate input using Joi
        const { error, value } = productSchema.validate(
            { name, description, price, category, subCategory, sizes, bestseller },
            { abortEarly: false }
        );

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.details.map((err) => err.message),
            });
        }

        // Parse sizes if sent as string
        const parsedSizes = typeof value.sizes === "string" ? JSON.parse(value.sizes) : value.sizes;

        // Process uploaded images
        const image1 = req?.files?.image1?.[0];
        const image2 = req?.files?.image2?.[0];
        const image3 = req?.files?.image3?.[0];
        const image4 = req?.files?.image4?.[0];

        const images = [image1, image2, image3, image4].filter((img) => img !== undefined);

        if (images.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        const imagesResults = await Promise.all(
            images.map(async (image) => {
                const result = await cloudinary.uploader.upload(image.path, { resource_type: "image", folder: "products" });
                return {
                    url: result.secure_url.toString(),
                    public_id: result.public_id.toString(),
                };
            })
        );

        // Construct and save product
        const product = new Product({
            name: value.name,
            description: value.description,
            price: Number(value.price),
            image: imagesResults,
            category: value.category,
            subCategory: value.subCategory,
            sizes: parsedSizes,
            bestseller: value.bestseller,
        });

        await product.save();

        res.status(201).json({ success: true, message: "Product added successfully" });

    } catch (error) {
        console.error("Add product error:", error.message);
        res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

// Function for Products list using _id keyset pagination
const listProducts = async (req, res) => {
    try {
        const { lastId, limit } = req.query;
        const queryLimit = parseInt(limit) || 10;

        const query = lastId
            ? { _id: { $lt: lastId } }  // Fetch older than last seen ID
            : {};

        const products = await Product.find(query)
            .sort({ _id: -1 }) // Newest first by ObjectId
            .limit(queryLimit)
            .select("name price image category subCategory sizes bestseller");

        if (!products || products.length === 0) {
            return res.status(200).json({
                success: true,
                products: [],
                hasMore: false,
            });
        }

        const nextCursor = products[products.length - 1]._id;

        res.status(200).json({
            success: true,
            products,
            hasMore: true,
            nextCursor, // Use this as ?lastId in next fetch
        });

    } catch (error) {
        console.error("List Products Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products. Please try again later.",
        });
    }
};




// Function for remove product
const removeProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id || id.length !== 24) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // Find and delete the product
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Delete each image from Cloudinary
        await Promise.all(
            product.image.map(async (img) => {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            })
        )
        await product.deleteOne();
        res.status(200).json({ success: true, message: "Product removed successfully" });

    } catch (error) {
        console.error("Remove Product Error:", error);
        res.status(500).json({ success: false, message: "Failed to remove product. Please try again later." });
    }
};

// Function for single product info
const singleProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format (MongoDB ObjectId length is 24 characters)
        if (!id || id.length !== 24) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product });

    } catch (error) {
        console.error("Single Product Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch product" });
    }
};


export { addProduct, listProducts, removeProduct, singleProduct };