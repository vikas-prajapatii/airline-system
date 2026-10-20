package com.noir.client;

import com.noir.payload.response.AirlineResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "airline-core-service", url = "${airline-service.url:http://localhost:5002}")
public interface AirlineClient {

    @GetMapping("/api/airlines/admin")
    AirlineResponse getAirlineByOwner(@RequestHeader("X-User-Id") Long userId);
}
