/** Data service for abstracting user-related API interactions. */
import api from "../api";

export const userService = {
    getMe: async () => {
        const response = await api.get("/users/me");
        return response.data;
    },
    getChannel: async () => {
        const response = await api.get("/users/channel");
        return response.data;
    },
    toggleUpdates: async () => {
        const response = await api.post("/users/toggle-updates");
        return response.data;
    }
};
