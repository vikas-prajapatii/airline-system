package com.noir.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightMealResponse {
    private Long id;
    private Long flightId;
    private Long mealId;
    private String name;
    private String code;
    private String description;
    private Boolean available;
    private Double price;
    private Integer displayOrder;
    private String notes;
}
