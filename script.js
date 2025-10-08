const userLocation = document.getElementById("userLocation"),
  converter = document.getElementById("converter"),
  weatherIcon = document.querySelector(".weatherIcon"),
  temperature = document.querySelector(".temperature"),
  feelsLike = document.querySelector(".feelsLike"),
  description = document.querySelector(".description"),
  date = document.querySelector(".date"),
  city = document.querySelector(".city"),
  HValue = document.getElementById("HValue"),
  WValue = document.getElementById("WValue"),
  SRValue = document.getElementById("SRValue"),
  SSValue = document.getElementById("SSValue"),
  CValue = document.getElementById("CValue"),
  VValue = document.getElementById("VValue"),
  PValue = document.getElementById("PValue");

let currentTemp = null;

function findUserLocation() {
  const city2 = userLocation.value.trim();
  if (!city2) {
    alert("Please enter a city name");
    return;
  }

  fetch(`/weather?city=${city2}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod !== 200) {
        alert(data.message);
        return;
      }

      city.innerHTML = `${data.name} , ${data.sys.country}`;
      weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
      temperature.innerHTML = TemConverter(data.main.temp);
      currentTemp = data.main.temp;

      function getClothingSuggestion(temp) {
        if (data.weather[0].main === "Rain") return "☂️ Carry an umbrella or wear a raincoat";
        if (temp <= 10) return "🧥 Wear a heavy jacket";
        if (temp <= 18) return "🧢 Light jacket or hoodie";
        if (temp <= 25) return "👕 Light cotton clothes";
        return "🧴 Wear Light cotton clothes and Stay hydrated";
      }
      document.getElementById("clothingTip").textContent =
        `👕 Tip: ${getClothingSuggestion(data.main.temp, data.weather[0].main)}`;

      feelsLike.innerHTML = "Feels like " + data.main.feels_like;
      description.innerHTML =
        `<i class="fa-brands fa-cloudversify"></i>&nbsp;${data.weather[0].description}`;

      const options = { weekday: "long", month: "long", day: "numeric", hour: "numeric", hour12: true };
      date.innerHTML = getLongFormateDateTime(data.dt, data.timezone, options);

      HValue.innerHTML = Math.round(data.main.humidity) + "<span> % </span>";
      WValue.innerHTML = Math.round(data.wind.speed) + "<span> m/s </span>";

      const options1 = { hour: "2-digit", minute: "2-digit", hour12: true };
      SRValue.innerHTML = getLongFormateDateTime(data.sys.sunrise, data.timezone, options1);
      SSValue.innerHTML = getLongFormateDateTime(data.sys.sunset, data.timezone, options1);
      CValue.innerHTML = data.clouds.all + "<span> % </span>";

      function getVisibilityLabel(meters) {
        if (meters == null) return { label: "Unknown", color: "gray" };
        if (meters >= 10000) return { label: "Excellent", color: "lightgreen" };
        if (meters >= 6000) return { label: "Good", color: "darkgreen" };
        if (meters >= 2000) return { label: "Moderate", color: "orange" };
        if (meters >= 1000) return { label: "Poor", color: "orangered" };
        return { label: "Very Poor", color: "red" };
      }
      const visKm = (data.visibility / 1000).toFixed(1) + " km";
      const visStatus = getVisibilityLabel(data.visibility);
      VValue.innerHTML = `${visKm} <span style="color:${visStatus.color}; font-weight: 500;">(${visStatus.label})</span>`;

      // Fetch AQI
      fetch(`/airquality?lat=${data.coord.lat}&lon=${data.coord.lon}`)
        .then((response) => response.json())
        .then((airData) => {
          const aqi = airData.list[0].main.aqi;
          const aqiLabels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
          const aqiColors = ["lightgreen", "yellowgreen", "orange", "orangered", "red"];

          const pValueElem = document.getElementById("PValue");
          pValueElem.textContent = `${aqiLabels[aqi - 1]} (AQI: ${aqi})`;
          pValueElem.style.color = aqiColors[aqi - 1];
          pValueElem.style.fontWeight = "600";
        })
        .catch(() => {
          document.getElementById("PValue").textContent = "Unavailable";
        });

      // Fetch Forecast
      getWeeklyForecast(data.name);
    })
    .catch((err) => console.error("Error fetching weather:", err));
}

function formatUnixTime(dtValue, offSet, options = {}) {
  const date = new Date((dtValue + offSet) * 1000);
  return date.toLocaleTimeString([], { timeZone: "UTC", ...options });
}

function getLongFormateDateTime(dtValue, offSet, options) {
  return formatUnixTime(dtValue, offSet, options);
}

window.onload = function () {
  userLocation.value = "Mumbai";
  findUserLocation();
};

function getWeeklyForecast(cityName) {
  fetch(`/forecast?city=${cityName}`)
    .then((response) => response.json())
    .then((data) => {
      if (Number(data.cod) !== 200) {
        alert("Forecast not available");
        return;
      }

      const dailyData = [];
      data.list.forEach((item) => {
        if (item.dt_txt.split(" ")[1] === "12:00:00") {
          dailyData.push(item);
        }
      });

      const weeklyForecastContainer = document.getElementById("weeklyForecast");
      weeklyForecastContainer.innerHTML = "";

      dailyData.forEach((day) => {
        const date = new Date(day.dt_txt);
        const options = { weekday: "short", day: "numeric", month: "short" };

        const forecastCard = document.createElement("div");
        forecastCard.classList.add("forecast-card");

        forecastCard.innerHTML = `
          <p>${date.toLocaleDateString("en-US", options)}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" />
          <p>${Math.round(day.main.temp)}°C</p>
          <p>${day.weather[0].main}</p>
        `;

        weeklyForecastContainer.appendChild(forecastCard);
      });
    })
    .catch((error) => {
      console.error("Error fetching forecast:", error);
    });
}

function TemConverter(temp) {
  let tempValue = Math.round(temp);
  if (converter.value === "°C") {
    return tempValue + "<span>°C</span>";
  } else {
    let ctof = Math.round((tempValue * 9) / 5 + 32);
    return ctof + "<span>°F</span>";
  }
}

function updateDisplayedTemperature() {
  if (currentTemp !== null) {
    document.querySelector(".temperature").innerHTML = TemConverter(currentTemp);
  }
}

document.getElementById("converter").addEventListener("change", updateDisplayedTemperature);

function toggleMenu() {
  const inputSection = document.querySelector(".weather-input");
  inputSection.classList.toggle("visible");
}

