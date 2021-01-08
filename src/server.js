var express = require("express");
var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var fs = require("fs");

const fsRead = () => {
  let outNumber = fs
    .readFileSync("db/outNumber.txt", {
      encoding: "utf8",
      flag: "r",
    })
    .split("\n");
  let bgNumber = fs.readFileSync("db/bgNumber.txt", {
    encoding: "utf8",
    flag: "r",
  });
  outNumber.splice(outNumber.length - 1, 1);

  console.log(outNumber);
  console.log("bgNumber", bgNumber);
  return [outNumber, bgNumber];
};

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/init.html");
});
app.get("/host", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
app.get("/guest", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static("public"));

io.on("connection", function (socket) {
  console.log("a user connected");
  io.emit("readData", { value: fsRead() });
  socket.on("roulette start", function (num) {
    console.log("roulette start", num);
    io.emit("roulette start", num);
  });
  socket.on("slide animation", function (num) {
    console.log("slide animation", num);
    io.emit("slide animation", num);
  });
  // データ保存
  socket.on("save", function (data) {
    console.log("save", data);
    let str = `${data[0]}\n`;
    fs.writeFile("db/outNumber.txt", str, { flag: "a" }, (err) => {
      if (err) console.log(err);
    });
    fs.writeFile("db/bgNumber.txt", data[1], (err) => {
      if (err) console.log(err);
    });
    let sendArr = fsRead();
    sendArr[0].push(String(data[0]));
    sendArr[1] = data[1];
    io.emit("readData", { value: sendArr });
  });
  // リセット
  socket.on("reset", function (data) {
    console.log("reset");
    fs.writeFile("db/outNumber.txt", "", (err) => {
      if (err) console.log(err);
    });
    fs.writeFile("db/bgNumber.txt", "", (err) => {
      if (err) console.log(err);
    });
    let sendArr = data;
    sendArr.push("reset");
    console.log("data.length", sendArr.length);

    io.emit("readData", { value: sendArr });
  });
});

http.listen(3000, function () {
  console.log("listening on *:3000");
});
