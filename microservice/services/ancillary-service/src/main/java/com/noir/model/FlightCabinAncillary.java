package com.noir.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class FlightCabinAncillary {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Long flightId;

    @Column(nullable = false)
    private Long cabinClassId;

    @ManyToOne
    private Ancillary ancillary;

    private Boolean available;

    private Integer maxQuantity;

    private Double price;

    @Builder.Default
    private Boolean includedInFare = false;
}
