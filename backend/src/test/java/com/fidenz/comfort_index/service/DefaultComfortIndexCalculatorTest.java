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
        // Everything at its perfect value should give the highest possible score.
        WeatherResponse weather = weatherWith(22.0, 45, 3.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(100, within(0.01));
    }

    @Test
    void extremeColdClampsTemperatureComponentToZero() {
        // Way past the point where temperature alone would go negative -
        // it should get stopped at 0, not go below.
        WeatherResponse weather = weatherWith(-50.0, 45, 3.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(55.0, within(0.01));
    }

    @Test
    void temperatureExactlyAtZeroBoundaryScoresZeroForThatComponent() {
        // 47 degrees is exactly 25 degrees away from the ideal of 22 - the
        // precise point where the temperature part of the formula lands on
        // exactly 0 by the math itself, not because it got clamped.
        WeatherResponse weather = weatherWith(47.0, 45, 3.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(55.0, within(0.01));
    }

    @Test
    void temperatureScoreIsSymmetricAboveAndBelowIdeal() {
        // Being 5 degrees too cold should hurt the score exactly as much as
        // being 5 degrees too hot - direction shouldn't matter, only distance.
        WeatherResponse fiveBelow = weatherWith(17.0, 45, 3.0);
        WeatherResponse fiveAbove = weatherWith(27.0, 45, 3.0);

        double scoreBelow = comfortIndexCalculator.calculateComfortIndex(fiveBelow);
        double scoreAbove = comfortIndexCalculator.calculateComfortIndex(fiveAbove);

        assertThat(scoreBelow).isCloseTo(scoreAbove, within(0.01));
        assertThat(scoreBelow).isCloseTo(91.0, within(0.01));
    }

    @Test
    void veryHighHumidityReducesButDoesNotZeroOutScore() {
        // At the highest possible humidity (100%), the score should drop a
        // lot but never hit zero - that's on purpose, by design.
        WeatherResponse weather = weatherWith(22.0, 100, 3.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(75.25, within(0.01));
    }

    @Test
    void zeroHumidityAlsoNeverZeroesOutHumidityComponent() {
        // Same idea at the other end of the scale - bone-dry air (0%
        // humidity) should also hurt the score without ever wiping it out.
        WeatherResponse weather = weatherWith(22.0, 0, 3.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(79.75, within(0.01));
    }

    @Test
    void highWindSpeedClampsWindComponentToZero() {
        // Strong, gale-like wind should zero out the wind part of the score.
        WeatherResponse weather = weatherWith(22.0, 45, 20.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(75.0, within(0.01));
    }

    @Test
    void calmWindNearZeroReducesScoreWithoutClamping() {
        // Wind can't go below 0 in real life, so this checks the other end -
        // completely still air should lower the score a bit, but not to zero.
        WeatherResponse weather = weatherWith(22.0, 45, 0.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(94.0, within(0.01));
    }

    @Test
    void moderateRealisticWeatherCombinesAllThreeFactorsCorrectly() {
        // A normal, everyday weather scenario - not an extreme edge case -
        // to check the three scores blend together correctly with mild,
        // realistic deviations from ideal.
        WeatherResponse weather = weatherWith(25.0, 55, 5.0);

        double score = comfortIndexCalculator.calculateComfortIndex(weather);

        assertThat(score).isCloseTo(86.1, within(0.01));
    }

    @Test
    void scoreStaysWithinZeroToHundredUnderHarshConditions() {
        // Even with every single factor at an extreme value at the same
        // time, the final score should still land somewhere between 0 and
        // 100 - it should never go outside that range.
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