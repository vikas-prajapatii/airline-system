package com.noir.mapper;

import com.noir.model.Airport;
import com.noir.payload.request.AirportRequest;
import com.noir.payload.response.AirportResponse;

import java.time.ZoneId;

public class AirportMapper {

    public static Airport toEntity(AirportRequest request) {
        if (request == null) {
            return null;
        }
        return Airport.builder()
                .iataCode(request.getIataCode() != null ? request.getIataCode().toUpperCase().trim() : null)
                .name(request.getName() != null ? request.getName().trim() : null)
                .timeZone(request.getTimeZone() != null ? request.getTimeZone().getId() : null)
                .address(request.getAddress())
                .geoCode(request.getGeoCode())
                .build();
    }

    public static AirportResponse toResponse(Airport airport) {
        if (airport == null) {
            return null;
        }

        ZoneId zoneId = null;
        if (airport.getTimeZone() != null && !airport.getTimeZone().isBlank()) {
            try {
                zoneId = ZoneId.of(airport.getTimeZone());
            } catch (Exception ignored) {
            }
        }

        return AirportResponse.builder()
                .id(airport.getId())
                .iataCode(airport.getIataCode())
                .name(airport.getName())
                .detailedName(airport.getDetailedName())
                .timeZone(zoneId)
                .address(airport.getAddress())
                .city(CityMapper.toResponse(airport.getCity()))
                .geoCode(airport.getGeoCode())
                .build();
    }

    public static void updateEntity(AirportRequest request, Airport existingAirport) {
        if (request == null || existingAirport == null) return;
        if (request.getIataCode() != null) {
            existingAirport.setIataCode(request.getIataCode().toUpperCase().trim());
        }
        if (request.getName() != null) {
            existingAirport.setName(request.getName().trim());
        }
        if (request.getTimeZone() != null) {
            existingAirport.setTimeZone(request.getTimeZone().getId());
        }
        if (request.getAddress() != null) {
            existingAirport.setAddress(request.getAddress());
        }
        if (request.getGeoCode() != null) {
            existingAirport.setGeoCode(request.getGeoCode());
        }
    }
}
