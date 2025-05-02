import "./TurnIndicator.scss";

interface TurnIndicatorProps {
  isPlayerTurn: boolean;
  timeLeftPercent: number;
  playerName: string;
}

const TurnIndicator = ({
  isPlayerTurn,
  timeLeftPercent,
  playerName,
}: TurnIndicatorProps) => {
  // Only show when it's the player's turn
  if (!isPlayerTurn) {
    return null;
  }

  return (
    <div className="turn-indicator">
      {/* Status message */}
      <div className="status-message">{playerName}'s Turn</div>

      {/* Timer bar */}
      <div className="timer-container">
        <div className="timer-bar" style={{ width: `${timeLeftPercent}%` }} />
      </div>
    </div>
  );
};

export default TurnIndicator;
