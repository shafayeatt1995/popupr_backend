require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const mongoMiddleware = require("./middleware/mongoMiddleware");
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60,
    }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});
app.use("/", mongoMiddleware, require("./routes"));

app.listen(port, "0.0.0.0", () => {
  console.log(`> Server listening at http://localhost:${port}`);
});
