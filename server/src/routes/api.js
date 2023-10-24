const express = require("express");
const planetsRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");

const app = express.Router();

app.use("/launches", launchesRouter);
app.use("/planets", planetsRouter);

module.exports = app;
