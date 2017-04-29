/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Flip the given kernel */
function flip(kernel) {
    for (var j = 0; j < 3; j++) {
        for (var i = 0; i < 5 - j; i++) {
            var temp = kernel[j][i];
            kernel[j][i] = kernel[5 - j - 1][5 - i - 1];
            kernel[5 - j - 1][5 - i - 1] = temp;
        }
    }
}

/* Apply convolution to source image with the kernel */
function convolve(sourceImage, kernel, resultImage) {
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

            resultImage.data[i] = r;
            resultImage.data[i + 1] = g;
            resultImage.data[i + 2] = b;
        }
    }
}

/* Set up the filtering operation */
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var operation = params["operation"];
    var order = params["order"];

    /* Set up the kernels */
    var kernel = [
        [0,  0, 0, 0, 0],
        [0, -1, 0, 1, 0],
        [0, -2, 0, 2, 0],
        [0, -1, 0, 1, 0],
        [0,  0, 0, 0, 0]
    ];
    var precombinedConvolution = [
        [1, 0,  -2, 0, 1],
        [4, 0,  -8, 0, 4],
        [6, 0, -12, 0, 6],
        [4, 0,  -8, 0, 4],
        [1, 0,  -2, 0, 1]
    ];
    var precombinedCorrelation = [
        [-1, 0,  2, 0, -1],
        [-4, 0,  8, 0, -4],
        [-6, 0, 12, 0, -6],
        [-4, 0,  8, 0, -4],
        [-1, 0,  2, 0, -1]
    ];

    if (order == "normal") {
        /* Make a temporary buffer */
        var buffer = {};
        buffer.data = [];
        buffer.width = resultImage.width;
        buffer.height = resultImage.height;

        /* Flip the kernel for convolution */
        if (operation ==  "convolution")
            flip(kernel);

        /* Apply the kernel twice */
        convolve(sourceImage, kernel, buffer);
        convolve(buffer, kernel, resultImage);
    }
    else {
        /* Flip the kernel for convolution */
        if (operation == "convolution")
            flip(precombinedConvolution);

        /* Apply the kernel for each operation */
        switch (operation) {
        case "convolution":
            convolve(sourceImage, precombinedConvolution, resultImage);
            break;
        case "correlation":
            convolve(sourceImage, precombinedCorrelation, resultImage);
            break;
        }
    }

    /* Clip the resulting RGB components */
    for (var i = 0; i < resultImage.data.length; i += 4) {
        resultImage.data[i] =
            Math.max(0, Math.min(255, resultImage.data[i]));
        resultImage.data[i + 1] =
            Math.max(0, Math.min(255, resultImage.data[i + 1]));
        resultImage.data[i + 2] =
            Math.max(0, Math.min(255, resultImage.data[i + 2]));
    }
}
imageproc.paramIds = ["operation", "order"];