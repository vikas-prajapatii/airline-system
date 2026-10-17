package com.noir.service.impl;

import com.noir.client.AirlineClient;
import com.noir.client.LocationClient;
import com.noir.event.FlightInstanceCreatedEvent;
import com.noir.event.FlightInstanceEventProducer;
import com.noir.mapper.FlightInstanceMapper;
import com.noir.model.Flight;
import com.noir.model.FlightInstance;
import com.noir.payload.request.FlightInstanceRequest;
import com.noir.payload.response.AircraftResponse;
import com.noir.payload.response.AirlineResponse;
import com.noir.payload.response.AirportResponse;
import com.noir.payload.response.FlightInstanceResponse;
import com.noir.repository.FlightInstanceRepository;
import com.noir.repository.FlightRepository;
import com.noir.service.FlightInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FlightInstanceServiceImpl implements FlightInstanceService {

    private final FlightRepository flightRepository;
    private final FlightInstanceRepository flightInstanceRepository;
    private final AirlineClient airlineClient;
    private final LocationClient locationClient;
    private final FlightInstanceEventProducer flightInstanceEventProducer;

    @Override
    public FlightInstanceResponse createFlightInstance(Long userId, FlightInstanceRequest request) throws Exception {

        // fetch airline by owner id or fallback to direct airlineId
        AirlineResponse airlineResponse;
        try {
            airlineResponse = airlineClient.getAirlineByOwner(userId);
        } catch (Exception e) {
            airlineResponse = airlineClient.getAirlineById(userId);
        }
        Flight flight = flightRepository.findById(request.getFlightId()).orElseThrow(
                () -> new Exception("Flight Not Found!")
        );

        // get aircraft data from airline core service
        AircraftResponse aircraft = airlineClient.getAircraftById(flight.getAircraftId());
        FlightInstance flightInstance = FlightInstanceMapper.toEntity(request, flight);
        flightInstance.setAirlineId(airlineResponse.getId());
        flightInstance.setTotalSeats(aircraft.getTotalSeats());
        flightInstance.setAvailableSeats(aircraft.getTotalSeats());

        FlightInstance saved = flightInstanceRepository.save(flightInstance);

        // create seat instances
        // publish kafka event, seat service consume that and create seat instance
        FlightInstanceCreatedEvent event = FlightInstanceCreatedEvent.builder()
                .flightInstanceId(saved.getId())
                .aircraftId(flight.getAircraftId())
                .flightId(flight.getId())
                .build();

        flightInstanceEventProducer.sendFlightInstanceCreated(event);

        return convertToFlightInstanceResponse(saved);
    }

    @Override
    public FlightInstanceResponse getFlightInstanceById(Long id) throws Exception {
        FlightInstance flightInstance = flightInstanceRepository.findById(id).orElseThrow(
                () -> new Exception("flight instance not found with id " + id)
        );
        return convertToFlightInstanceResponse(flightInstance);
    }

    @Override
    public Page<FlightInstanceResponse> getByAirlineId(Long userId,
                                                       Long departureAirportId,
                                                       Long arrivalAirportId,
                                                       Long flightId,
                                                       LocalDate onDate, Pageable pageable) {
        // fetch by owner id
        AirlineResponse airlineResponse = airlineClient.getAirlineByOwner(userId);
        LocalDateTime start = onDate != null ? onDate.atStartOfDay() : null;
        LocalDateTime end = onDate != null ? onDate.plusDays(1).atStartOfDay() : null;

        return flightInstanceRepository.findByAirlineId(
                airlineResponse.getId(),
                departureAirportId,
                arrivalAirportId,
                flightId,
                start,
                end,
                pageable
        ).map(this::convertToFlightInstanceResponse);
    }

    @Override
    public FlightInstanceResponse updateFlightInstance(Long id, FlightInstanceRequest request) throws Exception {
        FlightInstance existing = flightInstanceRepository.findById(id).orElseThrow(
                () -> new Exception("flight instance not found")
        );
        FlightInstanceMapper.updateEntity(request, existing);
        return convertToFlightInstanceResponse(flightInstanceRepository.save(existing));
    }

    @Override
    public void deleteFlightInstance(Long id) throws Exception {
        FlightInstance existing = flightInstanceRepository.findById(id).orElseThrow(
                () -> new Exception("flight instance not found")
        );
        flightInstanceRepository.delete(existing);
    }

    private FlightInstanceResponse convertToFlightInstanceResponse(FlightInstance flightInstance) {
        // service to service communication
        AirlineResponse airline = airlineClient.getAirlineById(flightInstance.getAirlineId());
        AirportResponse departureAirport = locationClient
                .getAirportById(flightInstance.getDepartureAirportId());
        AirportResponse arrivalAirport = locationClient
                .getAirportById(flightInstance.getArrivalAirportId());
        AircraftResponse aircraftResponse = airlineClient.getAircraftById(
                flightInstance.getFlight().getAircraftId());

        return FlightInstanceMapper.toResponse(
                flightInstance,
                aircraftResponse,
                airline,
                departureAirport,
                arrivalAirport
        );
    }
}
