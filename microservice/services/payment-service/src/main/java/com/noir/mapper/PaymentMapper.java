package com.noir.mapper;

import com.noir.model.Payment;
import com.noir.payload.dto.PaymentDTO;

public class PaymentMapper {

    public static PaymentDTO toDTO(Payment payment) {
        if (payment == null) return null;

        return PaymentDTO.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .bookingId(payment.getBookingId())
                .status(payment.getStatus())
                .gateway(payment.getProvider())
                .amount(payment.getAmount() != null ? payment.getAmount().longValue() : null)
                .transactionId(payment.getTransactionId())
                .gatewayPaymentId(payment.getProviderPaymentId())
                .failureReason(payment.getFailureReason())
                .completedAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
