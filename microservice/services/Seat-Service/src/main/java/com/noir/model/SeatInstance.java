package com.noir.model;

import com.noir.enums.SeatAvailabilityStatus;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class SeatInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long flightId;

    private Long flightInstanceId;

    @Enumerated(EnumType.STRING)
    private SeatAvailabilityStatus status;

    @ManyToOne
    private FlightInstanceCabin flightInstanceCabin;

    @ManyToOne
    private Seat seat;

    @Builder.Default
    private Boolean isAvailable = true;

    @Builder.Default
    private Boolean isBooked = false;

    private Double premiumSupercharge;
}
