const mongoose = require("mongoose");

const mongo = {
  async mongoConnect() {
    mongoose.set("strictQuery", true);
    const maxRetries = 5;
    let attempts = 0;

    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB is already connected.");
      return;
    }

    while (attempts < maxRetries) {
      try {
        await mongoose.connect(process.env.MONGO_URL, { autoIndex: true });
        console.log("MongoDB Connected");
        return;
      } catch (error) {
        attempts++;
        console.error(`MongoDB connection attempt ${attempts} failed:`, error);
        if (attempts === maxRetries) {
          console.error("Failed to connect to MongoDB after maximum retries.");
          throw new Error("MongoDB connection error");
        }

        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  },
};

module.exports = mongo;
