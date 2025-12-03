package com.cloudproject.drawing.service;

import com.cloudproject.drawing.dto.CreateRoomRequest;
import com.cloudproject.drawing.dto.RoomResponse;
import com.cloudproject.drawing.exception.CustomException;
import com.cloudproject.drawing.model.Room;
import com.cloudproject.drawing.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomResponse createRoom(CreateRoomRequest request) {
        Room room = new Room(request.getRoomName(), request.getUserId());
        Room savedRoom = roomRepository.save(room);
        return RoomResponse.fromEntity(savedRoom);
    }

    public List<RoomResponse> getAllActiveRooms() {
        return roomRepository.findByIsActive(true)
                .stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(String roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("방을 찾을 수 없습니다"));
        return RoomResponse.fromEntity(room);
    }

    public RoomResponse joinRoom(String roomId, String userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("방을 찾을 수 없습니다"));

        if (!room.getIsActive()) {
            throw new CustomException("비활성화된 방입니다");
        }

        if (!room.getParticipants().contains(userId)) {
            room.getParticipants().add(userId);
            room = roomRepository.save(room);
        }

        return RoomResponse.fromEntity(room);
    }

    public RoomResponse leaveRoom(String roomId, String userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("방을 찾을 수 없습니다"));

        room.getParticipants().remove(userId);

        if (room.getParticipants().isEmpty()) {
            room.setIsActive(false);
        }

        room = roomRepository.save(room);
        return RoomResponse.fromEntity(room);
    }

    public void deleteRoom(String roomId, String userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("방을 찾을 수 없습니다"));

        if (!room.getCreatedBy().equals(userId)) {
            throw new CustomException("방을 삭제할 권한이 없습니다");
        }

        // Hard Delete: MongoDB에서 완전히 삭제
        roomRepository.delete(room);
    }

    public List<RoomResponse> getRoomsByUserId(String userId) {
        return roomRepository.findByParticipantsContaining(userId)
                .stream()
                .filter(Room::getIsActive)
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
