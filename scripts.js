const OPENWEATHER_KEY = 'faaf0e2f99c52356f21e7ce0081fbff0'; 


// Initialize map
const map = L.map('map').setView([20, 77], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;

// Geolocation on page load
if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
    }, () => console.log("Geolocation denied. Search manually."));
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if(city) fetchWeatherByCity(city);
});

document.getElementById('forecastBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if(city) fetchForecast(city);
    else alert('Enter a city name to see 5-day forecast');
});

// Fetch weather by city
async function fetchWeatherByCity(city){
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_KEY}&units=metric`);
        if(!res.ok) throw new Error("City not found");
        const data = await res.json();
        displayWeather(data);
    } catch(err){
        document.getElementById('weather').innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon){
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`);
        const data = await res.json();
        displayWeather(data);
    } catch(err){
        console.log(err);
    }
}

// Display current weather and map
function displayWeather(data){
    const { coord, main, weather, wind, sys, name } = data;
    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = `
        <div class="weather-card">
            <h2>${name}, ${sys.country}</h2>
            <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].main}">
            <p>Temperature: ${main.temp} °C</p>
            <p>Condition: ${weather[0].main}</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>Wind: ${wind.speed} m/s</p>
            <p>Sunrise: ${new Date(sys.sunrise*1000).toLocaleTimeString()}</p>
            <p>Sunset: ${new Date(sys.sunset*1000).toLocaleTimeString()}</p>
        </div>
    `;
    if(marker) map.removeLayer(marker);
    marker = L.marker([coord.lat, coord.lon]).addTo(map).bindPopup(name).openPopup();
    map.setView([coord.lat, coord.lon], 8);
}

// Fetch 5-day forecast
async function fetchForecast(city){
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_KEY}&units=metric`);
        if(!res.ok) throw new Error("Forecast not found");
        const data = await res.json();
        displayForecast(data);
    } catch(err){
        document.getElementById('forecast').innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
}

// Display forecast
function displayForecast(data){
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '';
    for(let i=0; i<data.list.length; i+=8){
        const item = data.list[i];
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <h3>${new Date(item.dt*1000).toLocaleDateString()}</h3>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].main}">
            <p>Temp: ${item.main.temp_min}°C - ${item.main.temp_max}°C</p>
            <p>${item.weather[0].main}</p>
        `;
        forecastDiv.appendChild(card);
    }
}
