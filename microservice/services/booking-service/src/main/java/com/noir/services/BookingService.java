package com.noir.services;

import com.noir.enums.BookingStatus;
import com.noir.payload.request.BookingRequest;
import com.noir.payload.response.BookingResponse;
import com.noir.payload.response.PaymentInitiateResponse;

import java.util.List;

public interface BookingService {

    PaymentInitiateResponse createBooking(BookingRequest request, Long userId);
    BookingResponse updateBooking(Long id, BookingRequest request);
    BookingResponse getBookingById(Long id) throws Exception;
    List<BookingResponse> getAllBookingsByAirline(Long userId,
                                                  String searchQuery,
                                                  BookingStatus status,
                                                  Long flightInstanceId,
                                                  String sortDirection
    );

    List<BookingResponse> getBookingsByUser(Long userId);

    BookingResponse cancelBooking(Long id) throws Exception;

    void deleteBooking(Long id) throws Exception;
}
