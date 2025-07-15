# 🛍️ Foreverbuy — MERN Stack E-commerce Website

**Foreverbuy** is a full-featured e-commerce web application built using the MERN stack (MongoDB, Express.js, React, Node.js).  
It includes a customer-facing storefront, a secure admin dashboard, and a RESTful backend API — all organized in a single monorepo.

---

## 📁 Monorepo Structure

/foreverbuy-ecommerce
├── frontend/ # React app for customers
├── backend/ # Express.js REST API
├── admin/ # React app for admins


---

## 🌐 Live Demo Links

- 🛒 **Frontend (Customer Site):** [https://foreverbuy.onrender.com](https://foreverbuy.onrender.com)  
- 🧑‍💼 **Admin Panel:** [https://foreverbuy-admin.onrender.com](https://foreverbuy-admin.onrender.com)  
- ⚙️ **Backend API:** [https://foreverbuy-backend.onrender.com](https://foreverbuy-backend.onrender.com)

---

## 🚀 Features

### 🛍 Customer (Frontend)
- Product listing and detail pages  
- Shopping cart and quantity management  
- Checkout flow with Cash on Delivery  
- Order tracking after checkout  

### 🛠 Admin (Dashboard)
- Secure login authentication  
- Product management (CRUD)  
- Order management & status updates  
- View user details  

### 🔗 API (Backend)
- JWT-based user authentication  
- RESTful endpoints for products, users, and orders  
- MongoDB + Mongoose schema design  
- Error handling and middleware  

---

## 🧪 Tech Stack

- **Frontend:** React, React Router v7, Tailwind CSS  
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT  
- **Admin Panel:** React, Tailwind CSS  
- **Deployment:** Render.com  

---

## ⚙️ Running Locally

**Requirements:** Node.js v18+, MongoDB (local or Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/IqbalShahed/foreverbuy-ecommerce.git
cd foreverbuy-ecommerce
```
**Install Dependencies**

# Backend
```bash
cd backend
npm install
```
# Frontend
```bash
cd ../frontend
npm install
```
# Admin Panel
```bash
cd ../admin
npm install
```

***Setup Environment Variables***
Create a .env file in each of the following folders: backend/, frontend/, admin/.
Example for /backend/.env:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
(See each subfolder for specific .env requirements.)

***Run the Apps***
Use separate terminals or a process manager like concurrently.

# Start Backend
```bash
cd backend
npm run dev
```

# Start Frontend
```bash
cd ../frontend
npm start
```

# Start Admin Panel
```bash
cd ../admin
npm start
```

***Future Enhancements***
🔐 Online payment integration (Stripe, SSLCommerz, etc.)
🧮 Inventory management and stock alerts
📝 Customer reviews and ratings
📊 Analytics dashboard for admin

***License***
This project is open-source under the MIT License.

***Contributing***
Pull requests and feedback are welcome!
For major feature changes, please open an issue first to discuss what you would like to change.

***Author***
Iqbal Shahed
GitHub: @IqbalShahed
