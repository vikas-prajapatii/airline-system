package com.noir.mapper;

import com.noir.model.Ancillary;
import com.noir.payload.response.AncillaryResponse;
import com.noir.payload.response.InsuranceCoverageResponse;

import java.util.List;

public class AncillaryMapper {

    public static AncillaryResponse toResponse(
            Ancillary ancillary,
            List<InsuranceCoverageResponse> coverageResponsesList
    ) {
        if (ancillary == null) return null;

        return AncillaryResponse.builder()
                .id(ancillary.getId())
                .type(ancillary.getType())
                .subType(ancillary.getSubType())
                .rfisc(ancillary.getRfisc())
                .name(ancillary.getName())
                .description(ancillary.getDescription())
                .metadata(ancillary.getMetadata())
                .coverages(coverageResponsesList)
                .displayOrder(ancillary.getDisplayOrder())
                .airlineId(ancillary.getAirlineId())
                .build();
    }
}
