package com.noir.payload.response;

import com.noir.embeddable.Support;
import com.noir.enums.AirlineStatus;
import com.noir.payload.dto.UserDTO;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AirlineResponse {

    private Long id;

    private String iataCode;
    private String icaoCode;

    private String name;
    private String alias;

    private String logoUrl;
    private String website;

    private AirlineStatus status;
    private String alliance;

    private Instant createdAt;
    private Instant updatedAt;

    private Long ownerId;
    private UserDTO owner;
    private Long updatedById;

    private Long headquartersCityId;
    private CityResponse headquartersCity;
    private Support support;
}
