const mongoose = require("mongoose");

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready!");
});

mongoose.connection.on("error", (error) => {
  console.error(error);
});

const mongoConnect = async () => {
  await mongoose.connect(process.env.MONGO_URL);
};

const mongoDisconnect = async () => {
  await mongoose.disconnect(process.env.MONGO_URL);
};

module.exports = { mongoConnect, mongoDisconnect };
