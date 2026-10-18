package com.noir.service.impl;

import com.noir.mapper.FareRuleMapper;
import com.noir.model.Fare;
import com.noir.model.FareRules;
import com.noir.payload.request.FareRulesRequest;
import com.noir.payload.response.FareRulesResponse;
import com.noir.repository.FareRepository;
import com.noir.repository.FareRuleRepository;
import com.noir.service.FareRulesService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FareRulesServiceImpl implements FareRulesService {

    private final FareRepository fareRepository;
    private final FareRuleRepository fareRuleRepository;

    @Override
    public FareRulesResponse createFareRules(FareRulesRequest request) throws Exception {
        Fare fare = fareRepository.findById(request.getFareId())
                .orElseThrow(() -> new Exception("Fare not found with id: " + request.getFareId()));

        if (fareRuleRepository.existsByFareId(fare.getId())) {
            throw new Exception("Fare rules already exist for this fare");
        }

        FareRules fareRules = FareRuleMapper.toEntity(request, fare);
        FareRules savedFareRules = fareRuleRepository.save(fareRules);

        return FareRuleMapper.toResponse(savedFareRules);
    }

    @Override
    public FareRulesResponse getFareRulesById(Long id) throws Exception {
        FareRules fareRules = fareRuleRepository.findById(id).orElseThrow(
                () -> new Exception("fare rule not found with id: " + id)
        );
        return FareRuleMapper.toResponse(fareRules);
    }

    @Override
    public FareRulesResponse getFareRulesByFareId(Long fareId) {
        FareRules fareRules = fareRuleRepository.findByFareId(fareId);
        return FareRuleMapper.toResponse(fareRules);
    }

    @Override
    public List<FareRulesResponse> getFareRulesByAirlineId(Long airlineId) {
        return fareRuleRepository.findByAirlineId(airlineId).stream()
                .map(FareRuleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FareRulesResponse updateFareRules(Long id, FareRulesRequest request) throws Exception {
        FareRules fareRules = fareRuleRepository.findById(id).orElseThrow(
                () -> new Exception("fare rule not found with id: " + id)
        );
        FareRuleMapper.updateEntity(request, fareRules);
        FareRules savedFareRules = fareRuleRepository.save(fareRules);
        return FareRuleMapper.toResponse(savedFareRules);
    }

    @Override
    public void deleteFareRules(Long id) {
        FareRules fareRules = fareRuleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Fare rules not found with id: " + id));
        fareRuleRepository.delete(fareRules);
    }
}
