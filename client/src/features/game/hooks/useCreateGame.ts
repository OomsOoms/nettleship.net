import { useState } from "react";
import { createGame } from "../services/gameServices";

const useCreateGame = () => {
    const [gameCode, setGameCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateGame = async () => {
        setLoading(true);
        try {
            const response = await createGame();
            if (response?.status === 201) {
                setGameCode(response?.data.gameCode);
            } else {
                alert('Something went wrong');
            }
        } catch (error) {
            alert(error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        handleCreateGame,
        gameCode,
    };
};

export default useCreateGame;