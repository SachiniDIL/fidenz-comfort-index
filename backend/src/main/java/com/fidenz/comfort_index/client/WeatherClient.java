package com.fidenz.comfort_index.client;

import com.fidenz.comfort_index.dto.ForecastResponse;
import com.fidenz.comfort_index.dto.WeatherResponse;

public interface WeatherClient {
    WeatherResponse fetchWeather(String cityCode);
    ForecastResponse fetchForecast(String cityCode);
}
