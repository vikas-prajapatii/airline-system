package com.noir.model;

import com.noir.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String ticketNumber;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    private LocalDateTime issuedAt;

    @ManyToOne
    private Booking booking;

    @ManyToOne
    private Passenger passenger;
}
