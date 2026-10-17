package com.noir.repository;

import com.noir.model.FlightSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlightScheduleRepository extends JpaRepository<FlightSchedule, Long> {

    List<FlightSchedule> findByFlightAirlineId(Long airlineId);
}
