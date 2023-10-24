const { parse } = require("csv-parse");
const fs = require("fs");
const planets = require("./planets.mongo");

const isPlanetHabitable = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
};

const getNewPlanetsData = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream("./data/kepler_data.csv")
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isPlanetHabitable(data)) {
          savePlanet(data);
        }
      })
      .on("error", (error) => {
        console.log(error);
        reject(error);
      })
      .on("end", async () => {
        const allStoredPlanets = (await getAllPlanets()).length;
        console.log(`Number of stored planets: ${allStoredPlanets}`);
        resolve();
      });
  });
};

const getAllPlanets = async () => {
  return await planets.find({}, { _id: 0, __v: 0 });
};

const savePlanet = async (planet) => {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.log("Error saving planet: ", error.message);
  }
};

module.exports = {
  getNewPlanetsData,
  getAllPlanets,
};
