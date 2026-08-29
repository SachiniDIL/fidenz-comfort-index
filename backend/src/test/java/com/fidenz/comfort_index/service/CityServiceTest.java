package com.fidenz.comfort_index.service;

import com.fidenz.comfort_index.client.WeatherClient;
import com.fidenz.comfort_index.dto.City;
import com.fidenz.comfort_index.dto.CityWeatherResult;
import com.fidenz.comfort_index.dto.WeatherResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CityServiceTest {

    private final CityLoaderService cityLoaderService = mock(CityLoaderService.class);
    private final WeatherClient weatherClient = mock(WeatherClient.class);
    private final ComfortIndexCalculator comfortIndexCalculator = mock(ComfortIndexCalculator.class);

    private final CityService cityService =
            new CityService(cityLoaderService, weatherClient, comfortIndexCalculator);

    @Test
    void sortsCitiesByComfortScoreDescendingAndAssignsRank() {
        City colombo = new City("1248991", "Colombo");
        City oslo = new City("3143244", "Oslo");

        when(cityLoaderService.getCities()).thenReturn(List.of(colombo, oslo));

        WeatherResponse colomboWeather = weatherWith("hot and humid", 33.0);
        WeatherResponse osloWeather = weatherWith("cold and clear", -4.0);

        when(weatherClient.fetchWeather("1248991")).thenReturn(colomboWeather);
        when(weatherClient.fetchWeather("3143244")).thenReturn(osloWeather);

        when(comfortIndexCalculator.calculateComfortIndex(colomboWeather)).thenReturn(60.0);
        when(comfortIndexCalculator.calculateComfortIndex(osloWeather)).thenReturn(85.0);

        List<CityWeatherResult> results = cityService.getRankedCities();

        assertThat(results).hasSize(2);
        assertThat(results.get(0).cityName()).isEqualTo("Oslo");
        assertThat(results.get(0).rank()).isEqualTo(1);
        assertThat(results.get(0).comfortScore()).isEqualTo(85.0);

        assertThat(results.get(1).cityName()).isEqualTo("Colombo");
        assertThat(results.get(1).rank()).isEqualTo(2);
        assertThat(results.get(1).comfortScore()).isEqualTo(60.0);
    }

    @Test
    void mapsWeatherDescriptionAndTemperatureCorrectly() {
        City paris = new City("2988507", "Paris");
        when(cityLoaderService.getCities()).thenReturn(List.of(paris));

        WeatherResponse parisWeather = weatherWith("clear sky", 22.4);
        when(weatherClient.fetchWeather("2988507")).thenReturn(parisWeather);
        when(comfortIndexCalculator.calculateComfortIndex(parisWeather)).thenReturn(95.0);

        CityWeatherResult result = cityService.getRankedCities().get(0);

        assertThat(result.cityName()).isEqualTo("Paris");
        assertThat(result.description()).isEqualTo("clear sky");
        assertThat(result.temperature()).isEqualTo(22.4);
        assertThat(result.rank()).isEqualTo(1);
    }

    private WeatherResponse weatherWith(String description, double temp) {
        return new WeatherResponse(
                List.of(new WeatherResponse.WeatherDetail("Clear", description)),
                new WeatherResponse.MainDetail(temp, 50, 1013),
                new WeatherResponse.WindDetail(3.0),
                new WeatherResponse.CloudsDetail(0),
                10000,
                "TestCity"
        );
    }
}