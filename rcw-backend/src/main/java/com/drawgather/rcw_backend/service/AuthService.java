package com.drawgather.rcw_backend.service;

import com.drawgather.rcw_backend.dto.AuthResponse;
import com.drawgather.rcw_backend.dto.LoginRequest;
import com.drawgather.rcw_backend.dto.SignupRequest;
import com.drawgather.rcw_backend.entity.User;
import com.drawgather.rcw_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 존재하는 아이디입니다");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setNickname(request.getNickname());
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return new AuthResponse(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getNickname(),
            "회원가입 성공"
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다");
        }

        return new AuthResponse(
            user.getId(),
            user.getUsername(),
            user.getNickname(),
            "로그인 성공"
        );
    }
}
