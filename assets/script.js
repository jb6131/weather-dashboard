function getCoordinates(city, weatherDataCallback) {
  var apiKey = '761c649664695b812876f6334b403542';
  var geocodingApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  fetch(geocodingApiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (geocodingData) {
      if (geocodingData.length === 0) {
        showError("City not found");
      }

      var lat = geocodingData[0].lat;
      var lon = geocodingData[0].lon;
      weatherDataCallback({ lat, lon });
    });
}

function getWeatherByCoordinates(lat, lon, weatherDataCallback) {
  var apiKey = '761c649664695b812876f6334b403542';
  var weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(weatherApiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (weatherData) {
      weatherDataCallback(weatherData);
    });
}

function updateCurrentWeather(weatherData) {
  var city = weatherData.city.name;
  var date = '7/23/2023'; // Placeholder
  var icon = weatherData.list[0].weather[0].icon;
  var temperature = weatherData.list[0].main.temp;
  var windSpeed = weatherData.list[0].wind.speed;
  var humidity = weatherData.list[0].main.humidity;

  var currentWeatherDiv = document.getElementById('current-weather');

  currentWeatherDiv.innerHTML = `
  <h2>${city} (${date}) <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon"></h2>
  <p>Temp: ${temperature} K</p>
  <p>Wind: ${windSpeed} m/s</p>
  <p>Humidity: ${humidity}%</p>
  `;
}

function updateFiveDayForecast(weatherData) {
  var forecastDivs = document.querySelectorAll('.forecast-box');

  for (var i = 0; i < 5; i++) {
    var date = '7/23/2023';
    var icon = weatherData.list[i].weather[0].icon;
    var temperature = weatherData.list[i].main.temp;
    var windSpeed = weatherData.list[i].wind.speed;
    var humidity = weatherData.list[i].main.humidity;

    forecastDivs[i].innerHTML = `
      <p>Date: ${date}</p>
      <p><img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon"></p>
      <p>Temp: ${temperature} K</p>
      <p>Wind: ${windSpeed} m/s</p>
      <p>Humidity: ${humidity}%</p>
    `;
  }
}

function displaySearchHistory(searchHistory) {
  var searchHistoryDiv = document.getElementById('search-history');
  var historyButton = '';

  for (var i = 0; i < searchHistory.length; i++) {
    var city = searchHistory[i];
    historyButton += `<button class="button is-small">${city}</button>`;
  }

  searchHistoryDiv.innerHTML = historyButton;
}

function handleCoordinates(coordinates) {
  getWeatherByCoordinates(coordinates.lat, coordinates.lon, 
    function (weatherData) {
      handleWeatherData(weatherData, coordinates.city);
    });
}

function handleWeatherData(weatherData, city) {
  updateCurrentWeather(weatherData);
  updateFiveDayForecast(weatherData);

  var searchHistory = localStorage.getItem('searchHistory');

  if (!searchHistory) {
    searchHistory = [];
  } else {
    searchHistory = JSON.parse(searchHistory);
  }

  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
  }

  localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

  displaySearchHistory(searchHistory);
}

function handleSearch() {
  var searchInput = document.getElementById('city-search');
  var city = searchInput.value;

  getCoordinates(city, function (coordinates) {
    var data = {
      lat: coordinates.lat,
      lon: coordinates.lon,
      city: city
    };
    handleCoordinates(data);
  })
}

function showError(message) {
  var errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
}

var searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', handleSearch);