package com.noir.controller;

import com.noir.payload.dto.UserDTO;
import com.noir.payload.request.LoginRequest;
import com.noir.payload.response.AuthResponse;
import com.noir.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(
            @RequestBody @Valid UserDTO userDTO
    ) throws Exception {
        AuthResponse response = authService.signup(userDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody @Valid LoginRequest req) throws Exception {
        AuthResponse response = authService.login(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(response);
    }
}
