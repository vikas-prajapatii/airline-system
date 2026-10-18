package com.noir.mapper;

import com.noir.model.BaggagePolicy;
import com.noir.payload.response.BaggagePolicyResponse;

public class BaggagePolicyMapper {

    public static BaggagePolicyResponse toResponse(BaggagePolicy baggagePolicy) {
        if (baggagePolicy == null) return null;
        return BaggagePolicyResponse.builder()
                .id(baggagePolicy.getId())
                .name(baggagePolicy.getName())
                .description(baggagePolicy.getDescription())
                .cabinBaggageMaxWeight(baggagePolicy.getCabinBaggageMaxWeight())
                .cabinBaggagePieces(baggagePolicy.getCabinBaggagePieces())
                .cabinBaggageWeightPerPiece(baggagePolicy.getCabinBaggageWeightPerPiece())
                .cabinBaggageMaxDimension(baggagePolicy.getCabinBaggageMaxDimension())
                .checkInBaggageMaxWeight(baggagePolicy.getCheckInBaggageMaxWeight())
                .checkInBaggagePieces(baggagePolicy.getCheckInBaggagePieces())
                .checkInBaggageWeightPerPiece(baggagePolicy.getCheckInBaggageWeightPerPiece())
                .freeCheckedBagsAllowance(baggagePolicy.getFreeCheckedBagsAllowance())
                .priorityBaggage(baggagePolicy.getPriorityBaggage())
                .extraBaggageAllowance(baggagePolicy.getExtraBaggageAllowance())
                .airlineId(baggagePolicy.getAirlineId())
                .createdAt(baggagePolicy.getCreatedAt())
                .updatedAt(baggagePolicy.getUpdatedAt())
                .build();
    }
}
