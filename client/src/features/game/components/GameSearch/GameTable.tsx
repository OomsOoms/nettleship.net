import Button from "@components/ui/Button";
import '../../styles/GameTable.scss';

interface GameTableProps {
    games: Game[];
    loading: boolean;
    joinGame: (gameCode: string) => void;
}

interface Game {
    gameCode: string;
    status: string;
    maxPlayers: number;
    players: {
        players: string[];
    };
}

const GameTable = ({ games, loading, joinGame }: GameTableProps) => {
  // Always render at least one empty row to maintain layout
  const emptyRow = (
    <tr>
      <td>
        <Button className="join-button" disabled>
          Join
        </Button>
      </td>
      <td colSpan={3} className="empty-message">
        {!loading && "No games found. Try adjusting your filters or create a new game."}
      </td>
    </tr>
  )

  return (
    <div className="game-table-wrapper">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Game Code</th>
              <th>Status</th>
              <th>Players</th>
            </tr>
          </thead>
          <tbody>
            {games.length > 0
              ? games.map((game) => (
                <tr key={game.gameCode}>
                  <td>
                    <Button className="join-button" onClick={() => joinGame(game.gameCode)}>
                      Join
                    </Button>
                  </td>
                  <td>{game.gameCode}</td>
                  <td>{game.status}</td>
                  <td>{`${game.players.players.length}/${game.maxPlayers}`}</td>
                </tr>
              ))
              : !loading && emptyRow}
          </tbody>
        </table>
    </div>
  )
}

export default GameTable

