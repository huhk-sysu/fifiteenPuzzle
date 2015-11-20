var globalVariable = {
    freeX: 3,
    freeY: 3,
    positionX: [],
    positionY: [],
    moveX: [-1, 0, 1, 0],
    moveY: [0, 1, 0, -1],
    PREPARING: 1,
    RUNNING: 2,
    STOP: 3,
    DEMOING: 4,
    gameStatus: 3,
    moveCounter: 0,
    timeCounter: 0,
    timer: -1,
    solution: [],
    clickValid: true
};

function createBoxes() {
    "use strict";
    var panda = $("img"), container = $("<div id='container'></div>"), i, x, y, box;
    for (i = 0; i < 16; ++i) {
        x = Math.floor(i / 4);
        y = i % 4;
        box = $("<div class='box'>" + (i + 1) + "</div>");
        box.addClass("top" + x);
        box.addClass("left" + y);
        box.attr("id", "box" + i);
        container.append(box);
        if (i < 15) {
            box.css("backgroundPosition", -88 * y + "px " + -88 * x + "px");
            globalVariable.positionX[i] = x;
            globalVariable.positionY[i] = y;
        }
    }
    panda.before(container);
}

function demoMouseDown() {
    "use strict";
    if (globalVariable.gameStatus === globalVariable.DEMOING) {
        alert("请耐心等待演示完成！");
        globalVariable.clickValid = false;
    }
}

function canMove(myId) {
    "use strict";
    var x = globalVariable.positionX[myId], y = globalVariable.positionY[myId], i;
    for (i = 0; i < 4; ++i) {
        if (x + globalVariable.moveX[i] === globalVariable.freeX && y + globalVariable.moveY[i] === globalVariable.freeY) {
            return true;
        }
    }
    // console.log("can't move!");
    return false;
}

function restartValid(valid) {
    "use strict";
    var restart = $("#restart"), resign = $("#resign");
    restart.attr("disabled", !valid);
    restart.toggleClass("disabled");
    resign.attr("disabled", valid);
    resign.toggleClass("disabled");
}

function gameOver(boxes) {
    "use strict";
    var i;
    for (i = 0; i < boxes.length - 1; ++i) {
        if (!boxes.eq(i).hasClass("left" + i % 4) || !boxes.eq(i).hasClass("top" + Math.floor(i / 4))) {
            return false;
        }
    }
    return true;
}

function boxesClick(myId) {
    "use strict";
    return function () {
        if (globalVariable.gameStatus === globalVariable.STOP || !globalVariable.clickValid) {
            return;
        }
        var ok = canMove(myId), target, myself, temp, boxes = $(".box");
        if (ok) {
            // change position
            // 先移除后添加
            target = $("#box15");
            myself = $("#box" + myId);
            target.removeClass("left" + globalVariable.freeY);
            target.removeClass("top" + globalVariable.freeX);
            target.addClass("left" + globalVariable.positionY[myId]);
            target.addClass("top" + globalVariable.positionX[myId]);
            myself.removeClass("left" + globalVariable.positionY[myId]);
            myself.removeClass("top" + globalVariable.positionX[myId]);
            myself.addClass("left" + globalVariable.freeY);
            myself.addClass("top" + globalVariable.freeX);

            // change data
            temp = globalVariable.freeX;
            globalVariable.freeX = globalVariable.positionX[myId];
            globalVariable.positionX[myId] = temp;

            temp = globalVariable.freeY;
            globalVariable.freeY = globalVariable.positionY[myId];
            globalVariable.positionY[myId] = temp;

            if (globalVariable.gameStatus === globalVariable.PREPARING) {
                globalVariable.solution.push(myId);
            }

            if (globalVariable.gameStatus === globalVariable.RUNNING) {
                ++globalVariable.moveCounter;
                $("#moveCounter").text("步数： " + globalVariable.moveCounter);
                if (globalVariable.solution[globalVariable.solution.length - 1] === myId) {
                    globalVariable.solution.pop();
                } else {
                    globalVariable.solution.push(myId);
                }
                if (gameOver(boxes)) {
                    alert("你在" + globalVariable.timeCounter.toFixed(1) + "秒内走了" + globalVariable.moveCounter + "步，最终获得了胜利！");
                    globalVariable.gameStatus = globalVariable.STOP;
                    clearInterval(globalVariable.timer);
                    restartValid(true);
                }
            }
        }
    };
}

function update() {
    "use strict";
    globalVariable.timeCounter += 0.1;
    $("#time").text("时间： " + globalVariable.timeCounter.toFixed(1) + "秒");
}

function demo() {
    "use strict";
    var restart = $("#restart"), id = globalVariable.solution.pop();
    globalVariable.clickValid = true;
    $("#box" + id).click();
    if (globalVariable.solution.length === 0) {
        clearInterval(globalVariable.timer);
        restart.attr("disabled", false);
        restart.removeClass("disabled");
        globalVariable.gameStatus = globalVariable.STOP;
        globalVariable.clickValid = true;
    }
}

function prepare() {
    "use strict";
    var boxes = $(".box"), restart = $("#restart"), resign = $("#resign"), mode = $("#mode"), picture = $("#panda"),
        pictureSelector = $("#pictureSelector"), i;

    for (i = 0; i < boxes.length - 1; ++i) {
        // 方块的点击事件在游戏停止时不反应
        // 仅当游戏进行时有胜利判定
        boxes.eq(i).mousedown(demoMouseDown);
        boxes.eq(i).click(boxesClick(i));
    }
    boxes.eq(15).hide();

    restart.click(function () {
        globalVariable.gameStatus = globalVariable.PREPARING;
        var counter = 0, rand, times = Math.floor(Math.random() * 20) + 40;  // move 40~60 times
        while (counter < times) {
            rand = Math.floor(Math.random() * 15);
            if (rand !== globalVariable.solution[globalVariable.solution.length - 1] && canMove(rand)) {  // 不重复动2次同一个
                boxes.eq(rand).click();
                ++counter;
            }
        }
        globalVariable.gameStatus = globalVariable.RUNNING;
        globalVariable.moveCounter = 0;
        $("#moveCounter").text("步数： " + globalVariable.moveCounter);
        globalVariable.timeCounter = 0;
        $("#time").text("时间： " + globalVariable.timeCounter.toFixed(1) + "秒");
        restartValid(false);
        globalVariable.timer = setInterval(update, 100);
    });

    resign.click(function () {
        alert("你在" + globalVariable.timeCounter.toFixed(1) + "秒内走了" + globalVariable.moveCounter + "步，下次继续加油吧！");
        resign.attr("disabled", true);
        resign.addClass("disabled");
        clearInterval(globalVariable.timer);
        globalVariable.gameStatus = globalVariable.DEMOING;
        globalVariable.timer = setInterval(demo, 200);
    });

    mode.change(function () {
        for (i = 0; i < boxes.length - 1; ++i) {
            boxes.eq(i).toggleClass("boxNum");
        }
    });

    pictureSelector.change(function () {
        var index = this.selectedIndex;
        if (index === 0) {
            picture.attr("src", "images/panda.jpg");
            for (i = 0; i < boxes.length - 1; ++i) {
                boxes.eq(i).removeClass("boxPic2");
                boxes.eq(i).removeClass("boxPic3");
            }
        } else if (index === 1) {
            picture.attr("src", "images/meinv.jpg");
            for (i = 0; i < boxes.length - 1; ++i) {
                boxes.eq(i).addClass("boxPic2");
                boxes.eq(i).removeClass("boxPic3");
            }
        } else {
            picture.attr("src", "images/wangqing.jpg");
            for (i = 0; i < boxes.length - 1; ++i) {
                boxes.eq(i).removeClass("boxPic2");
                boxes.eq(i).addClass("boxPic3");
            }
        }
    });

    resign.attr("disabled", true);
    resign.addClass("disabled");
    globalVariable.gameStatus = globalVariable.STOP;
}

$(document).ready(function () {
    "use strict";
    createBoxes();
    prepare();
});
