var context;
var image;

function loadImage() {
    var canvas = document.getElementById("2dcanvas");
    context = canvas.getContext("2d");

    image = new Image();
    image.onload = function () {
        context.drawImage(image, 0, 0);
    }
    image.src = "hulk.png";
}

function gammaCorrect() {
    var slider = document.getElementById("gamma_slider");
    var span = document.getElementById("gamma_value");
    var gamma = slider.value;

    gamma = gamma / 10;
    if (gamma >= 1)
        span.innerHTML = gamma;
    else {
        span.innerHTML = "1/" + (2 - gamma);
        gamma = 1 / (2 - gamma);
    }

    context.drawImage(image, 0, 0);
    var myImage = context.getImageData(0, 0, 300, 350);
    for (i = 0; i < myImage.data.length; i+=4) {
        myImage.data[i] = Math.pow(myImage.data[i], gamma);
        myImage.data[i + 1] = Math.pow(myImage.data[i + 1], gamma);
        myImage.data[i + 2] = Math.pow(myImage.data[i + 2], gamma);
    }
    context.putImageData(myImage, 0, 0);
}