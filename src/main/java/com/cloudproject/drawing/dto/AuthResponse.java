package com.cloudproject.drawing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String id;
    private String username;
    private String email;
    private String message;

    public AuthResponse(String message) {
        this.message = message;
    }
}
