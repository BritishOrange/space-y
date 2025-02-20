import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";

const rootDir = process.cwd();
const port = 3000;
const app = express();

const loginedUsers = {};

app.use(express.static('spa/build'));
app.use(cookieParser());
app.use(express.json());

const isAuthorized = function (req, res, next) {
  if (req.originalUrl.includes('api') ||
      req.originalUrl.includes('static') ||
      req.originalUrl.includes('login')) {
    next();
    return;
  }
  if ("username" in req.cookies) {
    next();
    return;
  }
  res.redirect("/login");
  next();
}

app.use(isAuthorized);
app.use(isAuthorized);

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/", (_, res) => {
  res.send(":)");
});

app.get("*", (_, res) => {
  res.sendFile(path.join(rootDir, "spa/build/index.html"));
})

app.post("/api/login", (req, res) => {
  let username = req.body.username;
  loginedUsers[username] = true;
  res.cookie('username', username, {secure: true, httpOnly: true, sameSite: true});
  res.json({username: username});
});


app.post("/api/unlogin", (req, res) => {
  let username = req.body.username;
  delete loginedUsers[username];
  res.json({status: true});
});

https.createServer(
        {
          key: fs.readFileSync("certs/server.key"),
          cert: fs.readFileSync("certs/server.cert"),
        },
        app
    )
    .listen(3000, function () {
      console.log(
          "Example app listening on port 3000! Go to https://localhost:3000/"
      );
    });
