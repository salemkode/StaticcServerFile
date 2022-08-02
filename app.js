//
require('dotenv').config()
const fs = require("fs");
const path = require('path');

//
const express = require("express"),
  app = express();

//
app.get("/", async (req, res) => {
  const _path = path.join(__dirname, "static");
  fs.readdir(_path, (error, items) => {
    if (error) {
      res.send({
        error: true,
        message: "I can't get files list"
      });
    } else {
      const result = items.map((item) => {
        if (!item.startsWith(".")) {
          return `<a href="${req.protocol}://${path.join(req.get("host"), item)}">${item}</a> <br />`;
        }
      })

      res.send(result.join(""));
    }
  })
});

//
app.use(express.static("./static"));

//
const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log("Server start in http://localhost:" + port)
})