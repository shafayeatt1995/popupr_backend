require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const mongoMiddleware = require("./middleware/mongoMiddleware");

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL, ttl: 60 * 60 }),
    cookie: { secure: process.env.NODE_ENV !== "development" },
  })
);

app.get("/", (req, res) => res.json({ message: "Hello world" }));
app.use("/webhook", mongoMiddleware, require("./routes/webhook"));
app.use("/", mongoMiddleware, require("./routes"));

app.listen(port, () =>
  console.log(`> Server listening at http://localhost:${port}`)
);
