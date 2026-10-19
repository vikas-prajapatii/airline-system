package com.noir.payload.response;

import com.noir.enums.CoverageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceCoverageResponse implements Serializable {

    private Long id;
    private Long ancillaryId;
    private String ancillaryName;
    private CoverageType coverageType;
    private String name;
    private String description;
    private Double coverageAmount;
    private Boolean isFlat;
    private String claimCondition;
    private String emergencyContact;
    private Integer displayOrder;
    private Boolean active;
}
