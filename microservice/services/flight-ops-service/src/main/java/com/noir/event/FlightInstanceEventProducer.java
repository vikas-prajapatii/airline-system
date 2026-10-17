package com.noir.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FlightInstanceEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendFlightInstanceCreated(FlightInstanceCreatedEvent event) {
        try {
            log.info("Publishing flight instance created event: {}", event);
            kafkaTemplate.send("flight-instance-created", event);
        } catch (Exception e) {
            log.error("Could not publish flight instance created event to Kafka: {}", e.getMessage());
        }
    }
}
