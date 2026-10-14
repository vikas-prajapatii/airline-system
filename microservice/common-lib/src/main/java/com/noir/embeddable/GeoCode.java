package com.noir.embeddable;

import jakarta.persistence.Embeddable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class GeoCode {
    private Double latitude;
    private Double longitude;
}
