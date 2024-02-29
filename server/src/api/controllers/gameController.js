const gameService = require("../services/gameService");

async function createGame(req, res) {
  const { name, uuid, password } = req.body;
  try {
    const userDetails = await gameService.createGame({ name, uuid, password });
    return res.status(200).json(userDetails);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function findPublicGames(req, res) {
  const publicGames = await gameService.findPublicGames();
  try {
    res.status(200).json(publicGames);
  } catch (error) {
    console.error("Error fetching public games:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createGame,
  findPublicGames,
};
