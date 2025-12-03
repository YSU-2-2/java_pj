package com.cloudproject.drawing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveCanvasRequest {

    @NotBlank(message = "방 ID는 필수입니다")
    private String roomId;

    @NotBlank(message = "이미지 데이터는 필수입니다")
    private String imageData;  // Base64 encoded image
}
