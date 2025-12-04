package com.cloudproject.drawing.controller;

import com.cloudproject.drawing.dto.CanvasResponse;
import com.cloudproject.drawing.dto.SaveCanvasRequest;
import com.cloudproject.drawing.service.CanvasService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CanvasControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CanvasService canvasService;

    @Test
    @DisplayName("캔버스 저장 API 테스트")
    void saveCanvas_Success() throws Exception {
        // given
        SaveCanvasRequest request = new SaveCanvasRequest("room-123", "base64-image-data");
        CanvasResponse response = new CanvasResponse("canvas-1", "room-123", "base64-image-data", LocalDateTime.now());

        given(canvasService.saveCanvas(any(SaveCanvasRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(post("/api/canvas/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("canvas-1"))
                .andExpect(jsonPath("$.roomId").value("room-123"));
    }
}