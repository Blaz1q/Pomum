async function loadShaderFile(url) {
    const response = await fetch(url);
    return await response.text();
}
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
function compileShader(gl, type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }
async function initShaders() {
    const vsSrc = await loadShaderFile('./shaders/vertex.vert');
    const fsSrc = await loadShaderFile('./shaders/fragment.frag');
    const program = createProgram(gl, vsSrc, fsSrc);
    return program;
}
export class Animator {
    constructor(initialRotate = 0.5, initialColors = [
        [1.0, 0.5, 0.5],
        [1.0, 0.8, 0.5],
        [1.0, 0.9, 0.7]
    ]) {
        // Rotation
        this.rotate = initialRotate;
        this.targetRotate = initialRotate;
        this.rotateStart = initialRotate;
        this.rotateProgress = 0;
        this.rotateDuration = 60; // frames

        // Colors
        this.currentColors = initialColors.map(c => [...c]);
        this.targetColors = initialColors.map(c => [...c]);
        this.colorAnimStart = initialColors.map(c => [...c]);
        this.colorAnimProgress = 0;
        this.colorAnimDuration = 60;
        this.colorAnimating = false;
    }

    // Easing function: fast in, slow out
    static easeInShortOutLong(t) {
        return 1 - Math.pow(1 - t, 2.5);
    }

    // Start a smooth rotation to a new target
    smoothRotateTo(newRotate, duration = 60) {
        this.rotateStart = this.rotate;
        this.targetRotate = newRotate;
        this.rotateProgress = 0;
        this.rotateDuration = duration;
    }

    // Update rotation (call in render loop)
    updateRotate() {
        if (this.rotateProgress < 1) {
            this.rotateProgress += 1 / this.rotateDuration;
            if (this.rotateProgress > 1) this.rotateProgress = 1;
            const eased = Animator.easeInShortOutLong(this.rotateProgress);
            this.rotate = this.rotateStart + (this.targetRotate - this.rotateStart) * eased;
        }
        return this.rotate;
    }

    // Convert hex to vec3 [0-1]
    static hexToVec3(hex) {
        hex = hex.replace('#','');
        if(hex.length === 3) hex = hex.split('').map(c => c+c).join('');
        return [
            parseInt(hex.slice(0,2),16)/255,
            parseInt(hex.slice(2,4),16)/255,
            parseInt(hex.slice(4,6),16)/255
        ];
    }

    // Start color animation
    animateColors(hexArray, durationFrames = 60) {
        if(hexArray.length !== 3) {
            console.error("animateColors expects an array of 3 hex strings");
            return;
        }
        this.colorAnimStart = this.currentColors.map(c => [...c]);
        this.targetColors = hexArray.map(hex => Animator.hexToVec3(hex));
        this.colorAnimProgress = 0;
        this.colorAnimDuration = durationFrames;
        this.colorAnimating = true;
    }

    // Update colors (call in render loop)
    updateColors() {
        if(!this.colorAnimating) return this.currentColors;

        this.colorAnimProgress += 1 / this.colorAnimDuration;
        if(this.colorAnimProgress >= 1) {
            this.colorAnimProgress = 1;
            this.colorAnimating = false;
        }

        const eased = Animator.easeInShortOutLong(this.colorAnimProgress);

        for(let c = 0; c < 3; c++) {
            for(let i = 0; i < 3; i++) {
                this.currentColors[c][i] = this.colorAnimStart[c][i] +
                    (this.targetColors[c][i] - this.colorAnimStart[c][i]) * eased;
            }
        }
        return this.currentColors;
    }
}
export const animate = new Animator();
function createProgram(gl, vsSrc, fsSrc) {
      const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(prog));
        gl.deleteProgram(prog);
        return null;
      }
      return prog;
    }
initShaders().then(program => {
    const canvas = document.getElementById('glcanvas');
    const gl = canvas.getContext('webgl');
    function compileShader(gl, type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }
    

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    window.addEventListener('resize', resize);
    // full‐screen quad
    const posAttribLocation = gl.getAttribLocation(program, 'a_position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const u_timeLoc = gl.getUniformLocation(program, "u_time");
    const u_resLoc = gl.getUniformLocation(program, "u_resolution");
    const u_vortexStrengthLoc = gl.getUniformLocation(program, "u_vortexStrength");
    
    let startTime = performance.now();

    function render() {
        const smoothCols = animate.updateColors();
      const timeNow = (performance.now() - startTime) * 0.001;
      gl.useProgram(program);
      gl.uniform1f(u_vortexStrengthLoc, animate.updateRotate()); // 1.0 = normal, higher = stronger swirl 
      // set up position
      gl.enableVertexAttribArray(posAttribLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(posAttribLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3f(gl.getUniformLocation(program, "u_color1"), ...smoothCols[0]);
    gl.uniform3f(gl.getUniformLocation(program, "u_color2"), ...smoothCols[1]);
    gl.uniform3f(gl.getUniformLocation(program, "u_color3"), ...smoothCols[2]);
        gl.uniform1f(gl.getUniformLocation(program, "u_noiseScale"), 1);
gl.uniform1i(gl.getUniformLocation(program, "u_octaves"), 1);
gl.uniform1f(gl.getUniformLocation(program, "u_lacunarity"), 2);
gl.uniform1f(gl.getUniformLocation(program, "u_gain"), 1);
    // uniforms
      gl.uniform1f(u_timeLoc, timeNow);
      gl.uniform2f(u_resLoc, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(render);
    }

    resize();
    render();
});