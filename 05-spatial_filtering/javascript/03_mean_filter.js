/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Apply mean filter to source image with the kernel */
function meanFilter(sourceImage, resultImage, size) {
    var mid = Math.floor(size / 2);
    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var r = 0, g = 0, b = 0;

            /* Apply the kernel on the current pixel */
            for (var j = -mid; j <= mid; j++) {
                for (var i = -mid; i <= mid; i++) {
                    var pixel =
                        imageproc.getPixel(sourceImage, x + i, y + j);

                    r += pixel.r;
                    g += pixel.g;
                    b += pixel.b;
                }
            }

            var i = (x + y * resultImage.width) * 4;

            resultImage.data[i] = r / (size * size);
            resultImage.data[i + 1] = g / (size * size);
            resultImage.data[i + 2] = b / (size * size);
        }
    }
}

/* Set up the filtering operation */
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var size = params["size"];
    var repeat = params["repeat"];

    /* Make two temporary buffers */
    var buffer1 = {};
    buffer1.data = [];
    buffer1.width = sourceImage.width;
    buffer1.height = sourceImage.height;

    var buffer2 = {};
    buffer2.data = [];
    buffer2.width = sourceImage.width;
    buffer2.height = sourceImage.height;

    /* Copy the source image to buffer1 */
    for (var i = 0; i < sourceImage.data.length; i++)
        buffer1.data[i] = sourceImage.data[i];

    /* Apply the kernel */
    for (var i = 0; i < repeat; i++) {
        if (i % 2 == 0)
            meanFilter(buffer1, buffer2, size);
        else
            meanFilter(buffer2, buffer1, size);
    }

    /* Copy the result to the image data */
    if (repeat % 2 == 0) {
        for (var i = 0; i < resultImage.data.length; i += 4) {
            resultImage.data[i] = buffer1.data[i];
            resultImage.data[i + 1] = buffer1.data[i + 1];
            resultImage.data[i + 2] = buffer1.data[i + 2];
        }
    }
    else {
        for (var i = 0; i < resultImage.data.length; i += 4) {
            resultImage.data[i] = buffer2.data[i];
            resultImage.data[i + 1] = buffer2.data[i + 1];
            resultImage.data[i + 2] = buffer2.data[i + 2];
        }
    }
}
imageproc.paramIds = ["size", "repeat"];