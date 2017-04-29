/* Init the page with the imageproc javascript module */
function initPage() {
    imageproc.init("source", "result", "source_image");
}

/* Set up the filtering operation */
imageproc.operation = function(sourceImage, resultImage, params) {
    /* Get the parameters first */
    var method = params["method"];
    var sigma = params["sigma"];
    var amount = params["amount"];

    /* Values checking */
    if (isNaN(sigma) || sigma <= 0) {
        alert("Please enter a positive sigma value.");
        return;
    }
    if (isNaN(amount) || amount < 0 || amount > 100) {
        alert("Please enter a percentage between 0 and 100.");
        return;
    }

    /* Generate the noise */
    switch (method) {
    case "gaussian":
        /* Create a normal distribution */
        var dist = gaussian(0, sigma * sigma);

        /* Add the noise to the pixel brightness */
        for (var i = 0; i < sourceImage.data.length; i += 4) {
            var adjustment = dist.ppf(Math.random());
            var r, g, b;

            r = Math.round(sourceImage.data[i] + adjustment);
            g = Math.round(sourceImage.data[i + 1] + adjustment);
            b = Math.round(sourceImage.data[i + 2] + adjustment);

            /* Handle clipping */
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));

            resultImage.data[i] = r;
            resultImage.data[i + 1] = g;
            resultImage.data[i + 2] = b;
        }
        break;
    case "saltpepper":
        /* Randomly set the pixel to white or black */
        for (var i = 0; i < sourceImage.data.length; i += 4) {
            if (Math.random() < amount / 100.0) {
                resultImage.data[i] =
                resultImage.data[i + 1] =
                resultImage.data[i + 2] = (Math.random() < 0.5)? 0 : 255;
            }
            else {
                resultImage.data[i] = sourceImage.data[i];
                resultImage.data[i + 1] = sourceImage.data[i + 1];
                resultImage.data[i + 2] = sourceImage.data[i + 2];
            }
        }
    }
}
imageproc.paramIds = ["method", "sigma", "amount"];