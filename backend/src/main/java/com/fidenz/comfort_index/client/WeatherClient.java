package com.fidenz.comfort_index.client;

import com.fidenz.comfort_index.dto.WeatherResponse;

public interface WeatherClient {
    WeatherResponse fetchWeather(String cityCode);
}
