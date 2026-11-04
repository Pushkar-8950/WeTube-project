import axios from "axios"

const api = axios.create({
    baseURL:'http://localhost:8000/api/v1', 
    withCredentials:true // cookies ko cross-origin requests mein include karne ke liye hai, agar backend cookie-based authentication use krta h
});

export default api;