package com.fidenz.comfort_index.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import com.fidenz.comfort_index.dto.WeatherResponse;

class OpenWeatherMapClientTest {
    
    @Test
    void fetchWeatherReturnsParsedResponse() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);

        WeatherResponse mockResponse = new WeatherResponse(
            List.of(new WeatherResponse.WeatherDetail("Clouds", "overcast clouds")),
            new WeatherResponse.MainDetail(28.32, 81, 1012),
            new WeatherResponse.WindDetail(3.6),
            new WeatherResponse.CloudsDetail(90),
            10000,
            "Cairns"
        );

        when(mockRestTemplate.getForObject(anyString(), eq(WeatherResponse.class))).thenReturn(mockResponse);

        OpenWeatherMapClient client = new OpenWeatherMapClient("dummyApiKey", mockRestTemplate);
        WeatherResponse response = client.fetchWeather("2172797");

        assertThat(response.name()).isEqualTo("Cairns");
        assertThat(response.main().temp()).isEqualTo(28.32);
    }

}
