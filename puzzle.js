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
    solution : []
};

$(document).ready(function () {
    createBoxes();
    prepare();
});

function createBoxes() {
    var panda = $("img");
    var container = $("<div id='container'></div>");
    var box;
    for (var i = 0; i < 16; ++i) {
        box = $("<div class='box'></div>");
        box.addClass("position" + i);
        box.attr("id", "box" + i);
        container.append(box);
        if (i < 15) {
            box.css("backgroundPosition", -90 * (i % 4) + "px " + -90 * Math.floor(i / 4) + "px");
            globalVariable.positionX[i] = Math.floor(i / 4);
            globalVariable.positionY[i] = i % 4;
        }
    }
    panda.before(container);
}

function prepare() {
    var boxes = $(".box");
    for (var i = 0; i < boxes.length - 1; ++i) {
        // 方块的点击事件在游戏停止时不反应
        // 仅当游戏进行时有胜利判定
        boxes.eq(i).click(function () {
            if (globalVariable.gameStatus == globalVariable.STOP)
                return;
            var myId = parseInt(this.id.substring(3));
            // 这里的Number代表位置的编号
            var ok = canMove(myId);
            if (ok) {
                var myNumber = globalVariable.positionX[myId] * 4 + globalVariable.positionY[myId];
                var myClass = "position" + myNumber;
                var myself = $("." + myClass);
                var targetNumber = globalVariable.freeX * 4 + globalVariable.freeY;
                var targetClass = "position" + targetNumber;
                var target = $("." + targetClass);

                // change position
                target.addClass(myClass);
                target.removeClass(targetClass);
                myself.addClass(targetClass);
                myself.removeClass(myClass);

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
                }

                if (globalVariable.gameStatus == globalVariable.RUNNING && gameOver(boxes)) {
                    alert("你在" + globalVariable.timeCounter.toFixed(1) + "秒内走了" + globalVariable.moveCounter +  "步，最终获得了胜利！");
                    globalVariable.gameStatus = globalVariable.STOP;
                    clearInterval(globalVariable.timer);
                    resign.attr("disabled", true);
                    resign.addClass("disabled");
                    restart.attr("disabled", false);
                    restart.removeClass("disabled");
                }
            }
        });
    }
    boxes.eq(15).hide();

    var restart = $("#restart");
    var resign = $("#resign");

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
        restart.attr("disabled", true);
        restart.addClass("disabled");
        resign.attr("disabled", false);
        resign.removeClass("disabled");
        globalVariable.timer = setInterval(update, 100);
    });

    resign.click(function () {
        alert("你在" + globalVariable.timeCounter.toFixed(1) + "秒内走了" + globalVariable.moveCounter +  "步，下次继续加油吧！");
        resign.attr("disabled", true);
        resign.addClass("disabled");
        clearInterval(globalVariable.timer);
        globalVariable.gameStatus = globalVariable.DEMOING;
        globalVariable.timer = setInterval("demo()", 300);
    });
    resign.attr("disabled", true);
    resign.addClass("disabled");
    globalVariable.gameStatus = globalVariable.STOP;
}

function demo() {
    var restart = $("#restart");
    var id = globalVariable.solution.pop();
    $("#box" + id).click();
    if (globalVariable.solution.length == 0) {
        clearInterval(globalVariable.timer);
        restart.attr("disabled", false);
        restart.removeClass("disabled");
        globalVariable.gameStatus = globalVariable.STOP;
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
        if (!boxes.eq(i).hasClass("position" + i))
            return false;
    }
    return true;
}

function update() {
    globalVariable.timeCounter += 0.1;
    $("#time").text("时间： " + globalVariable.timeCounter.toFixed(1) + "秒");
}