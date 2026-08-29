package com.fidenz.comfort_index.controller;

import com.fidenz.comfort_index.client.WeatherClient;
import com.fidenz.comfort_index.dto.CityWeatherResult;
import com.fidenz.comfort_index.dto.ForecastPoint;
import com.fidenz.comfort_index.dto.ForecastResponse;
import com.fidenz.comfort_index.service.CityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    private final CityService cityService;
    private final WeatherClient weatherClient;


    public CityController(CityService cityService, WeatherClient weatherClient) {
        this.cityService = cityService;
        this.weatherClient = weatherClient;
    }

    @GetMapping
    public List<CityWeatherResult> getCities() {
        return cityService.getRankedCities();
    }

    @GetMapping("/{cityCode}/forecast")
    public List<ForecastPoint> getForecast(@PathVariable String cityCode) {
        ForecastResponse response = weatherClient.fetchForecast(cityCode);
        return response.list().stream()
                .map(entry -> new ForecastPoint(entry.dateTime(), entry.main().temp()))
                .toList();
    }
}