package com.noir.mapper;

import com.noir.model.FareRules;
import com.noir.payload.response.FareRulesResponse;

public class FareRuleMapper {

    public static FareRulesResponse toResponse(FareRules fareRules) {
        if (fareRules == null) return null;
        return FareRulesResponse.builder()
                .id(fareRules.getId())
                .ruleName(fareRules.getRuleName())
                .airlineId(fareRules.getAirlineId())
                .isRefundable(fareRules.getIsRefundable())
                .changeFee(fareRules.getChangeFee())
                .cancellationFee(fareRules.getCancellationFee())
                .refundDeadlineDays(fareRules.getRefundDeadlineDays())
                .changeDeadlineHours(fareRules.getChangeDeadlineHours())
                .isChangeable(fareRules.getIsChangeable())
                .createdAt(fareRules.getCreatedAt())
                .updatedAt(fareRules.getUpdatedAt())
                .build();
    }
}
