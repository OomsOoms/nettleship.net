import { useState } from "react";
import { checkGameExists } from "../services/gameServices";

const useCheckGameExists = () => {
    const [gameExists, setGameExists] = useState(null);
    const [gameCode, setGameCode] = useState("");
    const [loading, setLoading] = useState(false);

    const checkGame = async (code: string) => {
        setLoading(true);
        try {
            if (!code) {
                return false;
            }
            const response = await checkGameExists(code);
            if (response?.status === 200) {
                setGameCode(code);
                setGameExists(response.data);
                return response.data;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        gameExists,
        loading,
        checkGame,
        gameCode,
        setGameCode,
    };
};

export default useCheckGameExists;