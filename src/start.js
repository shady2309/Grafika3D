function start() {
     
    const canvas = document.getElementById("my_canvas");
    var pressedKey = {};
    window.onkeyup = function (e) {
        pressedKey[e.keyCode] = false;
    }
    window.onkeydown = function (e) {
        pressedKey[e.keyCode] = true;
    }

    let cameraSpeed = 0.02;
    let cameraPos = glm.vec3(0, 0, 3);
    let cameraFront = glm.vec3(0, 0, -1);
    let cameraUp = glm.vec3(0, 1, 0);
    let obrot = 0.0;
    let cameraFront_tmp = glm.vec3(1, 1, 1);

    canvas.requestPointerLock = canvas.requestPointerLock ||
    canvas.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock ||
    document.mozExitPointerLock;
    canvas.onclick = function() {
    canvas.requestPointerLock();
    };

    // Hook pointer lock state change events for different browsers
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    function lockChangeAlert() {
        if (document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas) {
        console.log('The pointer lock status is now locked');
        document.addEventListener("mousemove", ustaw_kamere_mysz, false);
        } else {
        console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", ustaw_kamere_mysz, false);
        }
    }
    let x = 50; //zmiana położenia w kierunku x
    let y = 50; //zmiana położenia w kierunku y
    let yaw =-90; //obrót względem osi X
    let pitch=0; //obrót względem osi Y
    
    function ustaw_kamere_mysz(e){
        let xoffset = e.movementX;
        let yoffset = e.movementY;
        let sensitivity = 0.1;
        let cameraSpeed = 0.05*elapsedTime;
        xoffset *= sensitivity;
        yoffset *= sensitivity;
        yaw += xoffset * cameraSpeed;
        pitch -= yoffset*cameraSpeed;
        if (pitch > 89.0)
            pitch = 89.0;
        if (pitch < -89.0)
            pitch = -89.0;
        let front = glm.vec3(1,1,1);
        front.x = Math.cos(glm.radians(yaw))*Math.cos(glm.radians(pitch));
        front.y = Math.sin(glm.radians(pitch));
        front.z = Math.sin(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
        cameraFront = glm.normalize(front);
    }
    function ustaw_kamere() {
        let cameraPos_tmp = glm.normalize(glm.cross(cameraFront, cameraUp));
        if (pressedKey["38"]) //Up
        {
            cameraPos.x += cameraSpeed * cameraFront.x;
            cameraPos.y += cameraSpeed * cameraFront.y;
            cameraPos.z += cameraSpeed * cameraFront.z;

        }
        if (pressedKey["40"]) //down
        {
            cameraPos.x -= cameraSpeed * cameraFront.x;
            cameraPos.y -= cameraSpeed * cameraFront.y;
            cameraPos.z -= cameraSpeed * cameraFront.z;
        }

        if (pressedKey["39"]) //right
        {
            cameraPos.x+=cameraPos_tmp.x * cameraSpeed;
            cameraPos.y+=cameraPos_tmp.y * cameraSpeed;
            cameraPos.z+=cameraPos_tmp.z * cameraSpeed;

        }
        if (pressedKey["37"]) //left
        {
            cameraPos.x-=cameraPos_tmp.x * cameraSpeed;
            cameraPos.y-=cameraPos_tmp.y * cameraSpeed;
            cameraPos.z-=cameraPos_tmp.z * cameraSpeed;
        }
        cameraFront_tmp.x = cameraPos.x + cameraFront.x;
        cameraFront_tmp.y = cameraPos.y + cameraFront.y;
        cameraFront_tmp.z = cameraPos.z + cameraFront.z;
        mat4.lookAt(view, cameraPos, cameraFront_tmp, cameraUp);
        gl.uniformMatrix4fv(uniView, false, view);
        requestAnimationFrame(ustaw_kamere);
    }

    requestAnimationFrame(ustaw_kamere);
    

    


    //Inicialize the GL contex
    const gl = canvas.getContext("webgl2");

    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        //return;
    }

    console.log("WebGL version: " + gl.getParameter(gl.VERSION));
    console.log("GLSL version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    console.log("Vendor: " + gl.getParameter(gl.VENDOR));

    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    const program = gl.createProgram();

    const vsSource = ` #version 300 es
            precision highp float;
            in vec3 position;
            in vec3 color;
            uniform mat4 model;
            uniform mat4 view;
            uniform mat4 proj;
            out vec3 Color;
            void main(void)
            {
              Color = color;
              gl_Position = proj * view * model * vec4(position,  1.0);
            }`;

    const fsSource = `#version 300 es
            precision highp float;
            in vec3 Color;
            out vec4 frag_color;
            void main(void)
            {
                frag_color = vec4(Color, 1.0);
            }`;

    //compilation vs
    gl.shaderSource(vs, vsSource);

    /*var vertexShaderSource = document.querySelector("#vs").text;*/

    gl.compileShader(vs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vs));
    }

    //compilation fs
    gl.shaderSource(fs, fsSource);
    /*gl.shaderSource(fs, extern.getElementsByTagName("fs")[0];.text); */
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fs));
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert(gl.getProgramInfoLog(program));
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    var n_draw = 3;
    kostka();

    const positionAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 6 * 4, 0);

    const colorAttrib = gl.getAttribLocation(program, "color");
    gl.enableVertexAttribArray(colorAttrib);
    gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 6 * 4, 3 * 4);

    window.requestAnimationFrame(draw);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);


    const view = mat4.create();
    mat4.lookAt(view, [0, 0, 3], [0, 0, -1], [0, 1, 0]);
    let uniView = gl.getUniformLocation(program, "view");
    gl.uniformMatrix4fv(uniView, false, view);

    const proj = mat4.create();
    mat4.perspective(proj, 60 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);
    let uniProj = gl.getUniformLocation(program, 'proj');
    gl.uniformMatrix4fv(uniProj, false, proj);

    const model = mat4.create();
    const kat_obrotu = (-45 * Math.PI) / 180; // in radians
    mat4.rotate(model, model, kat_obrotu, [0, 0, 1]);

    let uniModel = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(uniModel, false, model);

    ustaw_kamere();

    let licznik=0;
    const fpsElem = document.querySelector("#fps");
    let startTime=0;
    let elapsedTime=0;
    
    function draw() {
        elapsedTime = performance.now() - startTime;
        startTime = performance.now();
        licznik++;
        let fFps = 1000 / elapsedTime;
        if(licznik > fFps){
            fpsElem.textContent = fFps.toFixed(1);
            licznik = 0;
        }
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n_draw);
        window.requestAnimationFrame(draw);

        //setTimeout(() => { requestAnimationFrame(draw);}, 1000 / fFps);
    }
	
	setTimeout(() => { requestAnimationFrame(draw);}, 1000 / fFps);

   

    function kostka() {
        let punkty_ = 36;
        var vertices = [
            -0.5, -0.5, -0.5, 0.0, 0.0, 0.0,
            0.5, -0.5, -0.5, 0.0, 0.0, 1.0,
            0.5, 0.5, -0.5, 0.0, 1.0, 1.0,
            0.5, 0.5, -0.5, 0.0, 1.0, 1.0,
            -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
            -0.5, -0.5, -0.5, 0.0, 0.0, 0.0,
            -0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
            0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
            0.5, 0.5, 0.5, 1.0, 1.0, 1.0,
            0.5, 0.5, 0.5, 1.0, 1.0, 1.0,
            -0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
            -0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
            -0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
            -0.5, 0.5, -0.5, 1.0, 1.0, 1.0,
            -0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
            -0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
            -0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
            -0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
            0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
            0.5, 0.5, -0.5, 1.0, 1.0, 1.0,
            0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
            0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
            0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
            0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
            -0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
            0.5, -0.5, -0.5, 1.0, 1.0, 1.0,
            0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
            0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
            -0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
            -0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
            -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
            0.5, 0.5, -0.5, 1.0, 1.0, 1.0,
            0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
            0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
            -0.5, 0.5, 0.5, 0.0, 0.0, 0.0,
            -0.5, 0.5, -0.5, 0.0, 1.0, 0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        n_draw = punkty_;
    }

    window.addEventListener(
        "keydown",
        function (event) {
            switch (event.keyCode) {
                case 90: // Z
                    if (gl.isEnabled(gl.DEPTH_TEST))
                        gl.disable(gl.DEPTH_TEST);
                    else
                        gl.enable(gl.DEPTH_TEST);
                    break;
                case 27:
                    if (confirm("Chcesz wyjsc?")) ;
                    close();
                    break;
            }
        },
        false
    );

}






