package com.noir.exception;

import com.noir.payload.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception ex) {
        String message = ex.getMessage();
        if (message != null && message.toLowerCase().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(message, false));
        }
        if (message != null && (message.toLowerCase().contains("already exist") || message.toLowerCase().contains("duplicate"))) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse(message, false));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(message != null ? message : "Internal server error", false));
    }
}
