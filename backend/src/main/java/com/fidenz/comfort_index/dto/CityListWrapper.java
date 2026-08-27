package com.fidenz.comfort_index.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record CityListWrapper(
    @JsonProperty("List") List<CityJson> list
) {
}
