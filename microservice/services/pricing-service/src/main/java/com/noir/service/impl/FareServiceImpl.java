package com.noir.service.impl;

import com.noir.mapper.FareMapper;
import com.noir.model.Fare;
import com.noir.payload.request.FareRequest;
import com.noir.payload.response.FareResponse;
import com.noir.repository.FareRepository;
import com.noir.service.FareService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FareServiceImpl implements FareService {
    private final FareRepository fareRepository;
    @Override
    public FareResponse createFare(FareRequest request) throws Exception {
        if (fareRepository.existsByFlightIdAndCabinClassIdAndName(
                request.getFlightId(),
                request.getCabinClassId(),
                request.getName()
        )) {
            throw new Exception("fare already exist with provided name");
        }
        Fare fare = FareMapper.toEntity(request);
        Fare saved = fareRepository.save(fare);
        return FareMapper.toResponse(saved);
    }
    @Override
    public FareResponse getFareById(Long id) throws Exception {
        Fare fare = fareRepository.findById(id).orElseThrow(
                () -> new Exception("Fare not found with given Id")
        );
        return FareMapper.toResponse(fare);
    }

    @Override
    public List<FareResponse> getFaresByFlightIdAndCabinClassId(Long flightId, Long cabinClassId) {
        return fareRepository.findByFlightIdAndCabinClassId(
                flightId, cabinClassId
        ).stream().map(
                FareMapper::toResponse
        ).toList();
    }
    @Override
    public FareResponse updateFare(Long id, FareRequest request) throws Exception {
        Fare fare = fareRepository.findById(id).orElseThrow(
                () -> new Exception("Fare not found with given Id")
        );
        if (fareRepository.existsByFlightIdAndCabinClassIdAndNameAndIdNot(
                request.getFlightId(),
                request.getCabinClassId(),
                request.getName(),
                fare.getId()
        )) {
            throw new Exception("fare already exist with provided name");
        }

        FareMapper.updateEntity(request, fare);
        Fare updated = fareRepository.save(fare);
        return FareMapper.toResponse(updated);
    }

    @Override
    public void deleteFare(Long id) throws Exception {
        Fare fare = fareRepository.findById(id).orElseThrow(
                () -> new Exception("Fare not found with given Id")
        );
        fareRepository.delete(fare);
    }

    @Override
    public List<Fare> getFares() {
        return fareRepository.findAll();
    }

    @Override
    public Map<Long, FareResponse> getLowestFarePerFlight(List<Long> flightIds, Long cabinClassId) {
        if (flightIds == null || flightIds.isEmpty()) return Map.of();

        List<Fare> fares = fareRepository.findByFlightIdInAndCabinClassId(
                flightIds, cabinClassId
        );

        Map<Long, FareResponse> result = fares.stream()
                .collect(Collectors.toMap(
                        Fare::getFlightId,
                        fare -> fare,
                        (existing, candidate) ->
                                candidate.getTotalPrice() < existing.getTotalPrice()
                                        ? candidate : existing
                )).entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> FareMapper.toResponse(e.getValue())
                ));

        return result;
    }

    @Override
    public FareResponse getLowestFareForFlightAndCabin(Long flightId, Long cabinClassId) {
        List<Fare> fares = fareRepository.findByFlightIdAndCabinClassId(
                flightId, cabinClassId
        );
        Fare lowestFare = fares.stream()
                .min(Comparator.comparingDouble(Fare::getTotalPrice))
                .orElse(null);

        return FareMapper.toResponse(lowestFare);
    }

    @Override
    public Map<Long, FareResponse> getFaresByIds(List<Long> ids) {
        List<Fare> fares = fareRepository.findAllById(ids);
        return fares.stream().collect(Collectors.toMap(Fare::getId, FareMapper::toResponse));
    }
}
