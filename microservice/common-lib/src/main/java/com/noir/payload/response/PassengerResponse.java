package com.noir.payload.response;

import com.noir.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PassengerResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String passengerType;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String passportNumber;
    private String nationality;
    private Long seatInstanceId;

    private Long primaryUserId;
    private Boolean isActive;
    private Integer age;
    private Boolean isAdult;
    private String fullName;
    private Instant createdAt;
    private Instant updatedAt;
}
