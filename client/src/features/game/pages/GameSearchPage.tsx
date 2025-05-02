import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import GameFilters from "../components/GameSearch/GameFilters";
import GameTable from "../components/GameSearch/GameTable";

import InputField from "@components/ui/InputField";
import Button from "@components/ui/Button";
import MainLayout from "@components/layout/MainLayout";

import useGetGames from "../hooks/useGetGames";
import useCheckGameExists from "../hooks/useCheckGameExists";
import useCreateGame from "../hooks/useCreateGame";

import "../styles/GameSearchPage.scss";

const GameSearchPage = () => {
  const navigate = useNavigate();

  const {
    loading: gamesLoading,
    filters,
    handleChange,
    games,
    refresh,
  } = useGetGames();

  const {
    gameExists,
    loading: checkGameLoading,
    checkGame,
    gameCode: inputtedGameCode,
    setGameCode,
  } = useCheckGameExists();

  const {
    loading: createGameLoading,
    handleCreateGame: createGame,
    gameCode: newGameCode,
  } = useCreateGame();

  const loading = gamesLoading || checkGameLoading || createGameLoading;

  useEffect(() => {
    if (gameExists) {
      navigate(`/lobby/${inputtedGameCode}`);
    } else if (newGameCode) {
      navigate(`/lobby/${newGameCode}`);
    }
  }, [gameExists, newGameCode, inputtedGameCode, navigate]);

  return (
    <MainLayout>
      <div className="game-search-container">
        <div className="header-section">
          <div className="controls-container">
            <InputField
              name="gameCode"
              value={inputtedGameCode}
              onChange={(e) => setGameCode(e.target.value)}
              className="input-field"
            />
            <div className="button-container">
              <Button
                onClick={() => checkGame(inputtedGameCode)}
                disabled={!inputtedGameCode}
                className="button"
              >
                Join Game
              </Button>
              <Button onClick={createGame} className="button">
                Create Game
              </Button>
            </div>
          </div>
        </div>
        <div className="content-section">
          <GameFilters
            filters={filters}
            handleChange={handleChange}
            refresh={refresh}
          />
          <div className="table-container">
            <GameTable games={games} loading={loading} joinGame={checkGame} />
          </div>
        </div>
      </div>
      {loading && <div className="loading">Loading...</div>}
    </MainLayout>
  );
};

export default GameSearchPage;
