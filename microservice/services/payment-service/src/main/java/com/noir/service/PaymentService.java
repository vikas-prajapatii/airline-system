package com.noir.service;

import com.razorpay.RazorpayException;
import com.noir.payload.dto.PaymentDTO;
import com.noir.payload.request.PaymentInitiateRequest;
import com.noir.payload.request.PaymentVerifyRequest;
import com.noir.payload.response.PaymentInitiateResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws RazorpayException;

    PaymentDTO verifyPayment(PaymentVerifyRequest request) throws Exception;

    Page<PaymentDTO> getAllPayments(Pageable pageable);

    Map<Long, PaymentDTO> getPaymentsByBookingIds(List<Long> bookingIds);

}
