package com.fidenz.comfort_index.service;

import com.fidenz.comfort_index.client.WeatherClient;
import com.fidenz.comfort_index.dto.City;
import com.fidenz.comfort_index.dto.CityWeatherResult;
import com.fidenz.comfort_index.dto.WeatherResponse;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

@Service
public class CityService {

    private final CityLoaderService cityLoaderService;
    private final WeatherClient weatherClient;
    private final ComfortIndexCalculator comfortIndexCalculator;

    public CityService(CityLoaderService cityLoaderService, WeatherClient weatherClient, ComfortIndexCalculator comfortIndexCalculator) {
        this.cityLoaderService = cityLoaderService;
        this.weatherClient = weatherClient;
        this.comfortIndexCalculator = comfortIndexCalculator;
    }

    public List<CityWeatherResult> getRankedCities() {
        List<ScoredCity> scoredCities = cityLoaderService.getCities().stream()
                .map(this::scoreCity)
                .sorted(Comparator.comparingDouble(ScoredCity::comfortScore).reversed())
                .toList();

        return IntStream.range(0, scoredCities.size())
                .mapToObj(i -> toResult(scoredCities.get(i), i + 1))
                .toList();
    }

    private ScoredCity scoreCity(City city) {
        WeatherResponse weatherResponse = weatherClient.fetchWeather(city.cityCode());
        double score = comfortIndexCalculator.calculateComfortIndex(weatherResponse);
        String description = weatherResponse.weather().getFirst().description();
        return new ScoredCity(city.cityCode(), city.cityName(), description,
                weatherResponse.main().temp(),
                score);
    }

    private CityWeatherResult toResult(ScoredCity scoredCity, int rank) {
        double roundedScore = Math.round(scoredCity.comfortScore() * 10) / 10.0;

        return new CityWeatherResult(
                scoredCity.cityCode(),
                scoredCity.cityName(),
                scoredCity.description(),
                scoredCity.temperature(),
                roundedScore,
                rank
        );
    }

    private record ScoredCity(
            String cityCode,
            String cityName,
            String description,
            double temperature,
            double comfortScore
    ){}
}
