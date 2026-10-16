package com.noir.service;

import com.noir.enums.FlightStatus;
import com.noir.payload.request.FlightRequest;
import com.noir.payload.response.FlightResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FlightService {

    FlightResponse createFlight(Long userId, FlightRequest flightRequest) throws Exception;

    Page<FlightResponse> getFlightsByAirline(Long userId,
                                             Long departureAirportId,
                                             Long arrivalAirportId,
                                             Pageable pageable);

    FlightResponse getFlightById(Long id) throws Exception;

    FlightResponse updateFlight(Long id, FlightRequest flightRequest) throws Exception;

    FlightResponse changeStatus(Long id, FlightStatus status) throws Exception;

    void deleteFlight(Long userId, Long id) throws Exception;
}
