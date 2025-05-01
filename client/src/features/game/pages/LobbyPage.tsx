import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { useUser } from "../../../context/UserContext"
import useCheckGameExists from "../hooks/useCheckGameExists"
import useWebSocket from "../hooks/useWebSocket"

import Game from "../components/Game/Game"
import LobbyEntry from "../components/Lobby/LobbyEntry"
import Lobby from "../components/Lobby/Lobby"
import Menu from "../../../components/layout/Menu/Menu"
import GameChat from "../components/GameChat/GameChat"
import { ExitIcon } from "../../../assets/Icons"

import "../styles/LobbyPage.scss"
import { useEffect } from "react"

interface GameSettings {
  maxPlayers: number;
  playerHandSize: number;
  replacePlayers: boolean;
  declareLastCardPenalty: number;
  autoPlay: boolean;
  chaining: boolean;
  stacking: boolean;
  jumpIn: boolean;
  sevensAndZeros: boolean;
  drawUntilPlayable: boolean;
  playOnDraw: boolean;
  public: boolean;
}

export default function LobbyPage() {
  const gameCode = window.location.pathname.split("/").pop();
  
  const { user } = useUser();
  const navigate = useNavigate();
  const { checkGame } = useCheckGameExists();
  const {
    ws,
    isConnected,
    message,
    displayName,
    setDisplayName,
    saveDisplayName,
    setSaveDisplayName,
    handleSubmit,
  } = useWebSocket();

  // store the game state
  const [player, setPlayer] = useState()
  const [players, setPlayers] = useState([])
  const [gameSettings, setGameSettings] = useState<GameSettings>()
  const [gameStatus, setGameStatus] = useState("lobby");
  const [defaultDeckConfig, setDefaultDeckConfig] = useState([])
  const [deckConfig, setDeckConfig] = useState()
  const [topCard, setTopCard] = useState(null);
  const [direction, setGameDirection] = useState(1);
  const [messages, setMessages] = useState([])
  
  // Check if the game exists when the component mounts
  useEffect(() => {
    const fetchGameStatus = async () => {
      if (gameCode) {
        const response = await checkGame(gameCode);
        if (!response) {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    };
    fetchGameStatus();
  }, []);

  // Menu items for the GameMenu component with icons
  const leaveLobby = () => {
    navigate("/");
  }
  const menuItems = [
    {
      label: "Leave Game",
      onClick: leaveLobby,
      danger: true,
      icon: <ExitIcon />,
    },
  ]


  // player lobby actions
  // start game
  const handleStartGame = () => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: "startGame", configuration: deckConfig }));
    }
  }
  // kick player
  const handleKickPlayer = (userId: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: "removePlayer", userId }));
    }
  }
  // Add bot
  const handleAddBot = () => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: "addAiPlayer" }));
    }
  };
  // on change for game settings
  const onChange = (field: string, newValue: any) => {
    const updatedSettings: GameSettings = {
      ...gameSettings,
      [field]: newValue,
    } as GameSettings;
    setGameSettings(updatedSettings);

    // Send the updated settings object
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: "changeSettings", settings: updatedSettings }));
    }
  };


  // player game actions
  // handle last card
  const onDeclareLastCard = () => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: "declareLastCard" }));
    }
  };
  // Handle play card action
  const onPlayCard = (cardIndexes: number[], wildColour?: string, swapUserId?: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: "placeCard", cardIndexes, wildColour: wildColour || null, swapUserId: swapUserId || null }));
    }
  };
  // Handle draw card action
  const onDrawCard = () => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: "drawCard" }));
    }
  };

  // handle message action
  const onSendMessage = (message: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: "chatMessage", message }))
    }
  }

  // this should use the event send alongside the data not the data itself to decode the message
  // Listen for incoming messages from the WebSocket
  useEffect(() => {
    // if the message is empty or null, return
    if (!message) return;
    // parse the message from a string to an object
    const parsedMessage = JSON.parse(message);

    // Update game started state
    if (parsedMessage?.gameState?.status) {
      setGameStatus(parsedMessage.gameState.status);
    }

    // Update player only if it exists in the message
    if (parsedMessage?.gameState?.player) {
      setPlayer(parsedMessage.gameState.player);
    }

    // Update players only if they exist in the message
    if (parsedMessage?.gameState?.players) {
      setPlayers(parsedMessage.gameState.players);
    }

    // Update game settings only if they exist in the message
    if (parsedMessage?.gameState?.settings) {
      setGameSettings(parsedMessage.gameState.settings);
    }

    if (parsedMessage?.gameState?.direction) {
      setGameDirection(parsedMessage.gameState.direction);
    }

    // Update top card only if it exists in the message
    if (parsedMessage?.gameState?.topCard) {
      setTopCard(parsedMessage.gameState.topCard);
    }

    // Update deck config only if it exists in the message
    if (parsedMessage?.type === "deckConfig") {
      setDefaultDeckConfig(parsedMessage.deckConfig);
      setDeckConfig(parsedMessage.deckConfig);
    }

    // update the messages when the chatLog is sent
    if (parsedMessage.chat) {
      setMessages(parsedMessage.chat)
    }

    // append a new message to the chat log
    if (parsedMessage.message) {
      setMessages((prevMessages) => [...prevMessages, parsedMessage.message]);
    }

    // this is here because if a message has been recived its garuanteed to work which wasnt the case when it was in its own useEffect
    if (ws && defaultDeckConfig.length === 0) {
      ws.send(JSON.stringify({ type: "deckConfig" }));
    }
  }, [message]);

  return (
    <div className="lobby-page">
      <Menu items={menuItems} position="top-right" />
      {gameStatus === "lobby" ? (
        isConnected && player && gameSettings ? (
          <>
            <GameChat
              messages={messages}
              onSendMessage={onSendMessage}
            />
            <Lobby
              player={player}
              players={players}
              gameSettings={gameSettings}
              defaultDeckConfig={defaultDeckConfig}
              deckConfig={deckConfig}
              setDeckConfig={setDeckConfig}
              onChange={onChange}
              handleStartGame={handleStartGame}
              handleAddBot={handleAddBot}
              handleKickPlayer={handleKickPlayer}
            />
          </>
        ) : (
          <LobbyEntry
            isAuthenticated={!!user}
            displayName={displayName}
            setDisplayName={setDisplayName}
            saveDisplayName={saveDisplayName}
            setSaveDisplayName={setSaveDisplayName}
            handleSubmit={handleSubmit}
          />
        )
      ) : gameStatus === "inProgress" ? (
        <>
          <GameChat
            messages={messages}
            onSendMessage={onSendMessage}
          />
          <Game
            player={player}
            players={players}
            topCard={topCard}
            direction={direction}
            gameSettings={gameSettings}
            onDrawCard={onDrawCard}
            onPlayCard={onPlayCard}
            onDeclareLastCard={onDeclareLastCard}
          />
        </>
      ) : (
        <h1>Error</h1>
      )}
    </div>
  );
}

