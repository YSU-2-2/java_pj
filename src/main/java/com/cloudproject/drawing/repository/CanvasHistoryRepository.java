package com.cloudproject.drawing.repository;

import com.cloudproject.drawing.model.CanvasHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CanvasHistoryRepository extends MongoRepository<CanvasHistory, String> {

    Optional<CanvasHistory> findTopByRoomIdOrderBySavedAtDesc(String roomId);
}
