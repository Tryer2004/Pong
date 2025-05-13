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

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);

    // start the game with the ball going to Player 1
    resetBall(0);  

    // handle restarting with Spacebar
    document.addEventListener("keydown", function(e) {
        if (e.code === "Space") {
            restartGame();
        }
    });

    requestAnimationFrame(update);
};

function update() {
    context.clearRect(0, 0, boardWidth, boardHeight);

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

    // bounce off top/bottom
    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
        ball.velocityY *= -1;
    }

    // paddle collision
    if (detectCollision(ball, player1)) {
        let collidePoint = ball.y + ball.height / 2 - (player1.y + player1.height / 2);
        collidePoint = collidePoint / (player1.height / 2); // -1 to 1

        let angleRad = collidePoint * Math.PI / 4;
        let speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2) * 1.05;

        ball.velocityX = speed * Math.cos(angleRad);
        ball.velocityY = speed * Math.sin(angleRad);
        ball.x = player1.x + player1.width;
    }

    if (detectCollision(ball, player2)) {
        let collidePoint = ball.y + ball.height / 2 - (player2.y + player2.height / 2);
        collidePoint = collidePoint / (player2.height / 2); // -1 to 1

        let angleRad = collidePoint * Math.PI / 4;
        let speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2) * 1.05;

        ball.velocityX = -speed * Math.cos(angleRad);
        ball.velocityY = speed * Math.sin(angleRad);
        ball.x = player2.x - ball.width;
    }

    // update scores (optional: display scores on screen)
    if (ball.x < 0) {
        player2Score++;
        resetBall(2); // Player 2 scored
    } else if (ball.x > boardWidth) {
        player1Score++;
        resetBall(1); // Player 1 scored
    }

    // draw paddles and ball
    context.fillStyle = "white";
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    context.fillRect(player2.x, player2.y, player2.width, player2.height);

    context.fillStyle = "red";
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // draw scores
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Player 1: " + player1Score, 10, 20); // Player 1 score
    context.fillText("Player 2: " + player2Score, boardWidth - 120, 20); // Player 2 score

    requestAnimationFrame(update);
}

function movePlayer(e) {

}
