package com.fidenz.comfort_index.dto;

public record CityWeatherResult(
        String cityName,
        String description,
        double temperature,
        double comfortScore,
        int rank
) {
}
