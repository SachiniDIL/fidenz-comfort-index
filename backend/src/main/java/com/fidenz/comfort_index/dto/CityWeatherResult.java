package com.fidenz.comfort_index.dto;

public record CityWeatherResult(
        String cityCode,
        String cityName,
        String description,
        double temperature,
        double comfortScore,
        int rank
) {
}
