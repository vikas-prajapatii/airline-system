package com.noir.payload.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AirlineDropdownItem {

    private Long id;
    private String name;
    private String iataCode;
    private String icaoCode;
    private String logoUrl;
}
