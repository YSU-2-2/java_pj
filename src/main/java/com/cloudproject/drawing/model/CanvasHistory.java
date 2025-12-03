package com.cloudproject.drawing.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "canvas_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanvasHistory {

    @Id
    private String id;

    private String roomId;

    private String imageData;  // Base64 encoded image

    private LocalDateTime savedAt;

    public CanvasHistory(String roomId, String imageData) {
        this.roomId = roomId;
        this.imageData = imageData;
        this.savedAt = LocalDateTime.now();
    }
}
