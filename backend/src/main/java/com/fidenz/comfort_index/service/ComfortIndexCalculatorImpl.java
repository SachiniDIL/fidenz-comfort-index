package com.fidenz.comfort_index.service;

import com.fidenz.comfort_index.dto.WeatherResponse;

public class ComfortIndexCalculatorImpl implements ComfortIndexCalculator {

    private static final double TEMP_WEIGHT = 0.45;
    private static final double HUMIDITY_WEIGHT = 0.30;
    private static final double WIND_WEIGHT = 0.25;

    private static final double IDEAL_TEMP = 22.0;
    private static final double IDEAL_HUMIDITY = 45.0;
    private static final double IDEAL_WIND = 3.0;

    private static final double TEMP_PENALTY_PER_DEGREE = 4.0;
    private static final double HUMIDITY_PENALTY_PER_PERCENT = 1.5;
    private static final double WIND_PENALTY_PER_MS = 8.0;

    @Override
    public double calculateComfortIndex(WeatherResponse weather) {
        double temp = weather.main().temp();
        int humidity = weather.main().humidity();
        double windSpeed = weather.wind().speed();

        double tempScore = score(temp, IDEAL_TEMP, TEMP_PENALTY_PER_DEGREE);
        double humidityScore = score(humidity, IDEAL_HUMIDITY, HUMIDITY_PENALTY_PER_PERCENT);
        double windScore = score(windSpeed, IDEAL_WIND, WIND_PENALTY_PER_MS);

        return (TEMP_WEIGHT * tempScore) + (HUMIDITY_WEIGHT * humidityScore) + (WIND_WEIGHT * windScore);
    }

    private double score(double actual, double ideal, double penalty) {
        double raw = 100 - Math.abs(actual - ideal) * penalty;
        return Math.max(0, raw);
    }
}
