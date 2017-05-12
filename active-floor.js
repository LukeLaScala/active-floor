/**
 * Active Floor
 * 
 * @since 1.0
 * @description A simple multiplayer game built for a BrightLogic Active Floor.
 * @author Luke Lascala, Sam Olaogun
 */
'use strict';

let data;
const xhr = new XMLHttpRequest();
xhr.open('GET', 'http://activefloor.bca.bergen.org:8080/');
xhr.addEventListener('load', function() { data = this.repsonseText; });
xhr.send();

doucment.querySelector('body').classList.add('app');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.classList.add('app');
ctx.lineWidth = 2;
canvas.height = canvas.width;

const radius = 10;
const balls = [];
const minSpeed = { x: 1, y: 1 };
const maxSpeed = { x: 2, y: 2 };
const activeMark = '*';

let steppingState;

(function renderView() {
    /* Temp data */
    data = /* Get sensor data */ [
        ['.', '*', '.', '.'],
        ['.', '.', '*', '.'],
        ['.', '*', '.', '.'],
        ['.', '.', '.', '*'],
    ];

    steppingState = parseSensorData(data);

    // console.log(steppingState);
    // debugger;

    clearBoard();
    if (balls[0]) balls.map(ball => ball.render());
    window.requestAnimationFrame(renderView);
})();

// Shoot only every three seconds
setInterval(shootBalls, 3000);

function shootBalls() {

    // Clamp
    steppingState.forEach((coor, i) => {
        balls.push(new Ball(i, {
            x: coor.x + radius,
            y: coor.y + radius
        }, {
            dx: Math.floor(Math.random() * (maxSpeed.x - minSpeed.x + 1)) + minSpeed.x,
            dy: Math.floor(Math.random() * (maxSpeed.y - minSpeed.y + 1)) + maxSpeed.y
        }));
    })
}

/**
 * @description - Creates a ball with the specified properties.
 * @param {number} senderQuadrant — The quadrant that the ball is sent from.
 * @param {Object} currPos — The c
 * @param {number} speed — speed
 */
function Ball(senderQuadrant, currPos, speed) {
    this.senderQuadrant = senderQuadrant;
    this.currPos = currPos;
    this.speed = speed;
}

Ball.prototype.handleWallHit = function(dir) {
    if (dir === 'x') this.speed.dx = -this.speed.dx;
    else this.speed.dy = -this.speed.dy;
}

Ball.prototype.render = function() {
    ctx.beginPath();
    ctx.arc(this.currPos.x, this.currPos.y, radius, 0, Math.PI * 2);

    ctx.stroke();
    ctx.fill();

    if (this.currPos.x + radius >= canvas.width ||
        this.currPos.x - radius <= 0)
        this.handleWallHit('x');

    if (this.currPos.y + radius >= canvas.height ||
        this.currPos.y - radius <= 0)
        this.handleWallHit('y');

    this.currPos.x += this.speed.dx;
    this.currPos.y += this.speed.dy;
}

/**
 * @description - Clears the current context and redraws the axes.
 */
function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // X
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Y
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

/**
 * @description - Parses the stepping data from the view.
 * @param {string[][]} view - The sensor data
 */
function parseSensorData(view) {
    let steppingData = [];

    // Retrieves the step closest to the bottom corner. A bit kludgy, but it works
    view.forEach((row, i) => {
        if (i <= Math.floor((view.length - 1) / 2)) {
            row.forEach((col, j) =>
                j <= Math.floor((row.length - 1) / 2) ?
                (col === activeMark ? steppingData[1] = { x: i, y: j } : null) :
                (col === activeMark ? steppingData[0] = { x: i, y: j } : null)
            );
        } else {
            row.forEach((col, j) =>
                j <= Math.floor((row.length - 1) / 2) ?
                (col === activeMark ? steppingData[2] = { x: i, y: j } : null) :
                (col === activeMark ? steppingData[3] = { x: i, y: j } : null)
            );
        }
    })

    return steppingData.map(step => ({
        x: step.x * canvas.width / (view.length - 1),
        y: step.y * canvas.height / (view.length - 1)
    }));
}
