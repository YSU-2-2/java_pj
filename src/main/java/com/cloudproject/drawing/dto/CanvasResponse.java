package com.cloudproject.drawing.dto;

import com.cloudproject.drawing.model.CanvasHistory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CanvasResponse {

    private String id;
    private String roomId;
    private String imageData;
    private LocalDateTime savedAt;

    public static CanvasResponse fromEntity(CanvasHistory canvasHistory) {
        return new CanvasResponse(
                canvasHistory.getId(),
                canvasHistory.getRoomId(),
                canvasHistory.getImageData(),
                canvasHistory.getSavedAt()
        );
    }
}
