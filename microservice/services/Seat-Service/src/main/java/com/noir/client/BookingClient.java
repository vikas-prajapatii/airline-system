package com.noir.client;

import com.noir.payload.response.BookingResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "booking-service", url = "${booking-service.url:http://localhost:5008}")
public interface BookingClient {

    @GetMapping("/api/bookings/{id}")
    BookingResponse getBookingById(@PathVariable("id") Long id);
}
