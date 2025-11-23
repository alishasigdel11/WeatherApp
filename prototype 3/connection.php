<?php
$serverName = "localhost";
$userName = "root";
$password = "";
$conn = mysqli_connect($serverName, $userName, $password);

if (!$conn) {
    die("Failed to connect: " . mysqli_connect_error());
}

$createDatabase = "CREATE DATABASE IF NOT EXISTS prototype3";
mysqli_query($conn, $createDatabase);
mysqli_select_db($conn, 'prototype3');

$createTable = "CREATE TABLE IF NOT EXISTS weather_data (
    city VARCHAR(100) NOT NULL UNIQUE,
    country_code VARCHAR(10) NOT NULL,
    temperature FLOAT NOT NULL,
    humidity INT NOT NULL,
    pressure INT NOT NULL,
    wind_speed FLOAT NOT NULL,
    wind_dir INT NOT NULL,
    visibility FLOAT NOT NULL,
    descriptions VARCHAR(255) NOT NULL,
    mainweather VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);";
mysqli_query($conn, $createTable);

if (isset($_GET['q'])) {
    $city = mysqli_real_escape_string($conn, $_GET['q']);
} else {
    $city = "Biratnagar";
}

$selectAllData = "SELECT * FROM weather_data WHERE city = '$city'";
$result = mysqli_query($conn, $selectAllData);

$fetchNewData = false;
if (mysqli_num_rows($result) == 0){ 
    $fetchNewData = true;
} else {
    $row = mysqli_fetch_assoc($result);
    $lastUpdated = strtotime($row['last_updated']);
    $currentTime = time();
    $timeDifference = $currentTime - $lastUpdated;
    
    // If data is older than 2 hours (7200 seconds), fetch new data
    if ($timeDifference > 7200) {
        $fetchNewData = true;
    }
}

if ($fetchNewData) {
    $apikey = "14c6c2786c123f11fa571f7bca638f43";
    $url = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=$city&appid=${apikey}";
    $response = file_get_contents($url);

    if ($response === FALSE) {
        echo json_encode(['error' => 'Failed to fetch data from API']);
        exit;
    }

    $data = json_decode($response, true);
    if ($data['cod'] == 200) {
        $temp = $data['main']['temp'];
        $humidity = $data['main']['humidity'];
        $pressure = $data['main']['pressure'];
        $windSpeed = $data['wind']['speed'];
        $windDir = $data['wind']['deg'];
        $visibility = $data['visibility'];
        $weatherDescription = $data['weather'][0]['description'];
        $mainweather = $data['weather'][0]['main'];
        $icon = $data['weather'][0]['icon'];
        $countryCode = $data['sys']['country']; // Fetch country code

        $insertData = "INSERT INTO weather_data (city, country_code, temperature, humidity, pressure, wind_speed, wind_dir, visibility, descriptions, mainweather, icon)
        VALUES ('$city', '$countryCode', '$temp', '$humidity', '$pressure', '$windSpeed', '$windDir', '$visibility', '$weatherDescription', '$mainweather', '$icon')
        ON DUPLICATE KEY UPDATE 
        country_code='$countryCode', temperature='$temp', humidity='$humidity', pressure='$pressure', wind_speed='$windSpeed', wind_dir='$windDir',
        visibility='$visibility', descriptions='$weatherDescription', mainweather='$mainweather', icon='$icon'";

        mysqli_query($conn, $insertData);
    } else {
        echo json_encode(['error' => 'City not found']);
        exit;
    }
}

// Fetch data and return as JSON
$result = mysqli_query($conn, $selectAllData);
$rows = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = $row;
}

header('Content-Type: application/json');
echo json_encode($rows);

mysqli_close($conn);
?>
