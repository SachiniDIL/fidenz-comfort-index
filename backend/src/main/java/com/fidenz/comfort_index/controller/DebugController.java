package com.fidenz.comfort_index.controller;

import com.fidenz.comfort_index.config.CacheConfig;
import com.fidenz.comfort_index.dto.City;
import com.fidenz.comfort_index.service.CityLoaderService;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug/cache")
public class DebugController {

    private final CacheManager cacheManager;
    private final CityLoaderService cityLoaderService;

    public DebugController(CacheManager cacheManager, CityLoaderService cityLoaderService) {
        this.cacheManager = cacheManager;
        this.cityLoaderService = cityLoaderService;
    }

    @GetMapping
    public Map<String, String> getCacheStatus() {
        Cache cache = cacheManager.getCache(CacheConfig.WEATHER_CACHE);
        Map<String, String> status = new LinkedHashMap<>();

        for (City city : cityLoaderService.getCities()) {
            boolean present = cache != null && cache.get(city.cityCode()) != null;
            status.put(city.cityName(), present ? "HIT" : "MISS");
        }

        return status;
    }
}