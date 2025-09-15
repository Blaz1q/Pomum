precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_vortexStrength;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform float u_noiseScale;
uniform int u_octaves;
uniform float u_lacunarity;
uniform float u_gain;

// new uniforms for waves
uniform float u_waveAmp;   // wave amplitude (e.g. 0.02–0.1)
uniform float u_waveFreq;  // wave frequency (e.g. 5.0–15.0)
uniform float u_waveSpeed; // wave scroll speed (e.g. 1.0)

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

float smootherNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*f*(f*(f*6.0 - 15.0) + 10.0);
    return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
}

float fbmFluid(vec2 p) {
    float v = 0.0;
    float amp = 0.6;
    float freq = 1.0;
    for (int i=0; i<4; i++) {
        v += amp * smootherNoise(p * freq);
        p += 0.15 * vec2(sin(u_time*0.2+v*1.5), cos(u_time*0.2-v*1.5));
        freq *= 1.8;
        amp *= 0.55;
    }
    return v;
}

void main() {
    // base UV
    vec2 uv = (v_uv - 0.5) * 2.0;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;

    // apply independent waves
    uv.x += sin(uv.y * u_waveFreq + u_time * u_waveSpeed) * u_waveAmp;
    uv.y += cos(uv.x * u_waveFreq + u_time * u_waveSpeed) * u_waveAmp;

    // vortex swirl
    float r = length(uv);
    float theta = atan(uv.y, uv.x);
    theta += u_vortexStrength * r + (u_time * 0.05);

    vec2 warped = vec2(cos(theta), sin(theta)) * r;

    // fluid noise
    float n = fbmFluid(warped * 2.0 + u_time*0.3);
    float n2 = fbmFluid(warped * 5.0 - u_time*0.2);
    float t = mix(n, n2, 0.5);

    // colors
    vec3 col = mix(u_color1, u_color2, smoothstep(0.2, 0.5, t));
    col = mix(col, u_color3, smoothstep(0.5, 0.9, t));

    gl_FragColor = vec4(col, 1.0);
}