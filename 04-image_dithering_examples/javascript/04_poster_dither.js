// Initialise the page with the imageproc javascript module
function initPage() {
    imageproc.init("source", "result", "source_image");
}

// Make a bit mask based on the number of bit depth
function makeBitMask(bitDepth) {
    var mask = 0;
    for (i = 0; i < 8; i++) {
        mask = mask << 1;
        if (i < bitDepth) mask++;
    }
    return mask;
}

// Set up the posterization with dithering operation
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var bitDepth = {};
    bitDepth.r = parseInt(params["red_bit_depth"]);
    bitDepth.g = parseInt(params["green_bit_depth"]);
    bitDepth.b = parseInt(params["blue_bit_depth"]);
    var dithering = params["dithering"];

    // Make the masks
    var mask = {};
    mask.r = makeBitMask(bitDepth.r);
    mask.g = makeBitMask(bitDepth.g);
    mask.b = makeBitMask(bitDepth.b);

    // Create the error array for the RGB components
    var error = [];
    for (var y = 0; y < sourceImage.height; y++) {
        error[y] = [];
        for (var x = 0; x < sourceImage.width; x++)
            error[y][x] = {r: 0, g: 0, b: 0};
    }

    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var i = (x + y * sourceImage.width) * 4;

            var posterized;
            if (dithering == "yes") {
                /* With dithering */

                // Get the RGB with error, divided here for performance
                var r = sourceImage.data[i] + error[y][x].r / 16;
                var g = sourceImage.data[i + 1] + error[y][x].g / 16;
                var b = sourceImage.data[i + 2] + error[y][x].b / 16;

                // Handle clipping, only at 255
                r = Math.min(255, r);
                g = Math.min(255, g);
                b = Math.min(255, b);

                // Apply the masks
                posterized = {
                    r: r & mask.r,
                    g: g & mask.g,
                    b: b & mask.b
                };

                // Calculate the error (the error is always positive)
                var qerror = {
                    r: r - posterized.r,
                    g: g - posterized.g,
                    b: b - posterized.b,
                };

                // Diffuse the error to the neighboring pixels
                if (x < sourceImage.width - 1) {
                    error[y][x + 1].r += qerror.r * 7;
                    error[y][x + 1].g += qerror.g * 7;
                    error[y][x + 1].b += qerror.b * 7;
                }
                if (x > 0 && y < sourceImage.height - 1) {
                    error[y + 1][x - 1].r += qerror.r * 3;
                    error[y + 1][x - 1].g += qerror.g * 3;
                    error[y + 1][x - 1].b += qerror.b * 3;
                }
                if (y < sourceImage.height - 1) {
                    error[y + 1][x].r += qerror.r * 5;
                    error[y + 1][x].g += qerror.g * 5;
                    error[y + 1][x].b += qerror.b * 5;
                }
                if (x < sourceImage.width - 1 && y < sourceImage.height - 1) {
                    error[y + 1][x + 1].r += qerror.r;
                    error[y + 1][x + 1].g += qerror.b;
                    error[y + 1][x + 1].b += qerror.b;
                }
            }
            else {
                /* Without dithering */

                posterized = {
                    r: sourceImage.data[i] & mask.r,
                    g: sourceImage.data[i + 1] & mask.g,
                    b: sourceImage.data[i + 2] & mask.b
                };
            }

            // Set the pixel to the result image
            resultImage.data[i] = posterized.r;
            resultImage.data[i + 1] = posterized.g;
            resultImage.data[i + 2] = posterized.b;
        }
    }
}
imageproc.paramIds = [
    "red_bit_depth", "green_bit_depth", "blue_bit_depth", "dithering"
];