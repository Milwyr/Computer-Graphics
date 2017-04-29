/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Set up the filtering operation */
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var direction = params["direction"];

    /* Set up the kernel */
    var kernel;
    switch (direction) {
    case "horizontal":
        kernel = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        break;
    case "vertical":
        kernel = [
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0]
        ];
        break;
    case "nwse":
        kernel = [
            [1, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 1]
        ];
        break;
    case "nesw":
        kernel = [
            [0, 0, 0, 0, 1],
            [0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [1, 0, 0, 0, 0]
        ];
    }

    /* Apply the filter */
    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var r = 0, g = 0, b = 0;

            /* Apply the kernel on the current pixel */
            for (var j = -2; j <= 2; j++) {
                for (var i = -2; i <= 2; i++) {
                    var pixel =
                        imageproc.getPixel(sourceImage, x + i, y + j);
                    var kernelValue = kernel[j + 2][i + 2];

                    r += pixel.r * kernelValue;
                    g += pixel.g * kernelValue;
                    b += pixel.b * kernelValue;
                }
            }

            var i = (x + y * resultImage.width) * 4;

            resultImage.data[i] = r / 5;
            resultImage.data[i + 1] = g / 5;
            resultImage.data[i + 2] = b / 5;
        }
    }
}
imageproc.paramIds = ["direction"];