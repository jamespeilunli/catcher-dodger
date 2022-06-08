// FUNCTIONS
function background(color) {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function rect(x, y, width, height, color) {
    ctx.beginPath();
    ctx.rect(x-width/2, y-height/2, width, height);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function write_text(text, x, y, color, font) {
    ctx.beginPath();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
    ctx.closePath();
}

function range_between(a_min, a_max, b_min, b_max) {
    return (a_min > b_min && a_min < b_max) || (a_max > b_min && a_max < b_max);
}

function randint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function randrange(min, max) {
    return Math.random() * (max - min) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// CLASSES

class Player {

    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.dead = false;
    }

    change_pos(event) {
        let rect = canvas.getBoundingClientRect();
        this.x = event.clientX - rect.left;
    }

    tick() {
        // draw
        rect(this.x, this.y, this.width, this.height, this.color);
    }

}

class FallingObject {

    constructor(x, y, d, width, height, color) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    tick(player) {
        // move
        this.y += this.d;

        // if falling_object collided with player
        if (range_between(this.x - this.width/2, this.x + this.width/2, 
                          player.x - player.width/2, player.x + player.width/2) &&
            range_between(this.y - this.height/2, this.y + this.height/2, 
                          player.y - player.height/2, player.y + player.height/2)) { 
            if (dodger_game) player_is_dead = true;
            else return true;
        }

        // if falling_object has reached the end without colliding
        if (this.y + this.height >= canvas.height) {
            if (dodger_game) return true;
            else player_is_dead = true;
        }

        // draw
        rect(this.x, this.y, this.width, this.height, this.color);

        return false;
    }

}

// MAIN

let canvas, ctx, dodger_game, player, falling_objects, player_is_dead, t, score, cur_interval;

function tick() {
    if (player_is_dead) {
        background("red");

        write_text("You Died!", canvas.width/2, 200, "black", "30px Arial");
        write_text(`Final Score: ${score}`, canvas.width/2, 250, "black", "30px Arial");
    } else {    
        background("black");

        if (t % Math.floor(150*(score+1)**0.8/(score+1)) == 0) {
            falling_objects.push(new FallingObject(randint(10, canvas.width-10), 10, randrange((score+1)**0.4, (score+1)**0.5), randint(10, 50), randint(10, 50), dodger_game ? "red" : "lime"));
        }

        let remove = -1;
        for (let i = 0; i < falling_objects.length; i++) {
            if (falling_objects[i].tick(player)) { // tick falling_object; if return true, falling_object died
                remove = i;
                score++;
            }
        }
        if (remove !== -1) falling_objects.splice(remove, 1);

        player.tick();

        // show score
        write_text(`Score: ${score}`, canvas.width/2, 20, "white", "18px Arial");

        t++;
    }
}

function run() {
    document.getElementsByTagName("canvas")[0].outerHTML = '<canvas id="canvas" width="400" height="600" onmousemove="player.change_pos(event);"></canvas>'

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    dodger_game = document.getElementsByName("game-type")[1].checked; // is the game a dodger game (false)? or is it a catcher game (true)

    player = new Player(canvas.width/2, canvas.height-70, 50, 50, "white");
    falling_objects = [];

    player_is_dead = false;
    t = 0;
    score = 0;

    if (cur_interval) clearInterval(cur_interval);
    cur_interval = setInterval(tick, 10);
}


