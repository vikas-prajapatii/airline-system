package com.noir.payload.response;

import com.noir.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentLinkResponse {

    private Long id;
    private String paymentLinkId;
    private String paymentUrl;
    private PaymentStatus status;
    private Double amount;
}
