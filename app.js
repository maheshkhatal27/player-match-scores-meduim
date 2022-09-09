const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1- Returns a list of all the players in the player table

app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
      SELECT 
      player_id as playerId,
      player_name as playerName
      FROM
      player_details;`;

  const getAllPlayersArray = await db.all(getAllPlayersQuery);
  response.send(getAllPlayersArray);
});

//API 2-Returns a specific player based on the player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSpecificPlayerQuery = `SELECT 
      player_id as playerId,
      player_name as playerName
      FROM
      player_details
      WHERE player_id=${playerId};`;
  const specificPlayer = await db.get(getSpecificPlayerQuery);
  response.send(specificPlayer);
});

//API 3- Updates the details of a specific player based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersDetails = request.body;
  const { playerName } = playersDetails;

  const updateSpecificPlayerQuery = `
    UPDATE 
    player_details
    SET
    player_name='${playerName}' 
    WHERE 
    player_id=${playerId};`;

  const updatePlayer = await db.run(updateSpecificPlayerQuery);
  response.send("Player Details Updated");
});

//API 4-Returns the match details of a specific match

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT
    match_id as matchId,
    match,year
    FROM 
    match_details WHERE
    match_id=${matchId};`;

  const matchDetailsResponse = await db.get(getMatchDetailsQuery);
  response.send(matchDetailsResponse);
});
//API 5-Returns a list of all the matches of a player

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getAllMatchesOfPlayerQuery = `
    SELECT
      match_id as matchId,match,year 
    FROM player_match_score 
      NATURAL JOIN match_details
    WHERE
      player_id=${playerId};
    `;
  const playerMatchesResponse = await db.all(getAllMatchesOfPlayerQuery);
  response.send(playerMatchesResponse);
});

//API 6-Returns a list of players of a specific match

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersOfMatchesQuery = `SELECT
    player_id as playerId,
    player_name as playerName
    FROM player_match_score
    NATURAL JOIN
    player_details
    WHERE
    match_id=${matchId};`;

  const listOfPlayersSpecificMatches = await db.all(getPlayersOfMatchesQuery);
  response.send(listOfPlayersSpecificMatches);
});

//API 7-Returns the statistics of the total score, fours, sixes of a specific player based on the player ID

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatisticsOfPlayerQuery = `
    SELECT player_id as playerId,
    player_name as playerName,
    sum(score) as totalScore,
    sum(fours) as totalFours,
    sum(sixes) as totalSixes 
    FROM
    player_match_score NATURAL JOIN 
    player_details
    WHERE
    player_id=${playerId}`;
  const statisticsOfPlayer = await db.get(getStatisticsOfPlayerQuery);
  response.send(statisticsOfPlayer);
});
module.exports = app;
