import { Settings } from "./dictionary.js";
import { game } from "./main.js";
//performance test
let frameTimes = [];
let autoPerformanceCheckDone = false;
const SAMPLES_NEEDED = 60;

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
    constructor(initialRotate = 1, initialColors = ["#B266FF", "#C080FF", "#D299FF"]) {
        // Rotation
        this.rotate = initialRotate;
        this.targetRotate = initialRotate;
        this.rotateStart = initialRotate;
        this.rotateProgress = 0;
        this.rotateDuration = 60; // frames

        // Waves
        this.waveAmp = 0;
        this.waveFreq = 0;
        this.waveStart = 0;
        this.waveTarget = 0;
        this.waveFreqStart = 0;
        this.waveFreqTarget = 0;
        this.waveProgress = 0;
        this.waveDuration = 60;

        // Fluids
        this.fluidAmp = 0.6;
        this.fluidFreq = 1.0;
        this.fluidAmpStart = 0.6;
        this.fluidAmpTarget = 0.6;
        this.fluidFreqStart = 1.0;
        this.fluidFreqTarget = 1.0;
        this.fluidProgress = 0;
        this.fluidDuration = 60;

        // Light/dimming
        this.light = 0.3;          // current brightness (1 = full)
        this.targetLight = 0.3;    // target brightness
        this.lightStart = 0.3;     // start brightness
        this.lightProgress = 0;
        this.lightDuration = 60;   // frames for dim/bright transition
        // Colors
        this.currentColors = initialColors.map(c =>
            Array.isArray(c) ? [...c] : Animator.hexToVec3(c)
        );
        this.targetColors = this.currentColors.map(c => [...c]);
        this.colorAnimStart = this.currentColors.map(c => [...c]);
        this.colorAnimProgress = 0;
        this.colorAnimDuration = 60;
        this.colorAnimating = false;
    }

    static easeInShortOutLong(t) {
        return 1 - Math.pow(1 - t, 2.5);
    }

    smoothRotateTo(newRotate, duration = 60) {
        this.rotateStart = this.rotate;
        this.targetRotate = newRotate;
        this.rotateProgress = 0;
        this.rotateDuration = duration;
    }

    updateRotate() {
        if (this.rotateProgress < 1) {
            this.rotateProgress += 1 / this.rotateDuration;
            if (this.rotateProgress > 1) this.rotateProgress = 1;
            const eased = Animator.easeInShortOutLong(this.rotateProgress);
            this.rotate = this.rotateStart + (this.targetRotate - this.rotateStart) * eased;
        }
        return this.rotate;
    }

    smoothWaveTo(newAmp, newFreq, duration = 60) {
        this.waveStart = this.waveAmp;
        this.waveTarget = newAmp;
        this.waveFreqStart = this.waveFreq;
        this.waveFreqTarget = newFreq;
        this.waveProgress = 0;
        this.waveDuration = duration;
    }

    updateWave() {
        if (this.waveProgress < 1) {
            this.waveProgress += 1 / this.waveDuration;
            if (this.waveProgress > 1) this.waveProgress = 1;
            const eased = Animator.easeInShortOutLong(this.waveProgress);
            this.waveAmp = this.waveStart + (this.waveTarget - this.waveStart) * eased;
            this.waveFreq = this.waveFreqStart + (this.waveFreqTarget - this.waveFreqStart) * eased;
        }
        return { amp: this.waveAmp, freq: this.waveFreq };
    }

    smoothFluidTo(newAmp, newFreq, duration = 60) {
        this.fluidAmpStart = this.fluidAmp;
        this.fluidAmpTarget = newAmp;
        this.fluidFreqStart = this.fluidFreq;
        this.fluidFreqTarget = newFreq;
        this.fluidProgress = 0;
        this.fluidDuration = duration;
    }

    updateFluid() {
        if (this.fluidProgress < 1) {
            this.fluidProgress += 1 / this.fluidDuration;
            if (this.fluidProgress > 1) this.fluidProgress = 1;
            const eased = Animator.easeInShortOutLong(this.fluidProgress);
            this.fluidAmp = this.fluidAmpStart + (this.fluidAmpTarget - this.fluidAmpStart) * eased;
            this.fluidFreq = this.fluidFreqStart + (this.fluidFreqTarget - this.fluidFreqStart) * eased;
        }
        return { amp: this.fluidAmp, freq: this.fluidFreq };
    }
    smoothLightTo(newLight, duration = 60) {
        this.lightStart = this.light;
        this.targetLight = newLight;
        this.lightProgress = 0;
        this.lightDuration = duration;
    }

    // Call each frame to update
    updateLight() {
        if (this.lightProgress < 1) {
            this.lightProgress += 1 / this.lightDuration;
            if (this.lightProgress > 1) this.lightProgress = 1;
            const eased = Animator.easeInShortOutLong(this.lightProgress);
            this.light = this.lightStart + (this.targetLight - this.lightStart) * eased;
        }
        return this.light;
    }
    static hexToVec3(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        return [
            parseInt(hex.slice(0, 2), 16) / 255,
            parseInt(hex.slice(2, 4), 16) / 255,
            parseInt(hex.slice(4, 6), 16) / 255
        ];
    }

    animateColors(ColorPallete, durationFrames = 60) {
        var color;
        game.GameRenderer.currentColor = ColorPallete;
        if (Settings.DARK_MODE) {
            color = ColorPallete.dark;
        }
        else {
            color = ColorPallete.light;
        }
        if (color.length !== 3) {
            console.error("animateColors expects an array of 3 colors");
            return;
        }
        this.colorAnimStart = this.currentColors.map(c => [...c]);
        this.targetColors = color.map(c =>
            Array.isArray(c) ? [...c] : Animator.hexToVec3(c)
        );
        this.colorAnimProgress = 0;
        this.colorAnimDuration = durationFrames;
        this.colorAnimating = true;
    }

    updateColors() {
        if (!this.colorAnimating) return this.currentColors;

        this.colorAnimProgress += 1 / this.colorAnimDuration;
        if (this.colorAnimProgress >= 1) {
            this.colorAnimProgress = 1;
            this.colorAnimating = false;
        }

        const eased = Animator.easeInShortOutLong(this.colorAnimProgress);

        for (let c = 0; c < 3; c++) {
            for (let i = 0; i < 3; i++) {
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
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const u_timeLoc = gl.getUniformLocation(program, "u_time");
    const u_resLoc = gl.getUniformLocation(program, "u_resolution");
    const u_vortexStrengthLoc = gl.getUniformLocation(program, "u_vortexStrength");
    const u_waveAmp = gl.getUniformLocation(program, "u_waveAmp");
    const u_waveFreq = gl.getUniformLocation(program, "u_waveFreq");

    let startTime = performance.now();

    function render() {
        const now = performance.now();

        const smoothCols = animate.updateColors();
        const waveSettings = animate.updateWave();
        const fluidSettings = animate.updateFluid();
        const timeNow = (performance.now() - startTime) * 0.001;
        
        const currentLight = animate.updateLight();
        
        if (!autoPerformanceCheckDone && !Settings.LOW_GRAPHICS) {
            if (animate.lastFrameTime) {
                const delta = now - animate.lastFrameTime;
                frameTimes.push(delta);
            }
            animate.lastFrameTime = now;

            if (frameTimes.length >= SAMPLES_NEEDED) {
                const avgDelta = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
                
                // Jeśli średni czas klatki > 33ms (poniżej 30 FPS)
                if (avgDelta > 33) {
                    console.warn("Wykryto niską wydajność. Przełączanie na tryb uproszczony.");
                    Settings.LOW_GRAPHICS = true;
                }
                autoPerformanceCheckDone = true; 
            }
        }

        if (Settings.LOW_GRAPHICS) {
            // Używamy pierwszego koloru z palety jako tła
            // Mnożymy przez jasność (light), aby zachować efekt ściemniania
            const r = smoothCols[0][0] * currentLight*2;
            const g = smoothCols[0][1] * currentLight*2;
            const b = smoothCols[0][2] * currentLight*2;

            gl.clearColor(r, g, b, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            // Kontynuujemy pętlę, ale nie wykonujemy ciężkich operacji shadera
            requestAnimationFrame(render);
            return; 
        }
        gl.useProgram(program);
        gl.uniform1f(u_waveAmp, waveSettings.amp);
        gl.uniform1f(u_waveFreq, waveSettings.freq);
        gl.uniform1f(u_vortexStrengthLoc, animate.updateRotate()); // 1.0 = normal, higher = stronger swirl 

        // set up position
        gl.enableVertexAttribArray(posAttribLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(posAttribLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform3f(gl.getUniformLocation(program, "u_color1"), ...smoothCols[0]);
        gl.uniform3f(gl.getUniformLocation(program, "u_color2"), ...smoothCols[1]);
        gl.uniform3f(gl.getUniformLocation(program, "u_color3"), ...smoothCols[2]);
        gl.uniform1f(gl.getUniformLocation(program, "u_noiseScale"), 5);
        gl.uniform1f(gl.getUniformLocation(program, "u_fluidAmp"), fluidSettings.amp);
        gl.uniform1f(gl.getUniformLocation(program, "u_fluidFreq"), fluidSettings.freq);
        gl.uniform3f(gl.getUniformLocation(program, "u_particleColor"), 1.0, 1.0, 1.0); // white
        gl.uniform1f(gl.getUniformLocation(program, "u_starSize"), 0.1);
        gl.uniform1i(gl.getUniformLocation(program, "u_starCount"), 60);
        gl.uniform1f(gl.getUniformLocation(program, "u_particleIntensity"), animate.updateLight());
        // uniforms
        gl.uniform1f(u_timeLoc, timeNow);
        gl.uniform2f(u_resLoc, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    }

    resize();
    render();
});
window.animate = animate;