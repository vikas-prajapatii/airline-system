package com.noir.service;

import com.noir.payload.dto.UserDTO;
import com.noir.payload.response.AuthResponse;

public interface AuthService {

        AuthResponse login(String email, String password) throws Exception;
        AuthResponse signup(UserDTO req) throws Exception;
    }


