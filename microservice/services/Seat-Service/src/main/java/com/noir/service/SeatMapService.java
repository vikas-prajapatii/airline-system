package com.noir.service;

import com.noir.payload.request.SeatMapRequest;
import com.noir.payload.response.SeatMapResponse;

public interface SeatMapService {
    SeatMapResponse createSeatMap(Long userId, SeatMapRequest request) throws Exception;
    SeatMapResponse getSeatMapById(Long id) throws Exception;
    SeatMapResponse getSeatMapByCabinClass(Long cabinClassId);
    SeatMapResponse updateSeatMap(Long id, SeatMapRequest request) throws Exception;
    void deleteSeatMap(Long id) throws Exception;
}
