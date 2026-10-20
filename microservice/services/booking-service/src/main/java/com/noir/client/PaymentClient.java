package com.noir.client;

import com.noir.payload.request.PaymentInitiateRequest;
import com.noir.payload.response.PaymentInitiateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", url = "${payment-service.url:http://localhost:5009}")
public interface PaymentClient {

    @PostMapping("/api/payments/initiate")
    PaymentInitiateResponse initiatePayment(@RequestBody PaymentInitiateRequest request);
}
