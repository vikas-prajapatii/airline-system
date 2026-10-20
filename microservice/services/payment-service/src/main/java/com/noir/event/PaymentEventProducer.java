package com.noir.event;

import com.noir.model.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendPaymentCompleted(Payment payment) {
        try {
            log.info("Publishing payment completed event: {}", payment);
            kafkaTemplate.send("payment-completed", payment);
        } catch (Exception e) {
            log.error("Could not publish payment completed event to Kafka: {}", e.getMessage());
        }
    }

    public void sendPaymentFailed(Payment payment) {
        try {
            log.info("Publishing payment failed event: {}", payment);
            kafkaTemplate.send("payment-failed", payment);
        } catch (Exception e) {
            log.error("Could not publish payment failed event to Kafka: {}", e.getMessage());
        }
    }
}
