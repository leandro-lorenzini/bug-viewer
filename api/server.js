const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const settings = require("./src/controllers/settings.controller");
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');


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
app.use("/api/repository", require("./src/routes/repository.route"));
app.use("/api/auth", require("./src/routes/auth.route"));
app.use("/api/user", require("./src/routes/user.route"));
app.use("/api/token", require("./src/routes/token.route"));
app.use("/api/settings", require("./src/routes/settings.route"));
app.use("/api/parser", require("./src/routes/parser.route"));

app.use(express.static(path.resolve(__dirname, 'ui')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'ui', 'index.html'));
});


// Connect to the database
mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/bug-viewer")
  .then(() => {
    settings
      .setup()
      .then(() => {
        if (process.env.SSL) {
          var privateKey  = fs.readFileSync('./cert/certificate.key', 'utf8');
          var certificate = fs.readFileSync('./cert/certificate.crt', 'utf8');
          var httpsServer = https.createServer({ key: privateKey, cert: certificate }, app);
          httpsServer.listen(4443);
        }
        var httpServer = http.createServer(app);
        httpServer.listen(8080);
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