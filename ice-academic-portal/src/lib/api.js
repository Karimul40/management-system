const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        const token = typeof window !== "undefined" ? localStorage.getItem("portal_auth_token") : null;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn("Backend API offline or unreachable:", error.message);
        return { success: false, isOffline: true, message: error.message };
    }
};

export default apiRequest;
