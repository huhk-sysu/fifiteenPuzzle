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
    pictureUrl: ["images/panda.jpg", "images/meinv.jpg", "images/wangqing.jpg"]
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
    // console.log("can't move!");
    return false;
}

function restartValid(valid) {
    "use strict";
    var restart = $("#restart"), resign = $("#resign"), pictureSelector = $("#pictureSelector");
    restart.attr("disabled", !valid);
    restart.toggleClass("disabled");
    resign.attr("disabled", valid);
    resign.toggleClass("disabled");
    pictureSelector.attr("disabled", !valid);
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
    var boxes = $(".box"), counter = 0, rand, times = _.random(40, 60);  // move 40~60 times
    while (counter < times) {
        rand = _.random(0, 14);
        if (rand !== globalVariable.solution[globalVariable.solution.length - 1] && canMove(rand)) {  // 不重复动2次同一个
            boxes.eq(rand).click();
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



function prepare() {
    "use strict";
    var boxes = $(".box"), restart = $("#restart"), resign = $("#resign"), mode = $("#mode"), picture = $("#panda"),
        pictureSelector = $("#pictureSelector"), i;
    _.times(15, function (i) {
        boxes.eq(i).mousedown(demoMouseDown);
        boxes.eq(i).click(boxesClick(i));
    });
    boxes.eq(15).hide();
    restart.click(restartClick);
    resign.click(resignClick);
    mode.change(function () {
        _.times(15, function (i) {
            boxes.eq(i).toggleClass("boxNum");
        });
    });

    pictureSelector.change(function () {
        var index = this.selectedIndex;
        picture.attr("src", globalVariable.pictureUrl[index]);
        if (index === 0) {
            for (i = 0; i < boxes.length - 1; ++i) {
                boxes.eq(i).removeClass("boxPic2");
                boxes.eq(i).removeClass("boxPic3");
            }
        } else if (index === 1) {
            for (i = 0; i < boxes.length - 1; ++i) {
                boxes.eq(i).addClass("boxPic2");
                boxes.eq(i).removeClass("boxPic3");
            }
        } else {
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
