import express from 'express';
import { addProduct, listProducts, removeProduct, singleProduct } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import multer from 'multer';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const productRouter = express.Router();

productRouter.post(
    '/add', verifyAdmin ,
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 }
    ]),
    addProduct
);
productRouter.get('/list', listProducts);
productRouter.delete('/remove/:id', verifyAdmin , removeProduct);
productRouter.get('/single/:id', singleProduct);

// Error handling middleware for Multer
productRouter.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
    next();
})

export default productRouter;