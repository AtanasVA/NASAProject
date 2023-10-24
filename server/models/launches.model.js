const launches = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");

const DEFAUL_FLIGHT_NUMBER = 100;

const addNewLaunch = async (launch) => {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet was found");
  }

  const newFlightNumber = (await getLaunchFlightNumber()) + 1;

  const newLaunchData = {
    ...launch,
    flightNumber: newFlightNumber,
    customers: ["SpaceX", "NASA"],
    upcoming: true,
    success: true,
  };

  await saveLaunch(newLaunchData);

  return newLaunchData;
};

const populateLaunches = async () => {
  console.log("Loading planet data...");
  const SPACEX_API = "https://api.spacexdata.com/v4/launches/query";
  const response = await axios.post(SPACEX_API, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  try {
    const updatedLaunches = response.data.docs.map((launch) => {
      const launchCustomers = launch.payloads.flatMap(
        (payload) => payload.customers
      );
      return {
        flightNumber: launch.flight_number,
        mission: launch.name,
        rocket: launch.rocket.name,
        launchDate: launch.date_local,
        upcoming: launch.upcoming,
        success: launch.success,
        customers: launchCustomers,
      };
    });

    updatedLaunches.map(async (launch) => await saveLaunch(launch));
    console.log("Launches have been saved!");
  } catch (error) {
    console.log("Error loading launches data", error);
  }
};

const loadLaunchesData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded!");
    return;
  }
  await populateLaunches();
};

const getAllLaunches = async (skip, limit) => {
  return await launches
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
};

const getLaunchFlightNumber = async () => {
  const lastLaunch = await launches.findOne().sort("-flightNumber");

  if (!lastLaunch) {
    return DEFAUL_FLIGHT_NUMBER;
  }

  return lastLaunch.flightNumber;
};

const saveLaunch = async (launch) => {
  try {
    await launches.findOneAndUpdate(
      { flightNumber: launch.flightNumber },
      launch,
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.log("Error saving launch: ", error);
  }
};

const findLaunch = async (filter) => {
  return await launches.findOne(filter);
};

const doesLaunchExist = async (launchId) => {
  return await findLaunch({
    flightNumber: launchId,
  });
};

const abortLaunch = async (launchId) => {
  return await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
};

module.exports = {
  getAllLaunches,
  addNewLaunch,
  doesLaunchExist,
  abortLaunch,
  loadLaunchesData,
};
