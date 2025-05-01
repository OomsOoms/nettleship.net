import axios from "axios";
import { api } from "../../../utils/axiosInstance";

const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
        throw error.response;
    }
    throw error;
};

interface GetGamesParams {
    status: "lobby" | "inProgress" | "gameOver" | "";
    gameType: "" | "";
    maxPlayers: number | "";
    search: string;
}

export const getGames = async ({ status, gameType, maxPlayers, search }: GetGamesParams) => {
    const queryParams = new URLSearchParams();

    // Add query params if they exist
    if (status) queryParams.append("status", status);
    if (gameType) queryParams.append("gameType", gameType);
    if (maxPlayers) queryParams.append("maxPlayers", maxPlayers.toString());
    if (search) queryParams.append("search", search);

    // Convert query params to string
    const queryString = queryParams.toString();
    // Add query string to URL if it exists
    const query = queryString ? `?${queryString}` : "";

    try {
        const response = await api.get(`/games${query}`);
        return response;
    } catch (error) {
        handleAxiosError(error);
    }
};

export const checkGameExists = async (gameCode: string) => {
    try {
        // use exists param to only check if game exists
        const response = await api.get(`/games/${gameCode}?exists=true`);
        return response;
    } catch (error) {
        handleAxiosError(error);
    }
}

export const createGame = async () => {
    try {
        const response = await api.post("/games");
        return response;
    } catch (error) {
        handleAxiosError(error);
    }
}
