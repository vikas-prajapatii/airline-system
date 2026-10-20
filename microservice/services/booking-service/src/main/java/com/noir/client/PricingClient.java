package com.noir.client;

import com.noir.payload.response.FareResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "pricing-service", url = "${pricing-service.url:http://localhost:5005}")
public interface PricingClient {

    @GetMapping("/api/fares/{id}")
    FareResponse getFareById(@PathVariable("id") Long id);
}
