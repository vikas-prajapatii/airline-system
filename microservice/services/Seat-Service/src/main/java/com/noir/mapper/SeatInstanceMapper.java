package com.noir.mapper;

import com.noir.model.SeatInstance;
import com.noir.payload.response.SeatInstanceResponse;

public class SeatInstanceMapper {

    public static SeatInstanceResponse toResponse(SeatInstance seatInstance) {
        if (seatInstance == null) return null;
        return SeatInstanceResponse.builder()
                .id(seatInstance.getId())
                .seatId(seatInstance.getSeat() != null ? seatInstance.getSeat().getId() : null)
                .seatNumber(seatInstance.getSeat() != null ? seatInstance.getSeat().getSeatNumber() : null)
                .isBooked(seatInstance.getIsBooked())
                .isAvailable(seatInstance.getIsAvailable())
                .status(seatInstance.getStatus())
                .premiumSupercharge(seatInstance.getPremiumSupercharge())
                .flightId(seatInstance.getFlightId())
                .flightInstanceId(seatInstance.getFlightInstanceId())
                .build();
    }
}
