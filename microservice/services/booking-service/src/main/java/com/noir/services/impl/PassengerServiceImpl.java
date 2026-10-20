package com.noir.services.impl;

import com.noir.mapper.PassengerMapper;
import com.noir.model.Passenger;
import com.noir.payload.request.PassengerRequest;
import com.noir.repository.PassengerRepository;
import com.noir.services.PassengerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PassengerServiceImpl implements PassengerService {

    private final PassengerRepository passengerRepository;

    @Override
    public Passenger createPassenger(PassengerRequest request, Long userId) {
        Passenger passenger = PassengerMapper.toEntity(request);
        passenger.setPrimaryUserId(userId);
        return passengerRepository.save(passenger);
    }
}
