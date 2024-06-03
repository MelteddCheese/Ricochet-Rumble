document.addEventListener('DOMContentLoaded', function () {
    const redDisplay = document.getElementById('r_timer');
    const blueDisplay = document.getElementById('b_timer');
    const redTimer = new Timer(5, redDisplay);
    const blueTimer = new Timer(5, blueDisplay);

    // Update the displays initially
    redTimer.updateDisplay();
    blueTimer.updateDisplay();
});

let currentPlayer = 'b'; // Initialize current player

let initial_posn = [];//element_name,position_id,image as innerHtml

let history_moves = [];//history of moves

function insertImage() {
    let n = 0;
    document.querySelectorAll('.box').forEach((image) => {
        if (image.innerText !== '') {
            image.innerHTML = `${image.innerText} <img class='allimg' id="${image.innerText}" src="./resources/${image.innerText}.png" alt="">`;
            initial_posn[n] = [image.innerText, image.id, image.innerHTML];
            image.style.cursor = 'pointer';
            n++;
        }
    });
}

function resetBoxColors() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach((box) => {
        box.style.backgroundColor = 'rgb(241, 241, 241)';
    });
}

function showPossibleMoves(item) {
    if (item.innerText !== '') {
        var getId = item.id;
        var a = parseInt(getId.slice(1));
        // let ay;
        if (item.innerText === 'rcanon' || item.innerText === 'bcanon') {
            var ay = [a + 1, a - 1];
        } else {
            ay = [a + 1, a - 1, a + 10, a - 10, a + 11, a + 9, a - 9, a - 11];
        }

        item.style.backgroundColor = 'pink';

        for (let i = 0; i < ay.length; i++) {
            var targetId = 'b' + ay[i];
            var targetElement = document.getElementById(targetId);
            if (targetElement && targetElement.innerText === '') {
                targetElement.style.backgroundColor = 'green';
            }
        }
        console.log(item.innerText);
        if (
            item.innerText === 'rsemi' ||
            item.innerText === 'bsemi' ||
            item.innerText === 'rricochet' ||
            item.innerText === 'bricochet' ||
            item.innerText === 'rsemi1' ||
            item.innerText === 'bsemi1'
        ) {
            document.getElementById('rotate').style.visibility = 'visible';
            const buttonR = document.getElementById('right-turn');
            const buttonL = document.getElementById('left-turn');

            function rotateRight() {
                var img = document.getElementById(item.innerText);
                console.log(img.style);
                var currentRotation = img.style.transform
                    ? parseInt(img.style.transform.replace('rotate(', '').replace('deg)', ''))
                    : 0;
                var newRotation = currentRotation + 90;

                img.style.transform = `rotate(${newRotation}deg)`;
                document.getElementById('rotate').style.visibility = 'hidden';
                console.log(img.style.transform);
                resetBoxColors();
                buttonR.removeEventListener('click', rotateRight);
                buttonL.removeEventListener('click', rotateLeft);
                console.log(currentPlayer);
                if (currentPlayer === 'r') {
                    redTimer.pause();
                    placeBullet("red", "r");
                    fireBullet("r");
                }
                else if (currentPlayer === 'b') {
                    blueTimer.pause();
                    placeBullet("blue", "b");
                    fireBullet("b");
                }
                currentPlayer = currentPlayer === 'r' ? 'b' : 'r';
            }

            function rotateLeft() {
                var img = document.getElementById(item.innerText);
                var currentRotation = img.style.transform
                    ? parseInt(img.style.transform.replace('rotate(', '').replace('deg)', ''))
                    : 0;
                var newRotation = currentRotation - 90;
                img.style.transform = `rotate(${newRotation}deg)`;
                document.getElementById('rotate').style.visibility = 'hidden';
                console.log(img.style.transform);
                resetBoxColors();
                buttonR.removeEventListener('click', rotateRight);
                buttonL.removeEventListener('click', rotateLeft);
                console.log(currentPlayer);
                if (currentPlayer === 'r') {
                    redTimer.pause();
                    placeBullet("red", "r");
                    fireBullet("r");
                }
                else if (currentPlayer === 'b') {
                    blueTimer.pause();
                    placeBullet("blue", "b");
                    fireBullet("b");
                }
                currentPlayer = currentPlayer === 'r' ? 'b' : 'r';
            }

            buttonR.addEventListener('click', rotateRight);
            buttonL.addEventListener('click', rotateLeft);
        }
    }
}

let clickedcontent;
let clickedId;
var state = true;
// const handleBoxclick = (e) => { };
function setupBoxClickListeners() {
    const boxes = document.querySelector('ul');
    currentPlayer = 'b'; // Starting with blue player
    var bullet = document.getElementById('bullet');
    console.log(bullet);
    if (bullet)
        bullet.style.visibility = "hidden";
    bullet.className = '';
    boxes.addEventListener('click', (e) => {
        const boxName = e.target.tagName === 'IMG' ? e.target.parentNode : e.target;
        const box = document.getElementById(`${boxName.id}`);
        if (state) {
            if (box.innerText.trim().startsWith(currentPlayer) && bullet.style.visibility == 'hidden') {
                resetBoxColors();
                showPossibleMoves(box);
                clickedId = box.id;
                clickedcontent = box.innerHTML;
                if (e.target.tagName === 'IMG') state = false;
            }
        } else if (e.target.tagName !== 'IMG' && clickedId) {
            const item2 = box;
            const a = parseInt(clickedId.slice(1));
            let ay;

            if (document.getElementById(clickedId).innerText === 'rcanon' || document.getElementById(clickedId).innerText === 'bcanon') {
                ay = [a + 1, a - 1];
            } else {
                ay = [a + 1, a - 1, a + 10, a - 10, a + 11, a + 9, a - 9, a - 11];
            }

            let bool = false;
            for (const num of ay) {
                const targetId = 'b' + num;
                if (item2.id === targetId) {
                    bool = true;
                    document.getElementById(clickedId).innerHTML = '';
                    item2.innerHTML = clickedcontent;
                    resetBoxColors();
                    state = true;
                    // placeBullet();
                    // fireBullet();
                    if (currentPlayer === 'r') {
                        redTimer.pause();
                        placeBullet("red", "r");
                        fireBullet("r");
                    }
                    else if (currentPlayer === 'b') {
                        blueTimer.pause();
                        placeBullet("blue", "b");
                        fireBullet("b");
                    }
                    currentPlayer = currentPlayer === 'r' ? 'b' : 'r'; // Switch player
                    // resetBoxColors();
                    break;
                }
            }
            if (!bool) resetBoxColors();
            state = true;
        } else {
            resetBoxColors();
            state = true;
        }
    });
}


insertImage();
resetBoxColors();
setupBoxClickListeners();
resetBoxColors();

function placeBullet(color, c) {
    var canonBox = document.querySelector(`.box:has(img[id$="${c}canon"])`);
    let bullet = document.getElementById('bullet');
    if (!bullet) {
        bullet = document.createElement('div');
        bullet.id = 'bullet';
        bullet.style.width = '20px';
        bullet.style.height = '20px';
        bullet.style.backgroundColor = 'white';
        bullet.style.position = 'absolute';
        bullet.style.visibility = "visible";
        document.body.appendChild(bullet);
        bullet = document.getElementById('bullet');
        console.log('Bullet created:', bullet);
    }
    bullet.style.visibility = "visible";
    console.log(bullet.style.visibility);
    bullet.style.backgroundColor = color;
    console.log("placing bullet");
    console.log(bullet.style.backgroundColor);
    if (canonBox && bullet) {
        canonBox.appendChild(bullet);
        if (c === "r") {
            bullet.style.top = '27.5px';
            bullet.style.bottom = "";
        }
        else if (c === "b") {
            bullet.style.bottom = '27.5px';
            bullet.style.top = "";
        }
        bullet.style.left = '27.5px';
    } else {
        console.error("Canon box or bullet element not found.");
    }
}


function moveRedBullettUp(bullet, targetTop, onComplete) {
    let top = parseInt(window.getComputedStyle(bullet).getPropertyValue("top"));
    if (top > targetTop) {
        if (!isPaused)
            bullet.style.top = (top - 7) + "px"; // Move the bullet down
        //console.log(bullet.style.top);
        requestAnimationFrame(() => moveRedBullettUp(bullet, targetTop, onComplete));
    } else {
        bullet.style.visibility = 'hidden';
        if (onComplete) onComplete();
    }
}

function moveBullettDown(bullet, targetTop, onComplete) {
    let top = parseInt(window.getComputedStyle(bullet).getPropertyValue("top"));
    if (top < targetTop) {
        if (!isPaused)
            bullet.style.top = (top + 7) + "px"; // Move the bullet down
        //console.log(bullet.style.top);
        requestAnimationFrame(() => moveBullettDown(bullet, targetTop, onComplete));
    } else {
        if (onComplete) onComplete();
    }
}

function moveBullettUp(bullet, targetBottom, onComplete) {
    let bottom = parseInt(window.getComputedStyle(bullet).getPropertyValue("bottom"));
    if (bottom < targetBottom) {
        if (!isPaused)
            bullet.style.bottom = (bottom + 7) + "px";
        // Move the bullet up

        requestAnimationFrame(() => moveBullettUp(bullet, targetBottom, onComplete));
    } else {
        if (onComplete) onComplete();
    }
}

function moveBluebulletDown(bullet, targetBottom, onComplete) {
    let bottom = parseInt(window.getComputedStyle(bullet).getPropertyValue("bottom"));
    if (bottom > targetBottom) {
        if (!isPaused)
            bullet.style.bottom = (bottom - 7) + "px"; // Move the bullet up
        requestAnimationFrame(() => moveBluebulletDown(bullet, targetBottom, onComplete));
    } else {
        if (onComplete) onComplete();
    }
}

function moveBulletLeft(bullet, targetRight, onComplete) {
    let left = parseInt(window.getComputedStyle(bullet).getPropertyValue("left"));
    // targetRight = -(targetRight - 75);
    if (left > targetRight) {
        if (!isPaused)
            bullet.style.left = (left - 7) + "px"; // Move the bullet left
        //console.log(bullet.style.left);
        requestAnimationFrame(() => moveBulletLeft(bullet, targetRight, onComplete));
    } else {
        if (onComplete) onComplete();
    }
}

function moveBulletRight(bullet, targetLeft, onComplete) {
    let left = parseInt(window.getComputedStyle(bullet).getPropertyValue("left"));
    if (left < targetLeft) {
        if (!isPaused)
            bullet.style.left = (left + 7) + "px"; // Move the bullet right
        //console.log(bullet.style.left);
        requestAnimationFrame(() => moveBulletRight(bullet, targetLeft, onComplete));
    } else {
        if (onComplete) onComplete();
    }
}


function calc_dist(bullet, color, posn, canon_posn) {
    row = parseInt(posn.slice(1, 2));
    col = parseInt(posn.slice(2));
    console.log(row);
    console.log(col);
    canon_col = parseInt(canon_posn.slice(2));
    console.log(bullet.className);
    var present = false;
    var box_size = document.querySelector('.box').offsetWidth;
    box_size -= 3;
    var bullet = document.getElementById('bullet');
    var bullet_size = bullet.offsetWidth;
    if (bullet.className == "down" || bullet.className == "up") {
        //var stopid;
        //var stop
        if (bullet.className == 'down') {
            var i = row - 1;
            while (i > 0) {
                var id = 'b' + i + col;
                var newDiv = document.getElementById(id);
                if (newDiv && newDiv.innerHTML !== '') {
                    present = true;
                    console.log(i);
                    break;
                }
                i--;
            }
        }
        else {
            var i = row + 1;
            console.log(i);
            while (i <= 8) {
                var id = 'b' + i + col;
                var newDiv = document.getElementById(id);
                console.log(newDiv.innerText);
                if (newDiv && newDiv.innerHTML !== '') {
                    present = true;
                    console.log(i);
                    break;
                }
                i++;
            }
        }
        console.log(i);
        if (color == 'red') {
            var dist = (8 - i) * box_size + (box_size - bullet_size) / 2;
        }
        else if (color == 'blue') {
            var dist = (i - 1) * box_size + (box_size - bullet_size) / 2;
            console.log(dist);
        }
    }
    else if (bullet.className == 'left' || bullet.className == 'right') {
        if (bullet.className == 'left') {
            var i = col - 1;
            while (i > 0) {
                var id = 'b' + row + i;
                var newDiv = document.getElementById(id);
                if (newDiv && newDiv.innerHTML !== '') {
                    present = true;
                    break;
                }
                i--;
            }
        }
        else {
            var i = col + 1;
            while (i <= 8) {
                var id = 'b' + row + i;
                var newDiv = document.getElementById(id);
                if (newDiv && newDiv.innerHTML !== '') {
                    present = true;
                    break;
                }
                i++;
            }
        }
        var dist = (Math.abs(canon_col - i)) * box_size + (box_size - bullet_size) / 2;
    }
    if (present == true) {
        console.log("element found");
        console.log(newDiv.innerText);
        return [dist, newDiv, id];//distance,stopele,stopid
    }
    else {
        console.log('free path');
        console.log(dist);
        dist -= box_size;
        return [dist, false, false];//dist,no element,no id
    }
}

function checkele(bullet, stopele, c) {
    bulletDirection = bullet.classList[0];
    console.log(bulletDirection);
    console.log(stopele.innerText);
    var opp = c == 'r' ? 'b' : 'r';
    //alert(c);
    if (stopele.innerText == `${opp}titan`) {
        //alert(`${c} won`);
        removeTitanImage(stopele.id);
        const bullet = document.getElementById('bullet');
        //console.log(currentPlayer);
        //console.log(bullet.parentElement);
        var canonBox = document.querySelector(`.box:has(img[id$="${c}canon"])`);
        //console.log(canonBox);
        canonBox.removeChild(bullet);
        var team = c == 'r' ? 'RED' : 'BLUE';
        document.getElementById('loseMessage').innerText = `${team} WON`;
        return false;
    }
    else if (stopele.innerText == 'rsemi' || stopele.innerText == 'bsemi') {
        var img = document.getElementById(stopele.innerText);
        //console.log(img.style);
        var rot = img.style.transform
            ? parseInt(img.style.transform.replace('rotate(', '').replace('deg)', ''))
            : 0;
        if (rot < 0) {
            rot = Math.abs(rot) + 180;
        }
        var value = (rot / 90) % 4;
        //var new_dir;
        var semiRicochetMap = {
            0: { 'up': 'false', 'down': 'left', 'left': 'false', 'right': 'up' },
            1: { 'up': 'false', 'down': 'right', 'left': 'up', 'right': 'false' },
            2: { 'up': 'right', 'down': 'false', 'left': 'down', 'right': 'false' },
            3: { 'up': 'left', 'down': 'false', 'left': 'false', 'right': 'down' }
        };
        console.log(semiRicochetMap[value][bulletDirection]);
        return semiRicochetMap[value][bulletDirection];
    }
    else if (stopele.innerText == 'rricochet' || stopele.innerText == 'bricochet') {
        var img = document.getElementById(stopele.innerText);
        console.log(img.style.transform);
        var rot = img.style.transform
            ? parseInt(img.style.transform.replace('rotate(', '').replace('deg)', ''))
            : 0;
        if (rot < 0) {
            rot = Math.abs(rot);
        }
        console.log(`rotate1 ${rot}`);
        var value = (rot / 90) % 2;
        console.log(`rotate2 ${value}`);
        var ricochetMap = {
            0: { 'up': 'right', 'down': 'left', 'left': 'down', 'right': 'up' },
            1: { 'up': 'left', 'down': 'right', 'left': 'up', 'right': 'down' }
        };
        console.log(ricochetMap[value][bulletDirection]);
        return ricochetMap[value][bulletDirection];
    }
    else {
        bullet.style.visibility = 'hidden';
        return 'false';
    }
}


function moveupBulletRed(stopele, c) {
    console.log("red bullet moving");
    var bullet = document.getElementById('bullet');
    var bulletDirection = bullet.classList[0];
    console.log(bulletDirection);
    console.log(stopele);
    var canonBox = bullet.parentElement;
    bullet.style.visibility = "visible";
    var canonid = canonBox.id;
    var color = 'red';

    // Calculate distance to next obstacle
    var movement = calc_dist(bullet, color, stopele, canonid);
    var dist = movement[0];
    var stopele1 = movement[1];
    var stopid = movement[2];
    console.log(movement);
    console.log(dist);
    console.log(stopele1);
    console.log(stopid);

    // Recursive movement handling
    const handleMovement = () => {
        console.log('handlemovement called !!');
        if (stopele) {
            var newDirection = checkele(bullet, stopele1, 'r');
            if (newDirection && newDirection !== 'false') {
                bullet.classList.remove('up', 'down', 'left', 'right', 'false');
                bullet.classList.add(newDirection);
                console.log(bullet.className);
                console.log(stopid);
                moveupBulletRed(stopid, c); // Recursively move bullet in the new direction
            } else {
                if (stopele1.innerText == 'btitan') {
                    bullet.style.visibility = 'hidden';
                    redTimer.pause();
                    blueTimer.pause();
                    showGameOverScreen();
                }
                else {
                    bullet.style.visibility = 'hidden';
                    blueTimer.start();
                    var player_tog = document.getElementById('tog');
                    player_tog.innerText = "BLUE'S TURN";
                    player_tog.style.color = "blue";

                }
            }
        } else {
            bullet.style.visibility = 'hidden';
        }
    };

    switch (bulletDirection) {
        case 'up':
            console.log('red bullet movement initiated up');
            moveRedBullettUp(bullet, dist, handleMovement);
            break;
        case 'down':
            console.log('red bullet movement initiated down');
            moveBullettDown(bullet, dist, handleMovement);
            break;
        case 'left':
            console.log('red bullet movement initiated left');
            dist = -(dist - 75);
            moveBulletLeft(bullet, dist, handleMovement);
            break;
        case 'right':
            console.log('red bullet movement initiated right');
            moveBulletRight(bullet, dist, handleMovement);
            break;
        default:
            bullet.style.visibility = 'hidden';
    }
}

function moveupBulletBlue(stopele, c) {
    console.log("blue bullet moving");
    var bullet = document.getElementById('bullet');
    var bulletDirection = bullet.classList[0];
    console.log(bulletDirection);
    console.log(stopele);
    var canonBox = bullet.parentElement;
    bullet.style.visibility = "visible";
    console.log(bullet.style.visibility);
    var canonid = canonBox.id;
    var color = 'blue';

    // Calculate distance to next obstacle
    var movement = calc_dist(bullet, color, stopele, canonid);
    var dist = movement[0];
    var stopele1 = movement[1];
    var stopid = movement[2];
    console.log(movement);
    console.log(dist);
    console.log(stopele1);

    // Recursive movement handling
    var handleMovement = () => {
        console.log('handlemovement called !!');
        if (stopele) {
            var newDirection = checkele(bullet, stopele1, 'b');
            if (newDirection && newDirection !== 'false') {
                bullet.classList.remove('up', 'down', 'left', 'right', 'false');
                bullet.classList.add(newDirection);
                moveupBulletBlue(stopid, c); // Recursively move bullet in the new direction
            } else {
                if (stopele1.innerText == 'rtitan') {
                    console.log(bullet);
                    bullet.style.visibility = 'hidden';
                    redTimer.pause();
                    blueTimer.pause();
                    showGameOverScreen();
                }
                else {
                    bullet.style.visibility = 'hidden';
                    redTimer.start();
                    var player_tog = document.getElementById('tog');
                    player_tog.innerText = "RED'S TURN";
                    player_tog.style.color = "red";
                }
            }
        } else {
            bullet.style.visibility = 'hidden';
        }
    };

    switch (bulletDirection) {
        case 'up':
            console.log('bullet movement initiated up');
            moveBullettUp(bullet, dist, handleMovement);
            break;
        case 'down':
            console.log('bullet movement initiated down');
            moveBluebulletDown(bullet, dist, handleMovement);
            break;
        case 'left':
            console.log('bullet movement initiated left');
            dist = -(dist - 75);
            moveBulletLeft(bullet, dist, handleMovement);
            break;
        case 'right':
            console.log('bullet movement initiated right');
            moveBulletRight(bullet, dist, handleMovement);
            break;
        default:
            bullet.style.visibility = 'hidden';
    }
}

function fireBullet(c) {
    const bullet = document.getElementById('bullet');
    if (bullet) {
        if (c === "r") {
            bullet.classList.remove('up', 'down', 'left', 'right', 'false');
            bullet.classList.add('down');
            var canonBox = bullet.parentElement;
            var canonid = canonBox.id;
            console.log(canonid);
            moveupBulletRed(canonid);
        }
        else if (c === "b") {
            bullet.classList.remove('up', 'down', 'left', 'right', 'false');
            bullet.classList.add('up');
            //console.log(bullet.classList[0]);
            var canonBox = bullet.parentElement;
            var canonid = canonBox.id;
            console.log(canonid);
            moveupBulletBlue(canonid);
        }
    }
}

function removeTitanImage(boxId) {
    const box = document.getElementById(boxId);
    if (box) {
        const img = box.querySelector('img');
        if (img) {
            img.remove();
            console.log(`Removed titan image from ${boxId}`);
        } else {
            console.log(`No image found in ${boxId}`);
        }
    } else {
        console.log(`No box found with ID ${boxId}`);
    }
}

class Timer {
    constructor(startMinutes, displayElement) {
        this.startMinutes = startMinutes;
        this.currentTime = startMinutes * 60;
        this.displayElement = displayElement;
        this.interval = null;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    updateDisplay() {
        this.displayElement.textContent = this.formatTime(this.currentTime);
    }

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.updateDisplay();
            } else {
                clearInterval(this.interval);
                this.interval = null;
                if (displayElement.id == 'r_timer') {
                    document.getElementById('loseMessage').innerText = 'BLUE WON DUE TO TIMEOUT !';
                    showGameOverScreen();
                }
                else if (displayElement.id == 'b_timer') {
                    document.getElementById('loseMessage').innerText = 'RED WON DUE TO TIMEOUT !';
                    showGameOverScreen();
                }
            }
        }, 1000);
    }

    pause() {
        clearInterval(this.interval);
        this.interval = null;
    }

    reset() {
        this.pause();
        this.currentTime = this.startMinutes * 60;
        this.updateDisplay();
    }
}

// Initialize timers for both sides
const redDisplay = document.getElementById('r_timer');
const blueDisplay = document.getElementById('b_timer');
const redTimer = new Timer(5, redDisplay);
const blueTimer = new Timer(5, blueDisplay);

// Update the displays initially
redTimer.updateDisplay();
blueTimer.updateDisplay();

let isPaused = false;

document.getElementById("pauseButton").addEventListener("click", function () {
    isPaused = true;
    if (currentPlayer == 'r') {
        redTimer.pause();
    }
    else if (currentPlayer == 'b') {
        blueTimer.pause();
    }
    document.getElementById("pausedScreen").style.display = "flex"; // Show the paused screen
});

document.getElementById("playButtonPaused").addEventListener("click", function () {
    isPaused = false;
    document.getElementById("pausedScreen").style.display = "none"; // Hide the paused screen
    if (currentPlayer == 'r') {
        redTimer.start();
    }
    else if (currentPlayer == 'b') {
        blueTimer.start();
    }
});

function showGameOverScreen() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'flex';
}

document.getElementById("replayButton").addEventListener("click", function () {
    console.log("replay button clicked");
    resetGame();
});

document.getElementById("resetButton").addEventListener("click", function () {
    resetGame();
});


function resetGame() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'none';

    document.querySelectorAll('.box').forEach((box) => {
        var bullet1 = box.querySelector('#bullet');
        console.log(bullet1);
        if (bullet1) {
            console.log('Box with bullet found:', box.id);
        }
        box.innerHTML = '';
        box.style.cursor = '';
    });

    initial_posn.forEach(([element_name, position_id, innerHTML]) => {
        const box = document.getElementById(position_id);
        box.innerText = element_name;
        box.innerHTML = innerHTML;
        box.style.cursor = 'pointer';
    });
    resetBoxColors();
    currentPlayer = 'b';
    document.getElementById('tog').style.color = 'blue';
    document.getElementById('tog').innerText = "BLUE'S TURN";
    state = true;
    clickedId = null;
    clickedcontent = null;
    //setupBoxClickListeners();
    document.getElementById('rotate').style.visibility = 'hidden';
    redTimer.reset();
    blueTimer.reset();
}