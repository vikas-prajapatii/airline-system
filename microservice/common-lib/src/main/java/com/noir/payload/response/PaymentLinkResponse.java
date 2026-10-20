package com.noir.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentLinkResponse {

    private String payment_link_id;
    private String payment_link_url;

    public String getPaymentLinkId() {
        return payment_link_id;
    }

    public String getPaymentUrl() {
        return payment_link_url;
    }
}
