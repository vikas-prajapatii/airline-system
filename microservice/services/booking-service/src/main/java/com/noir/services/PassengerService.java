package com.noir.services;

import com.noir.model.Passenger;
import com.noir.payload.request.PassengerRequest;

public interface PassengerService {

    Passenger createPassenger(PassengerRequest request, Long userId);
}
