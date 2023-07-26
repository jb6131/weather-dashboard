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
      console.log(weatherData);
      weatherDataCallback(weatherData);
    });
}

function updateCurrentWeather(weatherData) {
  var city = weatherData.city.name;
  var date = new Date(weatherData.list[0].dt * 1000).toLocaleDateString();
  var icon = weatherData.list[0].weather[0].icon;

  var temperatureKelvin = weatherData.list[0].main.temp;
  var temperatureFahrenheit = (temperatureKelvin - 273.15) * 9/5 + 32;

  var temperatureShown = temperatureFahrenheit.toFixed(2);
  var windSpeed = weatherData.list[0].wind.speed;
  var humidity = weatherData.list[0].main.humidity;

  var currentWeatherDiv = document.getElementById('current-weather');

  currentWeatherDiv.innerHTML = `
  <p class="is-size-3">${city} (${date}) <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon"></p>
  <p>Temp: ${temperatureShown}&deg;F</p>
  <p>Wind: ${windSpeed} m/s</p>
  <p>Humidity: ${humidity}%</p>
  `;
}

function updateFiveDayForecast(weatherData) {
  var forecastDivs = document.querySelectorAll('.forecast-box');

  for (var i = 7; i < 40; i += 8) {
    var date = new Date(weatherData.list[i].dt * 1000).toLocaleDateString();
    var icon = weatherData.list[i].weather[0].icon;

    var temperatureKelvin = weatherData.list[i].main.temp;
    var temperatureFahrenheit = (temperatureKelvin - 273.15) * 9/5 + 32;

    var temperatureShown = temperatureFahrenheit.toFixed(2);
    var windSpeed = weatherData.list[i].wind.speed;
    var humidity = weatherData.list[i].main.humidity;

    var index = Math.floor((i - 7) / 8);

    forecastDivs[index].innerHTML = `
      <p>${date}</p>
      <p><img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon"></p>
      <p>Temp: ${temperatureShown}&deg;F</p>
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
    historyButton += `<button id="search-history" class="button is-small is-fullwidth my-2" data-city="${city}">${city}</button>`;
  }

  searchHistoryDiv.innerHTML = historyButton;
}

function displaySearchHistoryOnLoad() {
  var searchHistory = localStorage.getItem('searchHistory');
  searchHistory = JSON.parse(searchHistory);

  var searchHistoryDiv = document.getElementById('search-history');
  var historyButton = '';

  for (var i = 0; i < searchHistory.length; i++) {
    var city = searchHistory[i];
    historyButton += `<button id="search-history" class="button is-small is-fullwidth my-2" data-city="${city}">${city}</button>`;
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

function handleHistoryButtons(event) {
  if (event.target.id === 'search-history') {
    var city = event.target.dataset.city;

    getCoordinates(city, function (coordinates) {
      var data = {
        lat: coordinates.lat,
        lon: coordinates.lon,
        city: city
      };
      handleCoordinates(data);
    });
  }
}

function showError(message) {
  var errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
}

var searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', handleSearch);

var searchHistoryDiv = document.getElementById('search-history');
searchHistoryDiv.addEventListener('click', handleHistoryButtons);

displaySearchHistoryOnLoad();