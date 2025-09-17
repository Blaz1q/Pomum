precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_vortexStrength;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform float u_noiseScale;
uniform float u_fluidAmp;
uniform float u_fluidFreq;

// --- waves ---
uniform float u_waveAmp;
uniform float u_waveFreq;
uniform float u_waveSpeed;

// particles
uniform vec3 u_particleColor;
uniform float u_particleIntensity;
uniform float u_starSize;    // size of each star
uniform int   u_starCount;   // how many stars total

// ---- Noise helpers ----
float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(27.168, 98.123))) * 43758.5453);
}
float hash(float n) { return fract(sin(n) * 43758.5453123); }
vec2 hash2(float n) { return fract(sin(vec2(n, n+1.0)) * vec2(43758.5453,22578.145912)); }

float smootherNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0,0.0));
    float c = hash21(i + vec2(0.0,1.0));
    float d = hash21(i + vec2(1.0,1.0));
    vec2 u = f*f*f*(f*(f*6.0 - 15.0) + 10.0);
    return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
}

float fbmFluid(vec2 p, float amp, float freq) {
    float v = 0.0;
    for (int i=0; i<4; i++) {
        v += amp * smootherNoise(p * freq);
        p += 0.15 * vec2(
            sin(u_time * 0.2 + v * 1.5),
            cos(u_time * 0.2 - v * 1.5)
        );
        freq *= 1.8;
        amp *= 0.55;
    }
    return v;
}
float drawStar(vec2 uv, vec2 pos, float size, float angle, float blink) {
    // relative coordinates
    vec2 rel = uv - pos;

    // rotate around the star’s center by its own angle
    float s = sin(angle);
    float c = cos(angle);
    rel = vec2(c * rel.x - s * rel.y, s * rel.x + c * rel.y);

    // polar coordinates
    float r = length(rel) / size;
    float a = atan(rel.y, rel.x);

    // 5-point star
    float spikes = 5.0;
    float m = cos(a * spikes) * 0.5 + 0.5;

    // star mask
    float star = smoothstep(0.8, 0.2, r - m * 0.4);

    // falloff / glow
    float falloff = exp(-r * 4.0);

    return star * falloff * blink;
}

// --- star field ---
float starField(vec2 uv) {
    float sum = 0.0;
    for (int i=0; i<2000; i++) {
        if (i >= u_starCount) break;
        float fi = float(i);

        // random star position
        vec2 pos = hash2(fi) * 2.0 - 1.0;
        pos.x *= u_resolution.x / u_resolution.y;

        // blinking
        float blink = 0.5 + 0.5 * sin(u_time * (2.0 + hash(fi)*3.0) + fi);

        // star own rotation
        float angle = u_time * (0.5 + hash(fi+13.0)*1.5);

        // warp star position same as uv (waves + vortex)
        vec2 warpedPos = pos;
        warpedPos.x += sin(warpedPos.y * u_waveFreq + u_time * u_waveSpeed) * u_waveAmp;
        warpedPos.y += cos(warpedPos.x * u_waveFreq + u_time * u_waveSpeed) * u_waveAmp;

        float r = length(warpedPos);
        float theta = atan(warpedPos.y, warpedPos.x);
        theta -= u_vortexStrength * r + (u_time * 0.05);
        warpedPos = vec2(cos(theta), sin(theta)) * r;

        // draw star at warped position with its own rotation
        sum += drawStar(uv, warpedPos, u_starSize, angle, blink);
    }
    return sum;
}

void main() {
    // base UV in [-1,1]
    vec2 uv = (v_uv - 0.5) * 2.0;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;

    // apply waves
    uv.x += sin(uv.y * u_waveFreq + u_time * u_waveSpeed) * u_waveAmp;
    uv.y += cos(uv.x * u_waveFreq + u_time * u_waveSpeed) * u_waveAmp;

    // vortex swirl
    float r = length(uv);
    float theta = atan(uv.y, uv.x);
    theta += u_vortexStrength * r + (u_time * 0.05);
    vec2 warped = vec2(cos(theta), sin(theta)) * r;

    // fluid noise
    float n = fbmFluid(warped * 2.0 + u_time*0.3,u_fluidAmp,u_fluidFreq);
    float n2 = fbmFluid(warped * 5.0 - u_time*0.2,u_fluidAmp,u_fluidFreq);
    float t = mix(n, n2, 0.5);

    // background colors
    vec3 col = mix(u_color1, u_color2, smoothstep(0.2, 0.5, t));
    col = mix(col, u_color3, smoothstep(0.5, 0.9, t));

    // stars
    // float stars = starField(uv);
    // col += u_particleColor * stars * u_particleIntensity;

    gl_FragColor = vec4(col, 1.0);
}


