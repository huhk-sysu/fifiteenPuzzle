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
    clickValid: true,
    pictureUrl: ["images/panda.jpg", "images/meinv.jpg", "images/wangqing.jpg"],
    boxes: null
};

function createBoxes() {
    "use strict";
    var img = $("img"), container = $("<div id='container'></div>"), x, y, box;
    _.times(16, function (i) {
        x = Math.floor(i / 4);
        y = i % 4;
        box = $("<div class='box'>" + (i + 1) + "</div>");
        box.addClass("top" + x + " " + "left" + y + " " + "pos" + i + " " + "boxPic1");
        box.attr("id", "box" + i);
        container.append(box);
        globalVariable.positionX[i] = x;
        globalVariable.positionY[i] = y;
    });
    img.before(container);
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
    return false;
}

function restartValid(valid) {
    "use strict";
    var restart = $("#restart"), pictureSelector = $("#pictureSelector");
    restart.attr("disabled", !valid);
    restart.toggleClass("disabled");
    pictureSelector.attr("disabled", !valid);
}

function resignValid(valid) {
    "use strict";
    var resign = $("#resign");
    resign.attr("disabled", !valid);
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

function changeData(myId) {
    "use strict";
    var target = $("#box15"), myself = $("#box" + myId), temp;
    target.removeClass("left" + globalVariable.freeY + " " + "top" + globalVariable.freeX);
    target.addClass("left" + globalVariable.positionY[myId] + " " + "top" + globalVariable.positionX[myId]);
    myself.removeClass("left" + globalVariable.positionY[myId] + " " + "top" + globalVariable.positionX[myId]);
    myself.addClass("left" + globalVariable.freeY + " " + "top" + globalVariable.freeX);
    temp = globalVariable.freeX;
    globalVariable.freeX = globalVariable.positionX[myId];
    globalVariable.positionX[myId] = temp;
    temp = globalVariable.freeY;
    globalVariable.freeY = globalVariable.positionY[myId];
    globalVariable.positionY[myId] = temp;
}

function showGameOver() {
    "use strict";
    alert("你在" + globalVariable.timeCounter.toFixed(1) + "秒内走了" + globalVariable.moveCounter + "步，最终获得了胜利！");
    globalVariable.gameStatus = globalVariable.STOP;
    clearInterval(globalVariable.timer);
    restartValid(true);
    resignValid(false);
}

function boxesClick(myId) {
    "use strict";
    return function () {
        if (globalVariable.gameStatus !== globalVariable.STOP && globalVariable.clickValid && canMove(myId)) {
            changeData(myId);
            if (globalVariable.gameStatus === globalVariable.PREPARING) {
                globalVariable.solution.push(myId);
            } else if (globalVariable.gameStatus === globalVariable.RUNNING) {
                ++globalVariable.moveCounter;
                $("#moveCounter").text("步数： " + globalVariable.moveCounter);
                if (globalVariable.solution[globalVariable.solution.length - 1] === myId) {
                    globalVariable.solution.pop();
                } else {
                    globalVariable.solution.push(myId);
                }
                if (gameOver(globalVariable.boxes)) {
                    showGameOver();
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
    var restart = $("#restart"), id = globalVariable.solution.pop(), pictureSelector = $("#pictureSelector");
    globalVariable.clickValid = true;
    $("#box" + id).click();
    if (globalVariable.solution.length === 0) {
        clearInterval(globalVariable.timer);
        restart.attr("disabled", false);
        pictureSelector.attr("disabled", false);
        restart.removeClass("disabled");
        globalVariable.gameStatus = globalVariable.STOP;
        globalVariable.clickValid = true;
    }
}

function randomMove() {
    "use strict";
    var counter = 0, rand, times = _.random(40, 60);  // move 40~60 times
    while (counter < times) {
        rand = _.random(0, 14);
        if (rand !== globalVariable.solution[globalVariable.solution.length - 1] && canMove(rand)) {  // 不重复动2次同一个
            globalVariable.boxes.eq(rand).click();
            ++counter;
        }
    }
}

function restartClick() {
    "use strict";
    globalVariable.solution = [];
    globalVariable.gameStatus = globalVariable.PREPARING;
    randomMove();
    globalVariable.gameStatus = globalVariable.RUNNING;
    globalVariable.moveCounter = 0;
    $("#moveCounter").text("步数： " + globalVariable.moveCounter);
    globalVariable.timeCounter = 0;
    $("#time").text("时间： " + globalVariable.timeCounter.toFixed(1) + "秒");
    restartValid(false);
    resignValid(true);
    globalVariable.timer = setInterval(update, 100);
}

function resignClick() {
    "use strict";
    var resign = $("#resign");
    alert("你在" + globalVariable.timeCounter.toFixed(1) + "秒内走了" + globalVariable.moveCounter + "步，下次继续加油吧！");
    resign.attr("disabled", true);
    resign.addClass("disabled");
    clearInterval(globalVariable.timer);
    globalVariable.gameStatus = globalVariable.DEMOING;
    globalVariable.timer = setInterval(demo, 100);
}

function modeClick() {
    "use strict";
    var boxes = $(".box");
    _.times(15, function (i) {
        boxes.eq(i).toggleClass("boxNum");
    });
}

function selectorChange() {
    "use strict";
    var index = $("#pictureSelector").get()[0].selectedIndex;
    $("#panda").attr("src", globalVariable.pictureUrl[index]);
    _.times(15, function (i) {
        globalVariable.boxes.eq(i).removeClass("boxPic1 boxPic2 boxPic3");
        globalVariable.boxes.eq(i).addClass("boxPic" + (index + 1));
    });
}

function setButtons() {
    "use strict";
    $("#restart").click(restartClick);
    $("#resign").click(resignClick);
    $("#mode").change(modeClick);
    $("#pictureSelector").change(selectorChange);
}

function prepare() {
    "use strict";
    globalVariable.boxes = $(".box");
    _.times(15, function (i) {
        globalVariable.boxes.eq(i).mousedown(demoMouseDown);
        globalVariable.boxes.eq(i).click(boxesClick(i));
    });
    globalVariable.boxes.eq(15).hide();
    setButtons();
    resignValid(false);
    globalVariable.gameStatus = globalVariable.STOP;
}

$(document).ready(function () {
    "use strict";
    createBoxes();
    prepare();
});
