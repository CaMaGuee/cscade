/* =========================================================
    BlockPuzzle SPA Module
========================================================= */
export function BlockPuzzle() {

    /* =========================
        기본 설정
    ========================= */
    const BOARD_SIZE = 10;
    const boardEl = document.getElementById("board");
    const blocksEl = document.getElementById("blocks");

    const BLOCK_COUNT = 3;
    let currentBlocks = [];

    let offsetX = 0;
    let offsetY = 0;

    let refreshRemain = 3;

    let score = 0;
    const scoreEl = document.getElementById("score");

    let board = Array.from({ length: BOARD_SIZE }, () =>
        Array(BOARD_SIZE).fill(0)
    );

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
        보드 생성
    ========================= */
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        boardEl.appendChild(cell);
    }

    /* =========================
        블록 생성
    ========================= */

    function createBlocks() {
        blocksEl.innerHTML = "";

        const totalValue = currentBlocks.flatMap(block => block.flat()).reduce((acc, val) => acc + val, 0);
        if (totalValue < 1) {
            currentBlocks = getRandomShapes(BLOCK_COUNT);
        }

        currentBlocks.forEach((shape, index) => {
            const block = document.createElement("div");
            block.className = "block";
            block.style.gridTemplateColumns =
                `repeat(${shape[0].length}, 1fr)`;

            shape.forEach(row => {
                row.forEach(v => {
                    const c = document.createElement("div");
                    c.className = "block-cell";      // 모든 셀에 class 부여
                    c.style.background = v ? "#ff8a65" : "transparent"; // 값에 따라 색상 지정
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
        let ghost = null;

        blockEl.addEventListener("pointerdown", e => {
            e.preventDefault();

            blockEl.setPointerCapture(e.pointerId);

            const rect = blockEl.getBoundingClientRect();

            offsetX = rect.width - 14;
            offsetY = rect.height - 14;

            ghost = blockEl.cloneNode(true);
            ghost.classList.add("ghost");
            ghost.style.width = rect.width + "px";
            ghost.style.height = rect.height + "px";

            document.body.appendChild(ghost);

            // 최초 위치도 바로 중앙 정렬
            ghost.style.left = (e.clientX - offsetX) + "px";
            ghost.style.top  = (e.clientY - offsetY) + "px";
        });

        window.addEventListener("pointermove", e => {
            if (!ghost) return;

            ghost.style.left = (e.clientX - offsetX) + "px";
            ghost.style.top  = (e.clientY - offsetY) + "px";
        });

        window.addEventListener("pointerup", e => {
            blockEl.releasePointerCapture(e.pointerId);

            if (!ghost) return;

            const rect = boardEl.getBoundingClientRect();
            const cellSize = rect.width / BOARD_SIZE;

            const blockWidth = shape[0].length;
            const blockHeight = shape.length;

            const cellX = Math.floor((e.clientX - rect.left) / cellSize);
            const cellY = Math.floor((e.clientY - rect.top) / cellSize);

            const x = cellX - (blockWidth - 1);
            const y = cellY - (blockHeight - 1);

            if (canPlace(shape, x, y)) {
                updateScore(10); // 블록 배치 점수

                placeBlock(shape, x, y);
                clearLines();

                currentBlocks[blockIndex] = currentBlocks[blockIndex].map(row =>
                    row.map(cell => 0)
                );
                createBlocks();
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
        toClear.forEach(key => {
            const [x, y] = key.split(",").map(Number);
            const index = y * BOARD_SIZE + x;
            boardEl.children[index].classList.add("clearing");
        });

        setTimeout(() => {
            toClear.forEach(key => {
                const [x, y] = key.split(",").map(Number);
                board[y][x] = 0;
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
    createBlocks();
    render();

    window.addEventListener("DOMContentLoaded", () => {
        const refreshBtn = document.getElementById("blocks-refresh");
        const refreshCountEl = document.getElementById("refresh-count");

        refreshBtn.addEventListener("pointerdown", () => {
            if (refreshRemain <= 0) return;

            refreshRemain--;

            currentBlocks.splice(0, BLOCK_COUNT);
            createBlocks();

            refreshCountEl.textContent = `남은 횟수: ${refreshRemain}`;

            if (refreshRemain === 0) {
                refreshBtn.disabled = true;
                refreshBtn.style.opacity = "0.5";
                refreshBtn.style.cursor = "not-allowed";
            }
        });
    });
}