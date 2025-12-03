package com.cloudproject.drawing.controller;

import com.cloudproject.drawing.dto.CanvasResponse;
import com.cloudproject.drawing.dto.SaveCanvasRequest;
import com.cloudproject.drawing.service.CanvasService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/canvas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CanvasController {

    private final CanvasService canvasService;

    @PostMapping("/save")
    public ResponseEntity<CanvasResponse> saveCanvas(@Valid @RequestBody SaveCanvasRequest request) {
        CanvasResponse response = canvasService.saveCanvas(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<CanvasResponse> getLatestCanvas(@PathVariable String roomId) {
        CanvasResponse response = canvasService.getLatestCanvas(roomId);
        return ResponseEntity.ok(response);
    }
}
