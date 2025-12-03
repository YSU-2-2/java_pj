package com.cloudproject.drawing.service;

import com.cloudproject.drawing.dto.AuthResponse;
import com.cloudproject.drawing.dto.LoginRequest;
import com.cloudproject.drawing.dto.RegisterRequest;
import com.cloudproject.drawing.exception.CustomException;
import com.cloudproject.drawing.model.User;
import com.cloudproject.drawing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        // 중복 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException("Username already exists", "USERNAME_EXISTS");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already exists", "EMAIL_EXISTS");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 사용자 생성
        User user = new User(
            request.getUsername(),
            request.getEmail(),
            encodedPassword
        );

        User savedUser = userRepository.save(user);

        return new AuthResponse(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            "Registration successful"
        );
    }

    public AuthResponse login(LoginRequest request) {
        // 사용자 찾기
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new CustomException("Invalid username or password", "INVALID_CREDENTIALS"));

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("Invalid username or password", "INVALID_CREDENTIALS");
        }

        return new AuthResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            "Login successful"
        );
    }
}
