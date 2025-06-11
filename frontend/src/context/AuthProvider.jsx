import axios from "axios";
import { useEffect, useState } from "react"
import { backendUrl } from "../config/shopConfig";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";
import { useShop } from "./ShopContex";
import { useNavigate } from "react-router";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const {setCartItems} = useShop();
    const navigate = useNavigate();

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/user/deshboard`, { withCredentials: true });
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (error) {
            console.log(error);
            setUser(null)
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);
    
    const login = async (email, password) => {
        try {
            const res = await axios.post(`${backendUrl}/api/user/login`, { email, password }, { withCredentials: true });
            if (res.data.success) {
                await checkAuth();
                navigate("/");
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(`${backendUrl}/api/user/register`, { name, email, password }, { withCredentials: true });
            if (res.data.success) {
                await checkAuth();
                navigate("/")
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    const logout = async () => {
        try {
            const res = await axios.post(`${backendUrl}/api/user/logout`, {}, { withCredentials: true });
            if (res.data.success) {
                setUser(null);
                setCartItems({});
                navigate("/login")
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, register, navigate }} >
            {children}
        </AuthContext.Provider>
    )
}