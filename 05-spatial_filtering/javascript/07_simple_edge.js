/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Set up the filtering operation */
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var direction = params["direction"];
    var postproc = params["postproc"];
    var threshold = params["threshold"];

    /* Set up the kernel */
    var kernel;
    switch (direction) {
    case "horizontal":
        kernel = [
            [0,-1, 0],
            [0, 1, 0],
            [0, 0, 0]
        ];
        break;
    case "vertical":
        kernel = [
            [ 0, 0, 0],
            [-1, 1, 0],
            [ 0, 0, 0]
        ];
        break;
    case "nwse":
        kernel = [
            [-1, 0, 0],
            [ 0, 1, 0],
            [ 0, 0, 0]
        ];
        break;
    case "nesw":
        kernel = [
            [0, 0,-1],
            [0, 1, 0],
            [0, 0, 0]
        ];
    }

    /* Apply the filter */
    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var r = 0, g = 0, b = 0;

            /* Apply the kernel on the current pixel */
            for (var j = -1; j <= 1; j++) {
                for (var i = -1; i <= 1; i++) {
                    var pixel =
                        imageproc.getPixel(sourceImage, x + i, y + j);
                    var kernelValue = kernel[j + 1][i + 1];

                    r += pixel.r * kernelValue;
                    g += pixel.g * kernelValue;
                    b += pixel.b * kernelValue;
                }
            }

            /* Post-process */
            if (postproc == "threshold") {
                var value = (Math.abs(r) + Math.abs(g) + Math.abs(b)) / 3;
                if (value < threshold)
                    r = g = b = 0;
                else
                    r = g = b = 255;
            }

            /* Clip the result */
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));

            var i = (x + y * resultImage.width) * 4;

            resultImage.data[i] = r;
            resultImage.data[i + 1] = g;
            resultImage.data[i + 2] = b;
        }
    }
}
imageproc.paramIds = ["direction", "postproc", "threshold"];