package com.fidenz.comfort_index.client;

import com.fidenz.comfort_index.config.CacheConfig;
import com.fidenz.comfort_index.dto.WeatherResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = {CacheConfig.class, OpenWeatherMapClient.class})
@TestPropertySource(properties = "openweathermap.api.key=test28hx84b87bx87h8")
class WeatherCachingTest {

    @MockitoBean
    private RestTemplate restTemplate;

    @Autowired
    private WeatherClient weatherClient;

    @Test
    void secondCallWithinTtlDoesNotHitRestTemplateAgain(){
        WeatherResponse mockResponse = new WeatherResponse(
                List.of(new WeatherResponse.WeatherDetail("Clear", "clear sky")),
                new WeatherResponse.MainDetail(25.0, 60, 1010),
                new WeatherResponse.WindDetail(3.0),
                new WeatherResponse.CloudsDetail(0),
                10000,
                "Colombo"
        );

        when(restTemplate.getForObject(anyString(), eq(WeatherResponse.class))).thenReturn(mockResponse);

        weatherClient.fetchWeather("1248991");
        weatherClient.fetchWeather("1248991");

        verify(restTemplate, times(1)).getForObject(anyString(), eq(WeatherResponse.class));
    }
}
