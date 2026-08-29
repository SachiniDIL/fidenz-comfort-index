package com.fidenz.comfort_index.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ForecastResponse(
        @JsonProperty("list") List<ForecastEntry> list
) {
    public record ForecastEntry(
            @JsonProperty("dt_txt") String dateTime,
            @JsonProperty("main") MainDetail main
    ) {
        public record MainDetail(
                @JsonProperty("temp") Double temp
        ) {
        }
    }
}