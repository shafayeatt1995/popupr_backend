const { mongoConnect } = require("../config/database");

const mongoMiddleware = async (req, res, next) => {
  try {
    await mongoConnect();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    res.status(500).json({ error: "Failed to connect to the database" });
  }
};

module.exports = mongoMiddleware;
