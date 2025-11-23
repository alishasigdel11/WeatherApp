async function getAndDisplayWeather(city) {
    let data;
    
    if (navigator.onLine) {
        try {
            console.log('Fetching data from API...');
            const response = await fetch(`http://localhost/prototype3/connection.php?q=${encodeURIComponent(city)}`);
            data = await response.json();
            
            if (data.error) {
                console.log('Fetching from OpenWeatherMap due to missing or outdated data...');
                await fetchFromOpenWeather(city);
                return;
            }
            
            localStorage.setItem(city, JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching online data:', error);
            document.getElementById('forecast').innerHTML = '<p style="color: red;">Error fetching online data.</p>';
            return;
        }
    } else 
        console.log('Offline mode: Fetching data from Local Storage...');
        data = JSON.parse(localStorage.getItem(city));
        
        if (!data) {
            document.getElementById('forecast').innerHTML = '<p style="color: red;">No offline data available.</p>';
            return;
        }
    }
    
    displayWeather(data);
}

async function fetchFromOpenWeather(city) {
    const apiKey = 'a7105641180d8b8bf7f6eb14ebd8ea72';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('City not found or API error.');
        }
        
        const data = await response.json();
        displayWeatherFromAPI(data);
        
        await fetch(`http://localhost/prototype3/connection.php?q=${encodeURIComponent(city)}`);
    } catch (error) {
        document.getElementById('forecast').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        console.error('Fetch Error:', error);
    }
}

function displayWeather(data) {
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
        <p>${formatDate(new Date())}</p>
        <p>Main Weather Condition: ${data.weather[0].main}</p>
        <p>Weather Condition: ${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
        <h1>${Math.round(data.main.temp)}&deg;C</h1>
        <div class="weather-details">
            <div class="icon-container">
                <img src="https://img.icons8.com/fluency/48/humidity.png" alt="Humidity icon">
                <div>Humidity: ${data.main.humidity}%</div>
            </div>
            <div class="icon-container">
                <img src="https://img.icons8.com/fluency/48/wind.png" alt="Wind icon">
                <div>Wind: ${data.wind.speed} m/s</div>
            </div>
            <div class="icon-container">
                <img src="https://img.icons8.com/fluency/48/barometer-gauge.png" alt="Pressure icon">
                <div>Pressure: ${data.main.pressure} hPa</div>
            </div>
            <div class="icon-container">
                <img src="https://img.icons8.com/fluency/48/visible.png" alt="Visibility icon">
                <div>Visibility: ${(data.visibility / 1000).toFixed(1)} km</div>
            </div>
        </div>
    `;
}

function formatDate(date) {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}
