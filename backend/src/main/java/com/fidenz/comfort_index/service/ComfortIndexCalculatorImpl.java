package com.fidenz.comfort_index.service;

import com.fidenz.comfort_index.dto.WeatherResponse;
import org.springframework.stereotype.Service;

@Service
public class ComfortIndexCalculatorImpl implements ComfortIndexCalculator {

    // How much each thing counts toward the final score. They add up to 1.
    // Temperature counts the most because it's the first thing people notice
    // about weather. Humidity counts second because it mostly makes heat feel
    // worse, not bad on its own. Wind counts least because people usually
    // mention it last.
    private static final double TEMP_WEIGHT = 0.45;
    private static final double HUMIDITY_WEIGHT = 0.30;
    private static final double WIND_WEIGHT = 0.25;

    // The "perfect" value for each thing. If the real value matches this
    // exactly, that part of the score is a full 100.
    private static final double IDEAL_TEMP = 22.0;      // most people feel best somewhere between 20 and 25 degrees
    private static final double IDEAL_HUMIDITY = 45.0;  // most people feel best somewhere between 30% and 60%
    private static final double IDEAL_WIND = 3.0;       // a light breeze - enough to notice, not enough to bother you

    // How fast the score drops as you move away from the perfect value.
    // To get this number: pick how far away from perfect would feel really
    // bad, then do 100 divided by that number.
    // For temperature: 25 degrees away feels really bad, so 100 / 25 = 4.
    private static final double TEMP_PENALTY_PER_DEGREE = 4.0;

    // For humidity, I picked a "feels really bad" distance bigger than what's
    // even possible (humidity only goes from 0% to 100%). That means even at
    // the worst possible humidity, the score never actually hits zero. This
    // is on purpose - bad humidity should hurt the score, but shouldn't be
    // able to wreck it completely by itself.
    // 100 / 66.7 = 1.5
    private static final double HUMIDITY_PENALTY_PER_PERCENT = 1.5;

    // For wind, 12.5 m/s away from perfect feels really bad (around 15.5 m/s
    // total, which is strong, gale-like wind). This number is bigger than
    // temperature's on purpose - windy weather starts feeling bad faster than
    // a slow change in temperature does.
    // 100 / 12.5 = 8
    private static final double WIND_PENALTY_PER_MS = 8.0;

    // Pressure:

    @Override
    public double calculateComfortIndex(WeatherResponse weather) {
        double temp = weather.main().temp();
        int humidity = weather.main().humidity();
        double windSpeed = weather.wind().speed();

        // Work out a score for each thing on its own (0 to 100),
        // then combine them using the weights above.
        double tempScore = score(temp, IDEAL_TEMP, TEMP_PENALTY_PER_DEGREE);
        double humidityScore = score(humidity, IDEAL_HUMIDITY, HUMIDITY_PENALTY_PER_PERCENT);
        double windScore = score(windSpeed, IDEAL_WIND, WIND_PENALTY_PER_MS);

        return (TEMP_WEIGHT * tempScore) + (HUMIDITY_WEIGHT * humidityScore) + (WIND_WEIGHT * windScore);
    }

    // The same method is used to score every single thing (temperature,
    // humidity, wind). It starts at 100 (perfect), takes away points based on
    // how far off the real value is, and never lets the score go below 0.
    private double score(double actual, double ideal, double penalty) {
        double raw = 100 - Math.abs(actual - ideal) * penalty;
        return Math.max(0, raw);
    }
}