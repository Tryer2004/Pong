// === Game Settings ===
let paused = false;
let isSinglePlayer = true;
let aiDifficulty = "medium"; // Options: easy, medium, hard
const MAX_BALL_SPEED = 8; // ts is the max speed
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

let playerWidth = 10;
let playerHeight = 50;
let ballWidth = 10;
let ballHeight = 10;

let gameOver = false;
let player1Score = 0;
let player2Score = 0;

// === Player Setup ===
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

// === Ball Setup ===
let ball = {
    x: boardWidth / 2 - ballWidth / 2,
    y: boardHeight / 2 - ballHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 2,
    velocityY: 2
};

// === Init Game ===
window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);
     
    
        
        

    document.addEventListener("keydown", function (e) {
        if (e.code === "Space" && gameOver) {
            restartGame();
        } else if (e.code === "KeyM") {
            isSinglePlayer = !isSinglePlayer;
        } else if (e.code === "Digit1") {
            aiDifficulty = "easy";
        } else if (e.code === "Digit2") {
            aiDifficulty = "medium";
        } else if (e.code === "Digit3") {
            aiDifficulty = "hard";
        } else if (e.code === "KeyP") {
            paused = !paused;
            if (!paused && !gameOver) {
                requestAnimationFrame(update); // Resume game loop
            }
        }
    });
    
    

    resetBall(0);
    requestAnimationFrame(update);
};

// === Game Loop ===
function update() {
    context.clearRect(0, 0, boardWidth, boardHeight);
    if(paused) {
        //Draw paused screen
        context.fillStyle = "white";
        context.font= "30px Arial"; 
        context.fillText("Paused" , boardWidth / 2 - 50, boardHeight / 2);
        return; 



    }

    // Center dashed line
    for (let y = 0; y < boardHeight; y += 20) {
        context.fillStyle = "gray";
        context.fillRect(boardWidth / 2 - 1, y, 2, 10);
    }

    // Move player1
    let nextY1 = player1.y + player1.velocityY;
    if (!outOfBounds(nextY1, player1.height)) player1.y = nextY1;

    // Move player2 (AI or player)
    if (isSinglePlayer) {
        let aiSpeed = getAISpeed();
        if (ball.y + ball.height / 2 < player2.y + player2.height / 2) {
            player2.velocityY = -aiSpeed;
        } else if (ball.y + ball.height / 2 > player2.y + player2.height / 2) {
            player2.velocityY = aiSpeed;
        } else {
            player2.velocityY = 0;
        }
    }
    let nextY2 = player2.y + player2.velocityY;
    if (!outOfBounds(nextY2, player2.height)) player2.y = nextY2;

    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Bounce off top/bottom
    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
        ball.velocityY *= -1;
    }

    // Paddle collisions
    if (detectCollision(ball, player1)) reflectBall(ball, player1, 1);
    if (detectCollision(ball, player2)) reflectBall(ball, player2, -1);

    // Check score
    if (ball.x < 0) {
        player2Score++;
        if (player2Score >= 5) gameOver = true;
        resetBall(2);
    } else if (ball.x > boardWidth) {
        player1Score++;
        if (player1Score >= 5) gameOver = true;
        resetBall(1);
    }

    // Draw paddles and ball
    context.fillStyle = "white";
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    context.fillRect(player2.x, player2.y, player2.width, player2.height);

    context.fillStyle = "red";
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // Draw scores
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Player 1: " + player1Score, 10, 20);
    context.fillText("Player 2: " + player2Score, boardWidth - 120, 20);

    // Show mode and difficulty
    context.fillText("Mode: " + (isSinglePlayer ? "Single Player" : "Multiplayer"), boardWidth / 2 - 70, 20);
    if (isSinglePlayer) {
        context.fillText("AI: " + aiDifficulty.toUpperCase(), boardWidth / 2 - 40, 40);
    }

    // Draw game over
    if (gameOver) {
        context.fillStyle = "red";
        context.font = "30px Arial";
        let winner = player1Score >= 5 ? "Player 1 Wins!" : "Player 2 Wins!";
        context.fillText(winner, boardWidth / 2 - context.measureText(winner).width / 2, boardHeight / 2);
        context.font = "20px Arial";
        context.fillText("Press Space to Restart", boardWidth / 2 - 110, boardHeight / 2 + 30);
    } else {
        requestAnimationFrame(update);
    }
}

// === Controls ===
function movePlayer(e) {
    let speed = getBallSpeed(); //Paddle speed based on balls speed
    if (e.code === "KeyW") player1.velocityY = -speed;
    if (e.code === "KeyS") player1.velocityY = speed;
    if (!isSinglePlayer) {
        if (e.code === "ArrowUp") player2.velocityY = -speed;
        if (e.code === "ArrowDown") player2.velocityY = speed;
    }
}

function stopPlayer(e) {
    if (["KeyW", "KeyS"].includes(e.code)) {
        player1.velocityY = 0;
    }
    if (["ArrowUp", "ArrowDown"].includes(e.code)) {
         player2.velocityY = 0;}
}

// === Helpers ===
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

function reflectBall(ball, paddle, direction) {
    
    let collidePoint = ball.y + ball.height / 2 - (paddle.y + paddle.height / 2);
    collidePoint = collidePoint / (paddle.height / 2); // -1 to 1
    let angleRad = collidePoint * Math.PI / 4;
    let speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2) * 1.2; // increase ball on hit

    ball.velocityX = direction * speed * Math.cos(angleRad);
    ball.velocityY = speed * Math.sin(angleRad);
    ball.x = direction === 1 ? paddle.x + paddle.width : paddle.x - ball.width;

//Limit ball speed
let currentSpeed = Math.sqrt (ball.velocityX ** 2 + ball.velocityY ** 2)
if (currentSpeed > MAX_BALL_SPEED){
let scale = MAX_BALL_SPEED / currentSpeed;
ball.velocityX *= scale;
ball.velocityY *= scale; 

}
}



    

function resetBall(playerScored) {
    ball.x = boardWidth / 2 - ball.width / 2;
    ball.y = boardHeight / 2 - ball.height / 2;

    // Set horizontal direction only — toward the opponent
    if (playerScored === 1) {
        // Player 1 scored → ball goes to Player 2 (right)
        ball.velocityX = 2;
    } else if (playerScored === 2) {
        // Player 2 scored → ball goes to Player 1 (left)
        ball.velocityX = -2;
    } else {
        // First serve or random
        ball.velocityX = Math.random() < 0.5 ? -2 : 2;
    }

    // No vertical movement at the start
    ball.velocityY = 0;
}



function restartGame() {
    gameOver = false;
    player1Score = 0;
    player2Score = 0;
    player1.y = boardHeight / 2 - playerHeight / 2;
    player2.y = boardHeight / 2 - playerHeight / 2;
    resetBall(0);
    requestAnimationFrame(update);
}


function getAISpeed() {
    let ballSpeed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2); // Calculate ball speed

    // Define difficulty factor
    let difficultyFactor;
    switch (aiDifficulty) {
        case "easy":
            difficultyFactor = 0.5;
            break;
        case "medium":
            difficultyFactor = 0.75;
            break;
        case "hard":
            difficultyFactor = 1;
            break;
        default:
            difficultyFactor = 0.75;
            break;
    }

    // Calculate AI speed based on ball speed and difficulty
    let aiSpeed = ballSpeed * difficultyFactor;

    // Calculate distance to ball (center of ball vs center of AI paddle)
    let distanceToBall = Math.abs(ball.y + ball.height / 2 - (player2.y + player2.height / 2));

    // AI's speed also depends on how far it is from the ball
    aiSpeed += distanceToBall / 100;

    // Ensure AI speed doesn't exceed a max value (e.g., 6)
    return Math.min(aiSpeed, 6);
}


function getBallSpeed() {
    return Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);

}
