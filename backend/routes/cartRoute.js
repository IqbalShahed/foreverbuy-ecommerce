import express from 'express';
import { addToCart, getUserCart, updateCart } from '../controllers/cartController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const cartRoute = express.Router();

cartRoute.post('/add', verifyUser ,addToCart);        // POST: { itemId, size }
cartRoute.put('/update', verifyUser ,updateCart);     // PUT: { itemId, size, quantity }
cartRoute.get('/get', verifyUser, getUserCart);           // GET: /cart

export default cartRoute;