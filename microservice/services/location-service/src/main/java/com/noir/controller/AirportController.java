package com.noir.controller;

import com.noir.payload.request.AirportRequest;
import com.noir.payload.response.ApiResponse;
import com.noir.payload.response.AirportResponse;
import com.noir.service.AirportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/airports")
public class AirportController {

    private final AirportService airportService;

    @PostMapping
    public ResponseEntity<AirportResponse> createAirport(
            @Valid @RequestBody AirportRequest request
    ) throws Exception {
        AirportResponse response = airportService.createAirport(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AirportResponse> getAirportById(
            @PathVariable Long id
    ) throws Exception {
        AirportResponse response = airportService.getAirportById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AirportResponse>> getAllAirports() {
        List<AirportResponse> airports = airportService.getAllAirports();
        return ResponseEntity.ok(airports);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AirportResponse> updateAirport(
            @PathVariable Long id,
            @Valid @RequestBody AirportRequest request
    ) throws Exception {
        AirportResponse response = airportService.updateAirport(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteAirport(
            @PathVariable Long id
    ) throws Exception {
        airportService.deleteAirport(id);
        return ResponseEntity.ok(new ApiResponse("Airport deleted successfully"));
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<AirportResponse>> getAirportsByCityId(
            @PathVariable Long cityId
    ) {
        List<AirportResponse> airports = airportService.getAirportByCityId(cityId);
        return ResponseEntity.ok(airports);
    }

    @GetMapping("/iata/{iataCode}")
    public ResponseEntity<AirportResponse> getAirportByIataCode(
            @PathVariable String iataCode
    ) throws Exception {
        AirportResponse response = airportService.getAirportByIataCode(iataCode);
        return ResponseEntity.ok(response);
    }
}
