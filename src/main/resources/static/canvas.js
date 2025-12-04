// java_pj/src/main/resources/static/canvas.js

// ===== 전역 변수 =====
let canvas, ctx;
let currentUser = null;
let currentRoom = null;
let stompClient = null;
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#000000';
let currentStrokeWidth = 2;
let startX, startY;

// 상태 관리 변수 (Undo/Redo)
let drawingHistory = []; // 모든 드로잉 작업 저장 (벡터 데이터)
let redoStack = [];      // Redo를 위한 스택 (내 로컬 작업만)
let savedBackgroundImage = null; // 불러온 이미지 저장용

// 참여자 관리
let participants = new Map(); // userId -> username

// 커서 공유를 위한 Throttle 변수
let lastCursorSendTime = 0;
const CURSOR_THROTTLE_MS = 50; // 50ms마다 전송

// ===== 초기화 =====
window.addEventListener('DOMContentLoaded', async () => {
    initializeCanvas();
    await checkAuth();
    setupToolbar();
    setupEventListeners();
});

async function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/';
        return;
    }
    currentUser = JSON.parse(userStr);
    
    // 본인을 참여자 목록에 우선 추가
    participants.set(currentUser.id, currentUser.username);
    updateParticipantListUI();

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');

    if (!roomId) {
        showToast('방 정보가 없습니다.');
        window.location.href = '/rooms.html';
        return;
    }
    await fetchRoomInfo(roomId);
}

async function fetchRoomInfo(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
            currentRoom = await response.json();
            document.getElementById('roomName').textContent = currentRoom.roomName;
            connectWebSocket();
        } else {
            showToast('방 정보를 불러올 수 없습니다.');
            window.location.href = '/rooms.html';
        }
    } catch (error) {
        console.error(error);
        showToast('서버 오류가 발생했습니다.');
    }
}

function initializeCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 캔버스 배경 흰색 초기화 (투명 배경 방지)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setupToolbar() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        // onclick 이벤트가 있는 버튼(undo, redo, clear)은 제외
        if(btn.onclick) return; 
        
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentTool = e.currentTarget.dataset.tool;
        });
    });

    document.getElementById('colorPicker').addEventListener('change', (e) => currentColor = e.target.value);
    
    const strokeWidth = document.getElementById('strokeWidth');
    const strokeValue = document.getElementById('strokeValue');
    strokeWidth.addEventListener('input', (e) => {
        currentStrokeWidth = e.target.value;
        strokeValue.textContent = e.target.value;
    });
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    
    // 드로잉과 커서 공유를 동시에 처리
    canvas.addEventListener('mousemove', (e) => {
        handleMouseMove(e);
        handleCursorShare(e);
    });
    
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

// ===== WebSocket 연결 =====
function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // 콘솔 로그 줄이기

    stompClient.connect({}, (frame) => {
        console.log('✅ WebSocket 연결 성공!');
        showToast('방에 연결되었습니다.');

        // 1. 드로잉 및 제어 메시지 구독
        stompClient.subscribe(`/topic/room/${currentRoom.id}/draw`, (message) => {
            const msg = JSON.parse(message.body);
            if (msg.userId !== currentUser.id) {
                // 커서 데이터는 별도로 처리 (드로잉 히스토리에 넣지 않음)
                if (msg.drawingData && msg.drawingData.type === 'cursor') {
                    updateRemoteCursor(msg.userId, msg.username, msg.drawingData);
                } else {
                    handleRemoteDrawingMessage(msg);
                }
            }
        });

        // 2. 채팅 및 입장/퇴장 구독
        stompClient.subscribe(`/topic/room/${currentRoom.id}/chat`, (message) => {
            const chatMessage = JSON.parse(message.body);
            handleSystemMessage(chatMessage);
            displayChatMessage(chatMessage);
        });

        sendJoinMessage();
    }, (error) => {
        console.error('❌ WebSocket 연결 실패:', error);
        showToast('연결이 끊어졌습니다. 5초 후 재연결...');
        setTimeout(connectWebSocket, 5000);
    });
}

// ===== 로직 처리 함수들 =====

// 다른 사용자의 드로잉/Undo/Clear 처리
function handleRemoteDrawingMessage(msg) {
    const data = msg.drawingData;
    
    if (data.type === 'undo') {
        // 해당 사용자의 가장 최근 작업을 히스토리에서 제거
        for (let i = drawingHistory.length - 1; i >= 0; i--) {
            if (drawingHistory[i].userId === msg.userId) {
                drawingHistory.splice(i, 1);
                redrawCanvas();
                break;
            }
        }
    } else if (data.type === 'clear') {
        drawingHistory = []; // 히스토리 전체 삭제
        savedBackgroundImage = null; // 배경 이미지도 삭제
        redrawCanvas();
        showToast(`${msg.username}님이 캔버스를 초기화했습니다.`);
    } else {
        // 일반 드로잉: 히스토리에 추가하고 그리기
        const action = { ...data, userId: msg.userId };
        drawingHistory.push(action);
        drawAction(action);
    }
}

// 참여자 관리 및 시스템 메시지 처리
function handleSystemMessage(msg) {
    if (msg.type === 'JOIN') {
        if (!participants.has(msg.userId)) {
            participants.set(msg.userId, msg.username);
            updateParticipantListUI();
            showToast(`${msg.username}님이 입장했습니다.`);
        }
    } else if (msg.type === 'LEAVE') {
        if (participants.has(msg.userId)) {
            participants.delete(msg.userId);
            removeRemoteCursor(msg.userId); // 나간 사람 커서 제거
            updateParticipantListUI();
            showToast(`${msg.username}님이 퇴장했습니다.`);
        }
    }
}

// 커서 위치 전송 (Throttling 적용)
function handleCursorShare(e) {
    const now = Date.now();
    // 부하 방지를 위해 일정 시간 간격(50ms)으로만 전송
    if (now - lastCursorSendTime > CURSOR_THROTTLE_MS) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 좌표가 캔버스 범위를 벗어나지 않았을 때만 전송
        if (x >= 0 && y >= 0 && x <= canvas.width && y <= canvas.height) {
            const cursorData = {
                type: 'cursor',
                coordinates: [x, y],
                color: getUserColor(currentUser.id), // 사용자 고유 색상
                strokeWidth: 0
            };
            sendDrawingData(cursorData);
            lastCursorSendTime = now;
        }
    }
}

// 원격 커서 UI 업데이트
function updateRemoteCursor(userId, username, data) {
    const cursorLayer = document.getElementById('cursorLayer');
    let cursor = document.getElementById(`cursor-${userId}`);

    // 커서 요소가 없으면 새로 생성
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = `cursor-${userId}`;
        cursor.className = 'remote-cursor';
        
        const icon = document.createElement('div');
        icon.className = 'cursor-icon';
        icon.style.borderBottomColor = data.color; // 사용자 색상 적용

        const label = document.createElement('div');
        label.className = 'cursor-label';
        label.textContent = username;
        label.style.backgroundColor = data.color; // 라벨 배경도 사용자 색상

        cursor.appendChild(icon);
        cursor.appendChild(label);
        cursorLayer.appendChild(cursor);
    }

    // 커서 위치 업데이트 (CSS transform 사용으로 부드럽게)
    const x = data.coordinates[0];
    const y = data.coordinates[1];
    cursor.style.transform = `translate(${x}px, ${y}px)`;
}

function removeRemoteCursor(userId) {
    const cursor = document.getElementById(`cursor-${userId}`);
    if (cursor) cursor.remove();
}

// ===== 드로잉 이벤트 핸들러 =====
function handleMouseDown(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    if (currentTool === 'pen') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

function handleMouseMove(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (currentTool === 'pen') {
        const action = {
            type: 'pen',
            coordinates: [startX, startY, currentX, currentY],
            color: currentColor,
            strokeWidth: currentStrokeWidth,
            userId: currentUser.id
        };
        drawAction(action);
        drawingHistory.push(action);
        sendDrawingData(action);
        
        startX = currentX;
        startY = currentY;
    } else if (currentTool === 'eraser') {
        const action = {
            type: 'eraser',
            coordinates: [currentX, currentY],
            color: '#FFFFFF',
            strokeWidth: currentStrokeWidth * 4,
            userId: currentUser.id
        };
        drawAction(action);
        drawingHistory.push(action);
        sendDrawingData(action);
    }
}

function handleMouseUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    let drawingData = null;
    
    if (currentTool === 'line') {
        drawingData = { type: 'line', coordinates: [startX, startY, endX, endY], color: currentColor, strokeWidth: currentStrokeWidth };
    } else if (currentTool === 'rect') {
        const width = endX - startX;
        const height = endY - startY;
        drawingData = { type: 'rect', coordinates: [startX, startY, width, height], color: currentColor, strokeWidth: currentStrokeWidth };
    } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        drawingData = { type: 'circle', coordinates: [startX, startY, radius], color: currentColor, strokeWidth: currentStrokeWidth };
    }

    if (drawingData) {
        drawingData.userId = currentUser.id;
        drawAction(drawingData); // 내 화면에 그리기
        drawingHistory.push(drawingData); // 히스토리에 저장
        sendDrawingData(drawingData); // 서버 전송
    }
    
    // 새로운 동작이 생기면 Redo 스택 초기화
    if (redoStack.length > 0) redoStack = [];
}

// ===== 그리기 함수 (단일 액션 처리) =====
function drawAction(data) {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.strokeWidth;
    ctx.beginPath();

    switch (data.type) {
        case 'pen':
        case 'line':
            ctx.moveTo(data.coordinates[0], data.coordinates[1]);
            ctx.lineTo(data.coordinates[2], data.coordinates[3]);
            ctx.stroke();
            break;
        case 'rect':
            ctx.strokeRect(data.coordinates[0], data.coordinates[1], data.coordinates[2], data.coordinates[3]);
            break;
        case 'circle':
            ctx.arc(data.coordinates[0], data.coordinates[1], data.coordinates[2], 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'eraser':
            ctx.clearRect(data.coordinates[0] - data.strokeWidth / 2, data.coordinates[1] - data.strokeWidth / 2, data.strokeWidth, data.strokeWidth);
            break;
    }
}

// ===== Undo / Redo / Clear / Redraw =====
function undo() {
    // 내 작업만 찾아서 취소
    for (let i = drawingHistory.length - 1; i >= 0; i--) {
        if (drawingHistory[i].userId === currentUser.id) {
            const removedAction = drawingHistory.splice(i, 1)[0];
            redoStack.push(removedAction);
            redrawCanvas();
            
            // Undo 이벤트를 서버로 전송하여 다른 사람들도 내 작업을 지우게 함
            sendDrawingData({ type: 'undo', coordinates: [], color: '', strokeWidth: 0 });
            return;
        }
    }
    showToast('취소할 내 작업이 없습니다.');
}

function redo() {
    if (redoStack.length === 0) {
        showToast('복구할 작업이 없습니다.');
        return;
    }
    const action = redoStack.pop();
    drawingHistory.push(action);
    drawAction(action);
    sendDrawingData(action); // 다시 그리기 전송
}

function clearCanvas() {
    if(!confirm('모든 그림을 지우시겠습니까? 복구할 수 없습니다.')) return;
    
    drawingHistory = [];
    redoStack = [];
    savedBackgroundImage = null;
    redrawCanvas();
    
    sendDrawingData({ type: 'clear', coordinates: [], color: '#FFFFFF', strokeWidth: 0 });
}

function redrawCanvas() {
    // 1. 캔버스 클리어
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. 저장된 배경 이미지(불러오기 한 경우)가 있다면 그리기
    if (savedBackgroundImage) {
        ctx.drawImage(savedBackgroundImage, 0, 0);
    }

    // 3. 히스토리 재실행
    drawingHistory.forEach(action => drawAction(action));
}

// ===== 통신 및 유틸리티 =====
function sendDrawingData(drawingData) {
    if (stompClient && stompClient.connected) {
        const message = {
            roomId: currentRoom.id,
            userId: currentUser.id,
            username: currentUser.username,
            drawingData: drawingData
        };
        stompClient.send('/app/draw', {}, JSON.stringify(message));
    }
}

function sendJoinMessage() {
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/join', {}, JSON.stringify({
            roomId: currentRoom.id, userId: currentUser.id, username: currentUser.username, content: `${currentUser.username}님이 입장했습니다.`
        }));
    }
}

function sendLeaveMessage() {
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/leave', {}, JSON.stringify({
            roomId: currentRoom.id, userId: currentUser.id, username: currentUser.username, content: `${currentUser.username}님이 퇴장했습니다.`
        }));
    }
}

// ===== 채팅/UI 관련 =====
function updateParticipantListUI() {
    const list = document.getElementById('participantList');
    const count = document.getElementById('participantCount');
    if(list) list.innerHTML = '';
    if(count) count.textContent = participants.size;

    participants.forEach((name, id) => {
        const div = document.createElement('div');
        div.className = 'participant';
        const isMe = id === currentUser.id ? ' (나)' : '';
        div.innerHTML = `<div class="participant-dot" style="background: ${getUserColor(id)}"></div><span>${name}${isMe}</span>`;
        if(list) list.appendChild(div);
    });
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (message && stompClient && stompClient.connected) {
        const chatMessage = { type: 'CHAT', roomId: currentRoom.id, userId: currentUser.id, username: currentUser.username, content: message };
        stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
        chatInput.value = '';
    }
}

function displayChatMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    if (message.type === 'JOIN' || message.type === 'LEAVE') {
        messageDiv.className = 'chat-message system';
        messageDiv.textContent = message.content;
    } else {
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `<span class="username">${message.username}:</span>${message.content}`;
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function leaveRoom() {
    if (confirm('정말 방을 나가시겠습니까?')) {
        sendLeaveMessage();
        if (stompClient) stompClient.disconnect();
        setTimeout(() => window.location.href = '/rooms.html', 300);
    }
}

// ===== 저장/불러오기 =====
async function saveCanvas() {
    try {
        const imageData = canvas.toDataURL('image/png');
        const response = await fetch('/api/canvas/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: currentRoom.id, imageData: imageData })
        });
        if (response.ok) showToast('캔버스가 저장되었습니다!');
        else showToast('캔버스 저장 실패');
    } catch (error) {
        showToast('서버 오류가 발생했습니다.');
    }
}

async function loadCanvas() {
    try {
        const response = await fetch(`/api/canvas/${currentRoom.id}`);
        if (response.ok) {
            const data = await response.json();
            const img = new Image();
            img.onload = () => {
                savedBackgroundImage = img; // 배경 이미지로 저장
                drawingHistory = []; // 기존 벡터 히스토리는 초기화 (이미지로 대체되므로)
                redrawCanvas();
                showToast('캔버스를 불러왔습니다! (이전 작업 Undo 불가)');
            };
            img.src = data.imageData;
        } else {
            showToast('저장된 캔버스가 없습니다.');
        }
    } catch (error) {
        showToast('불러오기 오류 발생');
    }
}

// ===== 유틸리티 =====
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return; // 컨테이너가 없으면 중단
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function getUserColor(userId) {
    // userId를 시드로 사용하여 고정된 색상 생성
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

window.addEventListener('beforeunload', () => sendLeaveMessage());