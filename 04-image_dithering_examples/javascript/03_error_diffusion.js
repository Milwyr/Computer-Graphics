// Initialise the page with the imageproc javascript module
function initPage() {
    imageproc.init("source", "result", "source_image");
}

// Set up the ordered dithering operation
imageproc.operation = function(sourceImage, resultImage) {
    // Create the error array
    var error = [];
    for (var y = 0; y < sourceImage.height; y++) {
        error[y] = [];
        for (var x = 0; x < sourceImage.width; x++)
            error[y][x] = 0;
    }

    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var i = (x + y * sourceImage.width) * 4;

            var r = sourceImage.data[i];
            var g = sourceImage.data[i + 1];
            var b = sourceImage.data[i + 2];

            var value = Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);

            // Add the error to the value, divided here for performance
            value = value + error[y][x] / 16;

            // Set the colour to closest black or white colour
            var pixel_error;
            if (value < 128) {
                resultImage.data[i] =
                resultImage.data[i + 1] =
                resultImage.data[i + 2] = 0;

                pixel_error = value;
            }
            else {
                resultImage.data[i] =
                resultImage.data[i + 1] =
                resultImage.data[i + 2] = 255;

                pixel_error = value - 255;
            }

            // Diffuse the error to the neighboring pixels
            if (x < sourceImage.width - 1)
                error[y][x + 1] += pixel_error * 7;
            if (x > 0 && y < sourceImage.height - 1)
                error[y + 1][x - 1] += pixel_error * 3;
            if (y < sourceImage.height - 1)
                error[y + 1][x] += pixel_error * 5;
            if (x < sourceImage.width - 1 && y < sourceImage.height - 1)
                error[y + 1][x + 1] += pixel_error;
        }
    }
}