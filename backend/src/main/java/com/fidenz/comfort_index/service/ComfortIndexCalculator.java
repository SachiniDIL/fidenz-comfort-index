package com.fidenz.comfort_index.service;

import com.fidenz.comfort_index.dto.WeatherResponse;

public interface ComfortIndexCalculator {
    double calculateComfortIndex(WeatherResponse weather);
}
