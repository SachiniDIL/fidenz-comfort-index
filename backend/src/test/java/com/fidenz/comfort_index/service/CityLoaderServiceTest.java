package com.fidenz.comfort_index.service;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.fidenz.comfort_index.dto.City;

import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

class CityLoaderServiceTest {

    private final CityLoaderService cityLoaderService = new CityLoaderService(new ObjectMapper());

    @Test
    void loadExactlyTenCities() {
        List<City> cities = cityLoaderService.getCities();
        assert cities.size() == 10;
    }

    @Test
    void mapsCityCodeAndNameCorrectly() {
        List<City> cities = cityLoaderService.getCities();
        
        assertThat(cities)
        .extracting(City::cityCode, City::cityName)
        .contains(
            tuple("1248991", "Colombo"),
            tuple("2643743", "London"),
            tuple("2172797", "Cairns")
        );
    }
}
