// Initialise the page with the imageproc javascript module
function initPage() {
    imageproc.init("source", "result", "source_image");
}

// Set up the ordered dithering operation
imageproc.operation = function(sourceImage, resultImage, params) {
    // Get the parameters first
    var pattern = params["pattern"];

    // Retrieve the correct matrix
    var matrix, normalized;
    switch (pattern) {
    case "bayer2":
        matrix = [ [1, 3],
                   [4, 2] ];
        normalized = 4;
        break;
    case "bayer4":
        matrix = [ [ 1,  9,  3, 11],
                   [13,  5, 15,  7],
                   [ 4, 12,  2, 10],
                   [16,  8, 14,  6] ];
        normalized = 16;
        break;
    case "heart":
        matrix = [ [5, 5, 5, 5, 5, 5, 5],
                   [5, 5, 4, 5, 4, 5, 5],
                   [5, 4, 3, 4, 3, 4, 5],
                   [5, 3, 2, 2, 2, 3, 5],
                   [5, 5, 3, 1, 3, 5, 5],
                   [5, 5, 5, 3, 5, 5, 5],
                   [5, 5, 5, 5, 5, 5, 5] ];
        normalized = 5;
    }

    // The x and y position is used in the matrix
    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var i = (x + y * sourceImage.width) * 4;

            var r = sourceImage.data[i];
            var g = sourceImage.data[i + 1];
            var b = sourceImage.data[i + 2];

            var value = Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);
            value = value / 255 * normalized;

            // Get the corresponding threshold of the pixel
            var threshold = matrix[y % matrix.length][x % matrix.length];

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
}
imageproc.paramIds = ["pattern"];