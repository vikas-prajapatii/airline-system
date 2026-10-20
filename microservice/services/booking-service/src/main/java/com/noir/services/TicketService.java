package com.noir.services;

import com.noir.model.Booking;
import com.noir.model.Ticket;

import java.util.List;

public interface TicketService {

    List<Ticket> generateTicketsForBooking(Booking booking);
}
