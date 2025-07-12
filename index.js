import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_KEY = "";
const BASE_URL = "https://api.openweathermap.org/data/2.5/"

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/weather", async (req, res) => {
    try{
    const weather = await axios.get(BASE_URL + "weather", {
        params: {
            q: req.body.city,
            appid: API_KEY,
            units: "metric",
        }
    });
    const longtitude = weather.data.coord.lon;
    const latitude = weather.data.coord.lat;

    const airPollution = await axios.get(BASE_URL + "air_pollution", {
        params: {
            lat: latitude,
            lon: longtitude,
            appid: API_KEY,
        }
    });
    const forecast = await axios.get(BASE_URL + "forecast", {
        params: {
            lat: latitude,
            lon: longtitude,
            units: "metric",
            appid: API_KEY,
        }
    });
    const groupedForecast = {};

    forecast.data.list.forEach(item => {
    const date = item.dt_txt.slice(0, 10); //"YYYY-MM-DD"
    if (!groupedForecast[date]) {
        groupedForecast[date] = [];
    }
    groupedForecast[date].push(item);
    });
    res.render("index.ejs", {content: weather.data, airPollution: airPollution.data, forecast: forecast.data, groupedForecast: groupedForecast,});
    } catch (error) {
        console.log(error.response.data); // Error dari API
        res.render("index.ejs", { error: error.response.data });
    }

})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});