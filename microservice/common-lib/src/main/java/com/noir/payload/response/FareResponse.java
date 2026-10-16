package com.noir.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareResponse {

    private Long id;
    private Long flightInstanceId;
    private BigDecimal baseFare;
    private BigDecimal tax;
    private BigDecimal totalFare;
    private String currency;
}
