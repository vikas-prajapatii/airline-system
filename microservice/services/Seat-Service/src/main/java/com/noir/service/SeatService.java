package com.noir.service;

import com.noir.payload.request.SeatRequest;
import com.noir.payload.response.SeatResponse;

import java.util.List;

public interface SeatService {
    void generateSeats(Long seatMapId) throws Exception;
    List<SeatResponse> getAll();
    SeatResponse updateSeats(Long seatId, SeatRequest request);
}
