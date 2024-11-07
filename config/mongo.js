const mongoose = require("mongoose");
const time = Date.now();
const mongoUrl = process.env.MONGO_URL;
mongoose.set("strictQuery", false);

mongoose
  .connect(mongoUrl, { autoIndex: false })
  .then(() => {})
  .catch((err) => console.error("Error connecting to mongo", err))
  .finally(() =>
    console.log("Mongo connected time", (Date.now() - time) / 1000 + "sec")
  );

const connection = mongoose.connection;
connection.on("error", (error) => console.error(error));
mongoose.Promise = global.Promise;

if (process.env.MONGO_LOGS === "1") {
  mongoose.set("debug", true);
}
