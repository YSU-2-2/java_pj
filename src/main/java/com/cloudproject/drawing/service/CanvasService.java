package com.cloudproject.drawing.service;

import com.cloudproject.drawing.dto.CanvasResponse;
import com.cloudproject.drawing.dto.SaveCanvasRequest;
import com.cloudproject.drawing.exception.CustomException;
import com.cloudproject.drawing.model.CanvasHistory;
import com.cloudproject.drawing.repository.CanvasHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CanvasService {

    private final CanvasHistoryRepository canvasHistoryRepository;

    public CanvasResponse saveCanvas(SaveCanvasRequest request) {
        CanvasHistory canvasHistory = new CanvasHistory(
                request.getRoomId(),
                request.getImageData()
        );

        CanvasHistory saved = canvasHistoryRepository.save(canvasHistory);
        return CanvasResponse.fromEntity(saved);
    }

    public CanvasResponse getLatestCanvas(String roomId) {
        CanvasHistory canvasHistory = canvasHistoryRepository
                .findTopByRoomIdOrderBySavedAtDesc(roomId)
                .orElseThrow(() -> new CustomException("저장된 캔버스를 찾을 수 없습니다"));

        return CanvasResponse.fromEntity(canvasHistory);
    }
}
