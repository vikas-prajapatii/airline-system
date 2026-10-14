package com.noir.service.impl;

import com.noir.mapper.AirportMapper;
import com.noir.model.Airport;
import com.noir.model.City;
import com.noir.payload.request.AirportRequest;
import com.noir.payload.response.AirportResponse;
import com.noir.repository.AirportRepository;
import com.noir.repository.CityRepository;
import com.noir.service.AirportService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AirportServiceImpl implements AirportService {

    private final AirportRepository airportRepository;
    private final CityRepository cityRepository;

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "allAirports", allEntries = true),
            @CacheEvict(cacheNames = "airportsByCity", allEntries = true)
    })
    public AirportResponse createAirport(AirportRequest request) throws Exception {
        String iataCode = request.getIataCode() != null ? request.getIataCode().toUpperCase().trim() : null;

        if (airportRepository.findByIataCode(iataCode).isPresent()) {
            throw new Exception("Airport with IATA code already exists: " + iataCode);
        }

        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new Exception("City not found with id: " + request.getCityId()));
        Airport airport = AirportMapper.toEntity(request);
        airport.setCity(city);

        Airport savedAirport = airportRepository.save(airport);
        return AirportMapper.toResponse(savedAirport);
    }

    @Override
    @Cacheable(cacheNames = "airports", key = "#id")
    public AirportResponse getAirportById(Long id) throws Exception {
        Airport airport = airportRepository.findById(id).orElseThrow(
                () -> new Exception("Airport not exist with id: " + id)
        );
        return AirportMapper.toResponse(airport);
    }

    @Override
    @Cacheable(cacheNames = "allAirports")
    public List<AirportResponse> getAllAirports() {
        return airportRepository.findAll().stream()
                .map(AirportMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "airports", key = "#id"),
            @CacheEvict(cacheNames = "allAirports", allEntries = true),
            @CacheEvict(cacheNames = "airportsByCity", allEntries = true)
    })
    public AirportResponse updateAirport(Long id, AirportRequest request) throws Exception {
        Airport existingAirport = airportRepository.findById(id).orElseThrow(
                () -> new Exception("Airport not exist with id: " + id)
        );

        if (request.getIataCode() != null
                && !existingAirport.getIataCode().equalsIgnoreCase(request.getIataCode())
                && airportRepository.findByIataCode(request.getIataCode().toUpperCase().trim()).isPresent()
        ) {
            throw new Exception("Airport with IATA code already exists: " + request.getIataCode());
        }

        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new Exception("City not found with id: " + request.getCityId()));
            existingAirport.setCity(city);
        }

        AirportMapper.updateEntity(request, existingAirport);
        Airport updatedAirport = airportRepository.save(existingAirport);
        return AirportMapper.toResponse(updatedAirport);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = "airports", key = "#id"),
            @CacheEvict(cacheNames = "allAirports", allEntries = true),
            @CacheEvict(cacheNames = "airportsByCity", allEntries = true)
    })
    public void deleteAirport(Long id) throws Exception {
        Airport airport = airportRepository.findById(id).orElseThrow(
                () -> new Exception("Airport not exist with id: " + id)
        );
        airportRepository.delete(airport);
    }

    @Override
    @Cacheable(cacheNames = "airportsByCity", key = "#cityId")
    public List<AirportResponse> getAirportByCityId(Long cityId) {
        return airportRepository.findByCityId(cityId).stream()
                .map(AirportMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AirportResponse getAirportByIataCode(String iataCode) throws Exception {
        Airport airport = airportRepository.findByIataCode(iataCode != null ? iataCode.toUpperCase().trim() : null)
                .orElseThrow(() -> new Exception("Airport not found with IATA code: " + iataCode));
        return AirportMapper.toResponse(airport);
    }
}
