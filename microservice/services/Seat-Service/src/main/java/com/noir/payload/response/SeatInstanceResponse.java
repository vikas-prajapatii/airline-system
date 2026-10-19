package com.noir.payload.response;

import com.noir.enums.SeatAvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatInstanceResponse {
    private Long id;
    private Long seatId;
    private String seatNumber;
    private Boolean isBooked;
    private Boolean isAvailable;
    private SeatAvailabilityStatus status;
    private Double premiumSupercharge;
    private Long flightId;
    private Long flightInstanceId;
}
