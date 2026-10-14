package com.noir.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.noir.embeddable.Address;
import com.noir.embeddable.GeoCode;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Airport {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true, nullable = false, length = 3)
    private String iataCode;

    @Column(nullable = false)
    private String name;

    @Embedded
    private Address address;

    @Embedded
    private GeoCode geoCode;

    @Column(name = "time_zone_id", length = 50)
    private String timeZone;

    @ManyToOne
    @JsonIgnore
    private City city;

    @JsonIgnore
    @Transient
    public String getDetailedName() {
        String airportName = name != null ? name.toUpperCase() : "";
        if (city != null && city.getCityCode() != null) {
            return airportName + "/" + city.getCityCode();
        }
        return airportName;
    }
}
