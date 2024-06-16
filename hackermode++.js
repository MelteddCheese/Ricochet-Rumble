document.addEventListener('DOMContentLoaded', function () {
    const redDisplay = document.getElementById('r_timer');
    const blueDisplay = document.getElementById('b_timer');
    const redTimer = new Timer(5, redDisplay);
    const blueTimer = new Timer(5, blueDisplay);

    // Update the displays initially
    redTimer.updateDisplay();
    blueTimer.updateDisplay();
});

var movement_sound = new Track_sound("./resources/move.wav");
var vanish_sound = new Track_sound("./resources/vanishing.mp3");
var game_sound = new Track_sound("./resources/game theme loop.wav");

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

let evtg = [];

let movements_store = [];

let redo_arr = [];

let swap_arr = [];

let history_moves = [];//history of moves as text
var history_final = '';

let r_spells = [];
let b_spells = [];
let red_spells = [];
let blue_spells = [];
function generateRandomPositions() {
    initial_posn = [];
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
    positions.push(['rsemi1', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['rricochet1', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['rcanon', getRandomPosition([8])]);

    positions.push(['btitan', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['btank', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['bsemi', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['bricochet', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['bsemi1', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
    positions.push(['bricochet1', getRandomPosition([1, 2, 3, 4, 5, 6, 7, 8])]);
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
        bullet.style.height = '20px'; // Set the bullet height
        bullet.style.backgroundColor = 'white'; // Set the bullet color
        bullet.style.position = 'absolute'; // Set the bullet position
        bullet.style.visibility = "visible";
        document.body.appendChild(bullet); // Append the bullet to the document
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
    var box_size = document.querySelector('.box').offsetWidth;
    var bullet_size = bullet.offsetWidth;
    if (canonBox && bullet) {
        canonBox.appendChild(bullet);
        if (c === "r") {
            bullet.style.top = (box_size - bullet_size) / 2 + 'px';
            bullet.style.bottom = "";
        }
        else if (c === "b") {
            bullet.style.bottom = (box_size - bullet_size) / 2 + 'px';
            bullet.style.top = "";
        }
        bullet.style.left = (box_size - bullet_size) / 2 + 'px';
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
            var dist = (8 - i) * (box_size + 2) + (box_size - bullet_size) / 2;
        }
        else if (color == 'blue') {
            var dist = (i - 1) * (box_size + 2) + (box_size - bullet_size) / 2;
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
        var dist = (Math.abs(canon_col - i)) * (box_size + 2) + (box_size - bullet_size) / 2;
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
    console.log(stopele);
    console.log(stopele.innerText);

    var opp = c == 'r' ? 'b' : 'r';
    //alert(c);
    if (stopele != false) {
        if (stopele.innerText == `${opp}titan`) {
            //alert(`${c} won`);
            console.log(r_protect);
            console.log(b_protect);
            if (stopele.innerText == 'rtitan' && r_protect) {
                console.log('red protect');
                let index = r_spells.indexOf('protect');
                if (index !== -1) {
                    r_spells.splice(index, 1);
                }
                bullet.style.visibility = 'hidden';
                document.getElementById('r_protect').classList.remove('unlocked');
                return false;
            }
            else if (stopele.innerText == 'btitan' && b_protect) {
                console.log('blue protect');
                let index = b_spells.indexOf('protect');
                if (index !== -1) {
                    b_spells.splice(index, 1);
                }
                bullet.style.visibility = 'hidden';
                document.getElementById('b_protect').classList.remove('unlocked');
                return false;
            }
            else {
                var removed_value = stopele.innerHTML;
                let aa = evtg[evtg.length - 1][1];
                aa.push(removed_value, stopele.id);
                evtg[evtg.length - 1][1] = aa;
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
            }
            return false;
        }
        else if (stopele.classList.contains('invisible')) {
            refl_count--;
            return bulletDirection;
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
                if (stopele.innerText == 'rsemi' || stopele.innerText == 'rsemi1') {
                    if (c == 'b') {
                        b_destroy++;
                        if (b_destroy == 2) {
                            document.getElementById('b_teleport').classList.add('unlocked');
                            b_spells.push('teleport');
                        }
                    }
                }
                if (stopele.innerText == 'bsemi' || stopele.innerText == 'bsemi1') {
                    if (c == 'r') {
                        r_destroy++;
                        if (r_destroy == 2) {
                            document.getElementById('r_teleport').classList.add('unlocked');
                            r_spells.push('teleport');
                        }
                    }
                }
                var removed_value = stopele.innerHTML;
                let aa = evtg[evtg.length - 1][1];
                aa.push(removed_value, stopele.id);
                evtg[evtg.length - 1][1] = aa;
                let a = movements_store[movements_store.length - 1];
                a.push(removed_value, stopele.id);
                movements_store.splice(-1);
                movements_store.push(a);
                let b = history_moves[history_moves.length - 1];
                b = b + ` and ${stopele.innerText} disappeared from ${stopele.id.slice(1)}`;
                history_moves.splice(-1);
                history_moves.push(b);
                stopele.innerHTML = '';
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
            if (bulletDirection == 'up' && stopele.innerText == 'btank') {
                refl_count--;
                return 'up';
            }
            else if (bulletDirection == 'down' && stopele.innerText == 'rtank') {
                refl_count--;
                return 'down';
            }
            else {
                if (stopele.innerText == 'rtank' && c == 'b') {
                    b_hit++;
                    if (b_hit == 3 && !(b_spells.includes('protect'))) {
                        console.log('3 hits by blue');
                        document.getElementById('b_protect').classList.add('unlocked');
                        b_protect = true;
                        b_spells.push('protect');
                        b_hit = 0;
                        evtg[evtg.length - 1][4][0] = true;
                    }
                }
                else if (stopele.innerText == 'btank' && c == 'r') {
                    r_hit++;
                    if (r_hit == 3 && !(r_spells.includes('protect'))) {
                        console.log('3 hits by red');
                        document.getElementById('r_protect').classList.add('unlocked');
                        r_protect = true;
                        r_spells.push('protect');
                        r_hit = 0;
                        evtg[evtg.length - 1][4][1] = true;
                    }
                }
                bullet.style.visibility = 'hidden';
                return 'false';
            }
        }
        else {
            bullet.style.visibility = 'hidden';
            return 'false';
        }
    }
    else {
        bullet.style.visibility = 'hidden';
        return 'false';
    }
}


function moveupBulletRed(stopele, c) {
    refl_count++;
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
                    if (b_protect) {
                        b_protect = false;
                        redTimer.pause();
                        blueTimer.start();
                        bullet.style.visibility = 'hidden';
                        if (invisible_ele !== '') {
                            invisible_ele.classList.remove('invisible');
                            invisible_ele = '';
                        }
                        var player_tog = document.getElementById('tog');
                        player_tog.innerText = "BLUE'S TURN";
                        player_tog.style.color = "blue";
                        if (refl_count > 3 && !(r_spells.includes('invisible'))) {
                            document.getElementById('r_invisible').classList.add('unlocked');
                            r_spells.push('invisible');
                        }
                        red_spells.push([r_spells.includes('invisible'), r_spells.includes('teleport'), r_spells.includes('protect')]);
                        blue_spells.push([b_spells.includes('invisible'), b_spells.includes('teleport'), b_spells.includes('protect')]);
                        console.log(red_spells);
                        console.log(blue_spells);
                    }
                    else {
                        bullet.style.visibility = 'hidden';
                        redTimer.pause();
                        blueTimer.pause();
                        showGameOverScreen();
                    }
                }
                else {
                    bullet.style.visibility = 'hidden';
                    blueTimer.start();
                    if (invisible_ele !== '') {
                        invisible_ele.classList.remove('invisible');
                        invisible_ele = '';
                    }
                    var player_tog = document.getElementById('tog');
                    player_tog.innerText = "BLUE'S TURN";
                    player_tog.style.color = "blue";
                    if (refl_count > 3 && !(r_spells.includes('invisible'))) {
                        document.getElementById('r_invisible').classList.add('unlocked');
                        r_spells.push('invisible');
                    }
                    red_spells.push([r_spells.includes('invisible'), r_spells.includes('teleport'), r_spells.includes('protect')]);
                    blue_spells.push([b_spells.includes('invisible'), b_spells.includes('teleport'), b_spells.includes('protect')]);
                    console.log(red_spells);
                    console.log(blue_spells);
                }
            }
        } else {
            bullet.style.visibility = 'hidden';
            if (invisible_ele !== '') {
                invisible_ele.classList.remove('invisible');
                invisible_ele = '';
            }
            if (refl_count > 3 && !(r_spells.includes('invisible'))) {
                r_spells.push('invisible');
                document.getElementById('r_invisible').classList.add('unlocked');
            }
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
    refl_count++;
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
                    if (r_protect) {
                        r_protect = false;
                        redTimer.start();
                        blueTimer.pause();
                        bullet.style.visibility = 'hidden';
                        if (invisible_ele !== '') {
                            invisible_ele.classList.remove('invisible');
                            invisible_ele = '';
                        }
                        var player_tog = document.getElementById('tog');
                        player_tog.innerText = "RED'S TURN";
                        player_tog.style.color = "#E00707";
                        if (refl_count > 3 && !(b_spells.includes('invisible'))) {
                            b_spells.push('invisible');
                            document.getElementById('b_invisible').classList.add('unlocked');
                        }
                        red_spells.push([r_spells.includes('invisible'), r_spells.includes('teleport'), r_spells.includes('protect')]);
                        blue_spells.push([b_spells.includes('invisible'), b_spells.includes('teleport'), b_spells.includes('protect')]);
                        console.log(red_spells);
                        console.log(blue_spells);
                    }
                    else {
                        bullet.style.visibility = 'hidden';
                        redTimer.pause();
                        blueTimer.pause();
                        showGameOverScreen();
                    }
                }
                else {
                    bullet.style.visibility = 'hidden';
                    redTimer.start();
                    if (invisible_ele !== '') {
                        invisible_ele.classList.remove('invisible');
                        invisible_ele = '';
                    }
                    var player_tog = document.getElementById('tog');
                    player_tog.innerText = "RED'S TURN";
                    player_tog.style.color = "#E00707";
                    if (refl_count > 3 && !(b_spells.includes('invisible'))) {
                        b_spells.push('invisible');
                        document.getElementById('b_invisible').classList.add('unlocked');
                    }
                    red_spells.push([r_spells.includes('invisible'), r_spells.includes('teleport'), r_spells.includes('protect')]);
                    blue_spells.push([b_spells.includes('invisible'), b_spells.includes('teleport'), b_spells.includes('protect')]);
                    console.log(red_spells);
                    console.log(blue_spells);
                }
            }
        } else {
            bullet.style.visibility = 'hidden';
            if (invisible_ele !== '') {
                invisible_ele.classList.remove('invisible');
                invisible_ele = '';
            }
            if (refl_count > 3 && !(b_spells.includes('invisible'))) {
                b_spells.push('invisible');
                document.getElementById('b_invisible').classList.add('unlocked');
            }
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

var refl_count = 0;

function fireBullet(c) {
    const bullet = document.getElementById('bullet');
    if (bullet) {
        refl_count = 0;
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
            const spells = document.querySelectorAll('.spell');
            spells.forEach(spell => {
                spell.style.visibility = 'hidden';
                console.log(spell.style.visibility);
            });
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
                if (this.displayElement.id == 'r_timer') {
                    document.getElementById('loseMessage').innerText = 'BLUE WON DUE TO TIMEOUT !';
                    showGameOverScreen();
                }
                else if (this.displayElement.id == 'b_timer') {
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

document.getElementById('spellss').addEventListener('click', function () {
    isPaused = true;
    redTimer.pause();
    blueTimer.pause();
    console.log("overlay is clicked");
    document.getElementById('overlay').style.display = 'flex';
});

document.getElementById('closeButtonSpell').addEventListener('click', function () {
    isPaused = false;
    if (currentPlayer == 'r') {
        redTimer.start();
    }
    else if (currentPlayer == 'b') {
        blueTimer.start();
    }
    document.getElementById('overlay').style.display = 'none';
});

let isPaused = false;

document.getElementById("pauseButton").addEventListener("click", function () {
    isPaused = true;
    redTimer.pause();
    blueTimer.pause();
    game_sound.stop();
    document.getElementById("pausedScreen").style.display = "flex"; // Show the paused screen
});

document.getElementById("playButtonPaused").addEventListener("click", function () {
    isPaused = false;
    game_sound.play();
    document.getElementById("pausedScreen").style.display = "none"; // Hide the paused screen
    if (currentPlayer == 'r') {
        redTimer.start();
    }
    else if (currentPlayer == 'b') {
        blueTimer.start();
    } // Start the move timer again
});

let undo_done = false;


document.getElementById("undoButton").addEventListener("click", function () {
    //console.log(movements_store);
    if (evtg.length) {
        let array = evtg[evtg.length - 1];
        if (red_spells.length >= 2) {
            let r1 = red_spells[red_spells.length - 1];//last element
            let r2 = red_spells[red_spells.length - 2];//last before element
            for (i = 0; i < 3; i++) {
                if (r1[i] == r2[i]);
                else {
                    if (r1[i]) {
                        if (i == 0) {
                            let index = r_spells.indexOf('invisible');
                            if (index > -1) {
                                r_spells.splice(index, 1);
                            }
                            document.getElementById('r_invisible').classList.remove('unlocked');
                        }
                        else if (i == 1) {
                            let index = r_spells.indexOf('teleport');
                            if (index > -1) {
                                r_spells.splice(index, 1);
                            }
                            document.getElementById('r_teleport').classList.remove('unlocked');
                            r_destroy--;
                        }
                        else if (i == 2) {
                            let index = r_spells.indexOf('protect');
                            if (index > -1) {
                                r_spells.splice(index, 1);
                            }
                            document.getElementById('r_protect').classList.remove('unlocked');
                            r_hit = 2;
                            r_protect = false;
                        }
                    }
                    else if (r2[i]) {  //being used up in undone move
                        if (i == 0) {
                            r_spells.push('invisible');
                            document.getElementById('r_invisible').classList.add('unlocked');
                        }
                        else if (i == 1) {
                            r_spells.push('teleport');
                            document.getElementById('r_teleport').classList.add('unlocked');
                            document.getElementById(array[3][1]).innerHTML = array[3][0];
                            document.getElementById(array[3][2]).innerHTML = '';
                        }
                        else if (i == 2) {
                            r_spells.push('protect');
                            document.getElementById('r_protect').classList.add('unlocked');
                            r_protect = true;
                        }
                    }
                }
            }
            let b1 = blue_spells[blue_spells.length - 1];//last element
            let b2 = blue_spells[blue_spells.length - 2];//last before element
            for (i = 0; i < 3; i++) {
                if (b1[i] == b2[i]);
                else {
                    if (b1[i]) {
                        if (i == 0) {
                            let index = b_spells.indexOf('invisible');
                            if (index > -1) {
                                b_spells.splice(index, 1);
                            }
                            document.getElementById('b_invisible').classList.remove('unlocked');
                        }
                        else if (i == 1) {
                            let index = b_spells.indexOf('teleport');
                            if (index > -1) {
                                b_spells.splice(index, 1);
                            }
                            document.getElementById('b_teleport').classList.remove('unlocked');
                            b_destroy--;
                        }
                        else if (i == 2) {
                            let index = b_spells.indexOf('protect');
                            if (index > -1) {
                                b_spells.splice(index, 1);
                            }
                            document.getElementById('b_protect').classList.remove('unlocked');
                            b_hit = 2;
                            b_protect = false;
                        }
                    }
                    else if (b2[i]) {  //being used up in undone move
                        if (i == 0) {
                            b_spells.push('invisible');
                            document.getElementById('b_invisible').classList.add('unlocked');
                        }
                        else if (i == 1) {
                            b_spells.push('teleport');
                            document.getElementById('b_teleport').classList.add('unlocked');
                            document.getElementById(array[3][1]).innerHTML = array[3][0];
                            document.getElementById(array[3][2]).innerHTML = '';
                        }
                        else if (i == 2) {
                            b_spells.push('protect');
                            document.getElementById('b_protect').classList.add('unlocked');
                            b_protect = true;
                        }
                    }
                }
            }
        }
        redTimer.pause();
        blueTimer.pause();
        let bullet = document.getElementById('bullet');
        let arr = evtg[evtg.length - 1][1];
        if (arr.length == 5) {
            document.getElementById(arr[4]).innerHTML = arr[3];
        }
        if (Number.isInteger(arr[1])) {
            let img = document.getElementById(arr[0]).querySelector('img');
            img.style.transform = `rotate(${(arr[2])}deg)`;//arr[2]=initial_rotation
            //console.log(document.getElementById(arr[0]).style.transform);
        }
        else if (arr[0] == 0) {
            let store = document.getElementById(arr[1]).innerHTML;
            document.getElementById(arr[1]).innerHTML = document.getElementById(arr[2]).innerHTML;
            document.getElementById(arr[2]).innerHTML = store;
        }
        else {
            document.getElementById(arr[2]).innerHTML = '';
            document.getElementById(arr[1]).innerHTML = arr[0];
        }
        undo_done = true;//boolean for conditioning
        redo_arr.push(evtg[evtg.length - 1]);//evtg
        evtg.splice(-1);
        redo_arr.push(red_spells[red_spells.length - 1]);//redspells
        red_spells.splice(-1);
        redo_arr.push(blue_spells[blue_spells.length - 1]);//bluespells
        blue_spells.splice(-1);
        let hist = history_moves[history_moves.length - 1];//updating history
        redo_arr.push(hist);

        history_moves.splice(-1);
        if (currentPlayer == 'r') {
            currentPlayer = 'b';
            bullet.style.visibility = 'hidden';
            blueTimer.start();
            var player_tog = document.getElementById('tog');
            player_tog.innerText = "BLUE'S TURN";
            player_tog.style.color = "#2C30D1";
        }
        else if (currentPlayer == 'b') {
            currentPlayer = 'r';
            bullet.style.visibility = 'hidden';
            redTimer.start();
            var player_tog = document.getElementById('tog');
            player_tog.innerText = "RED'S TURN";
            player_tog.style.color = "#E00707";
        }
    }
})

document.getElementById("redoButton").addEventListener("click", function () {
    if (undo_done) {
        console.log(redo_arr);
        console.log(red_spells);
        console.log(blue_spells);
        let array = redo_arr[0];
        let r1 = red_spells[red_spells.length - 1];//after 2
        let r2 = redo_arr[1];//to achieve
        for (i = 0; i < 3; i++) {
            if (r1[i] == r2[i]) { ; }
            else {
                if (r1[i]) {
                    if (i == 0) {
                        let index = r_spells.indexOf('invisible');
                        if (index > -1) {
                            r_spells.splice(index, 1);
                        }
                        document.getElementById('r_invisible').classList.remove('unlocked');
                    }
                    else if (i == 1) {
                        let index = r_spells.indexOf('teleport');
                        if (index > -1) {
                            r_spells.splice(index, 1);
                        }
                        document.getElementById('r_teleport').classList.remove('unlocked');
                        document.getElementById(array[3][2]).innerHTML = array[3][0];
                        document.getElementById(array[3][1]).innerHTML = '';
                    }
                    else if (i == 2) {
                        let index = r_spells.indexOf('protect');
                        if (index > -1) {
                            r_spells.splice(index, 1);
                        }
                        document.getElementById('r_protect').classList.remove('unlocked');
                        r_protect = false;
                    }
                }
                else if (r2[i]) {  //being achieved in the redone move
                    if (i == 0) {
                        r_spells.push('invisible');
                        document.getElementById('r_invisible').classList.add('unlocked');
                    }
                    else if (i == 1) {
                        r_spells.push('teleport');
                        document.getElementById('r_teleport').classList.add('unlocked');
                    }
                    else if (i == 2) {
                        r_spells.push('protect');
                        document.getElementById('r_protect').classList.add('unlocked');
                        r_hit = 0;
                        r_protect = true;
                    }
                }
            }
        }
        let b1 = blue_spells[blue_spells.length - 1];//after 2
        let b2 = redo_arr[2];//to achieve
        for (i = 0; i < 3; i++) {
            if (b1[i] == b2[i]) { ; }
            else {
                if (b1[i]) {
                    if (i == 0) {
                        let index = b_spells.indexOf('invisible');
                        if (index > -1) {
                            b_spells.splice(index, 1);
                        }
                        document.getElementById('b_invisible').classList.remove('unlocked');
                    }
                    else if (i == 1) {
                        let index = b_spells.indexOf('teleport');
                        if (index > -1) {
                            b_spells.splice(index, 1);
                        }
                        document.getElementById('b_teleport').classList.remove('unlocked');
                        document.getElementById(array[3][2]).innerHTML = array[3][0];
                        document.getElementById(array[3][1]).innerHTML = '';
                    }
                    else if (i == 2) {
                        let index = b_spells.indexOf('protect');
                        if (index > -1) {
                            b_spells.splice(index, 1);
                        }
                        document.getElementById('b_protect').classList.remove('unlocked');
                        b_protect = false;
                    }
                }
                else if (b2[i]) {  //being achieved in the redone move
                    if (i == 0) {
                        b_spells.push('invisible');
                        document.getElementById('b_invisible').classList.add('unlocked');
                    }
                    else if (i == 1) {
                        b_spells.push('teleport');
                        document.getElementById('b_teleport').classList.add('unlocked');
                    }
                    else if (i == 2) {
                        b_spells.push('protect');
                        document.getElementById('b_protect').classList.add('unlocked');
                        b_hit = 0;
                        b_protect = true;
                    }
                }
            }
        }

        let rem_arr = redo_arr[0];
        if (Number.isInteger(rem_arr[1][1])) {  //rotation
            if (document.getElementById(rem_arr[1][0]).innerHTML !== '') {
                let img = document.getElementById(rem_arr[1][0]).querySelector('img');
                img.style.transform = `rotate(${rem_arr[1][1]}deg)`;
            }
        }
        else if (rem_arr[1][0] == 0) {  //swap
            let store = document.getElementById(rem_arr[1][1]).innerHTML;
            document.getElementById(rem_arr[1][1]).innerHTML = document.getElementById(rem_arr[1][2]).innerHTML;
            document.getElementById(rem_arr[1][2]).innerHTML = store;
        }
        else {
            document.getElementById(rem_arr[1][1]).innerHTML = '';
            document.getElementById(rem_arr[1][2]).innerHTML = rem_arr[1][0];
        }
        if (rem_arr[1].length == 5) {   //removing the piece that was removed and put back due to undo
            document.getElementById(rem_arr[1][4]).innerHTML = '';
        }
        evtg.push(redo_arr[0]);
        red_spells.push(redo_arr[1]);
        blue_spells.push(redo_arr[2]);
        history_moves.push(redo_arr[3]);
        redo_arr = [];
        var bullet = document.getElementById('bullet');
        if (currentPlayer == 'r') {
            currentPlayer = 'b';
            bullet.style.visibility = 'hidden';
            redTimer.pause();
            blueTimer.start();
            var player_tog = document.getElementById('tog');
            player_tog.innerText = "BLUE'S TURN";
            player_tog.style.color = "#2C30D1";
        }
        else if (currentPlayer == 'b') {
            currentPlayer = 'r';
            bullet.style.visibility = 'hidden';
            blueTimer.pause();
            redTimer.start();
            var player_tog = document.getElementById('tog');
            player_tog.innerText = "RED'S TURN";
            player_tog.style.color = "#E00707";
        }
    }
})

function showGameOverScreen() {
    game_sound.stop();
    redTimer.reset();
    blueTimer.reset();
    for (moves in history_moves) {
        history_final += (history_moves[moves] + '\n');
    }
    console.log(history_final);
    localStorage.setItem("History of Moves", history_final);
    let jsonString = JSON.stringify(movements_store);
    localStorage.setItem('movements_arr', jsonString);
    let everything = JSON.stringify(evtg);
    localStorage.setItem('evtg_arr', everything);
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'flex';
}

document.getElementById("history").addEventListener("click", function () {
    game_sound.stop();
    redTimer.pause();
    blueTimer.pause();
    const historyScreen = document.getElementById('showHistoryScreen');
    historyScreen.style.display = 'flex';
    let history_display = '';
    for (moves in history_moves) {
        history_display += (history_moves[moves] + '\n');
    }
    document.getElementById("historyDisplay").innerText = history_display;
})

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

document.getElementById('replayButton').addEventListener("click", function () {
    b_invisible = false;
    r_invisible = false;
    r_teleport = false;
    b_teleport = false;
    r_protect = false;
    b_protect = false;
    invisible_ele = '';
    r_destroy = 0;
    b_destroy = 0;
    r_hit = 0;
    b_hit = 0;
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'none';
    console.log(gameOverScreen.style.display);
    past_game = localStorage.getItem('evtg_arr');
    document.getElementById('timerContainer').style.visibility = 'hidden';
    document.getElementById('optionsBar').style.visibility = 'hidden';
    const spells = this.querySelectorAll('.spells');
    spells.forEach(spell => {
        spell.style.visibility = 'hidden';
        console.log(spell.style.visibility);
    });
    // document.getElementById('spells').style.visibility = 'hidden';

    document.querySelectorAll('.box').forEach((box) => {
        var bullet1 = box.querySelector('#bullet');
        if (bullet1) {
            console.log('Box with bullet found:', box.id);
        }
        box.classList.remove('invisible');
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
    console.log(gameOverScreen.style.display);

    // if (past_game) {
    //     let pastgame_arr = JSON.parse(past_game);
    //     var i = 0;
    //     let moves = pastgame_arr.length;
    //     makeMovement();
    //     function makeMovement() {
    //         let done = false;
    //         if (pastgame_arr[i][2] !== 0) {
    //             document.getElementById(pastgame_arr[i][2]).classList.add('invisible');
    //         }
    //         if (pastgame_arr[i][3] !== 0) {
    //             document.getElementById(pastgame_arr[i][3][2]).innerHTML = pastgame_arr[i][3][0];
    //             document.getElementById(pastgame_arr[i][3][1]).innerHTML = '';
    //         }
    //         if (i > 0) {
    //             if (pastgame_arr[i - 1][2]) {
    //                 document.getElementById(pastgame_arr[i - 1][2]).classList.remove('invisible');
    //             }
    //         }
    //         if (Number.isInteger(pastgame_arr[i][1][1])) {
    //             document.getElementById(pastgame_arr[i][1][0]).style.transform = `rotate(${(pastgame_arr[i][1][1] - pastgame_arr[i][1][2])}deg)`;//arr[2]=initial_rotation
    //             done = true;
    //         }
    //         else if (pastgame_arr[i][1][0] == 0) {
    //             let store = document.getElementById(pastgame_arr[i][1][1]).innerHTML;
    //             document.getElementById(pastgame_arr[i][1][1]).innerHTML = document.getElementById(pastgame_arr[i][1][2]).innerHTML;
    //             document.getElementById(pastgame_arr[i][1][2]).innerHTML = store;
    //             done = true;
    //         }
    //         else {
    //             document.getElementById(pastgame_arr[i][1][1]).innerHTML = '';
    //             document.getElementById(pastgame_arr[i][1][2]).innerHTML = pastgame_arr[i][1][0];
    //             done = true;
    //         }
    //         if (done) {
    //             if (i % 2 == 0) {
    //                 placeBullet("blue", "b");
    //                 fireBullet("b");
    //             }
    //             else if (i % 2 == 1) {
    //                 placeBullet("red", "r");
    //                 fireBullet("r");
    //             }
    //             i++;
    //             if (i < moves) {
    //                 setTimeout(makeMovement, 4000);
    //             }
    //             else if (i == moves) {
    //                 const bullet = document.getElementById('bullet');
    //                 bullet.style.visibility = 'hidden';
    //             }
    //         }
    //     }
    // }
    if (past_game) {
        let pastgame_arr = JSON.parse(past_game);
        let i = 0;
        let moves = pastgame_arr.length;

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        const handleMovement = async (move) => {
            // Movement logic
            if (move[2] !== 0) {
                document.getElementById(move[2]).classList.add('invisible');
            }
            if (move[3] !== 0) {
                document.getElementById(move[3][2]).innerHTML = move[3][0];
                document.getElementById(move[3][1]).innerHTML = '';
            }
            if (i > 0) {
                if (pastgame_arr[i - 1][2]) {
                    document.getElementById(pastgame_arr[i - 1][2]).classList.remove('invisible');
                }
            }
            if (Number.isInteger(move[1][1])) {
                let img = document.getElementById(move[1][0]).querySelector('img');
                img.style.transform = `rotate(${(move[1][1])}deg)`; //arr[2]=initial_rotation
            } else if (move[1][0] == 0) {
                let store = document.getElementById(move[1][1]).innerHTML;
                document.getElementById(move[1][1]).innerHTML = document.getElementById(move[1][2]).innerHTML;
                document.getElementById(move[1][2]).innerHTML = store;
            } else {
                document.getElementById(move[1][1]).innerHTML = '';
                document.getElementById(move[1][2]).innerHTML = move[1][0];
            }
        };

        const fireBulletAfterDelay = async (i) => {
            await delay(2000); // Wait 2 seconds for bullet firing
            console.log(`Bullet firing phase ${i}`);
            if (i % 2 == 0) {
                placeBullet("blue", "b");
                fireBullet("b");
                i++;
            } else {
                placeBullet("red", "r");
                fireBullet("r");
                i++;
            }
        };

        const replay = async () => {
            while (i < moves) {
                console.log(`Movement phase ${i}`);

                await handleMovement(pastgame_arr[i]);
                await fireBulletAfterDelay(i);


                await delay(2000); // Wait another 2 seconds before next movement
            }

            const bullet = document.getElementById('bullet');
            bullet.style.visibility = 'hidden';
        };

        replay();
    } else {
        console.log('No data found in local storage.');
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
    evtg = [];
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

    generateRandomPositions();
    resetBoxColors();
    // Reset any other game state variables
    currentPlayer = 'b';
    document.getElementById('tog').style.color = 'blue';
    document.getElementById('tog').innerText = "BLUE'S TURN";
    state = true;
    clickedId = null;
    clickedcontent = null;
    swapped = false;
    b_invisible = false;
    r_invisible = false;
    r_teleport = false;
    b_teleport = false;
    r_protect = false;
    b_protect = false;
    invisible_ele = '';
    r_destroy = 0;
    b_destroy = 0;
    r_hit = 0;
    b_hit = 0;
    //setupBoxClickListeners();
    document.getElementById('rotate').style.visibility = 'hidden';
    redTimer.reset();
    blueTimer.reset();
    document.getElementById('timerContainer').style.visibility = 'visible';
    document.getElementById('optionsBar').style.visibility = 'visible';
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
                movement_sound.play();
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
                if (evtg.length == 0) {
                    evtg.push([0, [item.id, newRotation, currentRotation], 0, 0, [false, false]]);
                }
                if (evtg[evtg.length - 1][1] !== 0) {
                    evtg.push([0, [item.id, newRotation, currentRotation], 0, 0, [false, false]]);
                }
                else {
                    evtg[evtg.length - 1][1] = [item.id, newRotation, currentRotation];
                }
                movements_store.push([item.id, newRotation, currentRotation]);
                if (evtg[evtg.length - 1][3] !== 0) {
                    history_moves.push(`${document.getElementById(evtg[evtg.length - 1][3][2]).innerText} teleported from ${evtg[evtg.length - 1][3][1].slice(1)} to ${evtg[evtg.length - 1][3][2].slice(1)} and ${item.innerText} rotated right`);
                }
                else {
                    history_moves.push(`${item.innerText} rotated right`);
                }
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
                movement_sound.play();
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
                if (evtg.length == 0) {
                    evtg.push([0, [item.id, newRotation, currentRotation], 0, 0, [false, false]]);
                }
                if (evtg[evtg.length - 1][1] !== 0) {
                    evtg.push([0, [item.id, newRotation, currentRotation], 0, 0, [false, false]]);
                }
                else {
                    evtg[evtg.length - 1][1] = [item.id, newRotation, currentRotation];
                }
                movements_store.push([item.id, newRotation, currentRotation]);
                if (evtg[evtg.length - 1][3] !== 0) {
                    history_moves.push(`${document.getElementById(evtg[evtg.length - 1][3][2]).innerText} teleported from ${evtg[evtg.length - 1][3][1].slice(1)} to ${evtg[evtg.length - 1][3][2].slice(1)} and ${item.innerText} rotated left`);
                }
                else {
                    history_moves.push(`${item.innerText} rotated left`);
                }
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
var b_invisible = false;
var r_invisible = false;
var r_teleport = false;
var b_teleport = false;
var r_protect = false;
var b_protect = false;
var invisible_ele = '';
var r_destroy = 0;
var b_destroy = 0;
var r_hit = 0;
var b_hit = 0;
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
        const boxName = e.target.tagName === 'IMG' ? e.target.parentNode : e.target;
        const box = document.getElementById(`${boxName.id}`);
        document.getElementById('rotate').style.visibility = 'hidden';
        const buttonR = document.getElementById('right-turn');
        const buttonL = document.getElementById('left-turn');
        const newButtonR = buttonR.cloneNode(true);
        buttonR.parentNode.replaceChild(newButtonR, buttonR);
        const newButtonL = buttonL.cloneNode(true);
        buttonL.parentNode.replaceChild(newButtonL, buttonL);

        if (b_invisible && currentPlayer == 'b') {
            if (box.innerText !== '' && box.innerText !== 'btitan' || box.innerText !== 'rtitan' || box.innerText !== 'bcanon' || box.innerText !== 'rcanon') {
                box.classList.add('invisible');
                evtg.push([0, 0, [box.id], 0, [false, false]]);
                document.getElementById('b_invisible').classList.remove('unlocked');
                invisible_ele = box;
                b_invisible = false;
                let index = b_spells.indexOf('invisible');
                if (index > -1) {
                    b_spells.splice(index, 1);
                }
                resetBoxColors();
            }
        }
        if (r_invisible && currentPlayer == 'r') {
            if (box.innerText !== '' && box.innerText !== 'btitan' || box.innerText !== 'rtitan' || box.innerText !== 'bcanon' || box.innerText !== 'rcanon') {
                box.classList.add('invisible');
                console.log(box.classList);
                evtg.push([0, 0, [box.id], 0, [false, false]]);
                document.getElementById('r_invisible').classList.remove('unlocked');
                invisible_ele = box;
                r_invisible = false;
                let index = r_spells.indexOf('invisible');
                if (index > -1) {
                    r_spells.splice(index, 1);
                }
                resetBoxColors();
            }
        }
        // if(r_teleport && currentPlayer=='r'){

        // }
        if (state && !(r_invisible) && !(b_invisible)) {
            if (box.innerText.trim().startsWith(currentPlayer) && bullet.style.visibility == 'hidden') {
                if (undo_done) {
                    undo_done = false;
                    redo_arr = [];
                }
                if (!(r_teleport || b_teleport)) {
                    resetBoxColors();
                    showPossibleMoves(box);
                }
                clickedId = box.id;
                clickedcontent = box.innerHTML;
                if (r_teleport || b_teleport) {
                    box.style.backgroundColor = 'yellow';
                }
                if (e.target.tagName === 'IMG') state = false;
            }
        }
        else if (swapped && clickedId && !(r_invisible) && !(b_invisible)) {
            const item2 = box;
            let bool = false;
            for (const num of swap_arr) {
                //console.log(num);
                if (item2.id === num) {
                    bool = true;
                    if (evtg.length == 0) {
                        evtg.push([0, [0, clickedId, item2.id], 0, 0, [false, false]]);
                    }
                    if (evtg[evtg.length - 1][1] !== 0) {
                        evtg.push([0, [0, clickedId, item2.id], 0, 0, [false, false]]);
                    }
                    else {
                        evtg[evtg.length - 1][1] = [0, clickedId, item2.id];
                    }
                    movements_store.push([0, clickedId, item2.id]);
                    if (evtg[evtg.length - 1][3] !== 0) {
                        history_moves.push(`${document.getElementById(evtg[evtg.length - 1][3][2]).innerText} teleported from ${evtg[evtg.length - 1][3][1]} to ${evtg[evtg.length - 1][3][2]} and ${document.getElementById(clickedId).innerText} swapped with ${item2.innerText}`);
                    }
                    else {
                        history_moves.push(`${document.getElementById(clickedId).innerText} swapped with ${item2.innerText}`);
                    }
                    let store = document.getElementById(clickedId).innerHTML;
                    document.getElementById(clickedId).innerHTML = item2.innerHTML;
                    movement_sound.play();
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

        else if (e.target.tagName !== 'IMG' && clickedId && !(r_invisible) && !(b_invisible)) {
            const item2 = box;

            if (r_teleport || b_teleport) {
                item2.innerHTML = clickedcontent;
                document.getElementById(clickedId).innerHTML = '';
                resetBoxColors();
                state = false;
                if (currentPlayer == 'r') {
                    document.getElementById('r_teleport').classList.remove('unlocked');
                    let index = r_spells.indexOf('teleport');
                    if (index > -1) {
                        r_spells.splice(index, 1);
                    }
                    r_teleport = false;
                }
                else if (currentPlayer == 'b') {
                    document.getElementById('b_teleport').classList.remove('unlocked');
                    let index = b_spells.indexOf('teleport');
                    if (index > -1) {
                        b_spells.splice(index, 1);
                    }
                    b_teleport = false;
                }
                evtg.push([0, 0, 0, [clickedcontent, clickedId, item2.id], [false, false]]);
            }
            else {
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
                        if (evtg.length == 0) {
                            evtg.push([0, [clickedcontent, clickedId, item2.id], 0, 0, [false, false]]);
                        }
                        if (evtg[evtg.length - 1][1] !== 0) {
                            evtg.push([0, [clickedcontent, clickedId, item2.id], 0, 0, [false, false]]);
                        }
                        else {
                            evtg[evtg.length - 1][1] = [clickedcontent, clickedId, item2.id];
                        }
                        movements_store.push([clickedcontent, clickedId, item2.id]);
                        if (evtg[evtg.length - 1][3] !== 0) {
                            history_moves.push(`${document.getElementById(evtg[evtg.length - 1][3][2]).innerText} teleported from ${evtg[evtg.length - 1][3][1].slice(1)} to ${evtg[evtg.length - 1][3][2].slice(1)} and ${document.getElementById(clickedId).innerText} moved from ${clickedId.slice(1)} to ${item2.id.slice(1)}`);
                        }
                        else {
                            history_moves.push(`${document.getElementById(clickedId).innerText} moved from ${clickedId.slice(1)} to ${item2.id.slice(1)}`);
                        }
                        document.getElementById('rotate').style.visibility = 'hidden';
                        document.getElementById(clickedId).innerHTML = '';
                        movement_sound.play();
                        item2.innerHTML = clickedcontent;
                        resetBoxColors();
                        state = true;
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
        }
        else {
            resetBoxColors();
            state = true;
        }
    });
}


document.getElementById('b_invisible').addEventListener('click', () => {
    if (currentPlayer == 'b') {
        b_invisible = true;
        document.querySelectorAll('.box').forEach((image) => {
            if (image.innerHTML !== '') {
                if (image.innerText !== 'rtitan' && image.innerText !== 'btitan' && image.innerText !== 'bcanon' && image.innerText !== 'rcanon') {
                    image.style.backgroundColor = 'yellow';
                }
            }
        })
    }
})

document.getElementById('r_invisible').addEventListener('click', () => {
    if (currentPlayer == 'r') {
        r_invisible = true;
        document.querySelectorAll('.box').forEach((image) => {
            if (image.innerHTML !== '') {
                if (image.innerText !== 'rtitan' && image.innerText !== 'btitan' && image.innerText !== 'bcanon' && image.innerText !== 'rcanon') {
                    image.style.backgroundColor = 'yellow';
                }
            }
        })
    }
})

document.getElementById('r_teleport').addEventListener('click', () => {
    if (currentPlayer == 'r') {
        r_teleport = true;

    }
})

document.getElementById('b_teleport').addEventListener('click', () => {
    if (currentPlayer == 'b') {
        b_teleport = true;
    }
})


if (past_game) {
    let pastgame_arr = JSON.parse(past_game);
    let i = 0;
    let moves = pastgame_arr.length;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const replay = async () => {
        while (i < moves) {
            // Movement logic
            if (pastgame_arr[i][2] !== 0) {
                document.getElementById(pastgame_arr[i][2]).classList.add('invisible');
            }
            if (pastgame_arr[i][3] !== 0) {
                document.getElementById(pastgame_arr[i][3][2]).innerHTML = pastgame_arr[i][3][0];
                document.getElementById(pastgame_arr[i][3][1]).innerHTML = '';
            }
            if (i > 0) {
                if (pastgame_arr[i - 1][2]) {
                    document.getElementById(pastgame_arr[i - 1][2]).classList.remove('invisible');
                }
            }
            if (Number.isInteger(pastgame_arr[i][1][1])) {
                document.getElementById(pastgame_arr[i][1][0]).style.transform = `rotate(${(pastgame_arr[i][1][1] - pastgame_arr[i][1][2])}deg)`; //arr[2]=initial_rotation
            } else if (pastgame_arr[i][1][0] == 0) {
                let store = document.getElementById(pastgame_arr[i][1][1]).innerHTML;
                document.getElementById(pastgame_arr[i][1][1]).innerHTML = document.getElementById(pastgame_arr[i][1][2]).innerHTML;
                document.getElementById(pastgame_arr[i][1][2]).innerHTML = store;
            } else {
                document.getElementById(pastgame_arr[i][1][1]).innerHTML = '';
                document.getElementById(pastgame_arr[i][1][2]).innerHTML = pastgame_arr[i][1][0];
            }

            console.log(`Movement phase ${i}`);

            // Delay bullet logic to ensure movement happens first
            await delay(2000); // Wait 2 seconds for bullet firing

            console.log(`Bullet firing phase ${i}`);
            if (i % 2 == 0) {
                placeBullet("blue", "b");
                fireBullet("b");
            } else {
                placeBullet("red", "r");
                fireBullet("r");
            }

            i++;
            await delay(2000); // Wait another 2 seconds before next movement
        }

        const bullet = document.getElementById('bullet');
        bullet.style.visibility = 'hidden';
    };

    replay();
}

// if (past_game) {
//     let pastgame_arr = JSON.parse(past_game);
//     let i = 0;
//     let moves = pastgame_arr.length;

//     const replay_vid = setInterval(() => {
//         if (i < moves) {
//             // Movement logic
//             if (pastgame_arr[i][2] !== 0) {
//                 document.getElementById(pastgame_arr[i][2]).classList.add('invisible');
//             }
//             if (pastgame_arr[i][3] !== 0) {
//                 document.getElementById(pastgame_arr[i][3][2]).innerHTML = pastgame_arr[i][3][0];
//                 document.getElementById(pastgame_arr[i][3][1]).innerHTML = '';
//             }
//             if (i > 0) {
//                 if (pastgame_arr[i - 1][2]) {
//                     document.getElementById(pastgame_arr[i - 1][2]).classList.remove('invisible');
//                 }
//             }
//             if (Number.isInteger(pastgame_arr[i][1][1])) {
//                 document.getElementById(pastgame_arr[i][1][0]).style.transform = `rotate(${(pastgame_arr[i][1][1] - pastgame_arr[i][1][2])}deg)`; //arr[2]=initial_rotation
//             } else if (pastgame_arr[i][1][0] == 0) {
//                 let store = document.getElementById(pastgame_arr[i][1][1]).innerHTML;
//                 document.getElementById(pastgame_arr[i][1][1]).innerHTML = document.getElementById(pastgame_arr[i][1][2]).innerHTML;
//                 document.getElementById(pastgame_arr[i][1][2]).innerHTML = store;
//             } else {
//                 document.getElementById(pastgame_arr[i][1][1]).innerHTML = '';
//                 document.getElementById(pastgame_arr[i][1][2]).innerHTML = pastgame_arr[i][1][0];
//             }

//             // Bullet logic executed 2 seconds after movement
//             setTimeout(() => {
//                 if (i % 2 == 0) {
//                     placeBullet("blue", "b");
//                     fireBullet("b");
//                 } else if (i % 2 == 1) {
//                     placeBullet("red", "r");
//                     fireBullet("r");
//                 }
//             }, 2000); // 2 seconds delay for bullet firing

//             i++;
//         } else {
//             clearInterval(replay_vid);
//             const bullet = document.getElementById('bullet');
//             bullet.style.visibility = 'hidden';
//         }
//     }, 4000);

// 4 seconds interval