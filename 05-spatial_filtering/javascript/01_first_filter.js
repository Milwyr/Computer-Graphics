/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Set up the simple filtering operation */
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var flip = params["flip"];
    var edge = params["edge"];
    var clip = params["clip"];

    /* Set up the kernel for the filtering */
    var kernel = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    /* Apply flipping on the kernel */
    if (flip == "yes") {
        for (var j = 0; j < 2; j++) {
            for (var i = 0; i < 3 - j; i++) {
                var temp = kernel[j][i];
                kernel[j][i] = kernel[3 - j - 1][3 - i - 1];
                kernel[3 - j - 1][3 - i - 1] = temp;
            }
        }
    }

    /* Normalisation requires an additional buffer */
    var buffer = [], min, max;

    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var r = 0, g = 0, b = 0;

            /* Apply the kernel on the current pixel */
            for (var j = -1; j <= 1; j++) {
                for (var i = -1; i <= 1; i++) {
                    var pixel =
                        imageproc.getPixel(sourceImage, x + i, y + j, edge);
                    var kernelValue = kernel[j + 1][i + 1];

                    r += pixel.r * kernelValue;
                    g += pixel.g * kernelValue;
                    b += pixel.b * kernelValue;
                }
            }

            /* Handle the clipping of the result */
            switch (clip) {
            case "offset":
                r = r + 128;
                g = g + 128;
                b = b + 128;
                break;
            case "absolute":
                r = Math.abs(r);
                g = Math.abs(g);
                b = Math.abs(b);
                break;
            }

            /* Need clipping for multiple approaches */
            if (clip == "clip" || clip == "offset" || clip == "absolute") {
                r = Math.max(0, Math.min(255, r));
                g = Math.max(0, Math.min(255, g));
                b = Math.max(0, Math.min(255, b));
            }

            var i = (x + y * resultImage.width) * 4;

            /* Put the pixels in the buffer for normalisation */
            if (clip == "normalise") {
                buffer[i] = r;
                buffer[i + 1] = g;
                buffer[i + 2] = b;

                if (i == 0) min = max = r;
                min = Math.min(min, r, g, b);
                max = Math.max(max, r, g, b);
            }
            else {
                resultImage.data[i] = r;
                resultImage.data[i + 1] = g;
                resultImage.data[i + 2] = b;
            }
        }
    }

    /* Apply normalisation */
    if (clip == "normalise") {
        for (var i = 0; i < resultImage.data.length; i += 4) {
            resultImage.data[i] = Math.round((buffer[i] - min) / (max - min) * 255);
            resultImage.data[i + 1] = Math.round((buffer[i + 1] - min) / (max - min) * 255);
            resultImage.data[i + 2] = Math.round((buffer[i + 2] - min) / (max - min) * 255);
        }
    }
}
imageproc.paramIds = ["flip", "edge", "clip"];