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
let drawingHistory = [];

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

    // URL에서 roomId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');

    if (!roomId) {
        alert('방 정보가 없습니다.');
        window.location.href = '/rooms.html';
        return;
    }

    // 방 정보 가져오기
    await fetchRoomInfo(roomId);
}

async function fetchRoomInfo(roomId) {
    try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (response.ok) {
            currentRoom = await response.json();
            document.getElementById('roomName').textContent = currentRoom.roomName;

            // 방 정보를 가져온 후에 WebSocket 연결
            connectWebSocket();
        } else {
            alert('방 정보를 불러올 수 없습니다.');
            window.location.href = '/rooms.html';
        }
    } catch (error) {
        console.error('방 정보 조회 실패:', error);
        alert('서버 오류가 발생했습니다.');
        window.location.href = '/rooms.html';
    }
}

function initializeCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');

    // 캔버스 초기 설정
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function setupToolbar() {
    // 도구 버튼 클릭 이벤트
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentTool = e.currentTarget.dataset.tool;
        });
    });

    // 색상 선택
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('change', (e) => {
        currentColor = e.target.value;
    });

    // 선 두께 조절
    const strokeWidth = document.getElementById('strokeWidth');
    const strokeValue = document.getElementById('strokeValue');
    strokeWidth.addEventListener('input', (e) => {
        currentStrokeWidth = e.target.value;
        strokeValue.textContent = e.target.value;
    });
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    // 채팅 입력 이벤트
    const chatInput = document.getElementById('chatInput');
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

// ===== WebSocket 연결 =====
function connectWebSocket() {
    console.log('WebSocket 연결 시도 - Room ID:', currentRoom.id, 'User:', currentUser.username);

    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    // 디버그 모드 비활성화 (선택사항)
    // stompClient.debug = null;

    stompClient.connect({}, (frame) => {
        console.log('✅ WebSocket 연결 성공!');
        console.log('구독 시작 - /topic/room/' + currentRoom.id + '/draw');
        console.log('구독 시작 - /topic/room/' + currentRoom.id + '/chat');

        // 드로잉 메시지 구독
        stompClient.subscribe(`/topic/room/${currentRoom.id}/draw`, (message) => {
            const drawingMessage = JSON.parse(message.body);
            console.log('📥 드로잉 메시지 수신:', drawingMessage);
            // 자신이 보낸 메시지는 무시
            if (drawingMessage.userId !== currentUser.id) {
                drawReceivedData(drawingMessage.drawingData);
            }
        });

        // 채팅 메시지 구독
        stompClient.subscribe(`/topic/room/${currentRoom.id}/chat`, (message) => {
            const chatMessage = JSON.parse(message.body);
            console.log('💬 채팅 메시지 수신:', chatMessage);
            displayChatMessage(chatMessage);
        });

        // 입장 메시지 전송
        sendJoinMessage();
    }, (error) => {
        console.error('❌ WebSocket 연결 실패:', error);
        setTimeout(connectWebSocket, 5000); // 5초 후 재연결 시도
    });
}

function sendJoinMessage() {
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/join', {}, JSON.stringify({
            roomId: currentRoom.id,
            userId: currentUser.id,
            username: currentUser.username,
            content: `${currentUser.username}님이 입장했습니다.`
        }));
    }
}

function sendLeaveMessage() {
    if (stompClient && stompClient.connected) {
        stompClient.send('/app/leave', {}, JSON.stringify({
            roomId: currentRoom.id,
            userId: currentUser.id,
            username: currentUser.username,
            content: `${currentUser.username}님이 퇴장했습니다.`
        }));
    }
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
        drawPen(startX, startY, currentX, currentY);
        startX = currentX;
        startY = currentY;
    } else if (currentTool === 'eraser') {
        erase(currentX, currentY);
    }
}

function handleMouseUp(e) {
    if (!isDrawing) return;
    isDrawing = false;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    let drawingData = null;

    switch (currentTool) {
        case 'line':
            drawingData = drawLine(startX, startY, endX, endY);
            break;
        case 'rect':
            drawingData = drawRect(startX, startY, endX, endY);
            break;
        case 'circle':
            drawingData = drawCircle(startX, startY, endX, endY);
            break;
    }

    // WebSocket으로 드로잉 데이터 전송
    if (drawingData) {
        sendDrawingData(drawingData);
    }
}

// ===== 드로잉 함수들 =====
function drawPen(x1, y1, x2, y2) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentStrokeWidth;
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 펜 도구는 실시간으로 전송
    const drawingData = {
        type: 'pen',
        coordinates: [x1, y1, x2, y2],
        color: currentColor,
        strokeWidth: currentStrokeWidth
    };
    sendDrawingData(drawingData);
}

function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentStrokeWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    return {
        type: 'line',
        coordinates: [x1, y1, x2, y2],
        color: currentColor,
        strokeWidth: currentStrokeWidth
    };
}

function drawRect(x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentStrokeWidth;
    ctx.strokeRect(x1, y1, width, height);

    return {
        type: 'rect',
        coordinates: [x1, y1, width, height],
        color: currentColor,
        strokeWidth: currentStrokeWidth
    };
}

function drawCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentStrokeWidth;
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();

    return {
        type: 'circle',
        coordinates: [x1, y1, radius],
        color: currentColor,
        strokeWidth: currentStrokeWidth
    };
}

function erase(x, y) {
    ctx.clearRect(x - currentStrokeWidth * 2, y - currentStrokeWidth * 2,
                  currentStrokeWidth * 4, currentStrokeWidth * 4);

    const drawingData = {
        type: 'eraser',
        coordinates: [x, y],
        color: '#FFFFFF',
        strokeWidth: currentStrokeWidth * 4
    };
    sendDrawingData(drawingData);
}

// ===== WebSocket 데이터 전송 =====
function sendDrawingData(drawingData) {
    if (stompClient && stompClient.connected) {
        const message = {
            roomId: currentRoom.id,
            userId: currentUser.id,
            username: currentUser.username,
            drawingData: drawingData
        };
        console.log('📤 드로잉 메시지 전송:', message);
        stompClient.send('/app/draw', {}, JSON.stringify(message));
    }
}

// ===== 수신된 드로잉 데이터 렌더링 =====
function drawReceivedData(data) {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.strokeWidth;

    switch (data.type) {
        case 'pen':
            ctx.beginPath();
            ctx.moveTo(data.coordinates[0], data.coordinates[1]);
            ctx.lineTo(data.coordinates[2], data.coordinates[3]);
            ctx.stroke();
            break;
        case 'line':
            ctx.beginPath();
            ctx.moveTo(data.coordinates[0], data.coordinates[1]);
            ctx.lineTo(data.coordinates[2], data.coordinates[3]);
            ctx.stroke();
            break;
        case 'rect':
            ctx.strokeRect(data.coordinates[0], data.coordinates[1],
                          data.coordinates[2], data.coordinates[3]);
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(data.coordinates[0], data.coordinates[1],
                   data.coordinates[2], 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'eraser':
            ctx.clearRect(data.coordinates[0] - data.strokeWidth / 2,
                         data.coordinates[1] - data.strokeWidth / 2,
                         data.strokeWidth, data.strokeWidth);
            break;
    }
}

// ===== 채팅 기능 =====
function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (message && stompClient && stompClient.connected) {
        const chatMessage = {
            type: 'CHAT',
            roomId: currentRoom.id,
            userId: currentUser.id,
            username: currentUser.username,
            content: message
        };
        console.log('💬 채팅 메시지 전송:', chatMessage);
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

// ===== 방 나가기 =====
function leaveRoom() {
    if (confirm('정말 방을 나가시겠습니까?')) {
        sendLeaveMessage();

        // WebSocket 연결 해제
        if (stompClient) {
            stompClient.disconnect();
        }

        // 방 목록으로 이동
        setTimeout(() => {
            window.location.href = '/rooms.html';
        }, 300);
    }
}

// 페이지 종료 시 퇴장 메시지 전송
window.addEventListener('beforeunload', () => {
    sendLeaveMessage();
});

// ===== 캔버스 저장/불러오기 =====
async function saveCanvas() {
    try {
        // Canvas를 Base64 이미지로 변환
        const imageData = canvas.toDataURL('image/png');

        const response = await fetch('/api/canvas/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomId: currentRoom.id,
                imageData: imageData
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ 캔버스 저장 성공:', data);
            alert('캔버스가 저장되었습니다!');
        } else {
            const error = await response.json();
            console.error('❌ 캔버스 저장 실패:', error);
            alert('캔버스 저장에 실패했습니다: ' + (error.message || ''));
        }
    } catch (error) {
        console.error('❌ 캔버스 저장 오류:', error);
        alert('서버 오류가 발생했습니다.');
    }
}

async function loadCanvas() {
    try {
        const response = await fetch(`/api/canvas/${currentRoom.id}`);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ 캔버스 불러오기 성공:', data);

            // 이미지 생성
            const img = new Image();
            img.onload = () => {
                // 캔버스 지우기
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 이미지 그리기
                ctx.drawImage(img, 0, 0);
                alert('캔버스를 불러왔습니다!');
            };
            img.onerror = () => {
                console.error('❌ 이미지 로드 실패');
                alert('이미지를 불러오는데 실패했습니다.');
            };
            img.src = data.imageData;
        } else {
            const error = await response.json();
            console.error('❌ 캔버스 불러오기 실패:', error);
            alert('저장된 캔버스가 없습니다.');
        }
    } catch (error) {
        console.error('❌ 캔버스 불러오기 오류:', error);
        alert('서버 오류가 발생했습니다.');
    }
}
