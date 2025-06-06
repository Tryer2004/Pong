// === Game Settings === //
let paused = false;
let isSinglePlayer = true;
let aiDifficulty = "medium"; // Options: easy, medium, hard and harder
const MAX_BALL_SPEED = 8;
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

let coinsAwarded = false;
let playerData = {
    coins: 0,
    purchasedItems: [],
    selectedItem: null// item they own
}
const MAX_AI_SPEED = 7;
let selectedBallColor = "white";

// === Shop System ===
const shopItems = {
    red:    { cost:  5, color: "red",    width: 10, height: 10 },
    blue:   { cost: 10, color: "blue",   width: 10, height: 10 },
    green:  { cost: 15, color: "green",  width: 10, height: 10 },
    yellow: { cost: 20, color: "yellow", width: 20, height: 20 },
    purple: { cost: 30, color: "purple", width: 10, height: 10 },
    orange: { cost: 50, color: "orange", width:7, height : 7 }, 
}; 

function buyItem(itemKey) {
    const item = shopItems[itemKey];
    if (!item) return;

    if (!playerData.purchasedItems.includes(itemKey)) {
        if (playerData.coins >= item.cost) {
            playerData.coins -= item.cost;
            playerData.purchasedItems.push(itemKey);
        } else {
            alert("Not enough coins!");
            return;
        }
    }

    playerData.selectedItem = itemKey;
    applyItemToBall(itemKey);
    savePlayerData();
    updateCoinDisplay();
}
 //==update the Coin Display==/
function updateCoinDisplay() {
    const coinDisplay = document.getElementById ("coin-count");
    if (coinDisplay) coinDisplay.textContent = playerData.coins;

}
function toggleShop() {
    const shop = document.getElementById("shop");
    shop.style.display = shop.style.display === "none" ? "block" : "none";
} 

// === Player and Ball Dimensions ===
let playerWidth = 10;
let playerHeight = 50;
let ballWidth = 10;
let ballHeight = 10;

// === Scores & Game State ===
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
//==WINDOW.Onload===//
window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    try {
        let savedPlayerData = localStorage.getItem("pongPlayerData");
        if (savedPlayerData) {
            playerData = JSON.parse(savedPlayerData);
            coins = playerData.coins || 0;

            if (playerData.selectedItem) {
                applyItemToBall(playerData.selectedItem);
            }
        } else {
            playerData = {
                coins: 0,
                purchasedItems: [],
                selectedItem: null
            };
            coins = 0;
        }  
    } catch (e) {
        console.error("Failed to load player data:", e);
        // fallback
        playerData = {
            coins: 0,
            purchasedItems: [],
            selectedItem: null
        };
        coins = 0;
    } if (playerData.selectedItem) {
        applyItemToBall(playerData.selectedItem);
    }
    

    updateCoinDisplay();
    if (typeof updateShopUI === "function") updateShopUI();

    // The rest of your setup
    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);
    document.addEventListener("keydown", function (e) {
        if (e.code === "Space" && gameOver) restartGame();
        else if (e.code === "KeyM") isSinglePlayer = !isSinglePlayer;
        else if (e.code === "Digit1") aiDifficulty = "easy";
        else if (e.code === "Digit2") aiDifficulty = "medium";
        else if (e.code === "Digit3") aiDifficulty = "hard";
        else if (e.code === "Digit4") aiDifficulty = "harder";
        else if (e.code === "Digit5") aiDifficulty = "impossible";
        else if (e.code === "KeyP") {
            paused = !paused;
            if (!paused && !gameOver) requestAnimationFrame(update);
        } else if (e.code === "KeyE") toggleShop();
    });

    resetBall(0);
          // example reward logic inside a conditional, e.g.:
    if (player1Score >= 5 && isSinglePlayer && !coinsAwarded) {
        let reward = 0;
        if (aiDifficulty === "easy") reward = 1;
        else if (aiDifficulty === "medium") reward = 5;
        else if (aiDifficulty === "hard") reward = 15;
        else if (aiDifficulty === "harder") reward = 25;
        else if (aiDifficulty === "impossible") reward = 30;

        playerData.coins += reward;
        savePlayerData(); // Save updated playerData
        updateCoinDisplay();
        console.log(`You won! Coins earned: ${reward}. Total coins: ${playerData.coins}`);
        coinsAwarded = true;
    }

    requestAnimationFrame(update);
};
       



// === Game Loop ===//
function update() {
    context.clearRect(0, 0, boardWidth, boardHeight);

    if (paused) {
        context.fillStyle = "white";
        context.font = "30px Arial";
        context.fillText("Paused", boardWidth / 2 - 50, boardHeight / 2);
        return;
    }

    if (player2Score >= 5 || player1Score >= 5) {
        gameOver = true;

        coins += reward;
        localStorage.setItem("pongCoins", coins);
        updateCoinDisplay();
        console.log(`You won! Coins earned: ${reward}. Total coins: ${coins}`);
        

        
            localStorage.setItem("pongCoins", coins);
            updateCoinDisplay();
            console.log(`You won! Coins earned: ${reward}. Total coins: ${coins}`);
            coinsAwarded = true;
        } 
    
        // Draw center line
        for (let y = 0; y < boardHeight; y += 20) {
            context.fillStyle = "gray";
            context.fillRect(boardWidth / 2 - 1, y, 2, 10);
        }
        context.fillText ("Coins:" + playerData.coins, 10, 50);
        // Player 1 move
        let nextY1 = player1.y + player1.velocityY;
        if (!outOfBounds(nextY1, player1.height)) player1.y = nextY1;

        if (isSinglePlayer) {
            const targetY = ball.y + ball.height / 2 - (player2.y + player2.height / 2);
            player2.velocityY += Math.sign(targetY) * getAIAccel();
            player2.velocityY = Math.max(-MAX_AI_SPEED, Math.min(MAX_AI_SPEED, player2.velocityY));

            let newY = player2.y + player2.velocityY + (Math.random() * 2 - 1) * getAIError();
            if (!outOfBounds(newY, player2.height)) player2.y = newY;
        } else {
            let nextY2 = player2.y + player2.velocityY;
            if (!outOfBounds(nextY2, player2.height)) player2.y = nextY2;
        }
       context.fillText ("Coins:" + playerData.coins, 10, 50);
        // Move ball
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
            ball.velocityY *= -1;
        }

        if (detectCollision(ball, player1)) reflectBall(ball, player1, 1);
        if (detectCollision(ball, player2)) reflectBall(ball, player2, -1);

        if (ball.x < 0) {
            player2Score++;
            if (player2Score >= 5) gameOver = true;
            resetBall(2);
        } else if (ball.x > boardWidth) {
            player1Score++;
            if (player1Score >= 5) {
                gameOver = true;
        
                if (isSinglePlayer && !coinsAwarded) {
                    let reward = 0;
                    if (aiDifficulty === "easy") reward = 1;
                    else if (aiDifficulty === "medium") reward = 5;
                    else if (aiDifficulty === "hard") reward = 15;
                    else if (aiDifficulty === "harder") reward = 25;
                    else if (aiDifficulty === "impossible") reward = 30;
        
                    playerData.coins += reward;
                    savePlayerData();
                    updateCoinDisplay();
                    console.log(`You won! Coins earned: ${reward}. Total coins: ${playerData.coins}`);
                    coinsAwarded = true;
                }
            }
            resetBall(1);
        }
        

        // Draw
        context.fillStyle = "white";
        context.fillRect(player1.x, player1.y, player1.width, player1.height);
        context.fillRect(player2.x, player2.y, player2.width, player2.height);

       
        context.fillStyle = selectedBallColor;
        context.fillRect(ball.x, ball.y, ball.width, ball.height);

        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText("Player 1: " + player1Score, 10, 20);
        context.fillText("Player 2: " + player2Score, boardWidth - 120, 20);
        context.fillText("Mode: " + (isSinglePlayer ? "Single Player" : "Multiplayer"), boardWidth / 2 - 70, 20);

        if (isSinglePlayer) {
            context.fillText("AI: " + aiDifficulty.toUpperCase(), boardWidth / 2 - 40, 40);
        }
        
        if (gameOver) {
            context.fillStyle = "white";
            context.font = "30px Arial";
            let winner = player1Score >= 5 ? "Player 1 Wins!" : "Player 2 Wins!";
            context.fillText(winner, boardWidth / 2 - context.measureText(winner).width / 2, boardHeight / 2);
            context.font = "20px Arial";
            context.fillText("Press Space to Restart", boardWidth / 2 - 110, boardHeight / 2 + 30);
        } else {
            requestAnimationFrame(update);
        } }
        

// === Controls ===
function movePlayer(e) {
    let speed = getBallSpeed();
    if (e.code === "KeyW") player1.velocityY = -speed;
    if (e.code === "KeyS") player1.velocityY = speed;
    if (!isSinglePlayer) {
        if (e.code === "ArrowUp") player2.velocityY = -speed;
        if (e.code === "ArrowDown") player2.velocityY = speed;
    }
}

function stopPlayer(e) {
    if (["KeyW", "KeyS"].includes(e.code)) player1.velocityY = 0;
    if (["ArrowUp", "ArrowDown"].includes(e.code)) player2.velocityY = 0;
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
function savePlayerData() {
    localStorage.setItem("pongPlayerData", JSON.stringify(playerData));
}

function reflectBall(ball, paddle, direction) {
    let collidePoint = ball.y + ball.height / 2 - (paddle.y + paddle.height / 2);
    collidePoint = collidePoint / (paddle.height / 2);
    let angleRad = collidePoint * Math.PI / 4;
    let speed = Math.hypot(ball.velocityX, ball.velocityY) * 1.2;
    ball.velocityX = direction * speed * Math.cos(angleRad);
    ball.velocityY = speed * Math.sin(angleRad);
    ball.x = direction === 1 ? paddle.x + paddle.width : paddle.x - ball.width;
}   //======Purple and Orange ball=====/
    let cap = MAX_BALL_SPEED;
if (selectedBallColor === "purple") cap = 12;
if (selectedBallColor === "orange") cap = 20;

let current = Math.hypot(ball.velocityX, ball.velocityY);
if (current > cap) {
    let scale = cap / current;
    ball.velocityX *= scale;
    ball.velocityY *= scale;
}


selectedBallColor
function resetBall(playerScored) {
    ball.x = boardWidth / 2 - ball.width / 2;
    ball.y = boardHeight / 2 - ball.height / 2;

    ball.velocityX = playerScored === 1 ? 2 : playerScored === 2 ? -2 : (Math.random() < 0.5 ? -2 : 2);
    ball.velocityY = 0;

    const item = Object.values(shopItems).find(i => i.color === selectedBallColor);
    if (item) {
        ball.width = item.width;
        ball.height = item.height;
    }
}

function restartGame() {
    gameOver = false;
    coinsAwarded = false;
    player1Score = 0;
    player2Score = 0;
    player1.y = boardHeight / 2 - playerHeight / 2;
    player2.y = boardHeight / 2 - playerHeight / 2;
    resetBall(0);
    requestAnimationFrame(update);
}

function getBallSpeed() {
    return Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
}

function getAISpeed() {
    let ballSpeed = getBallSpeed();
    let difficultyFactor = { easy: 0.55, medium: 0.65, hard: 0.8, harder:0.9 }[aiDifficulty] || 0.55;
    let aiSpeed = ballSpeed * difficultyFactor + Math.abs(ball.y + ball.height / 2 - (player2.y + player2.height / 2)) / 100;
    return Math.min(aiSpeed, MAX_AI_SPEED);
}

function getAIError() {
    switch (aiDifficulty) {
        case "easy": return 1.2;
        case "medium": return 0.6;
        case "hard": return 0.3;
        case "harder": return 0.1;
        case "impossible": return 0.01;
        default: return 0.6;
    }
}

function getAIAccel() {
    switch (aiDifficulty) {
        case "easy": return 0.25;
        case "medium": return 0.4;
        case "hard": return 0.7;
        case "harder": return 0.9;
        case "impossible":return 0.99
        default: return 0.4;
    }
}
function applyItemToBall(itemKey) {
    const item = shopItems [itemKey];
    if (!item) return;
    selectedBallColor = item.color;
    ball.width = item.width;
    ball.height = item.height;

}
