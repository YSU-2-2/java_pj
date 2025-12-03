package com.cloudproject.drawing.controller;

import com.cloudproject.drawing.dto.CreateRoomRequest;
import com.cloudproject.drawing.dto.JoinRoomRequest;
import com.cloudproject.drawing.dto.RoomResponse;
import com.cloudproject.drawing.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllActiveRooms() {
        List<RoomResponse> rooms = roomService.getAllActiveRooms();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable String roomId) {
        RoomResponse response = roomService.getRoomById(roomId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @PathVariable String roomId,
            @Valid @RequestBody JoinRoomRequest request) {
        RoomResponse response = roomService.joinRoom(roomId, request.getUserId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<RoomResponse> leaveRoom(
            @PathVariable String roomId,
            @Valid @RequestBody JoinRoomRequest request) {
        RoomResponse response = roomService.leaveRoom(roomId, request.getUserId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable String roomId,
            @RequestParam String userId) {
        roomService.deleteRoom(roomId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByUserId(@PathVariable String userId) {
        List<RoomResponse> rooms = roomService.getRoomsByUserId(userId);
        return ResponseEntity.ok(rooms);
    }
}
