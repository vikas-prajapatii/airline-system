package com.noir.repository;

import com.noir.model.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AircraftRepository extends JpaRepository<Aircraft, Long> {
    boolean existsByCode(String code);
    List<Aircraft> findByAirlineId(Long airlineId);
    Aircraft findByIdAndAirlineId(Long id, Long airlineId);
}
