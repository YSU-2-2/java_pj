package com.cloudproject.drawing.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    private String id;

    private String roomName;

    private String createdBy;

    private List<String> participants;

    private Boolean isActive;

    private LocalDateTime createdAt;

    public Room(String roomName, String createdBy) {
        this.roomName = roomName;
        this.createdBy = createdBy;
        this.participants = new ArrayList<>();
        this.participants.add(createdBy);
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }
}
