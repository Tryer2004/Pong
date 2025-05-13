// board setup
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// players
let playerWidth = 10;
let playerHeight = 50;

let player1 = {
    x: 10,
    y: boardHeight / 2 - playerHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: 0
};

let player2 = {
    x: boardWidth - playerWidth - 10,
    y: boardHeight / 2 - playerHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: 0
};

// ball
let ballWidth = 10;
let ballHeight = 10;
let ball = {
    x: boardWidth / 2 - ballWidth / 2,
    y: boardHeight / 2 - ballHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 2,
    velocityY: 2
};

// scores
let player1Score = 0;
let player2Score = 0;

// game state
let isGameRunning = false;
let isGameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);

    // start/restart game with space
    document.addEventListener("keydown", function (e) {
        if (e.code === "Space" && !isGameRunning && !isGameOver) {
            isGameRunning = true;
        } else if (e.code === "Space" && isGameOver) {
            resetGame();
        }
    });

    requestAnimationFrame(update);
};

function update() {
    context.clearRect(0, 0, boardWidth, boardHeight);

    // Start screen
    if (!isGameRunning && !isGameOver) {
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText("Press SPACE to Start", boardWidth / 2 - 100, boardHeight / 2);
        requestAnimationFrame(update);
        return;
    }

    // Game Over screen
    if (isGameOver) {
        context.fillStyle = "white";
        context.font = "20px Arial";
        const winner = player1Score === 5 ? "Player 1 Wins!" : "Player 2 Wins!";
        context.fillText(winner, boardWidth / 2 - 70, boardHeight / 2);
        context.fillText("Press SPACE to Restart", boardWidth / 2 - 100, boardHeight / 2 + 30);
        return;
    }

    // move paddles
    let nextY1 = player1.y + player1.velocityY;
    if (!outOfBounds(nextY1, player1.height)) {
        player1.y = nextY1;
    }

    let nextY2 = player2.y + player2.velocityY;
    if (!outOfBounds(nextY2, player2.height)) {
        player2.y = nextY2;
    }

    // move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // scoring
    if (ball.x < 0) {
        player2Score++;
        checkGameOver();
        resetBall();
    } else if (ball.x + ball.width > boardWidth) {
        player1Score++;
        checkGameOver();
        resetBall();
    }

    // bounce off top and bottom
    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
        ball.velocityY *= -1;
    }

    // paddle collision
    if (detectCollision(ball, player1)) {
        ball.velocityX *= -1;
        ball.x = player1.x + player1.width;
    }
    if (detectCollision(ball, player2)) {
        ball.velocityX *= -1;
        ball.x = player2.x - ball.width;
    }

    // draw paddles
    context.fillStyle = "white";
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    context.fillRect(player2.x, player2.y, player2.width, player2.height);

    // draw ball
    context.fillStyle = "red";
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // draw score
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText(player1Score, boardWidth / 4, 30);
    context.fillText(player2Score, 3 * boardWidth / 4, 30);

    requestAnimationFrame(update);
}

function movePlayer(e) {
    if (e.code === "KeyW") {
        player1.velocityY = -3;
    } else if (e.code === "KeyS") {
        player1.velocityY = 3;
    }

    if (e.code === "ArrowUp") {
        player2.velocityY = -3;
    } else if (e.code === "ArrowDown") {
        player2.velocityY = 3;
    }
}

function stopPlayer(e) {
    if (["KeyW", "KeyS"].includes(e.code)) {
        player1.velocityY = 0;
    }
    if (["ArrowUp", "ArrowDown"].includes(e.code)) {
        player2.velocityY = 0;
    }
}

function outOfBounds(y, height) {
    return y < 0 || y + height > boardHeight;
}

function detectCollision(ball, paddle) {
    return (
        ball.x < paddle.x + paddle.width &&
        ball.x + ball.width > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y + ball.height > paddle.y
    );
}

function resetBall() {
    ball.x = boardWidth / 2 - ball.width / 2;
    ball.y = boardHeight / 2 - ball.height / 2;
    ball.velocityX = Math.random() < 0.5 ? 2 : -2;
    ball.velocityY = Math.random() < 0.5 ? 2 : -2;
}

function checkGameOver() {
    if (player1Score === 5 || player2Score === 5) {
        isGameOver = true;
        isGameRunning = false;
    }
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    isGameOver = false;
    isGameRunning = false;
    resetBall();
    requestAnimationFrame(update);
}
