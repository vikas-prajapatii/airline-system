package com.noir.embeddable;

import jakarta.persistence.Embeddable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class Support {

    private String email;
    private String phone;
    private String hours;

    public String getSupportEmail() {
        return email;
    }

    public void setSupportEmail(String supportEmail) {
        this.email = supportEmail;
    }

    public String getSupportPhone() {
        return phone;
    }

    public void setSupportPhone(String supportPhone) {
        this.phone = supportPhone;
    }

    public String getSupportHours() {
        return hours;
    }

    public void setSupportHours(String supportHours) {
        this.hours = supportHours;
    }

    public String getContactNumber() {
        return phone;
    }

    public void setContactNumber(String contactNumber) {
        this.phone = contactNumber;
    }
}
