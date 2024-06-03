document.addEventListener('DOMContentLoaded', function () {
    const redDisplay = document.getElementById('r_timer');
    const blueDisplay = document.getElementById('b_timer');
    const redTimer = new Timer(5, redDisplay);
    const blueTimer = new Timer(5, blueDisplay);

    // Update the displays initially
    redTimer.updateDisplay();
    blueTimer.updateDisplay();
});

var movement_sound = new Track_sound("./move.wav");
var vanish_sound = new Track_sound("./vanishing.mp3");
var game_sound = new Track_sound("./game theme loop.wav");

function Track_sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}
game_sound.sound.loop = true;
game_sound.sound.volume = 0.4;
game_sound.play();


let currentPlayer = 'b'; // Initialize current player

let initial_posn = [];//element_name,position_id,image as innerHtml, removed value, removed_item id

let movements_store = [];

let redo_arr = [];

let swap_arr = [];

let history_moves = [];//history of moves as text
var history_final = '';

var bot_positions = [];
function getBotPositions() {
    return new Promise((resolve, reject) => {
        try {
            let a = document.getElementById('rtitan').parentElement.id;
            let b = document.getElementById('rtank').parentElement.id;
            let c = document.getElementById('rsemi').parentElement.id;
            let d = document.getElementById('rricochet').parentElement.id;
            let e = document.getElementById('rcanon').parentElement.id;
            bot_positions = [a, b, c, d, e];
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}
var bot_greenTiles = [];
function botSelectElement() {
    return new Promise((resolve, reject) => {
        try {
            const randomNumber = Math.floor(Math.random() * 5);
            let element = document.getElementById(bot_positions[randomNumber]);
            var getId = element.id;
            var a = parseInt(getId.slice(1));
            var ay;
            if (element.innerText === 'rcanon' || element.innerText === 'bcanon') {
                ay = [a + 1, a - 1];
            } else {
                ay = [a + 1, a - 1, a + 10, a - 10, a + 11, a + 9, a - 9, a - 11];
            }

            element.style.backgroundColor = 'pink';

            for (let i = 0; i < ay.length; i++) {
                var targetId = 'b' + ay[i];
                var targetElement = document.getElementById(targetId);
                if (targetElement && targetElement.innerText === '') {
                    targetElement.style.backgroundColor = 'green';
                    bot_greenTiles.push(targetId);
                }
            }
            bot_move(element);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function bot_move(element) {
    const randomNumber = Math.floor(Math.random() * bot_greenTiles.length);
    let moved_position = bot_greenTiles[randomNumber];
    let movedvalue = element.innerHTML;
    let initialId = element.id;
    if (element.innerText == 'rsemi' || element.innerText == 'rricochet') {
        const ch = Math.floor(Math.random() * 3);
        if (ch == 0) {
            document.getElementById(moved_position).innerHTML = element.innerHTML;
            element.innerHTML = '';
        }
        else if (ch == 1) {
            let img = document.getElementById(element.innerText);
            let currentRotation = img.style.transform
                ? parseInt(img.style.transform.replace('rotate(', '').replace('deg)', ''))
                : 0;
            var newRotation = currentRotation + 90;
            img.style.transform = `rotate(${newRotation}deg)`;
        }
        else {
            let img = document.getElementById(element.innerText);
            let currentRotation = img.style.transform
                ? parseInt(img.style.transform.replace('rotate(', '').replace('deg)', ''))
                : 0;
            var newRotation = currentRotation - 90;
            img.style.transform = `rotate(${newRotation}deg)`;
        }
    }
    else {
        document.getElementById(moved_position).innerHTML = element.innerHTML;
        element.innerHTML = '';
    }
    resetBoxColors();
    bot_positions = [];
    bot_greenTiles = [];
}

async function botTurn() {
    try {
        await getBotPositions();
        await botSelectElement();
        redTimer.pause();
        placeBullet("red", "r");
        fireBullet("r");
        currentPlayer = 'b';
    } catch (error) {
        console.error('Error during bot turn:', error);
    }
}

function generateRandomPositions() {
    const boardSize = 8;
    const ids = new Set();

    function getRandomPosition(rowRange) {
        let position;
        do {
            const row = Math.floor(Math.random() * rowRange.length);
            const col = Math.floor(Math.random() * boardSize) + 1;
            position = `b${rowRange[row]}${col}`;
        } while (ids.has(position));
        ids.add(position);
        return position;
    }

    let positions = [];
    positions.push(['rtitan', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['rtank', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['rsemi', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['rricochet', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['rcanon', getRandomPosition([8])]);

    positions.push(['btitan', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['btank', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['bsemi', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['bricochet', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['bcanon', getRandomPosition([1])]);

    for (i in positions) {
        let a = document.getElementById(positions[i][1]);
        a.innerHTML = `${positions[i][0]} <img class='allimg' id="${positions[i][0]}" src="./resources/${positions[i][0]}.png" alt="">`;
        initial_posn.push([positions[i][0], positions[i][1], a.innerHTML]);
        a.style.cursor = 'pointer';
    }
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
            item.innerText === 'bsemi1' ||
            item.innerText === 'rricochet1' ||
            item.innerText === 'bricochet1'
        ) {
            let change = false;
            document.getElementById('rotate').style.visibility = 'visible';
            document.getElementById("swap").classList.remove("show");
            document.getElementById("swap").classList.add("hidden");
            const buttonR = document.getElementById('right-turn');
            const buttonL = document.getElementById('left-turn');

            if (item.innerText === 'rricochet' ||
                item.innerText === 'bricochet' || item.innerText === 'rricochet1' ||
                item.innerText === 'bricochet1') {
                document.getElementById("swap").classList.remove("hidden");
                document.getElementById("swap").classList.add("show");
                var swap_button = document.getElementById('swap');
                swap_button.addEventListener('click', swap_rico);
            }

            function swap_rico() {
                swapped = true;
                change = true;
                document.getElementById('rotate').style.visibility = 'hidden';
                document.getElementById("swap").classList.remove("show");
                document.getElementById("swap").classList.add("hidden");
                resetBoxColors();
                document.querySelectorAll('.box').forEach((image) => {
                    if (image.innerHTML !== '') {
                        if (image.innerHTML !== item.innerHTML && image.innerText !== 'rtitan' && image.innerText !== 'btitan' && image.innerText !== 'bcanon' && image.innerText !== 'rcanon') {
                            swap_arr.push(image.id);
                            image.style.backgroundColor = 'yellow';
                        }
                    }
                    //console.log(swap_arr);
                })
                buttonR.removeEventListener('click', rotateRight);
                buttonL.removeEventListener('click', rotateLeft);
                swap_button.removeEventListener('click', swap_rico);
            }

            function rotateRight() {
                change = true;
                var img = document.getElementById(item.innerText);
                document.getElementById('rotate').style.visibility = 'hidden';
                console.log(img.style);
                var currentRotation = img.style.transform
                    ? parseInt(img.style.transform.replace('rotate(', '').replace('deg)', ''))
                    : 0;
                var newRotation = currentRotation + 90;

                img.style.transform = `rotate(${newRotation}deg)`;
                //document.getElementById('rotate').style.visibility = 'hidden';
                //console.log(img.style.transform);
                resetBoxColors();
                buttonR.removeEventListener('click', rotateRight);
                buttonL.removeEventListener('click', rotateLeft);

                if (item.innerText === 'rricochet' ||
                    item.innerText === 'bricochet' || item.innerText === 'rricochet1' ||
                    item.innerText === 'bricochet1') {
                    swap_button.removeEventListener('click', swap_rico);
                }

                console.log(currentPlayer);
                movements_store.push([item.id, newRotation, currentRotation]);
                history_moves.push(`${item.innerText} rotated right`);
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
                change = true;
                var img = document.getElementById(item.innerText);
                document.getElementById('rotate').style.visibility = 'hidden';
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
                if (item.innerText === 'rricochet' ||
                    item.innerText === 'bricochet' || item.innerText === 'rricochet1' ||
                    item.innerText === 'bricochet1') {
                    swap_button.removeEventListener('click', swap_rico);
                }
                movements_store.push([item.id, newRotation, currentRotation]);
                history_moves.push(`${item.innerText} rotated left`);
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
            if (change) {
                document.getElementById('rotate').style.visibility = 'hidden';
            }
        }
    }
}

let clickedcontent;
let clickedId;
var state = true;
var swapped = false;
//const handleBoxclick = (e) => { };
function setupBoxClickListeners() {
    const boxes = document.querySelector('ul');
    currentPlayer = 'b'; // Starting with blue player
    var bullet = document.getElementById('bullet');
    console.log(bullet);
    if (bullet)
        bullet.style.visibility = "hidden";
    bullet.className = '';
    boxes.addEventListener('click', (e) => {
        if (currentPlayer == 'b') {
            const boxName = e.target.tagName === 'IMG' ? e.target.parentNode : e.target;
            const box = document.getElementById(`${boxName.id}`);
            document.getElementById('rotate').style.visibility = 'hidden';
            const buttonR = document.getElementById('right-turn');
            const buttonL = document.getElementById('left-turn');
            const newButtonR = buttonR.cloneNode(true);
            buttonR.parentNode.replaceChild(newButtonR, buttonR);
            const newButtonL = buttonL.cloneNode(true);
            buttonL.parentNode.replaceChild(newButtonL, buttonL);
            if (state) {
                if (box.innerText.trim().startsWith(currentPlayer) && bullet.style.visibility == 'hidden') {
                    if (undo_done) {
                        undo_done = false;
                        redo_arr = [];
                    }
                    resetBoxColors();
                    showPossibleMoves(box);
                    clickedId = box.id;
                    clickedcontent = box.innerHTML;
                    if (e.target.tagName === 'IMG') state = false;
                }
            }
            else if (swapped && clickedId) {
                const item2 = box;
                let bool = false;
                for (const num of swap_arr) {
                    //console.log(num);
                    if (item2.id === num) {
                        bool = true;
                        movements_store.push([0, clickedId, item2.id]);
                        history_moves.push(`${document.getElementById(clickedId).innerText} swapped with ${item2.innerText}`);
                        let store = document.getElementById(clickedId).innerHTML;
                        document.getElementById(clickedId).innerHTML = item2.innerHTML;
                        item2.innerHTML = store;
                        console.log('elements swapped');
                        resetBoxColors();
                        state = true;
                        swapped = false;
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
            }

            else if (e.target.tagName !== 'IMG' && clickedId) {
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
                        movements_store.push([clickedcontent, clickedId, item2.id]);
                        history_moves.push(`${document.getElementById(clickedId).innerText} moved from ${clickedId.slice(1)} to ${item2.id.slice(1)}`);
                        console.log(movements_store);
                        console.log(history_moves);
                        document.getElementById('rotate').style.visibility = 'hidden';
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
        }
    });
    //placeBullet();
}

generateRandomPositions();
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
        arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.innerHTML = '<img id="arrow_img" src="./resources/arrow.png" alt="">';
        bullet.appendChild(arrow);
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
    box_size += 2;
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
        var removed_value = stopele.innerHTML;
        let a = movements_store[movements_store.length - 1];
        a.push(removed_value, stopele.id);
        movements_store.splice(-1);
        movements_store.push(a);
        let b = history_moves[history_moves.length - 1];
        b = b + ` and ${stopele.innerText} disappeared from ${stopele.id.slice(1)}`;
        history_moves.splice(-1);
        history_moves.push(b);
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
    else if (stopele.innerText == 'rsemi' || stopele.innerText == 'bsemi' || stopele.innerText == 'rsemi1' || stopele.innerText == 'bsemi1') {
        var img = document.getElementById(stopele.innerText);
        //console.log(img.style);
        var rot = img.style.transform
            ? parseInt(img.style.transform.replace('rotate(', '').replace('deg)', ''))
            : 0;
        if (rot < 0) {
            if (Math.abs(rot) % 4 == 0 || Math.abs(rot) == 2) {
                rot = Math.abs(rot);
            }
            else {
                rot = Math.abs(rot) + 180;
            }
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
        if (semiRicochetMap[value][bulletDirection] == 'false') {
            vanish_sound.play();
            var removed_value = stopele.innerHTML;
            let a = movements_store[movements_store.length - 1];
            a.push(removed_value, stopele.id);
            movements_store.splice(-1);
            movements_store.push(a);
            let b = history_moves[history_moves.length - 1];
            b = b + ` and ${stopele.innerText} disappeared from ${stopele.id.slice(1)}`;
            history_moves.splice(-1);
            history_moves.push(b);
            stopele.innerHTML = '';
            console.log(movements_store);
            console.log(history_moves);
        }
        return semiRicochetMap[value][bulletDirection];
    }
    else if (stopele.innerText == 'rricochet' || stopele.innerText == 'bricochet' || stopele.innerText == 'rricochet1' || stopele.innerText == 'bricochet1') {
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
    else if (stopele.innerText == 'rtank' || stopele.innerText == 'btank') {
        if (bulletDirection == 'up') {
            return 'up';
        }
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
                    player_tog.style.color = "#E00707";
                    if (redTimer.isRunning()) {
                        setTimeout(() => {
                            botTurn();
                        }, 2000);
                    }
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
        this.running = false;
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
        if (this.running) {
            return true;
        }
        this.running = true;
        this.interval = setInterval(() => {
            if (this.currentTime > 0) {
                this.currentTime--;
                this.updateDisplay();
            } else {
                clearInterval(this.interval);
                this.interval = null;
                this.running = false;
                if (this.displayElement.id == 'r_timer') {
                    document.getElementById('loseMessage').innerText = 'BLUE WON DUE TO TIMEOUT !';
                    showGameOverScreen();
                } else if (this.displayElement.id == 'b_timer') {
                    document.getElementById('loseMessage').innerText = 'RED WON DUE TO TIMEOUT !';
                    showGameOverScreen();
                }
            }
        }, 1000);
        return true;
    }

    pause() {
        clearInterval(this.interval);
        this.interval = null;
        this.running = false;
    }

    reset() {
        this.pause();
        this.currentTime = this.startMinutes * 60;
        this.updateDisplay();
    }

    isRunning() {
        return this.running;
    }
}


const redDisplay = document.getElementById('r_timer');
const blueDisplay = document.getElementById('b_timer');
const redTimer = new Timer(5, redDisplay);
const blueTimer = new Timer(5, blueDisplay);

redTimer.updateDisplay();
blueTimer.updateDisplay();

let isPaused = false;

document.getElementById("pauseButton").addEventListener("click", function () {
    isPaused = true;
    redTimer.pause();
    blueTimer.pause();
    game_sound.stop();
    document.getElementById("pausedScreen").style.display = "flex";
});

document.getElementById("playButtonPaused").addEventListener("click", function () {
    isPaused = false;
    game_sound.play();
    document.getElementById("pausedScreen").style.display = "none";
    if (currentPlayer == 'r') {
        redTimer.start();
    }
    else if (currentPlayer == 'b') {
        blueTimer.start();
    }
});

let undo_done = false;

function showGameOverScreen() {
    game_sound.stop();
    for (moves in history_moves) {
        history_final += (history_moves[moves] + '\n');
    }
    console.log(history_final);
    localStorage.setItem("History of Moves", history_final);
    let jsonString = JSON.stringify(movements_store);
    localStorage.setItem('movements_arr', jsonString);
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'flex';
}


document.getElementById("closeButton").addEventListener("click", function () {
    game_sound.play();
    const historyScreen = document.getElementById('showHistoryScreen');
    historyScreen.style.display = 'none';
    if (currentPlayer == 'r') {
        redTimer.start();
    }
    else if (currentPlayer == 'b') {
        blueTimer.start();
    }
})


document.getElementById("regameButton").addEventListener("click", function () {
    console.log("regame button clicked");
    resetGame();
});

document.getElementById("resetButton").addEventListener("click", function () {
    resetGame();
});


function resetGame() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'none';
    history_moves = [];
    movements_store = [];
    game_sound.play();
    document.querySelectorAll('.box').forEach((box) => {
        var bullet1 = box.querySelector('#bullet');
        //console.log(bullet1);
        if (bullet1) {
            console.log('Box with bullet found:', box.id);
        }
        box.innerHTML = '';
        box.style.cursor = '';
    });

    initial_posn.forEach(([element_name, position_id, innerHTML]) => {
        const box = document.getElementById(position_id);
        box.innerText = element_name;
        box.innerHTML = innerHTML; // Restore the initial innerHTML
        box.style.cursor = 'pointer';
    });
    resetBoxColors();
    // Reset any other game state variables
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
    document.getElementById('timerContainer').style.visibility = 'visible';
    document.getElementById('optionsBar').style.visibility = 'visible';
}

