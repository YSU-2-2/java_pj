package com.cloudproject.drawing.dto;

import com.cloudproject.drawing.model.DrawingData;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrawingMessage {

    private String roomId;

    private String userId;

    private String username;

    private DrawingData drawingData;

    private LocalDateTime timestamp;

    public DrawingMessage(String roomId, String userId, String username, DrawingData drawingData) {
        this.roomId = roomId;
        this.userId = userId;
        this.username = username;
        this.drawingData = drawingData;
        this.timestamp = LocalDateTime.now();
    }
}
