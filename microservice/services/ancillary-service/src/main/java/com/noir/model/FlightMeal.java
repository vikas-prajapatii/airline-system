package com.noir.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class FlightMeal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Long flightId;

    @ManyToOne
    private Meal meal;

    @Builder.Default
    private Boolean available = true;

    private Double price;

    @Builder.Default
    private Integer displayOrder = 0;

    private String notes;
}
