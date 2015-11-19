var globalVariable = {
    freeX: 3,
    freeY: 3,
    positionX: [],
    positionY: [],
    moveX : [-1, 0, 1, 0],
    moveY : [0, 1, 0, -1],
    PREPARING : 1,
    RUNNING : 2,
    STOP : 3,
    DEMOING: 4,
    gameStatus : 3,
    moveCounter : 0,
    timeCounter : 0,
    timer : -1,
    solution : [],
    clickValid : true
};

$(document).ready(function () {
    createBoxes();
    prepare();
});

function createBoxes() {
    var panda = $("img");
    var container = $("<div id='container'></div>");
    var box;
    var x, y;
    for (var i = 0; i < 16; ++i) {
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

function prepare() {
    var boxes = $(".box");
    var restart = $("#restart");
    var resign = $("#resign");
    for (var i = 0; i < boxes.length - 1; ++i) {
        // 方块的点击事件在游戏停止时不反应
        // 仅当游戏进行时有胜利判定
        boxes.eq(i).mousedown(function () {
            if (globalVariable.gameStatus == globalVariable.DEMOING) {
                alert("请耐心等待演示完成！");
                globalVariable.clickValid = false;
            }
        });
        boxes.eq(i).click(function () {
            if (globalVariable.gameStatus == globalVariable.STOP || !globalVariable.clickValid)
                return;
            var myId = parseInt(this.id.substring(3));
            var ok = canMove(myId);
            if (ok) {
                // change position
                // 先移除后添加
                var target = $("#box15");
                var myself = $("#box" + myId);
                target.removeClass("left" + globalVariable.freeY);
                target.removeClass("top" + globalVariable.freeX);
                target.addClass("left" + globalVariable.positionY[myId]);
                target.addClass("top" + globalVariable.positionX[myId]);
                myself.removeClass("left" + globalVariable.positionY[myId]);
                myself.removeClass("top" + globalVariable.positionX[myId]);
                myself.addClass("left" + globalVariable.freeY);
                myself.addClass("top" + globalVariable.freeX);


                // change data
                var temp;
                temp = globalVariable.freeX;
                globalVariable.freeX = globalVariable.positionX[myId];
                globalVariable.positionX[myId] = temp;

                temp = globalVariable.freeY;
                globalVariable.freeY = globalVariable.positionY[myId];
                globalVariable.positionY[myId] = temp;

                if (globalVariable.gameStatus == globalVariable.PREPARING) {
                    globalVariable.solution.push(myId);
                }

                if (globalVariable.gameStatus == globalVariable.RUNNING) {
                    ++globalVariable.moveCounter;
                    $("#moveCounter").text("步数： " + globalVariable.moveCounter);
                    if (globalVariable.solution[globalVariable.solution.length - 1] == myId) {
                        globalVariable.solution.pop();
                    } else {
                        globalVariable.solution.push(myId);
                    }
                    if (gameOver(boxes)) {
                        alert("你在" + globalVariable.timeCounter.toFixed(1) + "秒内走了" + globalVariable.moveCounter +  "步，最终获得了胜利！");
                        globalVariable.gameStatus = globalVariable.STOP;
                        clearInterval(globalVariable.timer);
                        restartValid(true);
                    }
                }
            }
        });
    }
    boxes.eq(15).hide();

    restart.click(function () {
        globalVariable.gameStatus = globalVariable.PREPARING;
        var counter = 0;
        var rand;
        while (counter < 50) {
            rand = Math.floor(Math.random() * 15);
            if (rand != globalVariable.solution[globalVariable.solution.length - 1] && canMove(rand)) {
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
        alert("你在" + globalVariable.timeCounter.toFixed(1) + "秒内走了" + globalVariable.moveCounter +  "步，下次继续加油吧！");
        resign.attr("disabled", true);
        resign.addClass("disabled");
        clearInterval(globalVariable.timer);
        globalVariable.gameStatus = globalVariable.DEMOING;
        globalVariable.timer = setInterval("demo()", 200);
    });

    var mode = $("#mode");
    mode.change(function () {
        for (var i = 0; i < boxes.length - 1; ++i)
            boxes.eq(i).toggleClass("boxNum");
    });

    resign.attr("disabled", true);
    resign.addClass("disabled");
    globalVariable.gameStatus = globalVariable.STOP;
}

function demo() {
    var restart = $("#restart");
    var id = globalVariable.solution.pop();
    globalVariable.clickValid = true;
    $("#box" + id).click();
    if (globalVariable.solution.length == 0) {
        clearInterval(globalVariable.timer);
        restart.attr("disabled", false);
        restart.removeClass("disabled");
        globalVariable.gameStatus = globalVariable.STOP;
        globalVariable.clickValid = true;
    }
}

function canMove(myId) {
    var x = globalVariable.positionX[myId], y = globalVariable.positionY[myId];
    for (var i = 0; i < 4; ++i) {
        if (x + globalVariable.moveX[i] == globalVariable.freeX && y + globalVariable.moveY[i] == globalVariable.freeY)
            return true;
    }
    // console.log("can't move!");
    return false;
}

function gameOver(boxes) {
    for (var i = 0; i < boxes.length - 1; ++i) {
        if (!boxes.eq(i).hasClass("left" + i % 4) || !boxes.eq(i).hasClass("top" + Math.floor(i / 4)))
            return false;
    }
    return true;
}

function update() {
    globalVariable.timeCounter += 0.1;
    $("#time").text("时间： " + globalVariable.timeCounter.toFixed(1) + "秒");
}

function restartValid(valid) {
    var restart = $("#restart");
    var resign = $("#resign");
    restart.attr("disabled", !valid);
    restart.toggleClass("disabled");
    resign.attr("disabled", valid);
    resign.toggleClass("disabled");
}