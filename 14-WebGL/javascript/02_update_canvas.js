var gl;

function initWebGL() {
    // Get the WebGL context
    var canvas = document.getElementById("webgl_canvas");
    gl = canvas.getContext("webgl") ||
         canvas.getContext("experimental-webgl");

    // Initialise the WebGL environment
    if (gl) {
        gl.clearColor(0, 0, 0, 1);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Update the canvas content
        window.requestAnimationFrame(render);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* There is no code to draw anything at the moment */

    window.requestAnimationFrame(render);
}