import { Shuffle } from "lucide-react";
import "./PlayerSelector.scss";

export interface Player {
  displayName: string;
  handLength: number;
  isHost: boolean;
  isTurn: boolean;
  isYou: boolean;
  score: number;
  userId: string;
}

interface PlayerSelectorProps {
  players: Player[];
  handlePlayerSelect: (userId: string) => void;
}

const PlayerSelector = ({
  players,
  handlePlayerSelect,
}: PlayerSelectorProps) => {
  return (
    <div className="player-selector">
      <div className="selector-header">
        <h2 className="selector-title">Swap Hands With</h2>
      </div>
      <div className="selector-content">
        <div className="player-list">
          {players.map((player) => (
            <button
              key={player.userId}
              className="player-button"
              onClick={() => handlePlayerSelect(player.userId)}
            >
              <span className="player-name">{player.displayName}</span>
              <div className="player-info">
                <span className="card-count">{player.handLength} cards</span>
                <Shuffle className="shuffle-icon" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerSelector;
