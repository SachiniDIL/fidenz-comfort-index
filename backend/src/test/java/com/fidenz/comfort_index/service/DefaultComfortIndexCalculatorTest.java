package com.fidenz.comfort_index.service;

import com.fidenz.comfort_index.dto.WeatherResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.within;

class DefaultComfortIndexCalculatorTest {

    private final ComfortIndexCalculator comfortIndexCalculator = new ComfortIndexCalculatorImpl();

    @Test
    void idealConditionsProduceMaximumScore() {
        WeatherResponse weather = weatherWith(22.0, 45, 3.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(100, within(0.01));
    }

    @Test
    void extremeColdClampsTemperatureComponentToZero() {
        WeatherResponse weather = weatherWith(-50.0, 45, 3.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(55.0, within(0.01));
    }

    @Test
    void veryHighHumidityReducesButDoesNotZeroOutScore() {
        WeatherResponse weather = weatherWith(22.0, 100, 3.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(75.25, within(0.01));
    }

    @Test
    void highWindSpeedClampsWindComponentToZero() {
        WeatherResponse weather = weatherWith(22.0, 45, 20.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(75.0, within(0.01));
    }

    @Test
    void scoreStaysWithinZeroToHundredUnderHarshConditions() {
        WeatherResponse weather = weatherWith(-40.0, 0, 30.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isGreaterThanOrEqualTo(0.0);
        assertThat(score).isLessThanOrEqualTo(100.0);
    }

    private WeatherResponse weatherWith(double temp, int humidity, double windSpeed) {
        return new WeatherResponse(
                List.of(new WeatherResponse.WeatherDetail("Clear", "clear sky")),
                new WeatherResponse.MainDetail(temp, humidity, 1013),
                new WeatherResponse.WindDetail(windSpeed),
                new WeatherResponse.CloudsDetail(0),
                10000,
                "testCity"
        );
    }
}
