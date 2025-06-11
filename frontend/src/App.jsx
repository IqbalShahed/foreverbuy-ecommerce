import React from "react";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import PlaceOrder from "./pages/PlaceOrder";
import { Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { ToastContainer } from 'react-toastify';
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";


const App = () => {
  return (
    <div className="px-4 sm:px-[5%] md:px-[7%] lg:px-[9%]">
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/place-order" element={<PrivateRoute><PlaceOrder /></PrivateRoute>} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App