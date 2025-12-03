package com.cloudproject.drawing.controller;

import com.cloudproject.drawing.dto.ChatMessage;
import com.cloudproject.drawing.dto.DrawingMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketMessageController {

    private final SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/draw")
    public void handleDrawing(@Payload DrawingMessage message) {
        // 같은 방의 모든 사용자에게 드로잉 데이터 브로드캐스트
        messagingTemplate.convertAndSend(
                "/topic/room/" + message.getRoomId() + "/draw",
                message
        );
    }

    @MessageMapping("/chat")
    public void handleChatMessage(@Payload ChatMessage message) {
        // 같은 방의 모든 사용자에게 채팅 메시지 브로드캐스트
        messagingTemplate.convertAndSend(
                "/topic/room/" + message.getRoomId() + "/chat",
                message
        );
    }

    @MessageMapping("/join")
    public void handleUserJoin(@Payload ChatMessage message) {
        message.setType(ChatMessage.MessageType.JOIN);
        messagingTemplate.convertAndSend(
                "/topic/room/" + message.getRoomId() + "/chat",
                message
        );
    }

    @MessageMapping("/leave")
    public void handleUserLeave(@Payload ChatMessage message) {
        message.setType(ChatMessage.MessageType.LEAVE);
        messagingTemplate.convertAndSend(
                "/topic/room/" + message.getRoomId() + "/chat",
                message
        );
    }
}
