package com.noir.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "seat-service", url = "${seat-service.url:http://localhost:5006}")
public interface SeatClient {

    @PostMapping("/api/seat-instances/price/price")
    Double calculateSeatPrice(@RequestBody List<Long> seatInstanceIds);
}
