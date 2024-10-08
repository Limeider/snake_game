import { generateInitialCanvasData, renderItem, updateGameState, generateFood } from "./helperFucks.js";

// general constants
const START = { isStarted: false };
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 440;
const BLOCK_SIZE = 40;
let SNAKE = [{ x: 280, y: 80, prev: { x: null, y: null } }, { x: 280, y: 40, prev: { x: null, y: null } }, { x: 280, y: 0, prev: { x: null, y: null } }];
let SNAKE_DIR = "down";
let LAST_DIR = null;
const FPS = 10;
const FRAME_DURATION_MS = 1000 / FPS;
let LAST_RENDER_TIME = 0;
let GAME = { over: false };
let FOOD = { generated: false };
let SCORE = { count: 0 };

// handle start
const startH3 = document.querySelector(".start-div > h3");
const startBtn = document.getElementById("start");
const quitBtn = document.getElementById("quit");

startBtn.addEventListener("click", () => {
    setTimeout(() => {
        START.isStarted = true;
    }, 300);
})

quitBtn.addEventListener("click", () => {
    window.alert("bitch 🥰");
})

// get initial canvas
let CANVAS_DATA = generateInitialCanvasData(CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE);

// set canvas dimensions
const canvas = document.getElementById("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// canvas auto focus
window.onload = () => {
    canvas.focus();
}

// set snake direction
window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            if (SNAKE_DIR != "down") {
                SNAKE_DIR = "up";
            }
            break;
        case "ArrowDown":
            if (SNAKE_DIR != "up") {
                SNAKE_DIR = "down";
            }
            break;
        case "ArrowLeft":
            if (SNAKE_DIR != "right") {
                SNAKE_DIR = "left";
            }
            break;

        case "ArrowRight":
            if (SNAKE_DIR != "left") {
                SNAKE_DIR = "right";
            }
            break;
    }
})

// handle restart
const restartBtn = document.getElementById("restart");
restartBtn.addEventListener("click", () => {
    CANVAS_DATA = generateInitialCanvasData(CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_SIZE);
    SNAKE = [{ x: 280, y: 80, prev: { x: null, y: null } }, { x: 280, y: 40, prev: { x: null, y: null } }, { x: 280, y: 0, prev: { x: null, y: null } }];
    SNAKE_DIR = "down";
    LAST_DIR = null;
    LAST_RENDER_TIME = 0;
    GAME.over = false;
    FOOD.generated = false;
    SCORE.count = 0;

    setTimeout(() => {
        START.isStarted = true;
        requestAnimationFrame((timeStamp) => paintCanvas(timeStamp));
    }, 300);
})

// Call paint
requestAnimationFrame((timeStamp) => paintCanvas(timeStamp));

function paintCanvas(timeStamp) {
    if (START.isStarted) {
        startH3.classList.add("hidden");
        restartBtn.classList.add("hidden");
        startBtn.classList.add("hidden");
        quitBtn.classList.add("hidden");
        const elapsed = timeStamp - LAST_RENDER_TIME;
        if (elapsed < FRAME_DURATION_MS) {
            requestAnimationFrame((nextTimeStamp) => { paintCanvas(nextTimeStamp) });
            return;
        }

        if (LAST_DIR) { // fixes error as snake was colliding into self even with two/three segments, so im using elapsed as a sort of buffer and rechecking directions
            switch (LAST_DIR) {
                case "right":
                    if (SNAKE_DIR === "left") {
                        SNAKE_DIR = "right";
                    }
                    break;
                case "left":
                    if (SNAKE_DIR === "right") {
                        SNAKE_DIR = "left";
                    }
                    break;
                case "up":
                    if (SNAKE_DIR === "down") {
                        SNAKE_DIR = "up";
                    }
                    break;

                case "down":
                    if (SNAKE_DIR === "up") {
                        SNAKE_DIR = "down";
                    }
                    break;
            }
        }

        LAST_DIR = SNAKE_DIR;
        LAST_RENDER_TIME = timeStamp;

        console.log("🚀 ~ CANVAS_DATA:", JSON.stringify(CANVAS_DATA));

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        updateGameState(CANVAS_DATA, SNAKE_DIR, SNAKE, BLOCK_SIZE, GAME, SCORE, FOOD);

        if (!FOOD.generated) {
            generateFood(CANVAS_DATA, FOOD);
        }

        CANVAS_DATA.forEach((row, rI) => {
            row.forEach((columnVal, cI) => {
                if (!(columnVal === 0)) {
                    renderItem(rI, cI, columnVal, BLOCK_SIZE, ctx, SNAKE_DIR);
                }
            })
        })

        // display score
        const scoreElement = document.getElementById("score");
        scoreElement.textContent = "Score: " + SCORE.count;

        if (!GAME.over) {
            requestAnimationFrame((nextTimeStamp) => paintCanvas(nextTimeStamp));
        } else {
            START.isStarted === false;
            startH3.classList.remove("hidden");
            restartBtn.classList.remove("hidden");
            quitBtn.classList.remove("hidden");

            ctx.font = '50px "Comic Sans MS"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.fillText('Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }
    } else {
        requestAnimationFrame((nextTimeStamp) => paintCanvas(nextTimeStamp));
    }
}