package com.fidenz.comfort_index.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.fidenz.comfort_index.dto.City;
import com.fidenz.comfort_index.dto.CityListWrapper;

import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class CityLoaderService {
    
    private final List<City> cities;

    public CityLoaderService(ObjectMapper objectMapper){
        this.cities = loadCitiesFromFile(objectMapper);
    }

    public List<City> getCities() {
        return cities;
    }
    
    private List<City> loadCitiesFromFile(ObjectMapper objectMapper) {
        try(InputStream inputStream = new ClassPathResource("cities.json").getInputStream()) {
            CityListWrapper cityListWrapper = objectMapper.readValue(inputStream, CityListWrapper.class);
            return cityListWrapper.list().stream()
                    .map(cityJson -> new City(cityJson.cityCode(), cityJson.cityName()))
                    .toList();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load cities from file", e);

        }
    }
}
