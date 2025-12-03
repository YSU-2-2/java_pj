package com.cloudproject.drawing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }

    private MessageType type;

    private String roomId;

    private String userId;

    private String username;

    private String content;

    private LocalDateTime timestamp;

    public ChatMessage(MessageType type, String roomId, String userId, String username, String content) {
        this.type = type;
        this.roomId = roomId;
        this.userId = userId;
        this.username = username;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }
}
