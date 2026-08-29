package com.fidenz.comfort_index.controller;

import com.fidenz.comfort_index.dto.CityWeatherResult;
import com.fidenz.comfort_index.service.CityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    private final CityService cityService;

    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    @GetMapping
    public List<CityWeatherResult> getCities() {
        return cityService.getRankedCities();
    }
}