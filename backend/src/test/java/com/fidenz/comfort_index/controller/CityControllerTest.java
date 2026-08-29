package com.fidenz.comfort_index.controller;

import com.fidenz.comfort_index.config.SecurityConfig;
import com.fidenz.comfort_index.dto.CityWeatherResult;
import com.fidenz.comfort_index.service.CityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CityController.class)
@Import(SecurityConfig.class)
class CityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CityService cityService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void getCitiesReturnsRankedListAsJsonArray() throws Exception {
        CityWeatherResult first = new CityWeatherResult("Oslo", "clear sky", -3.9, 85.0, 1);
        CityWeatherResult second = new CityWeatherResult("Colombo", "overcast clouds", 33.0, 60.0, 2);

        when(cityService.getRankedCities()).thenReturn(List.of(first, second));

        mockMvc.perform(get("/api/cities").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].cityName").value("Oslo"))
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[1].cityName").value("Colombo"))
                .andExpect(jsonPath("$[1].rank").value(2));
    }
}