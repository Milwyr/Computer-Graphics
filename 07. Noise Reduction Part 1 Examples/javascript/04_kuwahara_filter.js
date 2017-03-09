/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Find the region statistic centred at (x, y) */
function regionStat(x, y, sourceImage) {
    /* Find the mean colour and brightness */
    var meanR = 0, meanG = 0, meanB = 0;
    var meanGray = 0;
    for (var j = -1; j <= 1; j++) {
        for (var i = -1; i <= 1; i++) {
            var pixel = imageproc.getPixel(sourceImage, x + i, y + j);

            /* For the mean colour */
            meanR += pixel.r;
            meanG += pixel.g;
            meanB += pixel.b;

            /* For the mean brightness */
            meanGray += pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
        }
    }
    meanR /= 9;
    meanG /= 9;
    meanB /= 9;
    meanGray /= 9;

    /* Find the variance */
    var variance = 0;
    for (var j = -1; j <= 1; j++) {
        for (var i = -1; i <= 1; i++) {
            var pixel =
                imageproc.getPixel(sourceImage, x + i, y + j);
            var value = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

            variance += Math.pow(value - meanGray, 2);
        }
    }
    variance /= 9;

    return { mean: {r: meanR, g: meanG, b: meanB}, variance: variance };
}

/* Set up the filtering operation */
imageproc.operation = function(sourceImage, resultImage) {
    /* Apply the median filter */
    for (var y = 0; y < sourceImage.height; y++) {
        for (var x = 0; x < sourceImage.width; x++) {
            var regionA = regionStat(x - 1, y - 1, sourceImage);
            var regionB = regionStat(x + 1, y - 1, sourceImage);
            var regionC = regionStat(x - 1, y + 1, sourceImage);
            var regionD = regionStat(x + 1, y + 1, sourceImage);
            var minV = Math.min(regionA.variance, regionB.variance,
                                regionC.variance, regionD.variance);

            var i = (x + y * resultImage.width) * 4;

            /* Put the colour of the region with min variance in the pixel */
            switch (minV) {
            case regionA.variance:
                resultImage.data[i] = regionA.mean.r;
                resultImage.data[i + 1] = regionA.mean.g;
                resultImage.data[i + 2] = regionA.mean.b;
                break;
            case regionB.variance:
                resultImage.data[i] = regionB.mean.r;
                resultImage.data[i + 1] = regionB.mean.g;
                resultImage.data[i + 2] = regionB.mean.b;
                break;
            case regionC.variance:
                resultImage.data[i] = regionC.mean.r;
                resultImage.data[i + 1] = regionC.mean.g;
                resultImage.data[i + 2] = regionC.mean.b;
                break;
            case regionD.variance:
                resultImage.data[i] = regionD.mean.r;
                resultImage.data[i + 1] = regionD.mean.g;
                resultImage.data[i + 2] = regionD.mean.b;
            }
        }
    }
}