const http = require("http");
const { mongoConnect } = require("./services/mongo");
const { loadLaunchesData } = require("../models/launches.model");
require("dotenv").config();

const app = require("./app");
const { getNewPlanetsData } = require("../models/planets.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const startServer = async () => {
  await mongoConnect();
  await getNewPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Watching on port ${PORT}...`);
  });
};

startServer();
