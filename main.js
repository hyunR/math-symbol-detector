let model;

const label = ['plus',
    'equal',
    'alpha',
    'beta',
    'cosine',
    'infinity',
    'integral',
    'leq',
    'limit',
    'logarithm',
    'pi',
    'rightarrow',
    'sine',
    'square root',
    'summation',
    'tangent ',
    'theta',
    'times'
];

const canvasBox = document.querySelector('#canvas_box');

const canvas = document.createElement("canvas");

const canvasWidth = 255;
const canvasHeight = 255;
const canvasStrokeStyle = "white";
const canvasLineJoin = "round";
const canvasLineWidth = 5;
const canvasBackgroundColor = "black";
const canvasId = "canvas";

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;

canvasBox.appendChild(canvas);
ctx = canvas.getContext("2d");

let clickX = new Array();
let clickY = new Array();
let clickD = new Array();
let drawing;

$("#canvas").mousedown(function (e) {
    let mouseX = e.pageX - this.offsetLeft;
    let mouseY = e.pageY - this.offsetTop;

    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
});

canvas.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }

    let rect = canvas.getBoundingClientRect();
    let touch = e.touches[0];

    let mouseX = touch.clientX - rect.left;
    let mouseY = touch.clientY - rect.top;

    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();

}, false);

$("#canvas").mousemove(function (e) {
    if (drawing) {
        let mouseX = e.pageX - this.offsetLeft;
        let mouseY = e.pageY - this.offsetTop;
        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
});

canvas.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    if (drawing) {
        let rect = canvas.getBoundingClientRect();
        let touch = e.touches[0];

        let mouseX = touch.clientX - rect.left;
        let mouseY = touch.clientY - rect.top;

        addUserGesture(mouseX, mouseY, true);
        drawOnCanvas();
    }
}, false);

$("#canvas").mouseup(function (e) {
    drawing = false;
});

canvas.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);

$("#canvas").mouseleave(function (e) {
    drawing = false;
});

canvas.addEventListener("touchleave", function (e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
    drawing = false;
}, false);

function addUserGesture(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickD.push(dragging);
}

function drawOnCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = canvasStrokeStyle;
    ctx.lineJoin = canvasLineJoin;
    ctx.lineWidth = canvasLineWidth;

    for (let i = 0; i < clickX.length; i++) {
        ctx.beginPath();
        if (clickD[i] && i) {
            ctx.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
            ctx.moveTo(clickX[i] - 1, clickY[i]);
        }
        ctx.lineTo(clickX[i], clickY[i]);
        ctx.closePath();
        ctx.stroke();
    }
}

function clearCanvas(id) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    clickX = new Array();
    clickY = new Array();
    clickD = new Array();
    const result_div = document.querySelector('#result');
    result_div.innerHTML =''
}

async function loadModel() {
    console.log("model loading..");
    model = undefined;
    model = await tf.loadModel("model/model.json");
    console.log("model loaded..");
}

loadModel();

function preprocessCanvas(image) {
    let tensor = tf.fromPixels(image, 1)
        .resizeNearestNeighbor([45, 45])
        .mean(2)
        .expandDims(2)
        .expandDims()
        .toFloat();
    return tensor
}

async function predict() {
    
    const black_canvas = document.querySelector('#canvas')
    const tensor = preprocessCanvas(black_canvas);
   
    const predictions = await model.predict(tensor).data();

    const results = Array.from(predictions)

    let maxI = -1
    let maxV = 0
    for (let index = 0; index < results.length; index++) {
        if(results[index] >= maxV) {
            maxV = results[index];
            maxI = index
        }
    }
    console.log(label[maxI]);

    const result_div = document.querySelector('#result');
    if(result_div.childElementCount != 0 ){
        result_div.innerHTML =''
    }
    const result_p = document.createElement("p");
    result_p.innerHTML = `That looks like a ${label[maxI]} !`
    const result_wiki = document.createElement("a")
    result_wiki.href = "https://en.wikipedia.org/wiki/" + label[maxI]
    result_wiki.innerHTML = "Check it on the wiki"
    
    result_div.appendChild(result_p);
    result_div.appendChild(result_wiki);
}