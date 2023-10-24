const {
  getAllLaunches,
  addNewLaunch,
  doesLaunchExist,
  abortLaunch,
} = require("../../../models/launches.model");
const { paginateResults } = require("./pagination");

const httpGetAllLaunches = async (req, res) => {
  const { skip, limit } = paginateResults(req);

  const launchesArray = await getAllLaunches(skip, limit);

  return res.status(200).json(launchesArray);
};

const httpAddNewLaunch = async (req, res) => {
  let newLaunch = req.body;

  if (
    !newLaunch.mission ||
    !newLaunch.rocket ||
    !newLaunch.target ||
    !newLaunch.launchDate
  ) {
    return res.status(400).json({
      error: "Bad user input..",
    });
  }
  newLaunch.launchDate = new Date(newLaunch.launchDate);

  if (isNaN(newLaunch.launchDate)) {
    return res.status(400).json({
      error: "Invalid date entry..",
    });
  }

  return res.status(201).json(await addNewLaunch(newLaunch));
};
const httpAbortLaunch = async (req, res) => {
  const launchId = +req.params.id;
  const launchExists = await doesLaunchExist(launchId);

  if (!launchExists) {
    return res.status(404).json({
      error: "Launch does not exist",
    });
  }

  const abortResponse = await abortLaunch(launchId);
  if (!abortResponse) {
    return res.status(404).json({
      error: "Launch not aborted",
    });
  }

  return res.status(200).json({
    acknowledged: true,
  });
};

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
