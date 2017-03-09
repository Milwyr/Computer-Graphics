// Initialise the page with the imageproc javascript module
function initPage() {
    imageproc.init("source", "result", "source_image");
}

// Set up the random dithering operation
imageproc.operation = function(sourceImage, resultImage) {
    for (var i = 0; i < sourceImage.data.length; i += 4) {
        var r = sourceImage.data[i];
        var g = sourceImage.data[i + 1];
        var b = sourceImage.data[i + 2];

        var value = Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);

        // Generate a random threshold from 0 to 255
        var threshold = Math.floor(Math.random() * 256);

        // Set the colour to black or white based on threshold
        if (value < threshold) {
            resultImage.data[i] =
            resultImage.data[i + 1] =
            resultImage.data[i + 2] = 0;
        }
        else {
            resultImage.data[i] =
            resultImage.data[i + 1] =
            resultImage.data[i + 2] = 255;
        }
    }
}