package com.noir.payload.response;

import com.noir.domain.AncillaryMetadata;
import com.noir.enums.AncillaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AncillaryResponse {

    private Long id;
    private AncillaryType type;
    private String subType;
    private String rfisc;
    private String name;
    private String description;
    private String categoryDisplayName;
    private String categoryIcon;
    private String iconUrl;
    private AncillaryMetadata metadata;

    private List<InsuranceCoverageResponse> coverages;
    private Integer displayOrder;
    private Long airlineId;
}
