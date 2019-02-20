/**
 * 定义一个子弹类
 * @param {object} opts
 * @constructor
 */


var Bullet = function (opts) {
    this.length = opts.bulletSize;
    this.speed = opts.bulletSpeed;
    this.x = plane.x + plane.width / 2;
    this.y = plane.y;
};


Bullet.prototype.draw = function () {
    context.beginPath();
    context.strokeStyle = "white";
    context.lineWidth = 1;
    context.moveTo(this.x, this.y);
    context.lineTo(this.x, this.y - this.length);
    context.stroke();
};


Bullet.prototype.move = function () {
    this.y -= this.speed;
};