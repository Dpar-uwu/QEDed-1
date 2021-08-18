/* Classes */
class Player {
    constructor(x, y, angle, radius, color, speed, health, reload, mag, shooting) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.health = health;
        this.reload = reload;
        this.mag = mag;
        this.shooting = shooting;
    }
    draw() {        
        c.save();

        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.translate(-this.x, -this.y);
        
        //Legs
        c.beginPath();
        c.arc(this.x + this.radius / leg[0], this.y - this.radius / 1.5, this.radius / 2.5, 0, Math.PI * 2, false);
        c.fillStyle = '#ffc095';
        c.fill();
        c.stroke();
        
        c.beginPath();
        c.arc(this.x + this.radius / leg[1], this.y + this.radius / 1.5, this.radius / 2.5, 0, Math.PI * 2, false);
        c.fillStyle = '#ffc095';
        c.fill();
        c.stroke();
        
        //Circle        
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.stroke();
        
        //Eye
        c.beginPath();
        c.ellipse(this.x + this.radius / 2.5, this.y - this.radius / 3, this.radius / 3, this.radius / 2.5, Math.PI / 2, 0, 2 * Math.PI);
        c.fillStyle = '#FFF';
        c.fill();
        c.stroke();
        
        c.beginPath();
        c.ellipse(this.x + this.radius / 2.5, this.y + this.radius / 3, this.radius / 3, this.radius / 2.5, Math.PI / 2, 0, 2 * Math.PI);
        c.fillStyle = '#FFF';
        c.fill();
        c.stroke();
        
        //Eyeball
        c.beginPath();
        c.arc(this.x + this.radius / 1.7, this.y - this.radius / 3, this.radius / 5, 0, Math.PI * 2, false);
        c.fillStyle = 'black';
        c.fill();
        
        c.beginPath();
        c.arc(this.x + this.radius / 1.7, this.y + this.radius / 3, this.radius / 5, 0, Math.PI * 2, false);
        c.fillStyle = 'black';
        c.fill();
        
        c.restore();
        
    }
    rotate({ x, y }) {
        let dy = y - this.y
        let dx = x - this.x
        
        this.angle = Math.atan2(dy, dx)
    }
}

class Bullet {
    constructor(x, y, radius, color, velocity, strength) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.strength = strength;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Particles {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }
    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

/* Setting Varibles */
var canvas;
var c;

var x;
var y;

var bullets = [];
var enemies = [];
var particles = [];

var down = false;
var up = false;
var right = false;
var left = false;

var leg = [1.6, 1.6]
var isUp = true; 

var isMoving = {
    "w" : false,
    "a" : false,
    "s" : false,
    "d" : false
}

var speech = "";

const friction = 0.99;
var spawnTime = 5000;
var enemyRadius = 30;
var shootNow = true;
var animationId;
var intervalId;
var score = 0;

var health;
var character_speed;
var shooting_speed;
var bullet_speed;
var bullet_strength;
var reloading_time;
var magazine_capacity;
var life;
var high_score;
var points;

var ongoing = false;

/* EVENT LISTENER */
$(document).ready(function () {
    getGameInfo();
    
    $('.modal-backdrop').remove();
    $('#gameover').css("display","none");
    
    $('#mainModal').modal({
        backdrop: 'static',
        keyboard: false
    });
    $('#shopModal').modal({
        backdrop: 'static',
        keyboard: false
    });
    $('#mainModal').modal('show');

    canvas = document.querySelector('canvas');
    c = canvas.getContext('2d');

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    x = canvas.width / 2;
    y = canvas.height / 2;
});

$(document).on('click', '#shopBtn', function () {
    $('#mainModal').modal('hide');
    $('#shopModal').modal('show');
})

$(document).on('click', '.btnShop', function () {
    let id = this.id;

    if (points >= 100) {
        points -= 100;
        switch (id) {
            case 'lifeBtn':
                life += 1;
                break;
            case 'healthBtn':
                health += 10;
                break;
            case 'speedBtn':
                character_speed += 0.5;
                break;
            case 'shootingSpeedBtn':
                shooting_speed -= 100;
                break;
            case 'strengthBtn':
                bullet_strength += 1;
                break;
            case 'bulletSpeedBtn':
                bullet_speed += 0.5;
                break;
            case 'reloadBtn':
                reloading_time -= 100;
                break;
            case 'magBtn':
                magazine_capacity += 1;
                break;
        }
        let data = getData();
        updateGameInfo(data);
    }
})


$(document).on("click", "#playBtn", function () {
    $('#mainModal').modal('hide');
    
    life --;
    let data = getData();
    updateGameInfo(data);

    init();
    animate();

    spawnEnemies();

    canvas.addEventListener('click', shootbullets);

    addEventListener('keydown', function (event) {
        const code = event.code;

        if (code == 'KeyR') {
            reload();
        }
        if (code == 'KeyW' || code == 'ArrowUp') {
            up = true;
            isMoving['w'] = true;
        }
        if (code == 'KeyS' || code == 'ArrowDown') {
            down = true;
            isMoving['s'] = true;
        }
        if (code == 'KeyA'|| code == 'ArrowLeft') {
            left = true;
            isMoving['a'] = true;
        }
        if (code == 'KeyD'  || code == 'ArrowRight') {
            right = true;
            isMoving['d'] = true;
        }
    })

    addEventListener('keyup', function (event) {
        const code = event.code;

        if (code == 'KeyW' || code == 'ArrowUp') {
            up = false;
            isMoving['w'] = false;
        }
        if (code == 'KeyS' || code == 'ArrowDown') {
            down = false;
            isMoving['s'] = false;
        }
        if (code == 'KeyA'|| code == 'ArrowLeft') {
            left = false;
            isMoving['a'] = false;
        }
        if (code == 'KeyD'  || code == 'ArrowRight') {
            right = false;
            isMoving['d'] = false;
        }
    })

    addEventListener('mousemove', rotateCharacter);
})

// window.addEventListener("blur", function(){
//     if(ongoing){
//         cancelAnimationFrame(animationId);
//         removeEventListener('click', shootbullets);

//         $("#gameover").css("display", "block");
//         $('#mainModal').modal('show');

//         if(score > high_score){
//             high_score = score;
//             let data = getData();
//             updateGameInfo(data);
//         }
//         ongoing = false;
//     }
// })

/* API CALLS */
function getGameInfo() {
    let user_id = JSON.parse(localStorage.getItem('userInfo'))._id;

    $.ajax({
        url: `/game?user_id=${user_id}`,
        type: 'GET',
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            extractData(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            if(JSON.parse(xhr.responseText).code == "NOT_FOUND"){
                createGameInfo();
            }
        }
    });
}

function createGameInfo(){
    let user_id = JSON.parse(localStorage.getItem('userInfo'))._id;

    $.ajax({
        url: `/game?user_id=${user_id}`,
        method: 'POST',
        dataType: 'JSON',
        success: function(data, textStatus, xhr) {
            console.log("Game Info Successfully Created!");
            getGameInfo();
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("Error: " + xhr.responseText);
        }
    });
}

function updateGameInfo(data) {
    let user_id = JSON.parse(localStorage.getItem('userInfo'))._id;

    $.ajax({
        url: `/game?user_id=${user_id}`,
        type: 'PUT',
        data: data,
        dataType: 'JSON',
        success: function (data, textStatus, xhr) {
            extractData(data.result);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(errorThrown);
            alert('Error purchasing items!');
        }
    });
}

function getData() {
    let data = {
        "life": life,
        "points": points,
        "high_score": high_score,
        "character_health": health,
        "bullet_speed": bullet_speed,
        "reload_time": reloading_time,
        "magazine": magazine_capacity,
        "character_speed": character_speed,
        "shooting_speed": shooting_speed,
        "bullet_strength": bullet_strength
    }

    return data;
}

function extractData(data) {
    life = data.life;
    points = data.points;
    high_score = data.high_score;
    health = data.character_health;
    bullet_speed = data.bullet_speed;
    reloading_time = data.reload_time;
    magazine_capacity = data.magazine;
    shooting_speed = data.shooting_speed;
    character_speed = data.character_speed;
    bullet_strength = data.bullet_strength;

    if(data.life <= 0){
        $("#playBtn").addClass("disabled");
    }
    displayGameInfo();
    disableShopBtn();
}

function displayGameInfo() {
    document.getElementById('life').innerHTML = life;
    document.getElementById('life2').innerHTML = life;
    document.getElementById('health').innerHTML = health;
    document.getElementById('health2').innerHTML = health;
    document.getElementById('points').innerHTML = points;
    document.getElementById('highScore').innerHTML = high_score;
    document.getElementById('speed').innerHTML = character_speed;
    document.getElementById('shootingSpeed').innerHTML = shooting_speed / 1000;
    document.getElementById('reload').innerHTML = reloading_time / 1000;
    document.getElementById('mag').innerHTML = magazine_capacity;
    document.getElementById('bulletSpeed').innerHTML = bullet_speed;
    document.getElementById('strength').innerHTML = bullet_strength;
}

function disableShopBtn() {
    if (points < 100) {
        $('.btnShop').addClass('disabled');
    }
}

/* Game mechanics */
function init() {
    player = new Player(x, y, - Math.PI / 2, 25, '#ffc095', character_speed, health, reloading_time, magazine_capacity, shooting_speed);
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    document.getElementById("health2").innerHTML = health;
    document.getElementById("score").innerHTML = score;
    ongoing = true;
    spawnTime = 5000;
    enemyRadius = 30;

}

function spawnEnemies() {

    // Making enemy spawn more the longer player survive
    setTimeout(() => {
        spawnTime *= 0.90;
        enemyRadius *= 1.2;
        clearInterval(intervalId);
        spawnEnemies();
    }, 10000);

    console.log(spawnTime)

    intervalId = setInterval(() => {
        const radius = Math.random() * (enemyRadius - 15) + 15;

        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }
        else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(player.y - y, player.x - x);

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, spawnTime)
}

function animate() {
    animationId = requestAnimationFrame(animate);

    c.fillStyle = "rgba(255, 255, 255, 1)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        }
        else {
            particle.update();
        }
    })

    bullets.forEach((bullet, index) => {
        bullet.update();

        //Remove bullet from edges of the screen
        if (bullet.x + bullet.radius < 0 || bullet.x - bullet.radius > canvas.width ||
            bullet.y + bullet.radius < 0 || bullet.y - bullet.radius > canvas.height) {
            setTimeout(() => {
                bullets.splice(index, 1);
            }, 0)
        }
    })

    player.draw();
    moveCharacter();

    enemies.forEach((enemy, index) => {
        enemy.update();

        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

        enemy.velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        //Check if enemy touches player
        if (dist - enemy.radius - player.radius < 0.5) {

            player.health -= enemy.radius;
            document.getElementById("health2").innerHTML = Math.ceil(player.health);

            if (player.health - enemy.radius <= 0) {
                ongoing = false;

                cancelAnimationFrame(animationId);
                removeEventListener('click', shootbullets);

                $("#gameover").css("display", "block");
                $('#mainModal').modal('show');

                clearInterval(intervalId);

                if(score > high_score){
                    high_score = score;
                    let data = getData();
                    updateGameInfo(data);
                }
            }
            else {

                setTimeout(() => {
                    enemies.splice(index, 1);
                }, 0);

            }
        }

        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);

            //When bullets touch enemy
            if (dist - enemy.radius - bullet.radius < 0.5) {

                //Create explosions
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particles(bullet.x, bullet.y, Math.random() * 2, enemy.color,
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 6),
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        })
                    )
                }

                if (enemy.radius - bullet.strength > bullet.strength) {

                    //Increase score
                    score += bullet.strength;
                    // scoreElement.innerHTML = score;

                    gsap.to(enemy, {
                        radius: enemy.radius - bullet.strength
                    });
                    

                    setTimeout(() => {
                        bullets.splice(bulletIndex, 1);
                    }, 0);
                }
                else {
                    //Increase score
                    score += Math.floor(enemy.radius);
                    // scoreElement.innerHTML = score;

                    setTimeout(() => {
                        enemies.splice(index, 1);
                        bullets.splice(bulletIndex, 1);
                    }, 0);
                }
                document.getElementById("score").innerHTML = score;
            }
        })
    })

    c.fillStyle = 'black';
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = player.radius + "px creepster";
    c.fillText(speech, player.x, player.y - player.radius * 2);
}

function moveCharacter() {
    let player_x = player.x;
    let player_y = player.y;

    if (up) {
        player_y = player_y - player.speed;
    }
    else if (down) {
        player_y = player_y + player.speed;
    }
    if (left) {
        player_x = player_x - player.speed;
    }
    else if (right) {
        player_x = player_x + player.speed;
    }

    if (player_x + player.radius >= canvas.width) {
        player_x = canvas.width - player.radius;
    }
    else if (player_x - player.radius <= 0) {
        player_x = 0 + player.radius;
    }

    if (player_y + player.radius > canvas.height) {
        player_y = canvas.height - player.radius;
    }
    else if (player_y - player.radius <= 0) {
        player_y = 0 + player.radius;
    }

    player.x = player_x;
    player.y = player_y;

    moveLeg();
}

function moveLeg(){
    let moving = false;

    Object.keys(isMoving).forEach(key =>{
        if(isMoving[key] == true){
            moving = true;
            return false;
        }
    })

    if(moving){
        if(isUp){
            leg[0] += 0.1;
            leg[1] -= 0.1;
    
            if(leg[0] > 2.1) isUp = false;
        }
        else{
            leg[0] -= 0.1; 
            leg[1] += 0.1;
    
            if(leg[0] < 1.1) isUp = true;
        }
    }
}

function rotateCharacter(event) {
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let dy = y - player.y
    let dx = x - player.x

    // essentially get the angle from the player to the cursor in radians
    player.angle = Math.atan2(dy, dx)
}

function shootbullets(event) {
    if (player.mag != 0) {
        if (shootNow) {
            player.mag -= 1;
            const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);

            const velocity = {
                x: Math.cos(angle) * bullet_speed,
                y: Math.sin(angle) * bullet_speed
            };

            bullets.push(new Bullet(player.x , player.y , 8, 'black', velocity, bullet_strength));

            shootNow = false;

            setTimeout(function () {
                shootNow = true;
            }, player.shooting)

            if(player.mag == 0) speech = "Press R to reload!";
        }
    }
}

function reload() {
    canvas.removeEventListener('click', shootbullets);
    speech = 'Reloading!';
    
    setTimeout(function () {
        player.mag = 10;
        speech = '';
        canvas.addEventListener('click', shootbullets);
    }, player.reload)
}

