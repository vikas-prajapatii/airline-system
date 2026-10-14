package com.noir.embeddable;

import jakarta.persistence.Embeddable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class Address {
    private String street;
    private String postalCode;

}
