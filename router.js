import { BlockPuzzle } from "./BlockPuzzle.js";

let currentDestroy = null;

export function navigate(page) {
    if (currentDestroy) {
        currentDestroy();
        currentDestroy = null;
    }

    document.querySelectorAll(".game-btn-section").forEach(p => {
        p.style.display = "none";
    });

    const pageEl = document.getElementById(page);
    if (pageEl) pageEl.style.display = "block";

    if (page === "BlockPuzzle") {
        currentDestroy = BlockPuzzle();
    }
}

window.navigate = navigate;
