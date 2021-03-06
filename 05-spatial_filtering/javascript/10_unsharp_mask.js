/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Set up the filtering operation */
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var size = params["size"];
    var strength = params["strength"];

    /* Set up the kernel */
    var kernel, divisor;
    if (size == 3) {
        kernel = [
            [1, 2, 1],
            [2, 5, 2],
            [1, 2, 1]
        ];
        divisor = 17;
    }
    else {
        kernel = [
            [1,  3,  4,  3, 1],
            [3,  8, 11,  8, 3],
            [4, 11, 16, 11, 4],
            [3,  8, 11,  8, 3],
            [1,  3,  4,  3, 1]
        ];
        divisor = 136;
    }

    /* Create a buffer for the blurred image */
    var buffer = {};
    buffer.data = [];
    buffer.width = sourceImage.width;
    buffer.height = sourceImage.height;

    /* Apply the gaussian filter */
    var mid = Math.floor(size / 2);
    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var r = 0, g = 0, b = 0;

            /* Apply the kernel on the current pixel */
            for (var j = -mid; j <= mid; j++) {
                for (var i = -mid; i <= mid; i++) {
                    var pixel =
                        imageproc.getPixel(sourceImage, x + i, y + j);
                    var kernelValue = kernel[j + mid][i + mid];

                    r += pixel.r * kernelValue;
                    g += pixel.g * kernelValue;
                    b += pixel.b * kernelValue;
                }
            }

            var i = (x + y * resultImage.width) * 4;

            buffer.data[i] = r / divisor;
            buffer.data[i + 1] = g / divisor;
            buffer.data[i + 2] = b / divisor;
        }
    }

    /* Subtract the image with the blurred result */
    for (var i = 0; i < sourceImage.data.length; i += 4) {
        buffer.data[i] = sourceImage.data[i] - buffer.data[i];
        buffer.data[i + 1] = sourceImage.data[i + 1] - buffer.data[i + 1];
        buffer.data[i + 2] = sourceImage.data[i + 2]- buffer.data[i + 2];
    }

    /* Put the subtracted result to the original image */
    for (var i = 0; i < sourceImage.data.length; i += 4) {
        resultImage.data[i] =     sourceImage.data[i] +
                                  buffer.data[i] * strength / 20;
        resultImage.data[i + 1] = sourceImage.data[i + 1] +
                                  buffer.data[i + 1] * strength / 20;
        resultImage.data[i + 2] = sourceImage.data[i + 2] +
                                  buffer.data[i + 2] * strength / 20;
    }
}
imageproc.paramIds = ["size", "strength"];