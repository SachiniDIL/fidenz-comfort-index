package com.fidenz.comfort_index.client;

import com.fidenz.comfort_index.config.CacheConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fidenz.comfort_index.dto.WeatherResponse;
import com.fidenz.comfort_index.exception.WeatherApiException;

@Component
public class OpenWeatherMapClient implements WeatherClient {

    private static final String BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

    private final String apiKey;
    private final RestTemplate restTemplate;

    public OpenWeatherMapClient(
        @Value("${openweathermap.api.key}") String apiKey, 
        RestTemplate restTemplate) {
            this.apiKey = apiKey;
            this.restTemplate = restTemplate;
    }

    @Override
    @Cacheable(CacheConfig.WEATHER_CACHE)
    public WeatherResponse fetchWeather(String cityCode) {
        String url = UriComponentsBuilder.fromUriString(BASE_URL)
                .queryParam("id", cityCode)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric")
                .toUriString();

        try {
            return restTemplate.getForObject(url, WeatherResponse.class);
        } catch (Exception e) {
            throw new WeatherApiException("Failed to fetch weather data for city code: " + cityCode, e);
        }
    }
}