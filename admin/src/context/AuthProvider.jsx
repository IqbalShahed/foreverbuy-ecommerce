import axios from "axios";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/deshboard`, { withCredentials: true });
            if (res.data.success) {
                setUser(res.data.admin);
            }
        } catch (err) {
            console.log(err);
            setUser(null);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        checkAuth();
    }, [])

    const login = async (email, password) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/login`,
                { email, password },
                { withCredentials: true }
            );

            if (res.data.success) {
                await checkAuth();
                return true;
            } else {
                toast.error(res.data.message);
                return false;
            }
        } catch (err) {
            throw new Error(err?.response?.data?.message || "Login failed");
        }
    };


    const logout = async () => {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/logout`, {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }} >
            {children}
        </AuthContext.Provider>
    );
};