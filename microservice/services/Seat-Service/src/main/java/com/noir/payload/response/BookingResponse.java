package com.noir.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingNumber;
    private String bookingStatus;
    private Long userId;
    private Long flightId;
    private LocalDateTime bookingTime;
    private Double totalAmount;
}
