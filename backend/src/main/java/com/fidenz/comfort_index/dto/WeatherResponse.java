package com.fidenz.comfort_index.dto;

import java.util.List;

public record WeatherResponse(
        List<WeatherDetail> weather,
        MainDetail main,
        WindDetail wind,
        CloudsDetail clouds,
        Integer visibility,
        String name
) {

    public record WeatherDetail(
            String main,
            String description
    ) {
    }

    public record MainDetail(
            Double temp,
            Integer humidity,
            Integer pressure
    ) {
    }

    public record WindDetail(
           Double speed
    ) {
    }

    public record CloudsDetail(
            Integer all
    ) {
    }
}
