package com.noir.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaggagePolicyResponse {

    private Long id;
    private String name;
    private String description;
    private Double cabinBaggageMaxWeight;
    private Integer cabinBaggagePieces;
    private Double cabinBaggageWeightPerPiece;
    private Integer cabinBaggageMaxDimension;
    private Double checkInBaggageMaxWeight;
    private Integer checkInBaggagePieces;
    private Double checkInBaggageWeightPerPiece;
    private Integer freeCheckedBagsAllowance;
    private Boolean priorityBaggage;
    private Boolean extraBaggageAllowance;
    private Long airlineId;
    private Instant createdAt;
    private Instant updatedAt;
}
