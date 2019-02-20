var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var planeImg = new Image();
var monsterImg = new Image();
var boomImg = new Image();
planeImg.src = CONFIG.planeIcon;
monsterImg.src = CONFIG.enemyIcon;
boomImg.src = CONFIG.enemyBoomIcon;
var monster;// 怪兽实例
var plane;// 飞机实例
var key_record = [];// 记录键盘事件的keyCode
var animate;// animate中的值可以传到window.cancelAnimationFrame()以取消回调函数


// 元素
var container = document.getElementById('game');
var playBtn = document.querySelector('.js-play');
var replayBtn = document.querySelectorAll('.js-replay'); // 有两个replay按钮，一个是游戏失败后，一个是通关后
var nextBtn = document.querySelector('.js-next');
var score = document.querySelector('.score');
var nextLevel = document.querySelector('.game-next-level');


// 兼容定义requestAnimFrame
window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000/30);
    };


/**
 * 整个游戏对象
 */
var GAME = {
    status: CONFIG.status, // 初始游戏状态
    score: 0, // 游戏分数
    /**
     * 初始化函数,这个函数只执行一次
     * @param {object} opts
     * @return {[type]}      [description]
     */
    init: function(opts) {
        monster = new Monster(opts);
        plane = new Plane(opts);
        key_record = [];
    },
    /**
     * 绑定事件函数
     */
    bindEvent: function() {
        var self = this;
        // 开始游戏按钮
        playBtn.addEventListener("click", function () {
            self.play();
        });
        // 重新开始游戏按钮（游戏失败后和游戏通关后）
        replayBtn.forEach(function (value) {
            value.addEventListener("click", function () {
                self.score = 0;
                CONFIG.level = 1;
                self.init(CONFIG);
                self.play();
            })
        });
        // 下一关按钮
        nextBtn.addEventListener("click", function () {
            CONFIG.level++;
            self.init(CONFIG);
            self.play();
        });
        // 操作飞机
        document.addEventListener("keyup", function (e) {
            if (self.status === 'playing') {
                key_record[e.keyCode] = false;
                if (e.keyCode === 32) { // 每摁一下空格发射一枚子弹
                    plane.fire();
                }
            }
        });
        document.addEventListener("keydown", function (e) {
            if (self.status === 'playing') {
                key_record[e.keyCode] = true;
            }
        });
    },
    /**
     * 更新游戏状态，分别有以下几种状态：
     * start  游戏前
     * playing 游戏中
     * failed 游戏失败
     * success 游戏成功
     * all-success 游戏通过
     * stop 游戏暂停（可选）
     */
    setStatus: function(status) {
        this.status = status;
        container.setAttribute("data-status", status);
    },
    play: function() {
        this.setStatus('playing');
        this.init(CONFIG);
        monster.draw();
        plane.draw();
        this.refresh();
    },
    failed: function () {
        this.clean();
        this.setStatus('failed');
    },
    success: function () {
        this.clean();
        this.setStatus('success');
    },
    allSuccess: function () {
        this.clean();
        this.setStatus('all-success');
    },
    stop: function () {
        this.setStatus('stop');
    },
    /**
     * refresh: 刷新画面
     */
    refresh: function () {
        var self = this;
        // animate中的值可以传到window.cancelAnimationFrame()以取消回调函数
        // 此函数放置在具体操作的前方
        // 如果放在后面在结束
        animate = requestAnimFrame(function () {
            self.refresh();
        });
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < plane.bullets.length; i++) {
            plane.bullets[i].move();
            plane.bullets[i].draw();
        }
        this.bulletOut();
        this.crash();
        monster.move();
        monster.draw();
        plane.move();
        plane.draw();
        this.control();
        this.showScore();
    },
    /**
     * 展示游戏分数
     */
    showScore: function () {
        context.font = "18px arial";
        context.fillStyle = "white";
        context.fillText('分数：' + this.score, 20, 20);
    },
    /**
     * crash: 碰撞检测
     */
    crash: function () {
        for (var i = 0; i < monster.row; i++) {
            for (var j = 0; j < monster.column; j++) {
                if (monster.life[i][j] === 1) {
                    for (var k = 0; k < plane.bullets.length; k++) {
                        if (!(monster.x[j] + monster.width < plane.bullets[k].x) &&
                            !(plane.bullets[k].x < monster.x[j]) &&
                            !(monster.y[i] + monster.height < plane.bullets[k].y) &&
                            !(plane.bullets[k].y < monster.y[i])) {
                            monster.life[i][j] = -3;
                            plane.bullets.shift();
                            this.score++;
                        }
                    }
                }
            }
        }
    },
    /**
     * bulletOut: 检测子弹是否发射出画面
     */
    bulletOut: function () {
        for (var i = 0; i < plane.bullets.length; i++) {
            if (plane.bullets[i].y < 0) {
                plane.bullets.shift();
            }
        }
    },
    /**
     *
     */
    clean: function () {
        cancelAnimationFrame(animate);
        plane = null;
        monster = null;
        key_record = null;
        context.clearRect(0, 0, canvas.width, canvas.height);
    },
    /**
     * monitor: 监听游戏状态
     */
    monitor: function () {
        var killed = 0; //
        var padding = canvas.height - CONFIG.canvasPadding - plane.height - monster.height;
        for (var i = 0; i < monster.row; i++) {
            for (var j = 0; j < monster.column; j++) {
                if (monster.life[i][j] === 0) {
                    killed++;
                }
                if (monster.life[i][j] === 1 && monster.y[i] > padding) {
                    return -1
                }
            }
        }
        if (killed === monster.row * monster.column) {
            return 1;
        }
    },
    /**
     * control: 控制游戏状态
     */
    control: function () {
        var result = this.monitor();
        if (result === 1) {
            if (CONFIG.level < CONFIG.totalLevel) {
                this.success();
                nextLevel.innerHTML = '下一关等级为Level：' + (CONFIG.level + 1);
            } else if (CONFIG.level === CONFIG.totalLevel) {
                this.allSuccess();
            }
        } else if (result === -1) {
            score.innerHTML = this.score;
            this.failed();
        }
    }
};


// 初始化
window.onload = function () { GAME.bindEvent(); };