package com.cloudproject.drawing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRoomRequest {

    @NotBlank(message = "사용자 ID는 필수입니다")
    private String userId;
}
