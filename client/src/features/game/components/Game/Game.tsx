"use client";

import { useState, useEffect, useRef } from "react";
import UnoCard from "./UnoCard/UnoCard";
import PlayerHand from "./PlayerHand/PlayerHand";
import OtherPlayer from "./OtherPlayer/OtherPlayer";
import ColourSelector from "./ColourSelector/ColourSelector";
import PlayerSelector from "./PlayerSelector/PlayerSelector";
import TurnIndicator from "./TurnIndicator/TurnIndicator";
import { RotateCw, RotateCcw } from "lucide-react";
import useMobile from "../../../../hooks/useMobile";
import "./Game.scss";

// Card types
export type CardColour = "red" | "blue" | "green" | "yellow" | "black";
export type CardType =
  | "number"
  | "skip"
  | "reverse"
  | "drawTwo"
  | "wild"
  | "wildDrawFour";

// Update the Card interface to remove id
export interface Card {
  colour: CardColour;
  type: CardType;
  score: number;
}

// Player type
export interface Player {
  displayName: string;
  handLength: number;
  isHost: boolean;
  isTurn: boolean;
  isYou: boolean;
  score: number;
  userId: string;
}

interface CurrentPlayer {
  isHost: boolean;
  displayName: string;
  score: number;
  lastDrawnCard: Card | null;
  hand: Card[];
  lastDrawnCardIndex: number | null;
}

// Update the GameProps interface
interface GameProps {
  player: CurrentPlayer;
  players: Player[];
  topCard: Card;
  direction: 1 | 0;
  gameSettings: any;
  onPlayCard: (indexes: number[], wildColour?: string) => void;
  onDrawCard: () => void;
  onDeclareLastCard: () => void;
}

const Game = ({
  player,
  players,
  topCard,
  direction,
  gameSettings,
  onPlayCard,
  onDrawCard,
  onDeclareLastCard,
}: GameProps) => {
  const [playerPositions, setPlayerPositions] = useState<
    Array<{ top: string | number; left: string | number; transform: string }>
  >([]);
  const [showColourSelector, setShowColourSelector] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  // Update the pendingWildCard state to store both card and index
  const [pendingCard, setPendingCard] = useState<{ index: number } | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(100); // Percentage of time left
  const turnTimerRef = useRef<number | null>(null);
  const turnDuration = 15000; // 15 seconds per turn

  // Check if we're on mobile
  const isMobile = useMobile();

  // Calculate positions for other players
  const calculatePlayerPositions = (count: number) => {
    const positions = [];
    const totalPlayers = count;

    // Different positioning strategy for mobile
    if (isMobile) {
      // For mobile, position players in a more compact way
      if (totalPlayers <= 3) {
        // For 2-4 players total on mobile, position them at the top
        for (let i = 0; i < totalPlayers; i++) {
          positions.push({
            top: "5%",
            left: `${((i + 1) * 100) / (totalPlayers + 1)}%`,
            transform: "translateX(-50%)",
          });
        }
      } else {
        // For 5+ players on mobile, use two rows
        const firstRowCount = Math.ceil(totalPlayers / 2);
        const secondRowCount = totalPlayers - firstRowCount;

        // First row
        for (let i = 0; i < firstRowCount; i++) {
          positions.push({
            top: "5%",
            left: `${((i + 1) * 100) / (firstRowCount + 1)}%`,
            transform: "translateX(-50%)",
          });
        }

        // Second row
        for (let i = 0; i < secondRowCount; i++) {
          positions.push({
            top: "20%",
            left: `${((i + 1) * 100) / (secondRowCount + 1)}%`,
            transform: "translateX(-50%)",
          });
        }
      }
    } else {
      // Desktop positioning
      if (totalPlayers <= 3) {
        // For 2-4 players total, position them at the top
        for (let i = 0; i < totalPlayers; i++) {
          positions.push({
            top: "10%",
            left: `${((i + 1) * 100) / (totalPlayers + 1)}%`,
            transform: "translateX(-50%)",
          });
        }
      } else {
        // For 5+ players, position them in a semi-circle in the TOP half
        const radius = 40;
        const startAngle = Math.PI * 0.8; // Start from top-left
        const endAngle = Math.PI * 0.2; // End at top-right

        for (let i = 0; i < totalPlayers; i++) {
          const angle =
            startAngle + (endAngle - startAngle) * (i / (totalPlayers - 1));
          positions.push({
            top: `${50 - Math.abs(radius * Math.sin(angle))}%`, // Always stay in top half
            left: `${50 + radius * Math.cos(angle)}%`,
            transform: "translate(-50%, -50%)",
          });
        }
      }
    }

    return positions;
  };

  useEffect(() => {
    // if autoPlay is enabled, start the timer
    if (gameSettings.autoPlay) {
      startTurnTimer();
    }

    // Calculate positions for other players excluding the current player
    const otherPlayers = players.filter((player) => !player.isYou);
    setPlayerPositions(calculatePlayerPositions(otherPlayers.length));

    return () => {
      // Clean up timer on unmount
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
      }
    };
  }, [players]);

  // Start the turn timer
  const startTurnTimer = () => {
    // Reset timer
    setTurnTimeLeft(100);

    // Clear any existing timer
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current);
    }

    // Set up a new timer that updates every 100ms
    const startTime = Date.now();
    turnTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentLeft = Math.max(0, 100 - (elapsed / turnDuration) * 100);
      setTurnTimeLeft(percentLeft);

      // If time is up, just stop the timer
      if (percentLeft <= 0) {
        if (turnTimerRef.current) {
          clearInterval(turnTimerRef.current);
        }
      }
    }, 100) as unknown as number; // Update every 100ms for smooth animation
  };

  // Show a message for a few seconds#
  const showTemporaryMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Update the handlePlayCard function to use indices
  const handlePlayCard = (card: Card, index: number) => {
    // Find the current player
    const youPlayer = players.find((player) => player.isYou);
    // Only allow playing cards on the player's turn or if jumpIn is enabled
    if (!youPlayer || (!youPlayer.isTurn && !gameSettings.jumpIn)) return;

    // Check if it's a wild card
    if (card.type === "wild" || card.type === "wildDrawFour") {
      // Store the wild card and show colour selector
      setPendingCard({ index });
      setShowColourSelector(true);
      // check if its a 7 and if the rule is enabled
    } else if (card.score === 7 && gameSettings.sevensAndZeros) {
      // Show player selector for swapping hands
      setPendingCard({ index });
      setShowPlayerSelector(true);
    } else {
      if (gameSettings.stacking && card.type === "number") {
        console.log("Playing a number card");
        // find the index of cards with the same number
        const sameNumberCards = player.hand
          .map((c, i) =>
            c.type === "number" && c.score === card.score && i !== index
              ? i
              : null,
          )
          .filter((i) => i !== null) as number[];
        // add the card to the beginning of the array, this is becuase its the first card in the stack
        sameNumberCards.unshift(index);
        // play the card
        onPlayCard(sameNumberCards);
      } else {
        console.log("not stacking");
        onPlayCard([index]);
      }
    }
  };

  // Update the handleColourSelect function
  const handleColourSelect = (wildColour: CardColour) => {
    if (pendingCard) {
      // Call the onPlayCard callback with the wild card and its index
      // pass as an array with a single index, this is because its an action card and only one can be placed.
      onPlayCard([pendingCard.index], wildColour);
      // Reset the pending wild card and hide the colour selector
      setPendingCard(null);
      setShowColourSelector(false);
    }
  };

  const handlePlayerSelect = (userId: string) => {
    if (pendingCard) {
      // Call the onSelectPlayer callback with the selected player
      // pass as an array with a single index, this is because its an action card and only one can be placed.
      onPlayCard([pendingCard.index], userId);
      // Reset the pending wild card and hide the colour selector
      setPendingCard(null);
      setShowPlayerSelector(false);
    }
  };

  // Get the current player
  const youPlayer = players.find((player) => player.isYou);

  // Get other players (not the current player)
  const otherPlayers = players.filter((player) => !player.isYou);

  if (!topCard || !youPlayer || player.hand.length === 0) {
    return <div className="loading">Loading game...</div>;
  }

  return (
    <div className="game">
      {/* Direction indicator */}
      <div className="direction-indicator">
        <span className="direction-text">Direction:</span>
        {direction === 1 ? (
          <RotateCw className="direction-icon" />
        ) : (
          <RotateCcw className="direction-icon" />
        )}
      </div>

      {/* Message display */}
      {message && <div className="message">{message}</div>}

      {/* Center area with discard and draw piles */}
      <div className="card-piles">
        {/* Discard pile */}
        <div className="discard-pile">
          <UnoCard card={topCard} size={isMobile ? "md" : "lg"} />
        </div>

        {/* Draw pile */}
        <div
          className="draw-pile"
          onClick={youPlayer.isTurn ? onDrawCard : undefined}
        >
          <UnoCard
            card={{ colour: "black", type: "wild", score: 50 }}
            size={isMobile ? "md" : "lg"}
            faceDown={true}
          />
        </div>
      </div>

      {/* Other players */}
      {otherPlayers.map((player, index) => {
        // Ensure we have a valid position for this player
        const position = playerPositions[index] || {
          top: "10%",
          left: `${(index + 1) * 20}%`,
          transform: "translateX(-50%)",
        };

        return (
          <div
            key={player.userId}
            className="other-player-container"
            style={{
              top: position.top,
              left: position.left,
              transform: position.transform,
            }}
          >
            <OtherPlayer
              player={player}
              isActive={player.isTurn}
              timeLeftPercent={player.isTurn ? turnTimeLeft : 100}
            />
          </div>
        );
      })}

      {/* Player's hand with turn indicator */}
      <div className="player-hand-container">
        <TurnIndicator
          isPlayerTurn={youPlayer.isTurn}
          timeLeftPercent={turnTimeLeft}
          playerName={youPlayer.displayName}
        />
        <button className="call-uno-button" onClick={onDeclareLastCard}>
          Last Card!
        </button>
        <PlayerHand
          cards={player.hand}
          handlePlayCard={handlePlayCard}
          isPlayerTurn={youPlayer.isTurn || gameSettings.jumpIn}
        />
      </div>

      {/* Colour selector for wild cards */}
      {showColourSelector && (
        <div className="modal-overlay">
          <ColourSelector handleColourSelect={handleColourSelect} />
        </div>
      )}

      {/* Player selector for 7 cards (swap hands) */}
      {showPlayerSelector && (
        <div className="modal-overlay">
          <PlayerSelector
            players={otherPlayers}
            handlePlayerSelect={handlePlayerSelect}
          />
        </div>
      )}
    </div>
  );
};

export default Game;
