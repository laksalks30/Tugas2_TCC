require("dotenv").config();

const express = require("express");
const sequelize = require("./config/database");
const noteRoutes = require("./routes/noteRoutes");

const app = express();
const cors = require("cors");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Notes App Backend is running!");
});

require("./schema/Note");
app.use("/api/v1/notes", noteRoutes); //Endpoint

const port = process.env.PORT || 8080;

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await sequelize.sync();
    console.log("Database synced");
  } catch (err) {
    console.error("Database sync failed:", err.message);
  }
});