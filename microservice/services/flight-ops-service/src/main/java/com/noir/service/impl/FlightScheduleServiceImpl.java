package com.noir.service.impl;

import com.noir.client.AirlineClient;
import com.noir.client.LocationClient;
import com.noir.enums.FlightStatus;
import com.noir.mapper.FlightScheduleMapper;
import com.noir.model.Flight;
import com.noir.model.FlightSchedule;
import com.noir.payload.request.FlightInstanceRequest;
import com.noir.payload.request.FlightScheduleRequest;
import com.noir.payload.response.AirlineResponse;
import com.noir.payload.response.AirportResponse;
import com.noir.payload.response.FlightScheduleResponse;
import com.noir.repository.FlightRepository;
import com.noir.repository.FlightScheduleRepository;
import com.noir.service.FlightInstanceService;
import com.noir.service.FlightScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlightScheduleServiceImpl implements FlightScheduleService {

    private final FlightRepository flightRepository;
    private final FlightScheduleRepository flightScheduleRepository;
    private final FlightInstanceService flightInstanceService;
    private final AirlineClient airlineClient;
    private final LocationClient locationClient;

    @Override
    public FlightScheduleResponse createFlightSchedule(
            Long userId,
            FlightScheduleRequest request) throws Exception {

        AirlineResponse airlineResponse = airlineClient.getAirlineByOwner(userId);

        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new Exception("flight not found with given id"));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new Exception("end date is before start date");
        }
        FlightSchedule flightSchedule = FlightScheduleMapper.toEntity(request, flight);
        FlightSchedule savedSchedule = flightScheduleRepository.save(flightSchedule);

        // create flight instance for saved scheduled
        // 11/03/2026 to 10/04/2026
        // mon, tue, wed, thu
        List<DayOfWeek> operatingDays = savedSchedule.getOperatingDays();
        LocalDate startDate = savedSchedule.getStartDate();
        LocalDate endDate = savedSchedule.getEndDate();

        FlightInstanceRequest flightInstanceRequest = FlightInstanceRequest
                .builder()
                .scheduleId(savedSchedule.getId())
                .flightId(flight.getId())
                .arrivalAirportId(flight.getArrivalAirportId())
                .departureAirportId(flight.getDepartureAirportId())
                .status(FlightStatus.SCHEDULED)
                .build();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            if (operatingDays.contains(date.getDayOfWeek())) {
                flightInstanceRequest.setDepartureDateTime(
                        LocalDateTime.of(date, savedSchedule.getDepartureTime())
                );
                flightInstanceRequest.setArrivalDateTime(
                        LocalDateTime.of(date, savedSchedule.getArrivalTime())
                );
                flightInstanceService.createFlightInstance(airlineResponse.getId(), flightInstanceRequest);
            }
        }

        return convertToFlightScheduleResponse(savedSchedule);
    }

    @Override
    public FlightScheduleResponse getFlightScheduleById(Long id) throws Exception {
        FlightSchedule flightSchedule = flightScheduleRepository.findById(id).orElseThrow(
                () -> new Exception("flight schedule not found with id")
        );
        return convertToFlightScheduleResponse(flightSchedule);
    }

    @Override
    public List<FlightScheduleResponse> getFlightScheduleByAirline(Long userId) {
        AirlineResponse airlineResponse = airlineClient.getAirlineByOwner(userId);
        List<FlightSchedule> schedules = flightScheduleRepository.findByFlightAirlineId(
                airlineResponse.getId()
        );

        return schedules.stream().map(
                this::convertToFlightScheduleResponse
        ).toList();
    }

    @Override
    public FlightScheduleResponse updateFlightSchedule(Long id, FlightScheduleRequest flightScheduleRequest) throws Exception {
        FlightSchedule flightSchedule = flightScheduleRepository.findById(id).orElseThrow(
                () -> new Exception("flight schedule not found with id")
        );
        FlightScheduleMapper.updateEntity(flightScheduleRequest, flightSchedule);
        FlightSchedule updatedSchedule = flightScheduleRepository.save(flightSchedule);

        return convertToFlightScheduleResponse(updatedSchedule);
    }

    @Override
    public void deleteFlightSchedule(Long id) throws Exception {
        FlightSchedule flightSchedule = flightScheduleRepository.findById(id).orElseThrow(
                () -> new Exception("flight schedule not found with id")
        );
        flightScheduleRepository.delete(flightSchedule);
    }

    private FlightScheduleResponse convertToFlightScheduleResponse(FlightSchedule flightSchedule) {
        // fetch actual airport data from airline core service
        AirportResponse departureAirport = locationClient
                .getAirportById(flightSchedule.getDepartureAirportId());
        AirportResponse arrivalAirport = locationClient
                .getAirportById(flightSchedule.getArrivalAirportId());
        return FlightScheduleMapper.toResponse(
                flightSchedule, arrivalAirport, departureAirport
        );
    }
}
