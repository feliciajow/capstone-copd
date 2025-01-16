const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res) => {
  res.send("Received!");
});
app.post("/fileUpload", (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`BREATHAI listening on port ${port}`);
});