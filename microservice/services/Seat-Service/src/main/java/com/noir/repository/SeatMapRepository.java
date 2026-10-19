package com.noir.repository;

import com.noir.model.SeatMap;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatMapRepository extends JpaRepository<SeatMap, Long> {

    boolean existsByAirlineIdAndCabinClassIdAndName(Long airlineId, Long cabinClassId, String name);

    SeatMap findByCabinClassId(Long cabinClassId);
}
