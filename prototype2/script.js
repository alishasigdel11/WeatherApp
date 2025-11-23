async function fetchWeather() { 
    const location = document.getElementById('location').value.trim();

    if (!location) {
        alert('Please enter a city name.');
        return;
    }

    try {
        const response = await fetch(`http://localhost/Prototype2/connection.php?q=${encodeURIComponent(location)}`);
        const data = await response.json();

        if (data.error) {
            console.log('Fetching from OpenWeatherMap due to missing or outdated data...');
            await fetchFromOpenWeather(location);
            return;
        }

        displayWeatherFromDatabase(data);

    } catch (error) {
        console.error("Error fetching data from connection.php:", error);
        document.getElementById('forecast').innerHTML = `<p style="color: red;">Error fetching weather data.</p>`;
    }
}

async function fetchFromOpenWeather(location) {
    const apiKey = 'a7105641180d8b8bf7f6eb14ebd8ea72';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('City not found or API error.');
        }

        const data = await response.json();
        displayWeatherFromAPI(data);

        // Trigger the PHP script to store data into the database
        await fetch(`http://localhost/Prototype2/connection.php?q=${encodeURIComponent(location)}`);
    } catch (error) {
        document.getElementById('forecast').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        console.error('Fetch Error:', error);
    }
}

function displayWeatherFromDatabase(data) {
    const forecast = document.getElementById('forecast');
    forecast.innerHTML = `
        <h2>${data[0].city}, ${data[0].country_code}</h2>
        <p>${formatDate(new Date())}</p>
        <p>Main Weather Condition: ${data[0].mainweather}</p>
        <p>Weather Condition: ${data[0].descriptions}</p>
        <img src="https://openweathermap.org/img/wn/${data[0].icon}@2x.png" alt="Weather icon">
        <h1>${data[0].temperature}&deg;C</h1>
        <div class="weather-details">
            <div class="icon-container">
                <img src="https://img.icons8.com/ios/50/000000/humidity.png" alt="Humidity">
                <div>Humidity: ${data[0].humidity}%</div>
            </div>
            <div class="icon-container">
                <img src="https://img.icons8.com/fluency/48/windy-weather.png" alt="Wind icon">
                <div>Wind: ${data[0].wind_speed} m/s</div>
            </div>
            <div class="icon-container">
                <img src="https://img.icons8.com/ios/50/000000/barometer.png" alt="Pressure">
                <div>Pressure: ${data[0].pressure} hPa</div>
            </div>
            <div class="icon-container">
                <img src="https://img.icons8.com/ios/50/000000/visible.png" alt="Visibility">
                <div>Visibility: ${(data[0].visibility / 1000).toFixed(1)} km</div>
            </div>
        </div>
    `;
}

function displayWeatherFromAPI(data) {
    const forecast = document.getElementById('forecast');
    forecast.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <br>
        <p>${day}, ${fullDate}</p>
        <br>
        <p>Main Weather Condition: ${data.weather[0].main}</p>
        <br>
        <p>Weather Condition: ${data.weather[0].description}</p>
        <br>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
        <p class="temperature">${Math.round(data.main.temp)}&deg;C</p>
        <div class="mosh">
            <div class="icon">
                <img src="https://img.icons8.com/fluency/48/humidity.png" alt="Humidity icon">
                <p>Humidity: ${data.main.humidity}%</p>
            </div>
            <div class="icon">
                <img src="https://img.icons8.com/fluency/48/wind.png" alt="Wind icon">
                <p>Wind: ${data.wind.speed} m/s</p>
            </div>
            <div class="icon">
                <img src="https://img.icons8.com/fluency/48/barometer-gauge.png" alt="Pressure icon">
                <p>Pressure: ${data.main.pressure} hPa</p>
            </div>
            <div class="icon">
                <img src="https://img.icons8.com/fluency/48/visible.png" alt="Visibility icon">
                <p>Visibility: ${(data.visibility / 1000).toFixed(1)} km</p>
            </div>
        </div>
    `;
}


// Helper function to format the date
function formatDate(date) {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}
