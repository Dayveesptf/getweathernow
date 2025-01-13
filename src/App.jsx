import { useState, useEffect, useRef } from "react";
import cloud from '../src/assets/cloud.png';
import marker from '../src/assets/marker.png'
import thermo from '../src/assets/thermo.png'
import './App.css';

function App() {
  const [locationInput, setLocationInput] = useState(""); // Input value for the search bar
  const [location, setLocation] = useState(""); // Selected location to display on the card
  const [temperature, setTemperature] = useState(null);
  const [pressure, setPressure] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [visibility, setVisibility] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setCurrentTime(timeString);
  }, []);

  const WEATHER_API_KEY = "3b69875cf2e3676cf4ca64883e099514";
  const COUNTRIES_API_URL = "https://countriesnow.space/api/v0.1/countries";

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(COUNTRIES_API_URL);
        const data = await response.json();
        if (!data.error) {
          const allCities = data.data.flatMap((country) => country.cities);
          setCities(allCities);
        } else {
          setError("Failed to fetch cities.");
        }
      } catch (err) {
        setError("An error occurred while fetching cities");
      }
    };
    fetchCities();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocationInput(query); // Update the input field value

    if (query.length >= 3) {
      const filtered = cities.filter((city) => city.toLowerCase().includes(query.toLowerCase()));
      setFilteredCities(filtered);
      setIsBoxOpen(true);
    } else {
      setFilteredCities([]);
      setIsBoxOpen(false);
    }
  };

  const handleClickOutside = (e) => {
    if (boxRef.current && !boxRef.current.contains(e.target)) {
      setIsBoxOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getWeather = async (e) => {
    e.preventDefault();

    if (!locationInput) {
      setError("Please select a city!");
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${locationInput}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Location not found");
      }

      const data = await response.json();
      setTemperature(data.main.temp);
      setHumidity(data.main.humidity);
      setVisibility(data.visibility);
      setPressure(data.main.pressure);
      setSpeed(data.wind.speed);
      setError(null);

      // Update the location and time after successful fetch
      setLocation(data.name); // Use the city name from the API response
      setLocationInput(""); // Clear the input field
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setCurrentTime(timeString);
    } catch (err) {
      setError(err.message);
      setTemperature(null);
    }
  };

  return (
    <div className="w-[100%] min-h-screen bg-black max-h-max pt-6 md:pt-10 big-container flex flex-col justify-between">
      <div>
        <div className="bg-gray-800 w-[90%] mx-auto nav-bar flex justify-around py-2 md:py-6 border-y-2 border-x-1 rounded-sm md:rounded-full border-fuchsia-400">
          <div className="img-cont">
            <img src={cloud} alt="" />
          </div>
          <div className="header-box ml-[-7%] my-auto">
            <h1 className="text-white font-bold text-xl md:text-4xl lg:text-5xl text-center">GetWeatherNow</h1>
            <h6 className="text-fuchsia-600 font-bold text-sm lg:text-2xl md:text-1xl text-center time">{currentTime}</h6>
          </div>
          <div className="items-center align-middle my-auto today-box">
            <h3 className="text-white font-bold text-base md:text-2xl lg:text-4xl text-center today-header">Today</h3>
          </div>
        </div>
        <form onSubmit={getWeather}>
          <input
            type="text"
            className="w-[80%] md:w-[60%] ml-[10%] md:ml-[20%] mx-auto mt-28 bg-gray-800 items-center py-4 md:py-6 text-lg md:text-1xl lg:text-2xl md:pl-12 pl-4 rounded-xl text-white input-field"
            placeholder="🔎 Search location... (min 3 letters)"
            value={locationInput}
            onChange={handleSearchChange}
          />
          <br />
          {isBoxOpen && filteredCities.length > 0 && (
            <div
              ref={boxRef}
              className="max-h-[300px] overflow-y-auto w-[80%] md:w-[60%] ml-[10%] md:ml-[20%] p-2 mt-2 absolute z-10 bg-gray-800 border-fuchsia-400 border-2 rounded-lg"
            >
              <ul>
                {filteredCities.map((city, index) => (
                  <li
                    className="text-gray-400 mx-2 my-2 text-lg md:text-xl lg:text-2xl"
                    key={index}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setLocationInput(city); // Update the input field value
                      setIsBoxOpen(false);
                    }}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            className="bg-fuchsia-800 text-white w-[20%] ml-[40%] mt-4 md:text-xl py-2 md:py-4 rounded-md"
            type="submit"
          >
            Go
          </button>
        </form>

        {error && (
          <h6 className="text-center text-red-500 mt-4 text-lg">{error}</h6>
        )}
        {temperature !== null && (
          <div className="bg-gradient-to-r from-fuchsia-600 to-gray-900 mt-6 py-6 w-[96%] ml-[2%] shadow-md border-spacing-8 rounded-xl">
            <div className="pl-4 flex gap-2">
              <h1 className="text-xl md:text-2xl text-white">{location}</h1>
              <img src={marker} alt="" />
            </div>
            <div className="mt-12 flex lg:mt-40 text-center md:mt-28 w-[44%] ml-[28%] md:w-[50%] justify-evenly items-center">
              <img src={thermo} alt="" />
              <h2 className="text-2xl md:text-6xl lg:text-8xl text-white">{temperature}°C</h2>
            </div>
          <div className="mt-12 md:mt-32 lg:mt-44 grid grid-cols-2 gap-y-10 items-center md:grid-cols-4 mx-auto pl-10">
            <div className="items-center border-1 shadow-purple-900 w-5/6 py-4 lg:py-8 rounded-xl shadow-lg bg-gradient-to-br from-fuchsia-400 to-black">
              <h1 className="text-center text-lg md:text-2xl font-semibold text-white">Humidity</h1>
              <h3 className="text-center text-sm md:text-xl text-white">{humidity}%</h3>
            </div>
            <div className="items-center  border-1 shadow-indigo-900 w-5/6 py-4 rounded-xl shadow-lg bg-gradient-to-br from-blue-300 to-black lg:py-8">
              <h1 className="text-center text-lg md:text-2xl font-semibold text-white">Visibility</h1>
              <h3 className="text-center text-sm md:text-xl text-white">{visibility}km</h3>
            </div>
            <div className="items-center border-1 shadow-yellow-900 w-5/6 py-4 rounded-xl shadow-lg bg-gradient-to-br from-yellow-400 to-black lg:py-8">
              <h1 className="text-center text-lg md:text-2xl font-semibold text-white">Pressure</h1>
              <h3 className="text-center text-sm md:text-xl text-white">{pressure}hPa</h3>
            </div>
            <div className="items-center border-1 shadow-purple-900 w-5/6 py-4 rounded-xl shadow-lg bg-gradient-to-br from-green-400 to-black lg:py-8">
              <h1 className="text-center text-lg md:text-2xl font-semibold text-white">Speed</h1>
              <h3 className="text-center text-sm md:text-xl text-white">{speed}m/s</h3>
            </div>
          </div>
          </div>
      )}
      </div>
      <div className="mt-8 mb-8 text-center"><a href="mailto:dtechservices@gmail.com" className="text-fuchsia-700">dtechservices@gmail.com</a></div>
    </div>
  );
}

export default App;

