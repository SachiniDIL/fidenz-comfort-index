package com.fidenz.comfort_index.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import com.fidenz.comfort_index.dto.ForecastResponse;
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

    @Test
    void fetchForecastReturnsParsedResponse() {
        RestTemplate mockRestTemplate = mock(RestTemplate.class);

        ForecastResponse fakeResponse = new ForecastResponse(
                List.of(
                        new ForecastResponse.ForecastEntry(
                                "2026-08-30 12:00:00",
                                new ForecastResponse.ForecastEntry.MainDetail(24.5)
                        ),
                        new ForecastResponse.ForecastEntry(
                                "2026-08-30 15:00:00",
                                new ForecastResponse.ForecastEntry.MainDetail(26.1)
                        )
                )
        );

        when(mockRestTemplate.getForObject(anyString(), eq(ForecastResponse.class)))
                .thenReturn(fakeResponse);

        OpenWeatherMapClient client = new OpenWeatherMapClient( "fake-api-key", mockRestTemplate);

        ForecastResponse result = client.fetchForecast("2172797");

        assertThat(result.list()).hasSize(2);
        assertThat(result.list().get(0).dateTime()).isEqualTo("2026-08-30 12:00:00");
        assertThat(result.list().get(0).main().temp()).isEqualTo(24.5);
    }
}
