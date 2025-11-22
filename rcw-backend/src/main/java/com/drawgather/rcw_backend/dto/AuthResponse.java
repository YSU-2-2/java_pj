package com.drawgather.rcw_backend.dto;

public class AuthResponse {
    private Long userId;
    private String username;
    private String nickname;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(Long userId, String username, String nickname, String message) {
        this.userId = userId;
        this.username = username;
        this.nickname = nickname;
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
