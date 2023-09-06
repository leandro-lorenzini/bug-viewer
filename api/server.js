const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const settings = require("./src/controllers/settings.controller");

const app = express();

app.use(express.json()); // This is to parse JSON data if needed elsewhere in your app
app.use(express.urlencoded({ extended: true })); // This is to parse application/x-www-form-urlencoded
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));

// Session settings
app.use(
  session({
    name: "bug-viewer",
    secret: process.env.SESSION_SECRET || "test",
    secure: true,
    proxy: true,
    resave: true,
    saveUninitialized: false,
    maxAge: 3600000 * 12,
    cookie: {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: 3600000 * 12,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://mongo:27017/bug-viewer",
    }),
  })
);
app.use("/repository", require("./src/routes/repository.route"));
app.use("/auth", require("./src/routes/auth.route"));
app.use("/user", require("./src/routes/user.route"));
app.use("/token", require("./src/routes/token.route"));
app.use("/settings", require("./src/routes/settings.route"));
app.use("/parser", require("./src/routes/parser.route"));

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/bug-viewer")
  .then(() => {
    settings
      .setup()
      .then(() => {
        app.listen(3000, () => {
          console.log("API is running");
        });
      })
      .catch((error) => {
        console.log(error);
      });
  })
  .catch((error) => {
    console.error("Database connection error");
    console.log(error);
    process.exit(-1);
  });