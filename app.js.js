const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`your code is error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertSnakeToCamel = (each) => {
  return {
    movieId: each.movie_id,
    directorId: each.director_id,
    movieName: each.movie_name,
    leadActor: each.lead_actor,
  };
};

const convertSnakeToCamelDirector = (each) => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const allMoviesDetails = `select movie_name from movie order by movie_id ASC;`;
  const allMoviesDetailsResult = await db.all(allMoviesDetails);
  response.send(
    allMoviesDetailsResult.map((each) => convertSnakeToCamel(each))
  );
});

app.post("/movies/", async (request, response) => {
  const getDetails = request.body;
  const { directorId, movieName, leadActor } = getDetails;
  const getDetailsResult = `insert into movie (director_id, movie_name, lead_actor)
    values 
    (
        ${directorId},
        "${movieName}",
        "${leadActor}"
    );`;
  await db.run(getDetailsResult);
  response.send("Movie Successfully Added");
});

app.get("/directors/", async (request, response) => {
  const directorList = `select * from director order by director_id;`;
  const directorListResult = await db.all(directorList);
  response.send(
    directorListResult.map((each) => convertSnakeToCamelDirector(each))
  );
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieName = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieName);
  response.send("Movie Removed");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const changeData = `select * from movie where director_id = ${movieId};`;
  const collectDataResult = await db.get(changeData);
  response.send(convertSnakeToCamel(collectDataResult));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const insertMovieDetails = request.body;
  const { directorId, movieName, leadActor } = insertMovieDetails;
  const insertDetails = `UPDATE movie
SET director_id = ${directorId}, movie_name = "${movieName}", lead_actor = "${leadActor}"
WHERE movie_id = ${movieId};`;
  await db.run(insertDetails);
  response.send("Movie Details Updated");
});

module.exports = app;
