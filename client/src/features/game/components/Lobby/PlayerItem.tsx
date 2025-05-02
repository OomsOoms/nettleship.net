"use client";

import { Crown, User, Bot } from "../../../../assets/Icons";
import "../../styles/PlayerItem.scss";

interface PlayerItemProps {
  name: string;
  isEmpty?: boolean;
  isHost?: boolean;
  isYou?: boolean;
  isAI?: boolean;
  onKick?: () => void;
}

function PlayerItem({
  name,
  isEmpty = false,
  isHost = false,
  isYou = false,
  isAI = false,
  onKick,
}: PlayerItemProps) {
  return (
    <div className={`player-item ${isEmpty ? "player-item--empty" : ""}`}>
      <div
        className={`player-item__avatar ${isEmpty ? "player-item__avatar--empty" : ""}`}
      >
        {!isEmpty &&
          (isAI ? (
            <Bot className="player-item__bot-icon" />
          ) : (
            <User className="player-item__user-icon" />
          ))}
      </div>
      <span
        className={`player-item__name ${isEmpty ? "player-item__name--empty" : ""}`}
      >
        {name}
        {isYou && <span className="player-item__you-tag">(You)</span>}
      </span>
      {isHost && <Crown className="player-item__crown" />}

      {onKick && !isEmpty && (
        <button
          className="player-item__kick-button"
          onClick={(e) => {
            e.stopPropagation();
            onKick();
          }}
          aria-label="Kick player"
        >
          Kick
        </button>
      )}
    </div>
  );
}

export default PlayerItem;
