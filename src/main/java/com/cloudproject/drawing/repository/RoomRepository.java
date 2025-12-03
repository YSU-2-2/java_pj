package com.cloudproject.drawing.repository;

import com.cloudproject.drawing.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {

    List<Room> findByIsActive(Boolean isActive);

    List<Room> findByCreatedBy(String userId);

    List<Room> findByParticipantsContaining(String userId);
}
