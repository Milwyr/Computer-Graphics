(function(imageproc) {
    "use strict";

    /**
     * Apply a Gaussian filter to the input data
     * @param {number} size - Size of the Gaussian filter
     */
    imageproc.gaussianBlur = function(inputData, outputData, size) {
        // This sigma value is defined in the specification
        var sigma = size / 4;

        // Instantiate the row/column matrix, note that the matrix is symmetric
        // and hence the row matrix and the column matrix are equivalent
        var rowMatrix = [];

        // Generate a row matrix, i.e. 1 dimensional Gaussian kernel
        for (var i = 0; i < size; i++) {
            var distanceToCentre = Math.abs(size/2 - i - 0.5);
            var coefficient = 1 / (Math.sqrt(2 * Math.PI) * sigma);
            var exponent = Math.exp(
                -Math.pow(distanceToCentre, 2) / (2 * sigma * sigma));
            rowMatrix[i] = coefficient * exponent;
        }

        // Instantiate a two dimentional Gaussian kernel
        var kernel = [];
        for (var i = 0; i < size; i++) {
            kernel[i] = [];
        }

        // Convolute the row and column matrix (they are equivalent)
        // to obtain the two dimentional Gaussian kernel, and calculate
        // the divisor by summing up all the elements in the kernel
        var divisor = 0;
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                kernel[i][j] = rowMatrix[i] * rowMatrix[j];
                divisor += kernel[i][j];
            }
        }

        /***** DO NOT REMOVE - for marking *****/
        var line = "";
        console.log("Row matrix:");
        for (var i = 0; i < size; i++)
            line += rowMatrix[i] + " ";
        console.log(line);

        console.log("Kernel:");
        for (var j = 0; j < size; j++) {
            line = "";
            for (var i = 0; i < size; i++) {
                line += kernel[j][i] + " ";
            }
            console.log(line);
        }
        console.log("Divisor: " + divisor);
        /***** DO NOT REMOVE - for marking *****/

        var halfSize = Math.floor(size / 2);

        /* Apply the gaussian filter */
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                var sumR = 0, sumG = 0, sumB = 0;

                /* Sum the product of the kernel on the pixels */
                for (var j = -halfSize; j <= halfSize; j++) {
                    for (var i = -halfSize; i <= halfSize; i++) {
                        var pixel =
                            imageproc.getPixel(inputData, x + i, y + j);
                        var coeff = kernel[j + halfSize][i + halfSize];

                        sumR += pixel.r * coeff;
                        sumG += pixel.g * coeff;
                        sumB += pixel.b * coeff;
                    }
                }

                /* Set the averaged pixel to the output data */
                var i = (x + y * outputData.width) * 4;
                outputData.data[i]     = sumR / divisor;
                outputData.data[i + 1] = sumG / divisor;
                outputData.data[i + 2] = sumB / divisor;
            }
        }
    }

}(window.imageproc = window.imageproc || {}));