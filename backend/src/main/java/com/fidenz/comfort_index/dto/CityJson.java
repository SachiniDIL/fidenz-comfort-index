package com.fidenz.comfort_index.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CityJson(
    @JsonProperty("CityCode") String cityCode,
    @JsonProperty("CityName") String cityName
) {
}
