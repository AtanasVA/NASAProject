const { parse } = require("csv-parse");
const fs = require("fs");

const results = [];

const listHabitablePlanets = (planetsArr) => {
  const habitablePlanets = planetsArr.filter(
    (planet) =>
      planet.koi_disposition === "CONFIRMED" &&
      planet.koi_insol > 0.36 &&
      planet.koi_insol < 1.11 &&
      planet.koi_prad < 1.6
  );
  console.log();
  console.log(
    `Number of habitable planets found: ${habitablePlanets.length} \n`
  );
  habitablePlanets.map((planet) =>
    console.log(`Planet Name: ${planet.kepler_name}`)
  );
  console.log();
};

fs.createReadStream("kepler_data.csv")
  .pipe(
    parse({
      comment: "#",
      columns: true,
    })
  )
  .on("data", (data) => {
    results.push(data);
  })
  .on("error", (error) => {
    console.log(error);
  })
  .on("end", () => listHabitablePlanets(results));
