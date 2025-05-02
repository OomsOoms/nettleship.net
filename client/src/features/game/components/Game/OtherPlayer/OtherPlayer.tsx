import UnoCard from "../UnoCard/UnoCard";
import "./OtherPlayer.scss";

export interface Player {
  displayName: string;
  handLength: number;
  isHost: boolean;
  isTurn: boolean;
  isYou: boolean;
  score: number;
  userId: string;
}

interface OtherPlayerProps {
  player: Player;
  isActive?: boolean;
  timeLeftPercent?: number;
}

const OtherPlayer = ({
  player,
  isActive = false,
  timeLeftPercent = 100,
}: OtherPlayerProps) => {
  // Generate dummy card for display
  const dummyCard = {
    colour: "black" as const,
    type: "wild" as const,
    score: 50,
  };

  // Calculate how much to offset each card
  // For fewer cards, we can spread them out more
  const getOffset = () => {
    if (player.handLength <= 5) return 12;
    if (player.handLength <= 8) return 8;
    return 6; // For many cards, compact them more
  };

  const offset = getOffset();

  return (
    <div className="other-player">
      <div className="player-name-container">
        {/* Timer background for active player */}
        {isActive && (
          <div
            className="timer-background"
            style={{
              width: `${timeLeftPercent}%`,
              left: `${(100 - timeLeftPercent) / 2}%`,
            }}
          />
        )}

        {/* Player name */}
        <div className={`player-name ${isActive ? "active" : ""}`}>
          {player.displayName}
          {player.isHost && <span className="host-badge">Host</span>}
        </div>
      </div>

      <div className="cards-container">
        {Array.from({ length: player.handLength }).map((_, index) => {
          // Calculate rotation and offset for a fan effect
          const rotation = (index - (player.handLength - 1) / 2) * 5;
          const xOffset = (index - (player.handLength - 1) / 2) * offset;

          return (
            <div
              key={index}
              className="card-wrapper"
              style={{
                transform: `translateX(${xOffset}px) rotate(${rotation}deg)`,
                zIndex: index,
              }}
            >
              <UnoCard card={dummyCard} size="sm" faceDown />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OtherPlayer;
