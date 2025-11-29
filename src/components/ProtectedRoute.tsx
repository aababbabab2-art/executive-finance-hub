import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = localStorage.getItem("acc_token");

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};