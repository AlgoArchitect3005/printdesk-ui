import { create } from "axios";
import { createContext , useContext, useState , useEffect } from "react";

//1. Create the context
const AuthContext = createContext(null);

//2. Create a provider component (app ko wrap karega)
export function AuthProvider({ children}){
    const [token , setToken] = useState(() => localStorage.getItem('token'));
    const [user , setUser] = useState(() => {
        //Decode roles from token(JWT PAYLOAD = base64)
        const t = localStorage.getItem('token');
        return t ? decodeToken(t) : null;
    });

    //Token decode karne ka function-jwt se middle part base64 hota hai
    function decodeToken(t){
        try {
            const payload = JSON.parse(atob(t.split('.')[1]));
            return {
                username: payload.sub,
                role: payload.role , //Role_ADMIN ya Role_USER
            };
        }catch{
            return null;
        }
    }

    function login (newToken){
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(decodeToken(newToken));
    }

    function logout(){
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }

    const isAdmin = user?.role === 'Role_ADMIN';
    const isLoggedIn = !!token;

    return(
        <AuthContext.Provider value={{ token, user, login, logout, isAdmin, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const ctx = useContext(AuthContext);
    if(!ctx){
        throw new Error("useAuth must be inside AuthProvider");
    }
    return ctx;
}