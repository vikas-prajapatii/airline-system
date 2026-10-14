package com.noir.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/test")
    public ResponseEntity<String> testService() {
        return ResponseEntity.ok("User Service is up and running successfully!");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "user-service");
        status.put("status", "UP");
        status.put("port", 5001);
        status.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(status);
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> welcome() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome to Airline User Service API");
        return ResponseEntity.ok(response);
    }
}
