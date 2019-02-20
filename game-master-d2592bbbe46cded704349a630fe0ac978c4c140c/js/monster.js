/**
 * 定义一个敌人类
 * @param {object} opts
 * @constructor
 */


var Monster = function (opts) {
    this.width = opts.enemySize;
    this.height = opts.enemySize;
    this.speed = opts.enemySpeed;
    this.direction = opts.enemyDirection;
    this.gap = opts.enemyGap;
    this.column = opts.numPerLine;
    this.row = opts.level;
    this.canvasPadding = opts.canvasPadding;
    // 用两个数组来存储敌人的坐标
    this.x = [];
    this.y = [];
    // 初始化坐标
    for (var i = 0; i < this.row; i++) {
        this.y[i] = i * this.height + this.canvasPadding;
        for (var j = 0; j < this.column; j++) {
            this.x[j] = j * this.width + this.gap
        }
    }
    // 用一个二维数组来存储每个敌人的生命值
    this.life = [];
    // 每个敌人的默认生命值为1
    for (var i = 0; i < this.row; i++) {
        this.life[i] = [];
        for (var j = 0; j < this.column; j++) {
            this.life[i][j] = 1;
        }
    }
};


Monster.prototype.draw = function () {
    for (var i = 0; i < this.row; i++) {
        for (var j = 0; j < this.column; j++) {
            if (this.life[i][j] === 1) {
                context.drawImage(monsterImg, this.x[j], this.y[i], this.width, this.height);
            } else if (this.life[i][j] !== 0) {
                context.drawImage(boomImg, this.x[j], this.y[i], this.width, this.height);
                this.life[i][j]++; // 爆照画面保留3帧
            }
        }
    }
};


Monster.prototype.move = function () {
    var first;
    var last;

    // 只要每一列上存在敌人，那么就以这一列为边界first或者last
    selectFirst:
        for (var i = 0; i < this.column; i++) {
            for (var j = 0; j < this.row; j++) {
                if (this.life[j][i]) {
                    first = i;
                    break selectFirst;
                }
            }
        }

    selectLate:
        for (var i = this.column - 1; i >= 0; i--) {
            for (var j = this.row - 1; j >= 0; j--) {
                if (this.life[j][i]) {
                    last = i;
                    break selectLate;
                }
            }
        }

    if (this.direction === "right") {
        for (var i = 0; i < this.column; i++) {
            this.x[i] += this.speed;
        }
        if (this.x[last] > canvas.width - this.canvasPadding - this.width) {
            this.direction = "left";
            for (var j = 0; j < this.column; j++) {
                this.y[j] += this.height;
            }
        }
    } else if (this.direction === "left") {
        for (var i = 0; i < this.column; i++) {
            this.x[i] -= this.speed;
        }
        if (this.x[first] < this.canvasPadding) {
            this.direction = "right";
            this.y[j] += this.height;
        }
    }
};