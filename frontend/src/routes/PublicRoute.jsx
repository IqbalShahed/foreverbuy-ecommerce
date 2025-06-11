import React from "react"
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";

const PublicRoute = ({children}) =>{
    const {user, loading} = useAuth();
    if(loading) return <div>Loading...</div>;
    if(user) return <Navigate to = "/" replace />
    return children;
}

export default PublicRoute;