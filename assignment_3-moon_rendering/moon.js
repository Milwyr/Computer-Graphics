var v3 = twgl.v3, m4 = twgl.m4, primitives = twgl.primitives;

var gl;
var programInfo;
var sphere;
var stage = 0;
var projMatrix, viewMatrix;
var uniforms = {};
var colourMap, normalMap;
var animationTimer;

// Position of the light source
var lightPosition = v3.create(0,0,0);

var mouseInfo = {
    motion: false,
    pos: [0, 0],
    quat: trackball.create(0, 0, 0, 0),
    eye: [0, 0, 1000]
}

function createSphereTangents(arrays, subdivisionsAxis, subdivisionsHeight) {
    /* Calculate the tangents of each sphere position */
    var numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
    var tangents = primitives.createAugmentedTypedArray(3, numVertices);
    for (var y = 0; y <= subdivisionsHeight; y++) {
        for (var x = 0; x <= subdivisionsAxis; x++) {
            var u = x / subdivisionsAxis;
            var v = y / subdivisionsHeight;
            var theta = 2 * Math.PI * u;
            var phi = Math.PI * v;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var ux = cosTheta * sinPhi;
            var uz = sinTheta * sinPhi;
            if (ux * uz < 0.001)
                tangents.push(sinTheta, 0, -cosTheta);
            else
                tangents.push(uz, 0, -ux);
        }
    }
    arrays.tangent = tangents;
}

function initMouseEvents() {
    /* Set up the mouse events for the canvas area */
    gl.canvas.addEventListener('mousedown', function(event) {
        if (event.button == 0) {
            var rect = gl.canvas.getBoundingClientRect();
            mouseInfo.pos = [
                2 * (event.clientX - rect.left) / gl.canvas.width - 1,
                2 * (event.clientY - rect.top) / gl.canvas.height - 1,
            ];
            if (event.shiftKey)
                mouseInfo.motion = "pan";
            else if (event.ctrlKey)
                mouseInfo.motion = "zoom";
            else
                mouseInfo.motion = "trackball";
        }
    });
    gl.canvas.addEventListener('mouseup', function(event) {
        if (event.button == 0) mouseInfo.motion = false;
    });
    gl.canvas.addEventListener('mouseout', function(event) {
        mouseInfo.motion = false;
    });
    gl.canvas.addEventListener('mousemove', function(event) {
        if (mouseInfo.motion) {
            var rect = gl.canvas.getBoundingClientRect();
            var pos = [
                2 * (event.clientX - rect.left) / gl.canvas.width - 1,
                2 * (event.clientY - rect.top) / gl.canvas.height - 1,
            ];
            switch (mouseInfo.motion) {
            case "trackball":
                var dq = trackball.create(
                    mouseInfo.pos[0], -mouseInfo.pos[1], pos[0], -pos[1]);
                mouseInfo.quat = trackball.addQuats(dq, mouseInfo.quat);
                break;
            case "pan":
                mouseInfo.eye[0] -= (pos[0] - mouseInfo.pos[0]) * gl.canvas.width / 2;
                mouseInfo.eye[1] += (pos[1] - mouseInfo.pos[1]) * gl.canvas.height / 2;
                break;
            case "zoom":
                mouseInfo.eye[2] += (pos[1] - mouseInfo.pos[1]) * gl.canvas.height / 2;
            }
            mouseInfo.pos = pos;
        }
    });
    
}

function initKeyEvents() {
    // Set up the key events
    document.addEventListener('keydown', function(event) {
        switch (event.key) {
            case "0":   // No map
                stage = 0;
                break;
            case "1":   // Moon texture
                stage = 1;
                break;
            case "2":   // Normal map
                stage = 2;
                break;
            case "3":   // Face texture
                stage = 3;
                break;
            case "l":
                // Switch between a near and a distant light source
                lightPosition = (lightPosition[0] === 0) ?
                        v3.create(10000,0,0) : v3.create(0,0,0);
                break;
        }
        
        // Toggle the animation of light source when spacebar is pressed
        if (event.keyCode === 32) {
            if (animationTimer === undefined) {
                animationTimer = setInterval(function() {
                    let rotation = m4.axisRotation([0,1,0], 0.1);
                    lightPosition = m4.transformPoint(rotation, lightPosition);
                }, 60);
            } else {
                clearInterval(animationTimer);
                animationTimer = undefined;
            }
        }
    });
}

function initWebGL() {
    // Get the WebGL context
    gl = twgl.getWebGLContext(document.getElementById("webgl_canvas"));

    // Initialise the WebGL environment
    if (gl) {
        gl.clearColor(0, 0, 0, 1);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Create the programs
        programInfo = twgl.createProgramInfo(gl,
                          ["vertex-shader", "fragment-shader"]);
        gl.useProgram(programInfo.program);

        // Create the primitive
        twgl.setDefaults({ attribPrefix: 'a_' });
        var arrays = primitives.createSphereVertices(500, 50, 50);
        createSphereTangents(arrays, 50, 50);
        sphere = twgl.createBufferInfoFromArrays(gl, arrays); 

        // ** For stage 1 onwards
        // You need to create all relevant textures here
        colourMap = twgl.createTexture(gl, { src: "colormap.png", flipY: true });
        normalMap = twgl.createTexture(gl, { src: "normalmap.png", flipY: true });

        // Initialise the mouse and keys
        initMouseEvents();
        initKeyEvents();

        // Clear the matrix stack
        matrixstack.clear();

        // Update the canvas content
        window.requestAnimationFrame(render);
    }
}

function setupMatrices() {
    // Compute the current matrices
    var modelMatrix = matrixstack.top();
    var modelViewMatrix = m4.multiply(viewMatrix, modelMatrix);
    var normalMatrix = m4.inverse(m4.transpose(modelViewMatrix));
    var modelViewProjMatrix = m4.multiply(projMatrix, modelViewMatrix);

    // Set up the uniforms
    uniforms.u_ModelViewMatrix = modelViewMatrix;
    uniforms.u_NormalMatrix = normalMatrix;
    uniforms.u_ModelViewProjMatrix = modelViewProjMatrix;
}

function setupLight(ambient, color, position) {
    uniforms.u_WorldAmbient = ambient;
    uniforms.u_LightColor = color;
    uniforms.u_LightPosition = position;
}

function setupMaterial(ambient, diffuse, specular, shininess) {
    uniforms.u_MaterialAmbient  = ambient;
    uniforms.u_MaterialDiffuse  = diffuse;
    uniforms.u_MaterialSpecular = specular;
    uniforms.u_MaterialShininess = shininess;
}

function drawMoon() {
    matrixstack.push();

    // Set up matrices and uniforms
    setupMatrices();
    setupMaterial([0.8, 0.8, 0.75], [0.8, 0.8, 0.75], [0, 0, 0], 1);

    // ** For stage 1 onwards
    // Pass the textures as uniforms to the shader appropriately
    uniforms.u_ColorMap = colourMap;
    uniforms.u_NormalMap = normalMap;

    // Pass the current stage of the Moon to the shader
    uniforms.u_Stage = stage;
    twgl.setUniforms(programInfo, uniforms);

    // Draw a sphere
    twgl.setBuffersAndAttributes(gl, programInfo, sphere);
    twgl.drawBufferInfo(gl, sphere);

    matrixstack.pop();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up the perspective projection
    projMatrix = m4.perspective(60 * Math.PI / 180,
                        gl.canvas.width / gl.canvas.height, 0.5, 5000);

    // Set up the viewing transformation
    var lookAt = m4.lookAt(mouseInfo.eye,
                           [mouseInfo.eye[0], mouseInfo.eye[1], 0],
                           [0, 1, 0]);
    viewMatrix = m4.multiply(m4.inverse(lookAt),
                             trackball.buildMatrix(mouseInfo.quat));

    // ** For lighting
    // You need to change the light position to include
    // the distant light source, i.e.:
    // 1. Transform the light position with the view matrix
    // 2. Rotate the light position during animation, if required
    setupLight([0.1, 0.1, 0.1], [1, 1, 1], lightPosition);

    // Draw the objects
    drawMoon();

    window.requestAnimationFrame(render);
}
