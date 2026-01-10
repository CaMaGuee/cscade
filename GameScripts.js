let currentDestroy = null;
let audioUnlocked = false;      //사운드 언락용

function navigate(page){ 
    document.querySelectorAll(".SPA_PAGE").forEach(p => {
        p.style.display = "none";
    });

    document.querySelectorAll(".game-btn-section-body").forEach(p => {
        p.style.display = "none";
    });

    const pageEl = document.getElementById(page);
    if (pageEl) pageEl.style.display = "block";
}

function isVisible(el) {
    return el && window.getComputedStyle(el).display !== "none";
}

let turnTimeoutId   = null;
let turnIntervalId  = null;

let timerDone       = false;
let remainSeconds   = 0;

let timerEl         = document.getElementById("turn-timer");


function resetTurnTimer(ms) {
    // 기존 타이머 정리
    clearTimeout(turnTimeoutId);
    clearInterval(turnIntervalId);

    timerDone = false;

    remainSeconds       = Math.ceil(ms / 1000);
    timerEl.textContent = remainSeconds;

    // 실제 종료 타이머 (정확)
    turnTimeoutId = setTimeout(() => {
        playSound(sndLose);
        timerDone = true;
        clearInterval(turnIntervalId);
        timerEl.textContent = "--";

        const startBtn              = document.getElementById("blocks-refresh");
        startBtn.textContent        = "게임재시작";
        startBtn.style.background   = "linear-gradient(135deg, #ff7043, #bf360c)";
        startBtn.disabled           = false;
        startBtn.style.opacity      = "1";
        startBtn.style.cursor       = "allowed";

        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.add("game-over-cell");
        });
    }, ms);

    // 1초마다 표시용 감소
    turnIntervalId = setInterval(() => {
        remainSeconds--;
        if (remainSeconds <= 10) {
            playSound(sndtimeOut);
        }

        if (remainSeconds <= 0) {
            remainSeconds = 0;
            clearInterval(turnIntervalId);
        }
        timerEl.textContent = remainSeconds;
    }, 1000);
}

/* =========================
    기본 설정
========================= */
const BOARD_SIZE        = 10;
let boardEl             = document.getElementById("board");
let blocksEl            = document.getElementById("blocks");

const BLOCK_2048_SIZE   = 4;
let board2048El         = document.getElementById("board-2048");

const BLOCK_COUNT   = 3;
let currentBlocks   = [];

let offsetX = 0;
let offsetY = 0;

let refreshRemain = 3;

let score   = 0;
let scoreEl = document.getElementById("score");

let board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0)
);

let board_2048 = Array.from({ length: BLOCK_2048_SIZE }, () =>
    Array(BLOCK_2048_SIZE).fill(0)
);

const sndPick         = new Audio("pick.wav");
const sndDrop         = new Audio("drop.wav");
const sndLose         = new Audio("lose.wav");
const sndStart        = new Audio("gamestart.wav");
const sndtimeOut      = new Audio("timeOut.wav");
const sndlevelUp      = new Audio("levelUp.wav");
const sndlevelUpShort = new Audio("levelUpShort.wav");

// 딜레이 제거 (중요)
sndPick.preload         = "auto";
sndDrop.preload         = "auto";
sndLose.preload         = "auto";
sndStart.preload        = "auto";
sndtimeOut.preload      = "auto";
sndlevelUp.preload      = "auto";
sndlevelUpShort.preload = "auto";

/* =========================BlockPuzzle========================= */
/* =========================
    블록 정의
========================= */
const blockShapes = [
    [[0, 0, 0], [0, 0, 0], [1, 1, 1], [0, 1, 0]],               // T
    [[0, 0, 0], [1, 1, 1], [0, 1, 0], [0, 1, 0]],               // T
    [[0, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 1]],               // ㅗ
    [[0, 0, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],               // ㅗ
    [[0, 0], [0, 0], [1, 1], [1, 1]],                           // O
    [[0, 0], [1, 0], [1, 0], [1, 1]],                           // L
    [[0, 0], [1, 1], [0, 1], [0, 1]],                           // ㄱ
    [[0, 0, 0], [0, 0, 0], [1, 1, 1], [1, 0, 0]],               // 「
    [[0, 0, 0], [0, 0, 0], [0, 0, 1], [1, 1, 1]],               // 』
    [[0, 0, 0], [0, 0, 0], [0, 0, 1], [0, 1, 1]],               // 』
    [[0, 0, 0], [0, 0, 0], [0, 1, 1], [0, 1, 0]],               // 』
    [[0, 0, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]],               // ㅁ
    [[0, 0], [1, 1], [1, 1], [1, 1]],                           // ㅁ
    [[0, 0, 0], [0, 0, 0], [1, 1, 1], [1, 1, 1]],               // ㅁ
    [[1], [1], [1], [1]],                                       // |
    [[0], [1], [1], [1]],                                       // |
    [[0], [0], [1], [1]],                                       // |
    [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1]],   // ㅡ
    [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]],               // ㅡ
    [[0, 0], [0, 0], [0, 0], [1, 1]],                           // ㅡ
    [[0, 0, 0], [0, 0, 0], [0, 1, 0], [0, 0, 0]],               // .
    [[0, 0, 0], [0, 0, 0], [0, 1, 1], [1, 1, 0]],               // z
    [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 1, 1]],               // z
    [[0, 0], [0, 1], [1, 1], [1, 0]],                           // z
    [[0, 0], [1, 0], [1, 1], [0, 1]],                           // z
    [[0, 0], [0, 0], [0, 1], [1, 0]],                           // z
    [[0, 0], [0, 0], [1, 0], [0, 1]],                           // z

];

function getRandomShapes(count) {
    const shuffled = [...blockShapes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/* =========================
    사운드 재생
========================= */
function playSound(audio) {
    if (!audioUnlocked) return;

    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

document.addEventListener("pointerdown", () => {
    if (audioUnlocked) return;

    audioUnlocked = true;

    const silent = new Audio();
    silent.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
    silent.play().catch(() => {});
}, { once: true });

/* =========================
    보드 생성
========================= */
function createBoard(){
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        boardEl.appendChild(cell);
    }
}

/* =========================
    블록 생성
========================= */

function createBlocks() {
    blocksEl.innerHTML = "";

    const totalValue = currentBlocks.flatMap(block => block.flat()).reduce((acc, val) => acc + val, 0);
    if (totalValue < 1) {
        playSound(sndPick);
        currentBlocks = getRandomShapes(BLOCK_COUNT);
    }

    currentBlocks.forEach((shape, index) => {
        const block = document.createElement("div");
        block.className                 = "block";
        block.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;

        shape.forEach(row => {
            row.forEach(v => {
                const c             = document.createElement("div");
                c.className         = "block-cell";      // 모든 셀에 class 부여
                c.style.background  = v ? "#ff8a65" : "transparent"; // 값에 따라 색상 지정
                block.appendChild(c);
            });
        });

        enablePointer(block, shape, index);
        blocksEl.appendChild(block);
    });
}

/* =========================
    점수 시스템
========================= */
function updateScore(value) {
    score += value;
    scoreEl.textContent = `Score: ${score}`;
}

/* =========================
    Pointer Events 처리
========================= */
function enablePointer(blockEl, shape, blockIndex) {
    let ghost               = null;
    let lastCanPlaceCells   = [];
    let rafId               = null;

    blockEl.addEventListener("pointerdown", e => {
        playSound(sndPick);

        e.preventDefault();

        blockEl.setPointerCapture(e.pointerId);

        const rect = blockEl.getBoundingClientRect();

        offsetX = rect.width + 14;
        offsetY = rect.height + 14;

        ghost = blockEl.cloneNode(true);
        ghost.classList.add("ghost");
        ghost.style.width   = rect.width + "px";
        ghost.style.height  = rect.height + "px";

        document.body.appendChild(ghost);

        // 최초 위치도 바로 중앙 정렬
        ghost.style.left = (e.clientX - offsetX) + "px";
        ghost.style.top  = (e.clientY - offsetY) + "px";
    });

    window.addEventListener("pointermove", e => {
        if (!ghost) return;
        if (rafId !== null) return;

        rafId = requestAnimationFrame(() => {
            ghost.style.left = (e.clientX - offsetX) + "px";
            ghost.style.top  = (e.clientY - offsetY) + "px";

            const rect      = boardEl.getBoundingClientRect();
            const cellSize  = rect.width / BOARD_SIZE;

            const blockWidth    = shape[0].length;
            const blockHeight   = shape.length;

            const cellX = Math.floor((e.clientX - 14 - rect.left) / cellSize);
            const cellY = Math.floor((e.clientY - 14 - rect.top) / cellSize);

            const x = cellX - (blockWidth - 1);
            const y = cellY - (blockHeight - 1);

            // canPlace 요소 제거
            lastCanPlaceCells.forEach(cell => cell.classList.remove("canPlace"));
            // canPlace 객체 초기화
            lastCanPlaceCells = [];


            // 놓을 수 있으면 해당 위치 cell에 클래스 추가
            if (canPlace(shape, x, y) && !timerDone) {
                // ✅ ghost 숨기기
                ghost.classList.add("hidden");

                shape.forEach((row, r) => {
                    row.forEach((v, c) => {
                        if (v) {
                            const nx = x + c;
                            const ny = y + r;
                            if (nx >= 0 && ny >= 0 && nx < BOARD_SIZE && ny < BOARD_SIZE) {
                                const index = ny * BOARD_SIZE + nx;
                                const cell = boardEl.children[index];
                                cell.classList.add("canPlace");
                                lastCanPlaceCells.push(cell);
                            }
                        }
                    });
                });
            } else {
                // ❌ 놓을 수 없으면 ghost 다시 보이기
                ghost.classList.remove("hidden");
            }
            rafId = null;
        });
    });

    window.addEventListener("pointerup", e => {
        rafId = null;
        blockEl.releasePointerCapture(e.pointerId);

        if (!ghost) return;
        ghost.classList.remove("hidden");

        const rect      = boardEl.getBoundingClientRect();
        const cellSize  = rect.width / BOARD_SIZE;

        const blockWidth    = shape[0].length;
        const blockHeight   = shape.length;

        const cellX = Math.floor((e.clientX - 14 - rect.left) / cellSize);
        const cellY = Math.floor((e.clientY - 14 - rect.top) / cellSize);

        const x = cellX - (blockWidth - 1);
        const y = cellY - (blockHeight - 1);

        if (canPlace(shape, x, y) && !timerDone) {
            playSound(sndDrop);

            updateScore(10); // 블록 배치 점수

            placeBlock(shape, x, y);
            clearLines();

            currentBlocks[blockIndex] = currentBlocks[blockIndex].map(row =>
                row.map(cell => 0)
            );
            createBlocks();
            
            resetTurnTimer(25_000);
        }

        ghost.remove();
        ghost = null;
    });

    blockEl.addEventListener("pointercancel", () => {
        if (ghost) {
            ghost.remove();
            ghost = null;
        }
    });
}

/* =========================
    배치 가능 여부
========================= */
function canPlace(shape, x, y) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;

            const nx = x + c;
            const ny = y + r;

            if (
                nx < 0 || ny < 0 ||
                nx >= BOARD_SIZE ||
                ny >= BOARD_SIZE ||
                board[ny][nx]
            ) return false;
        }
    }
    return true;
}

/* =========================
    블록 고정
========================= */
function placeBlock(shape, x, y) {
    shape.forEach((row, r) => {
        row.forEach((v, c) => {
            if (v) board[y + r][x + c] = 1;
        });
    });
}

/* =========================
    줄 제거
========================= */
function findLinesToClear() {
    const toClear = new Set();

    // 가로 검사
    for (let y = 0; y < BOARD_SIZE; y++) {
        if (board[y].every(v => v === 1)) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                toClear.add(`${x},${y}`);
            }
        }
    }

    // 세로 검사
    for (let x = 0; x < BOARD_SIZE; x++) {
        let full = true;
        for (let y = 0; y < BOARD_SIZE; y++) {
            if (!board[y][x]) {
                full = false;
                break;
            }
        }
        if (full) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                toClear.add(`${x},${y}`);
            }
        }
    }

    return toClear;
}

function clearLines() {
    const toClear = findLinesToClear();
    if (toClear.size === 0) {
        render();
        return;
    }

    playSound(sndlevelUpShort);

    toClear.forEach(key => {
        const [x, y]    = key.split(",").map(Number);
        const index     = y * BOARD_SIZE + x;
        boardEl.children[index].classList.add("clearing");
    });
    
    setTimeout(() => {
        toClear.forEach(key => {
            const [x, y]    = key.split(",").map(Number);
            board[y][x]     = 0;
        });

        updateScore(toClear.size * 5);
        render();
    }, 400);
}

/* =========================
    렌더링
========================= */
function render() {
    document.querySelectorAll(".cell").forEach((cell, i) => {
        const x = i % BOARD_SIZE;
        const y = Math.floor(i / BOARD_SIZE);
        cell.className = board[y][x]
            ? "cell filled"
            : "cell";
    });
}

/* =========================
    초기화
========================= */
function initBlockPuzzle(isRestart) {
    const startBtn              = document.getElementById("blocks-refresh");
    startBtn.textContent        = "Refresh";
    startBtn.style.background   = "linear-gradient(135deg, #4fc3f7, #0288d1)";
    
    playSound(sndStart);

    if(!isRestart){
        timerEl     = document.getElementById("turn-timer");
        boardEl     = document.getElementById("board");
        blocksEl    = document.getElementById("blocks");
        scoreEl     = document.getElementById("score");

        createBoard();
    } else {
        score = -500; //라인 클리어시 +500 되는 값 역전치

        board = Array.from({ length: BOARD_SIZE }, () =>
            Array(BOARD_SIZE).fill(1)
        );

        clearLines();

        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.remove("game-over-cell");
        });

        currentBlocks.splice(0, BLOCK_COUNT);
        refreshRemain = 3;
        const refreshCountEl        = document.getElementById("refresh-count");
        refreshCountEl.textContent  = `남은 횟수: ${refreshRemain}`;
    }

    createBlocks();
    render();
}

window.addEventListener("DOMContentLoaded", () => {
    const refreshBtn        = document.getElementById("blocks-refresh");
    const refreshCountEl    = document.getElementById("refresh-count");

    refreshBtn.addEventListener("pointerdown", () => {
        // 게임 종료 상태면 재시작
        if (timerDone) {
            timerDone = false;
            initBlockPuzzle(1);
            return;
        }

        // 게임 중이면 블록 리프레시
        if (refreshRemain <= 0) return;

        refreshRemain--;

        playSound(sndDrop);

        currentBlocks.splice(0, BLOCK_COUNT);
        createBlocks();

        refreshCountEl.textContent      = `남은 횟수: ${refreshRemain}`;

        if (refreshRemain === 0) {
            refreshBtn.disabled         = true;
            refreshBtn.style.opacity    = "0.5";
            refreshBtn.style.cursor     = "not-allowed";
        }
    });
});

/* ============================2048============================ */
/* =========================
    버튼 입력
========================= */
function btnPointerDown(){
    document.getElementById("up-btn").addEventListener("pointerdown", () => {
        moveArrow("up");
        playMoveAnimation("up");
    });

    document.getElementById("down-btn").addEventListener("pointerdown", () => {
        moveArrow("down");
        playMoveAnimation("down");
    });

    document.getElementById("left-btn").addEventListener("pointerdown", () => {
        moveArrow("left");
        playMoveAnimation("left");
    });

    document.getElementById("right-btn").addEventListener("pointerdown", () => {
        moveArrow("right");
        playMoveAnimation("right");
    });
}

/* =========================
    키보드 입력
========================= */
const keyToDirection = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
};

let keyToBtn = {
    ArrowUp: document.getElementById("up-btn"),
    ArrowDown: document.getElementById("down-btn"),
    ArrowLeft: document.getElementById("left-btn"),
    ArrowRight: document.getElementById("right-btn"),
};

window.addEventListener("keydown", (event) => {
    const gamePage = document.getElementById("block2048");
    const direction = keyToDirection[event.key];
    if(!direction) return;
    if (!isVisible(gamePage)) return;
    if (event.repeat) return;

    const btn = keyToBtn[event.key];
    if (!btn) return;

    playMoveAnimation(direction);

    btn.classList.add("is-active");

    if (event.key === "ArrowUp") {
        moveArrow(direction);
    } else if (event.key === "ArrowDown") {
        moveArrow(direction);
    } else if (event.key === "ArrowLeft") {
        moveArrow(direction);
    } else if (event.key === "ArrowRight") {
        moveArrow(direction);
    }
});

window.addEventListener("keyup", (event) => {
    const gamePage = document.getElementById("block2048");
    if (!isVisible(gamePage)) return;

    const btn = keyToBtn[event.key];
    if (!btn) return;

    btn.classList.remove("is-active");
    
    if (event.key === "ArrowUp") {

    } else if (event.key === "ArrowDown") {

    } else if (event.key === "ArrowLeft") {

    } else if (event.key === "ArrowRight") {

    }
});

/* =========================
    입력 제어
========================= */
function moveArrow(Arrow){
    let btn = null;

    playSound(sndPick);

    if(Arrow == "up"){
        moveUp();
    } else if(Arrow == "down"){
        moveDown();
    } else if(Arrow == "left"){
        moveLeft();
    } else if(Arrow == "right"){
        moveRight();
    }

    spawnRandomTile();
    block_2048_render();
}

/* =========================
    move 함수
========================= */
function moveUp() {
    for (let x = 0; x < 4; x++) {
        const column = [];
        for (let y = 0; y < 4; y++) {
            column.push(board_2048[y][x]);
        }

        const moved = slideLine(column);

        for (let y = 0; y < 4; y++) {
            board_2048[y][x] = moved[y];
        }
    }
}

function moveDown() {
    for (let x = 0; x < 4; x++) {
        const column = [];
        for (let y = 0; y < 4; y++) {
            column.push(board_2048[y][x]);
        }

        const moved = slideLine(column.reverse()).reverse();

        for (let y = 0; y < 4; y++) {
            board_2048[y][x] = moved[y];
        }
    }
}

function moveLeft() {
    for (let y = 0; y < 4; y++) {
        board_2048[y] = slideLine(board_2048[y]);
    }
}

function moveRight() {
    for (let y = 0; y < 4; y++) {
        board_2048[y] = slideLine([...board_2048[y]].reverse()).reverse();
    }
}

/* =========================
    무빙 애니메이션
========================= */
function playMoveAnimation(direction) {
    const boardBody = document.getElementById("board-2048-body");

    const className = `move-${direction}`;

    // 혹시 남아있을 수 있으니 제거
    boardBody.classList.remove(
        "move-left",
        "move-right",
        "move-up",
        "move-down"
    );

    // 강제로 reflow (애니메이션 재실행용)
    void boardBody.offsetWidth;

    boardBody.classList.add(className);

    // 애니메이션 끝나면 제거
    setTimeout(() => {
        boardBody.classList.remove(className);
    }, 100);
}

/* =========================
    보드 생성
========================= */
function create2048Board(){
    for (let i = 0; i < BLOCK_2048_SIZE * BLOCK_2048_SIZE; i++) {
        const cell = document.createElement("div");
        cell.className = "cell-2048";
        board2048El.appendChild(cell);
    }
}

/* =========================
    블록 랜덤 생성
========================= */
function spawnRandomTile() {
    const emptyCells = [];

    for (let y = 0; y < BLOCK_2048_SIZE; y++) {
        for (let x = 0; x < BLOCK_2048_SIZE; x++) {
            if (board_2048[y][x] === 0) {
                emptyCells.push({ x, y });
            }
        }
    }

    // 빈칸이 없으면 종료 (게임 오버 판단)
    if (emptyCells.length === 0) {
        playSound(sndLose);
        
        document.querySelectorAll(".cell-2048").forEach(cell => {
            cell.classList.add("game-over-cell");
            cell.classList.remove("filled");
        });

        return;
    }

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { x, y } = emptyCells[randomIndex];

    board_2048[y][x] = 2;
}

/* =========================
    라인 밀기 (1단계)
========================= */
function slideLine(line) {
    // line: [2, 0, 4, 0] 같은 "한 줄" 배열

    // 0이 아닌 값만 골라낸다
    // 예: [2, 0, 4, 0] → [2, 4]
    const filtered  = line.filter(v => v !== 0);
    const merged    = [];

    for (let i = 0; i < filtered.length; i++) {
        // 다음 숫자가 있고, 현재 숫자와 같다면
        if (filtered[i] === filtered[i + 1]) {
            playSound(sndlevelUpShort);
            // 두 숫자를 합쳐서 추가
            merged.push(filtered[i] * 2);

            // 다음 숫자는 이미 사용했으므로 건너뜀
            i++;
        } else {
            // 다르면 그대로 추가
            merged.push(filtered[i]);
        }
    }

    // 빠진 칸 수만큼 0 배열을 만든다
    // 예: 전체 4칸 - 숫자 2개 = 0 두 개 필요
    const zeros = Array(4 - merged.length).fill(0);

    // 숫자들 뒤에 0을 붙여서 한 줄로 완성
    // 예: [2, 4] + [0, 0] → [2, 4, 0, 0]
    return [...merged, ...zeros];
}

/* =========================
    초기화
========================= */
function initBlock2048(isRestart) {
    playSound(sndStart);

    keyToBtn = {
        ArrowUp: document.getElementById("up-btn"),
        ArrowDown: document.getElementById("down-btn"),
        ArrowLeft: document.getElementById("left-btn"),
        ArrowRight: document.getElementById("right-btn"),
    };
    
    if(!isRestart){
        board2048El = document.getElementById("board-2048");
        
        create2048Board();
    } else {

    }

    btnPointerDown();
    spawnRandomTile();
    block_2048_render();
}

function updateCellStyle(cell, value) {
    // 기존 숫자 관련 클래스 제거
    cell.classList.forEach(cls => {
        if (cls.startsWith("v-")) {
            cell.classList.remove(cls);
        }
    });

    if (value === 0) {
        cell.textContent = "";
        return;
    }

    cell.textContent = value;

    // 2 → 1, 4 → 2, 8 → 3 ...
    const level = Math.log2(value);

    // 예: v-1, v-2, v-3 ...
    cell.classList.add(`v-${level}`);
}

function block_2048_render() {
    document.querySelectorAll(".cell-2048").forEach((cell, i) => {
        const x = i % BLOCK_2048_SIZE;
        const y = Math.floor(i / BLOCK_2048_SIZE);

        if (board_2048[y][x]) {
            updateCellStyle(cell, board_2048[y][x]);
        } else {
            updateCellStyle(cell, 0);
        }
    });
}

