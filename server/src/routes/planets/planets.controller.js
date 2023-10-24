const { getAllPlanets } = require("../../../models/planets.model");

const httpGetAllPlanets = async (_, res) => {
  return res.status(200).json(await getAllPlanets());
};

module.exports = {
  httpGetAllPlanets,
};
