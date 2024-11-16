const express = require("express");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const fileUpload = require("express-fileupload");
const mongoMiddleware = require("./middleware/mongoMiddleware");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL, ttl: 60 * 30 }),
    cookie: { secure: process.env.NODE_ENV !== "development" },
  })
);
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));

app.use("/webhook", mongoMiddleware, require("./routes/webhook"));
app.use(express.json());
app.get("/", (req, res) => res.json({ message: "Hello world" }));
app.use("/", mongoMiddleware, require("./routes"));

app.listen(port, () =>
  console.log(`> Server listening at http://localhost:${port}`)
);
