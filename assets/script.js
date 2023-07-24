function getWeatherData(city) {
  var apiKey = '761c649664695b812876f6334b403542';

  var geocodingApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  return fetch(geocodingApiUrl)
    .then(function (response) {
      console.log('Geocoding API Response:', response);
      return response.json();
    })
    .then(function (geocodingData) {
      console.log('Geocoding Data:', geocodingData);
      if (geocodingData.length === 0) {
        showError("City not found");
        return;
      }

      var lat = geocodingData[0].lat;
      var lon = geocodingData[0].lon;
    
      var weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      
      return fetch(weatherApiUrl)
        .then(function (response) {
          console.log('Weather API Response:', response);
          return response.json();
        })
        .catch(function (error) {
          console.error(error);
          throw error;
        });
    })
    .catch(function(error) {
      console.error(error);
      throw error;
    });
}

function updateCurrentWeather(weatherData) {
  var city = weatherData.city.name;
  var date = '7/23/2023'; // Placeholder
  var icon = weatherData.list[0].weather[0].icon;
  var temperature = weatherData.list[0].main.temp;
  var humidity = weatherData.list[0].main.humidity;
  var windSpeed = weatherData.list[0].wind.speed;

  var currentWeatherDiv = document.getElementById('current-weather');

  currentWeatherDiv.innerHTML = `
  <h2>${city} (${date}) <img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon"></h2>
  <p>Temp: ${temperature} K</p>
  <p>Wind: ${windSpeed} m/s</p>
  <p>Humidity: ${humidity}%</p>
  `;
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

function handleSearch() {
  var searchInput = document.getElementById('city-search');
  var city = searchInput.value;

  var weatherDataPromise = getWeatherData(city);

  weatherDataPromise
    .then(function(weatherData) {
      console.log('Weather Data:', weatherData);
      
      updateCurrentWeather(weatherData);
      // updateFiveDayForecast(weatherData);

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
    })
    .catch(function(error) {
      console.error(error);
    });
}

function showError(message) {
  var errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
}

var searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', handleSearch);