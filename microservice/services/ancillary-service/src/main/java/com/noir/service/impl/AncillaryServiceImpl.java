package com.noir.service.impl;

import com.noir.client.AirlineClient;
import com.noir.mapper.AncillaryMapper;
import com.noir.mapper.InsuranceCoverageMapper;
import com.noir.model.Ancillary;
import com.noir.model.InsuranceCoverage;
import com.noir.payload.request.AncillaryRequest;
import com.noir.payload.response.AirlineResponse;
import com.noir.payload.response.AncillaryResponse;
import com.noir.payload.response.InsuranceCoverageResponse;
import com.noir.repository.AncillaryRepository;
import com.noir.repository.InsuranceCoverageRepository;
import com.noir.service.AncillaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AncillaryServiceImpl implements AncillaryService {

    private final AncillaryRepository ancillaryRepository;
    private final InsuranceCoverageRepository coverageRepository;
    private final AirlineClient airlineClient;

    @Override
    public AncillaryResponse createAncillary(Long userId, AncillaryRequest request) {

        AirlineResponse airlineResponse = airlineClient.getAirlineByOwner(userId);

        Ancillary ancillary = Ancillary.builder()
                .type(request.getType())
                .subType(request.getSubType())
                .rfisc(request.getRfisc())
                .name(request.getName())
                .description(request.getDescription())
                .metadata(request.getMetadata())
                .displayOrder(request.getDisplayOrder())
                .airlineId(airlineResponse.getOwnerId())
                .build();

        Ancillary saved = ancillaryRepository.save(ancillary);
        return AncillaryMapper.toResponse(saved, null);
    }

    @Override
    public AncillaryResponse getById(Long id) throws Exception {
        Ancillary ancillary = ancillaryRepository.findById(id)
                .orElseThrow(
                        () -> new Exception("Ancillary not found")
                );

        // fetch insurance coverages by ancillary
        List<InsuranceCoverage> coverages = coverageRepository
                .findByAncillaryId(ancillary.getId());
        List<InsuranceCoverageResponse> coverageResponses = coverages.stream()
                .map(InsuranceCoverageMapper::toResponse)
                .toList();

        return AncillaryMapper.toResponse(ancillary, coverageResponses);
    }

    @Override
    public List<AncillaryResponse> getByAirlineId(Long userId) {
        AirlineResponse airlineResponse = airlineClient.getAirlineByOwner(userId);
        return ancillaryRepository.findByAirlineId(airlineResponse.getId())
                .stream()
                .map(
                        ancillary -> {
                            // fetch insurance coverages by ancillary
                            List<InsuranceCoverage> coverages = coverageRepository
                                    .findByAncillaryId(ancillary.getId());
                            List<InsuranceCoverageResponse> coverageResponses = coverages.stream()
                                    .map(InsuranceCoverageMapper::toResponse)
                                    .toList();
                            return AncillaryMapper.toResponse(ancillary, coverageResponses);
                        }
                ).collect(Collectors.toList());
    }

    @Override
    public AncillaryResponse updateAncillary(Long id, AncillaryRequest request) throws Exception {
        Ancillary ancillary = ancillaryRepository.findById(id)
                .orElseThrow(
                        () -> new Exception("Ancillary not found")
                );

        ancillary.setType(request.getType());
        ancillary.setSubType(request.getSubType());
        ancillary.setRfisc(request.getRfisc());
        ancillary.setName(request.getName());
        ancillary.setDescription(request.getDescription());
        ancillary.setMetadata(request.getMetadata());
        ancillary.setDisplayOrder(request.getDisplayOrder());

        Ancillary updated = ancillaryRepository.save(ancillary);

        // fetch insurance coverages by ancillary
        List<InsuranceCoverage> coverages = coverageRepository
                .findByAncillaryId(ancillary.getId());
        List<InsuranceCoverageResponse> coverageResponses = coverages.stream()
                .map(InsuranceCoverageMapper::toResponse)
                .toList();

        return AncillaryMapper.toResponse(updated, coverageResponses);
    }

    @Override
    public void deleteAncillary(Long id) throws Exception {
        Ancillary ancillary = ancillaryRepository.findById(id)
                .orElseThrow(
                        () -> new Exception("Ancillary not found")
                );

        ancillaryRepository.delete(ancillary);
    }
}
