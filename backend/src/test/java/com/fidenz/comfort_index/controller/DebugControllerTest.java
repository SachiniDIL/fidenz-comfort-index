package com.fidenz.comfort_index.controller;

import com.fidenz.comfort_index.config.SecurityConfig;
import com.fidenz.comfort_index.dto.City;
import com.fidenz.comfort_index.service.CityLoaderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
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

@WebMvcTest(DebugController.class)
@Import(SecurityConfig.class)
class DebugControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CacheManager cacheManager;

    @MockitoBean
    private CityLoaderService cityLoaderService;

    @MockitoBean
    private Cache cache;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void reportsHitWhenCityIsCachedAndMissWhenNot() throws Exception {
        City colombo = new City("1248991", "Colombo");
        City oslo = new City("3143244", "Oslo");

        when(cityLoaderService.getCities()).thenReturn(List.of(colombo, oslo));
        when(cacheManager.getCache("weather")).thenReturn(cache);
        when(cache.get("1248991")).thenReturn(new Cache.ValueWrapper() {
            public Object get() { return "cached-response"; }
        });
        when(cache.get("3143244")).thenReturn(null);

        mockMvc.perform(get("/api/debug/cache").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Colombo").value("HIT"))
                .andExpect(jsonPath("$.Oslo").value("MISS"));
    }
}