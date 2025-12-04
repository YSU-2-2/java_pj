package com.cloudproject.drawing.service;

import com.cloudproject.drawing.dto.CreateRoomRequest;
import com.cloudproject.drawing.dto.RoomResponse;
import com.cloudproject.drawing.model.Room;
import com.cloudproject.drawing.repository.RoomRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomService roomService;

    @Test
    @DisplayName("방 생성 성공 테스트")
    void createRoom_Success() {
        // given
        CreateRoomRequest request = new CreateRoomRequest("테스트 방", "user1");
        Room mockRoom = new Room(request.getRoomName(), request.getUserId());
        mockRoom.setId("room-123");

        given(roomRepository.save(any(Room.class))).willReturn(mockRoom);

        // when
        RoomResponse response = roomService.createRoom(request);

        // then
        assertThat(response.getId()).isEqualTo("room-123");
        assertThat(response.getRoomName()).isEqualTo("테스트 방");
        assertThat(response.getCreatedBy()).isEqualTo("user1");
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    @DisplayName("방 조회 성공 테스트")
    void getRoomById_Success() {
        // given
        String roomId = "room-123";
        Room mockRoom = new Room("테스트 방", "user1");
        mockRoom.setId(roomId);

        given(roomRepository.findById(roomId)).willReturn(Optional.of(mockRoom));

        // when
        RoomResponse response = roomService.getRoomById(roomId);

        // then
        assertThat(response.getId()).isEqualTo(roomId);
        assertThat(response.getRoomName()).isEqualTo("테스트 방");
    }
}