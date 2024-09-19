import { useState, useEffect, useRef } from 'react'
import './App.css'
function App() {

  const [location, setLocation] = useState('');
  const [temperature, setTemperature] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = '3b69875cf2e3676cf4ca64883e099514';

  const getWeather = async (e) => {
    e.preventDefault();
    
    if (!location) {
      setError("Enter a location!!");
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Location not found.');
      }

      const data = await response.json();
      setTemperature(data.main.temp); // Extract temperature from API response
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
      setTemperature(null);
    }
  };

  return (
    <div className='container'>
      <h1 className='heading'>Weather App</h1>
      <form onSubmit={getWeather}>
        <input
        className='form-input'
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location, preferably a city"
        />
        <br />
        <button className='enter-btn' type="submit">Go</button>
      </form>

      {error && <p style={{ color: 'red', fontSize: '15px'}}>{error}</p>}
      {temperature !== null && <h2 className='good-result'>Temperature is {temperature}°C</h2>}
    </div>
  );
} 

export default App
