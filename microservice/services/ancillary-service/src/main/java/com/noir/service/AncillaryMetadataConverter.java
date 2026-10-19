package com.noir.service;

import com.noir.domain.AncillaryMetadata;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Converter
public class AncillaryMetadataConverter implements AttributeConverter<AncillaryMetadata, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    @Override
    public String convertToDatabaseColumn(AncillaryMetadata attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            log.error("Error converting AncillaryMetadata to JSON string", e);
            return null;
        }
    }

    @Override
    public AncillaryMetadata convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(dbData, AncillaryMetadata.class);
        } catch (Exception e) {
            log.error("Error converting JSON string to AncillaryMetadata", e);
            return null;
        }
    }
}
