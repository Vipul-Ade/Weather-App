const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Loads .env file

const app = express();
app.use(cors());

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname)));

const API_KEY = process.env.WEATHER_API_KEY;

// ✅ Current Weather
app.get("/weather", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

// ✅ Forecast
app.get("/forecast", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch forecast" });
  }
});

// ✅ Air Quality
app.get("/airquality", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon)
    return res.status(400).json({ error: "Lat and Lon are required" });

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch air quality" });
  }
});

// ✅ Fallback for single-page app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("✅ Loaded API Key:", API_KEY ? "Yes" : "No");
});
