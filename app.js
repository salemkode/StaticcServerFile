//
require('dotenv').config()

//
const express = require("express"),
  app = express();

//
app.use(express.static("./static"));

//
const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log("Server start in http://localhost:" + port)
})