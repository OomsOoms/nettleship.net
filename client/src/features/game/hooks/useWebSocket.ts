import { useEffect, useState } from "react";
import websocketService from "../services/websocket";
import { useUser } from "../../../context/UserContext";

const useWebSocket = () => {
    const { user } = useUser();
    const [displayName, setDisplayName] = useState<string>("");
    const [saveDisplayName, setSaveDisplayName] = useState<boolean>(false);

    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const gameCode = window.location.pathname.split("/").pop();

    // handle the display name
    useEffect(() => {
    if (user) {
        setDisplayName(user.displayName);
    } else {
        const storedDisplayName = localStorage.getItem("displayName");
        if (storedDisplayName) {
        setDisplayName(storedDisplayName);
        }
    }
    }, [user]);

    const connectWebSocket = async () => {
        try {
            if (gameCode) {
                const socket = await websocketService.connect(gameCode, displayName, saveDisplayName);
                setWs(socket);
                setIsConnected(true);

                socket.onmessage = (event) => {
                    // parse the message and set the message state
                    const parsedMessage = JSON.parse(event.data);
                    console.log("[WebSocket Message event]", event);
                    setMessage(event.data);
                };

                socket.onclose = () => {
                    console.warn("[WebSocket Closed]");
                    setIsConnected(false);
                    // idk if i should try and reconnect becuase if the user has joined from another client idk
                };

                socket.onerror = (error) => {
                    console.error("[WebSocket Error]", error);
                    setIsConnected(false);
                };
            } else {
                console.error("Game code is missing. Cannot connect to WebSocket.");
            }
        } catch (error) {
            console.error("[WebSocket Connection Failed]", error);
            setIsConnected(false);
        }
    };

    // Disconnect WebSocket when the page is closed or the component is unmounted
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (ws) {
                ws.close(); // Close the WebSocket connection
                setIsConnected(false);
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (ws) {
                ws.close(); // Ensure WebSocket is closed on component unmount
                setIsConnected(false);
            }
        };
    }, [ws]);

    // join ws on submit
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // join the websocket with the displayname and the save display name
        connectWebSocket();
    }

    return {
        ws,
        isConnected,
        connectWebSocket,
        message,
        displayName,
        setDisplayName,
        saveDisplayName,
        setSaveDisplayName,
        handleSubmit,
    }
}

export default useWebSocket;