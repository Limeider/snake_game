export function generateInitialCanvasData(width, height, blockSize) {
    if (!(width % blockSize === 0 && height % blockSize === 0)) {
        throw new Error("Canvas Data cannot be generated due to blockSize error!");
    }

    const CANVAS_DATA = [];
    const rows = height / blockSize;
    const columns = width / blockSize;

    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < columns; j++) {
            row.push(0);
        }
        CANVAS_DATA.push(row);
    }
    return CANVAS_DATA;
}

// const snakeHead = new Image();
// snakeHead.src = "./images/snake-head.png";

const food = new Image();
food.src = "./images/apple.png";

export function renderItem(rI, cI, val, size, ctx, direction) {
    const x = cI * size;
    const y = rI * size;
    // if (val === 1) { // head
    //     let rotation = 0;
    //     switch (direction) {
    //         case "down":
    //             rotation = 0;
    //             break;
    //         case "up":
    //             rotation = 180;
    //             break;
    //         case "right":
    //             rotation = 270;
    //             break;
    //         case "left":
    //             rotation = 90;
    //             break;
    //     }

    //     snakeHead.style.transform = `rotate(${rotation}deg)`;
    //     ctx.drawImage(snakeHead, x, y);    }
    if (val === 1 || val === 2) {
        drawBorder(x, y, size, size, 1, ctx);
        ctx.fillStyle = "green";
        ctx.fillRect(x, y, size, size);
    } else if (val === 3) { // food
        ctx.drawImage(food, x, y);
        // ctx.fillStyle = "red";
        // ctx.fillRect(x, y, size, size);
    } else {
        throw new Error("Unexpected value in game grid!");
    }
}

function drawBorder(xPos, yPos, width, height, thickness = 1, ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
}

export function updateGameState(gameState, direction = "down", snake, blockSize, gameOver, score, foodGenerated) {
    updateSnakeBodyLocation(snake);
    updateSnakeHeadLocation(snake[0], blockSize, direction);

    for (let i = 0; i < snake.length; i++) { // these indices get messed up when you go through the inputs quickly
        const xIndex = snake[i].x / blockSize;
        const yIndex = snake[i].y / blockSize;

        if (i === 0) {
            if (!((yIndex < gameState.length && yIndex >= 0) && (xIndex < gameState[0].length && xIndex >= 0))) {
                gameOver.over = true;
                return;
            }

            if (gameState[yIndex][xIndex] === 3) {
                handleFoodConsumption(score, foodGenerated, snake);
            }
        }

        const xOldIndex = snake[i].prev.x / blockSize;
        const yOldIndex = snake[i].prev.y / blockSize;

        gameState[yOldIndex][xOldIndex] = 0;

        if (i === 0 && gameState[yIndex][xIndex] === 2) {
            gameOver.over = true;
            return;
        }

        if (i === 0) {
            gameState[yIndex][xIndex] = 1;
        } else {
            gameState[yIndex][xIndex] = 2;
        }
    }
}

export function generateFood(gameState, foodGenerated) {
    let randomXIndex = Math.floor(Math.random() * gameState[0].length);
    let randomYIndex = Math.floor(Math.random() * gameState.length);
    let randomStateVal = gameState[randomYIndex][randomXIndex];

    while (!(randomStateVal === 0)) {
        randomXIndex = Math.floor(Math.random() * gameState[0].length);
        randomYIndex = Math.floor(Math.random() * gameState.length);
        randomStateVal = gameState[randomYIndex][randomXIndex];
    }

    gameState[randomYIndex][randomXIndex] = 3;
    foodGenerated.generated = true;
}

function handleFoodConsumption(score, foodGenerated, snake) {
    score.count += 1;
    foodGenerated.generated = false;
    snake.push(generateSnakeSegment(snake));
}

function generateSnakeSegment(snake) {
    const lastSegment = snake[snake.length - 1];
    return { x: lastSegment.x, y: lastSegment.y, prev: { x: null, y: null } };
}

function updateSnakeHeadLocation(snakeHead, blockSize, direction, dt) {
    snakeHead.prev.x = snakeHead.x;
    snakeHead.prev.y = snakeHead.y;

    switch (direction) {
        case "down": {
            snakeHead.y += blockSize;
            break;
        }
        case "up": {
            snakeHead.y -= blockSize;
            break;
        }
        case "right": {
            snakeHead.x += blockSize;
            break;
        }
        case "left": {
            snakeHead.x -= blockSize;
            break;
        }
        default: {
            throw new Error("Unexpected direction received!");
        }
    }
}

function updateSnakeBodyLocation(snake) {
    for (let i = snake.length - 1; i > 0; i--) {
        const lastCoords = snake[i];
        const secondToLastCoords = snake[i - 1];

        lastCoords.prev.x = lastCoords.x;
        lastCoords.prev.y = lastCoords.y;

        lastCoords.x = secondToLastCoords.x;
        lastCoords.y = secondToLastCoords.y;
    }
}