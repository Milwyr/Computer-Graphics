var v3 = twgl.v3, m4 = twgl.m4, primitives = twgl.primitives;

var gl;
var programInfo;
var cube, sphere, floor;
var projMatrix, viewMatrix;
var uniforms = {};
var moveLimbsTimer;

var mouseInfo = {
    motion: false,
    pos: [0, 0],
    quat: trackball.create(0, 0, 0, 0),
    eye: [0, 50, 100]
}

// Rotation angle after a key down event
var angleEntireBody = 0;
var angleHead = 0;
var angleLeftArm = 0;
var angleRightArm = 0;
var angleLeftLeg = 0;
var angleRightLeg = 0;

function initialiseMouseEvents() {
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

function initialiseKeyEvents() {
    // Set up the key events to control the spaceship
    document.addEventListener('keydown', function(event) {
        switch (event.key.toLowerCase()) {
            case ",": angleEntireBody -= 5; break;
            case ".": angleEntireBody += 5; break;
            case "w": angleHead -= 5; break;
            case "e": angleHead += 5; break;
            case "a": angleLeftArm -= 5; break;
            case "s": angleLeftArm += 5; break;
            case "d": angleRightArm -= 5; break;
            case "f": angleRightArm += 5; break;
            case "z": angleLeftLeg -= 5; break;
            case "x": angleLeftLeg += 5; break;
            case "c": angleRightLeg -= 5; break;
            case "v": angleRightLeg += 5; break;
            case "r": resetRobot(); break;
        }
        
        // Toggle animation of the robot (movement of limbs) when spacebar is pressed
        if (event.keyCode === 32) {
            if (moveLimbsTimer === undefined) {
                // Rotation angle of the limbs
                var angle = 0;
                
                // A timer that keeps moving the limbs every 10ms
                moveLimbsTimer = setInterval(function() {
                    let radian = angle * Math.PI / 180;
                    
                    angleLeftArm = Math.sin(radian) * 60;
                    angleRightLeg = Math.sin(radian) * 60;
                    
                    angleRightArm = Math.sin(-radian) * 60;
                    angleLeftLeg = Math.sin(-radian) * 60;
                    
                    angle += 1;
                }, 10, angle);
            } else {
                resetRobot();
            }
        }
    });
}

function initialiseWebGL() {
    // Get the WebGL context
    gl = twgl.getWebGLContext(document.getElementById("webgl_canvas"));

    // Initialise the WebGL environment
    if (gl) {
        gl.clearColor(0, 0, 0, 1);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Create the program
        programInfo = twgl.createProgramInfo(gl,
                           ["vertex-shader", "fragment-shader"]);
        gl.useProgram(programInfo.program);

        // Create the primitive
        twgl.setDefaults({ attribPrefix: 'a_' });
        cube = primitives.createCubeBufferInfo(gl, 10);
        sphere = primitives.createSphereBufferInfo(gl, 7, 10, 10);
        floor = primitives.createXYQuadBufferInfo(gl, 100);

        // Initialise the mouse and keys
        initialiseMouseEvents();
        initialiseKeyEvents();

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

/**
 * Draw a robot component, which includes head, upper arm, forearm,
 * upper leg and lower leg.
 * @param scalingMatrix - [x_length, y_length, z_length], which indicates
 * lengths of the component in x, y, z directions respectively
 * @param colourMatrix - [r, g, b] values
 */
function drawComponent(scalingMatrix, colourMatrix) {
    matrixstack.push();
    
    // Set up the model transformation
    matrixstack.multiply(m4.scaling(scalingMatrix));
    matrixstack.multiply(m4.translation([0, 5, 0]));
    
    // Set up the matrices
    setupMatrices();
    
    // Set the colour
    uniforms.u_Color = colourMatrix;
    
    twgl.setUniforms(programInfo, uniforms);
    
    // Bind the vertex buffers
    twgl.setBuffersAndAttributes(gl, programInfo, cube);
    
    // Draw the vertex buffers as triangles
    twgl.drawBufferInfo(gl, cube);
    
    matrixstack.pop();
}

function drawEye(scalingMatrix, colourMatrix) {
    matrixstack.push();
    
    // Set up the model transformation
    matrixstack.multiply(m4.scaling(scalingMatrix));
    matrixstack.multiply(m4.translation([0, 5, 0]));
    
    // Set up the matrices
    setupMatrices();
    
    // Set the colour
    uniforms.u_Color = colourMatrix;
    
    twgl.setUniforms(programInfo, uniforms);
    
    // Bind the vertex buffers
    twgl.setBuffersAndAttributes(gl, programInfo, sphere);
    
    // Draw the vertex buffers as triangles
    twgl.drawBufferInfo(gl, sphere);
    
    matrixstack.pop();
}

/**
 * Draw an arm.
 * @param which - either "left" or "right" arm
 */
function drawArm(which) {
    const ARM_DIMENSIONS = [0.8, 3.5, 1.2];
    
    // Move to right for left limb, and move to left for right limb
    var translationMatrix = (which == "left") ?
        [21, ARM_DIMENSIONS[1] * 10, 0] : [-21, ARM_DIMENSIONS[1] * 10, 0];
    
    var rotationAngle = (which == "left") ? angleLeftArm : angleRightArm;
    
    // Draw an arm: push it to stack, move it horizontally, then rotate it
    matrixstack.push();
    matrixstack.multiply(m4.translation(translationMatrix));
    matrixstack.multiply(m4.rotationX(rotationAngle * Math.PI / 180));
    
    // Draw the arm from top to bottom (the y dimension should be negative)
    // to change the direction
    var armDimensions = [ARM_DIMENSIONS[0], -ARM_DIMENSIONS[1], ARM_DIMENSIONS[2]];
    drawComponent(armDimensions, [1, 0, 0]);
    
    // Pop the upper arm, return to the body
    matrixstack.pop();
}

/**
 * Stops movement of limbs and resets robot position.
 */
function resetRobot() {
    // Stop animation of the movement of limbs
    clearInterval(moveLimbsTimer);
    moveLimbsTimer = undefined;
    
    // Reset robot position
    angleEntireBody = 0;
    angleHead = 0;
    angleLeftArm = 0;
    angleLeftLeg = 0;
    angleRightArm = 0;
    angleRightLeg = 0;
}

/**
 * Draw a leg.
 * @param which - either "left" or "right" leg
 */
function drawLeg(which) {
    // Move to right for left leg, and move to left for right leg
    var translationMatrix = (which == "left") ? [8, 0, 0] : [-8, 0, 0];
    
    var rotationAngle = (which == "left") ? angleLeftLeg : angleRightLeg;
    
    // Draw a leg: push it to stack, move it horizontally, then rotate it
    matrixstack.push();
    matrixstack.multiply(m4.translation(translationMatrix));
    matrixstack.multiply(m4.rotationX(rotationAngle * Math.PI / 180));
    
    // Draw the leg from top to bottom (the y dimension should be negative)
    // to change the direction
    var legDimensions = [1.2, -3.5, 1.2];
    drawComponent(legDimensions, [1, 1, 0]);
    
    // Pop the leg, return to the body
    matrixstack.pop();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up the perspective projection
    projMatrix = m4.perspective(90 * Math.PI / 180,
                        gl.canvas.width / gl.canvas.height, 0.5, 200);

    // Set up the viewing transformation
    var lookAt = m4.lookAt(mouseInfo.eye,
                           [mouseInfo.eye[0], mouseInfo.eye[1], 0],
                           [0, 1, 0]);
    viewMatrix = m4.multiply(m4.inverse(lookAt),
                             trackball.buildMatrix(mouseInfo.quat));
    
    // Dimensions of the robot components in x, y, z coordinates
    const HEAD_DIMENSIONS = [1.5, 1.5, 1.5];
    const EYE_DIMENTIONS = [0.3, 0.3, 0.1];
    const BODY_DIMENSIONS = [3, 3.5, 2.5];
    
    // Draw the body: push it to stack, rotate the body, and then draw it
    matrixstack.push();
    matrixstack.multiply(m4.translation([0, BODY_DIMENSIONS[1]*10, 0]));
    matrixstack.multiply(m4.rotationY(angleEntireBody * Math.PI / 180));
    drawComponent(BODY_DIMENSIONS, [1, 1, 1]);
    
    // Draw the head: push it to stack, move it upward with value of
    // the height of the body, then rotate it, and then draw it
    matrixstack.push();
    matrixstack.multiply(m4.translation([0, BODY_DIMENSIONS[1]*10, 0]));
    matrixstack.multiply(m4.rotationY(angleHead * Math.PI / 180));
    drawComponent(HEAD_DIMENSIONS, [0, 0, 1]);
    
    // Draw left eye
    matrixstack.push();
    matrixstack.multiply(m4.translation([3, 10, 8]));
    drawEye(EYE_DIMENTIONS, [0, 1, 0]);
    
    // Pop left eye, return to head
    matrixstack.pop();
    
    // Draw right eye
    matrixstack.push();
    matrixstack.multiply(m4.translation([-3, 10, 8]));
    drawEye(EYE_DIMENTIONS, [0, 1, 0]);
    
    // Pop right eye, return to head
    matrixstack.pop();
    
    // Draw mouth
    matrixstack.push();
    matrixstack.multiply(m4.translation([0, 3, 8]));
    drawComponent([1, 0.2, 0.1], [0, 1, 0]);
    
    // Pop mouth, return to head
    matrixstack.pop();
    
    // Pop the head, return to body
    matrixstack.pop();
    
    // Draw left and right arm
    drawArm("left");
    drawArm("right");
    
    // Draw left and right leg
    drawLeg("left");
    drawLeg("right");
    
    // Pop the body
    matrixstack.pop();

    // Drawing the floor
    matrixstack.push();

    // Set up matrices and uniforms
    matrixstack.multiply(m4.rotationX(-90 * Math.PI / 180));
    setupMatrices();
    uniforms.u_Color = [1, 1, 1];
    twgl.setUniforms(programInfo, uniforms);

    // Bind the vertex buffers
    twgl.setBuffersAndAttributes(gl, programInfo, floor);

    // Draw the vertex buffers as triangles
    twgl.drawBufferInfo(gl, floor);

    matrixstack.pop();

    window.requestAnimationFrame(render);
}