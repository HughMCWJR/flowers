const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const segmentOutlineColor = "#4b5320";
const segmentFillColor = "#84f542";

const flowerColors = [
    "#e06377",
    "#c83349",
    "#5b9aa0",
    "#622569",
    "#e28d00"];

const centerFlowerColor = "#e0dd26";

const leafColor = "#248f11";

const flowerMinimumBaseSize = 25;
const flowerAngleLimit = Math.PI * 0.3;

const date = new Date();
//Math.seedrandom(date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString());

const maxFlowerRotation = Math.PI * 0.1 + Math.random() * Math.PI * 0.2;

const chanceToSpawnBranch = Math.random() * 0.08;
// const chanceToSpawnLeaf = Math.random() * 0.12;
const chanceToSpawnLeaf = 0;

const diverseColors = Math.random() < 0.5;

class Point {

    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    followAngleTowardsPoint(angle, distance) {

        return new Point(
            this.x + Math.cos(angle) * distance,
            this.y - Math.sin(angle) * distance
        );

    }

}

class Vector {

    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static createFromTwoPoints(pointA, pointB) {
        return new Vector(pointB.x - pointA.x, pointB.y - pointA.y);
    }

    getAngle() {

        const atan = Math.atan(this.y / this.x);
        return this.x < 0 ? atan + Math.PI : atan;

    }

    addToPoint(point) {
        return new Point(point.x + this.x, point.y + this.y);
    }

    scale(scale) {
        this.x *= scale;
        this.y *= scale;
        return this;
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    setToLength(length) {
        const curLength = Math.sqrt((this.x ** 2) + (this.y ** 2))
        this.x *= length / curLength;
        this.y *= length / curLength;
        return this;
    }

    rotate90CW() {
        const oldX = this.x;
        this.x = this.y;
        this.y = -oldX;
        return this;
    }

    rotate90CCW() {
        const oldX = this.x;
        this.x = -this.y;
        this.y = oldX;
        return this;
    }

}

function draw() {

    clearCanvas();

    var segments = [];

    var currentAngle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25;
    var currentWidth = Math.random() * flowerMinimumBaseSize + flowerMinimumBaseSize;
    var flowerHeight = Math.random() * canvas.height / 2 + canvas.height / 4;
    var currentPosition = new Point(
        canvas.width / 2,
        canvas.height - (flowerHeight / 2)
    );

    const flowerColor = getRandomFlowerColor();
    const allSameColor = Math.random() < 0.5;

    while (currentPosition.y > flowerHeight / 2) {

        const bottomRightPoint = currentPosition.followAngleTowardsPoint(currentAngle - Math.PI / 2, currentWidth / 2);
        const topRightPoint = bottomRightPoint.followAngleTowardsPoint(currentAngle + Math.PI * 0.05, currentWidth);
        const bottomLeftPoint = currentPosition.followAngleTowardsPoint(currentAngle + Math.PI / 2, currentWidth / 2);
        const topLeftPoint = bottomLeftPoint.followAngleTowardsPoint(currentAngle - Math.PI * 0.05, currentWidth);

        segments.push([bottomRightPoint, topRightPoint, topLeftPoint, bottomLeftPoint]);
        drawSegment(segments[segments.length - 1]);

        currentPosition = currentPosition.followAngleTowardsPoint(currentAngle, currentWidth * 0.8);

        if (Math.abs(currentAngle - Math.PI / 2) > Math.PI / 2 - flowerAngleLimit)
            currentAngle += currentAngle > Math.PI / 2 ? -Math.random() * maxFlowerRotation : Math.random() * maxFlowerRotation;
        else
            currentAngle += Math.random() * maxFlowerRotation - maxFlowerRotation / 2;

        currentWidth *= Math.random() * 0.04 + 0.96;

        if (Math.random() < chanceToSpawnBranch)
            drawBranch((currentPosition.y - flowerHeight / 2) / currentWidth, currentAngle + Math.random() * Math.PI - Math.PI / 2, currentWidth, currentPosition.x, currentPosition.y, allSameColor ? flowerColor : undefined);

        if (Math.random() < chanceToSpawnLeaf) {
            const leafStartPoint = segments[segments.length - 1][Math.floor(Math.random() * 4)]
            drawPetal(leafColor, leafStartPoint, 0, Math.random() * 30 + 50, Math.random() * Math.PI + Math.PI, Math.random() * 20 + 30);
        }
            

    }

    drawFlower(flowerColor, currentPosition, currentWidth);

}

function drawBranch(length, startAngle, startWidth, startX, startY, lastFlowerColor) {

    var segments = [];

    var currentAngle = startAngle;
    var currentWidth = startWidth;
    var currentPosition = new Point(
        startX,
        startY
    );

    const flowerColor = lastFlowerColor === undefined ? getRandomFlowerColor() : lastFlowerColor;

    for (let i = 0; i < length; i++) {

        const bottomRightPoint = currentPosition.followAngleTowardsPoint(currentAngle - Math.PI / 2, currentWidth / 2);
        const topRightPoint = bottomRightPoint.followAngleTowardsPoint(currentAngle + Math.PI * 0.05, currentWidth);
        const bottomLeftPoint = currentPosition.followAngleTowardsPoint(currentAngle + Math.PI / 2, currentWidth / 2);
        const topLeftPoint = bottomLeftPoint.followAngleTowardsPoint(currentAngle - Math.PI * 0.05, currentWidth);

        segments.push([bottomRightPoint, topRightPoint, topLeftPoint, bottomLeftPoint]);
        drawSegment(segments[segments.length - 1]);

        currentPosition = currentPosition.followAngleTowardsPoint(currentAngle, currentWidth * 0.8);

        if (Math.abs(currentAngle - Math.PI / 2) > Math.PI / 2 - maxFlowerRotation)
            currentAngle += currentAngle > Math.PI / 2 ? -Math.random() * maxFlowerRotation : Math.random() * maxFlowerRotation;
        else
            currentAngle += Math.random() * maxFlowerRotation - maxFlowerRotation / 2;


        currentWidth *= Math.random() * 0.05 + 0.95;

    }

    drawFlower(flowerColor, currentPosition, currentWidth);

}

function drawSegment(segment) {

    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(segment[0].x, segment[0].y);

    for (let i = 1; i < segment.length; i++) {

        ctx.lineTo(segment[i].x, segment[i].y);

    }

    ctx.fillStyle = segmentFillColor;
    ctx.fill();

    ctx.strokeStyle = segmentOutlineColor;
    ctx.stroke();

}

function drawFlower(color, location, stemSize) {

    const halfNumberOfPetals = Math.floor(Math.random() * 10 + 8);

    const flowerRadius = (Math.random() * 4 + 2) * stemSize;
    const flowerCenterRadius = (Math.random() * 0.25 + 0.25) * flowerRadius;

    const petalBezierPointWidth = ((Math.PI * flowerCenterRadius) / (halfNumberOfPetals)) * (Math.random() * 2 + 4)

    ctx.beginPath();
    ctx.arc(location.x, location.y, (flowerCenterRadius + flowerRadius) / 2, 0, 2 * Math.PI);
    ctx.fillStyle = centerFlowerColor;
    ctx.fill();

    for (let i = 0; i < halfNumberOfPetals; i++) {

        const angle = (Math.PI / halfNumberOfPetals) * i;
        const otherAngle = angle + Math.PI;
        
        drawPetal(color, location, flowerCenterRadius, flowerRadius, angle, petalBezierPointWidth);
        drawPetal(color, location, flowerCenterRadius, flowerRadius, otherAngle, petalBezierPointWidth);

    }

}

function drawPetal(color, flowerCenter, innerRadius, outerRadius, angle, petalBezierPointWidth) {

    const petalStartPosition = new Point(flowerCenter.x + Math.cos(angle) * innerRadius, flowerCenter.y + Math.sin(angle) * innerRadius);
    const petalEndPosition = new Point(flowerCenter.x + Math.cos(angle) * outerRadius, flowerCenter.y + Math.sin(angle) * outerRadius);

    const spineVector = Vector.createFromTwoPoints(petalStartPosition, petalEndPosition);

    const petalCenterPosition = spineVector.copy().scale(0.5).addToPoint(petalStartPosition);

    const leftBezierPoint = spineVector.copy().rotate90CCW().setToLength(petalBezierPointWidth / 2).addToPoint(petalCenterPosition);
    const rightBezierPoint = spineVector.copy().rotate90CW().setToLength(petalBezierPointWidth / 2).addToPoint(petalCenterPosition);

    ctx.beginPath();

    ctx.moveTo(petalStartPosition.x, petalStartPosition.y);

    ctx.quadraticCurveTo(leftBezierPoint.x, leftBezierPoint.y, petalEndPosition.x, petalEndPosition.y);
    ctx.quadraticCurveTo(rightBezierPoint.x, rightBezierPoint.y, petalStartPosition.x, petalStartPosition.y);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = segmentOutlineColor;
    ctx.stroke();

}

function clearCanvas() {

    ctx.clearRect(0, 0, canvas.height, canvas.height);

}

function getRandomFlowerColor() {
    return flowerColors[Math.floor(Math.random() * flowerColors.length)];
}