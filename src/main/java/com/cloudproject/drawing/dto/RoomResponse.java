package com.cloudproject.drawing.dto;

import com.cloudproject.drawing.model.Room;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private String id;
    private String roomName;
    private String createdBy;
    private List<String> participants;
    private Integer participantCount;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static RoomResponse fromEntity(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getRoomName(),
                room.getCreatedBy(),
                room.getParticipants(),
                room.getParticipants() != null ? room.getParticipants().size() : 0,
                room.getIsActive(),
                room.getCreatedAt()
        );
    }
}
