package com.noir.service.interservice;

import com.noir.payload.response.AirlineResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AirlineIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${airline-service.url:http://localhost:5002}")
    private String airlineServiceUrl;

    public AirlineResponse getAirLineById(Long airlineId) {
        String baseUrl = (airlineServiceUrl != null && airlineServiceUrl.endsWith("/"))
                ? airlineServiceUrl.substring(0, airlineServiceUrl.length() - 1)
                : airlineServiceUrl;
        String url = baseUrl + "/api/airlines/" + airlineId;
        log.info("Fetching airline details from: {}", url);
        return restTemplate.getForObject(url, AirlineResponse.class);
    }

}
