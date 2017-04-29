/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Set up the filtering operation */
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var size = params["size"];

    var mid = Math.floor(size / 2);
    var med = Math.floor(size * size / 2);

    /* Apply the median filter */
    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var r = 0, g = 0, b = 0;

            /* Add the pixels around the current pixel */
            var pixels = [];
            for (var j = -mid; j <= mid; j++) {
                for (var i = -mid; i <= mid; i++) {
                    var pixel =
                        imageproc.getPixel(sourceImage, x + i, y + j);
                    var value = pixel.r * 0.2126 +
                                pixel.g * 0.7152 +
                                pixel.b * 0.0722;

                    /* Push the pixel information in the array */
                    pixels.push({value: value, x: x + i, y: y + j});
                }
            }

            /* Sort the array */
            pixels.sort(function (a, b) { return a.value - b.value; });

            /* Set the median */
            var pixel = imageproc.getPixel(sourceImage,
                                           pixels[med].x, pixels[med].y);

            var i = (x + y * resultImage.width) * 4;

            resultImage.data[i] = pixel.r;
            resultImage.data[i + 1] = pixel.g;
            resultImage.data[i + 2] = pixel.b;
        }
    }
}
imageproc.paramIds = ["size"];