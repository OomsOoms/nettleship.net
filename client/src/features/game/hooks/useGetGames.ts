import { useState, useEffect } from "react";
import { getGames } from "../services/gameServices";

const useGetGames = () => {
    // used to update the state of the filters as the user interacts with the UI
    const [filters, setFilters] = useState({
        status: "" as "" | "lobby" | "inProgress",
        gameType: "" as "" | "uno",
        maxPlayers: 10 as number,
        search: ""
    });
    // used to store the filters that will be used to call the API
    const [apiFilters, setApiFilters] = useState(filters);

    // stores the games and loading state
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);

    // changes the filter state
    const handleChange = (field: string, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // used to update the apiFilters state after the user
    // stops interacting with the UI for 500ms
    useEffect(() => {
        const timeout = setTimeout(() => {
            setApiFilters(filters);
        }, 500);

        return () => clearTimeout(timeout);
    }, [filters]);

    // uses the getGames function to fetch games and set the games state
    const refresh = async () => {
        setLoading(true);
        try {
            const response = await getGames(apiFilters);
            if (response?.status === 200) {
                setGames(response.data);
            } else {
                alert(response?.data?.message);
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    }

    // only fetches the games when the api filters change every 500ms
    useEffect(() => {
        refresh();
    }, [apiFilters]); // when the apiFilters change, refresh the games

    return {
        loading,
        filters,
        handleChange,
        games,
        refresh
    };
};

export default useGetGames;