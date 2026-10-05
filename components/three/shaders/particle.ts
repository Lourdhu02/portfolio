export const vertexShader = `
uniform float uTime;
uniform float uProgress;
uniform vec3 uMouse;
uniform float uMouseForce;

attribute vec3 target;
attribute float seed;
attribute float size;
attribute float isAccent;

varying float vAlpha;
varying float vAccent;

// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 curlNoise(vec3 p) {
    const float e = .1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_x0 = vec3(snoise(p - dx), snoise(p - dx + 10.0), snoise(p - dx + 20.0));
    vec3 p_x1 = vec3(snoise(p + dx), snoise(p + dx + 10.0), snoise(p + dx + 20.0));
    vec3 p_y0 = vec3(snoise(p - dy), snoise(p - dy + 10.0), snoise(p - dy + 20.0));
    vec3 p_y1 = vec3(snoise(p + dy), snoise(p + dy + 10.0), snoise(p + dy + 20.0));
    vec3 p_z0 = vec3(snoise(p - dz), snoise(p - dz + 10.0), snoise(p - dz + 20.0));
    vec3 p_z1 = vec3(snoise(p + dz), snoise(p + dz + 10.0), snoise(p + dz + 20.0));

    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

    const float divisor = 1.0 / (2.0 * e);
    return normalize(vec3(x , y , z) * divisor);
}

void main() {
    vAccent = isAccent;
    
    // Starting position (nebula)
    vec3 pos = position; 
    
    // Add curl noise over time. It is 18 simplex lookups per particle and fades out with
    // uProgress, so skip it once the name has formed (a uniform branch, same for every vertex).
    if (uProgress < 1.0) {
        vec3 noise = curlNoise(pos * 0.5 + uTime * 0.2);
        pos += noise * 2.0 * (1.0 - uProgress);
    }
    
    // Stagger based on seed
    float stagger = seed * 0.4;
    float p = clamp((uProgress - stagger) * (1.0 / 0.6), 0.0, 1.0);
    p = smoothstep(0.0, 1.0, p);
    
    // Interpolate towards target
    vec3 currentPos = mix(pos, target, p);
    
    // Cursor repulsion
    float dist = distance(currentPos, uMouse);
    float force = smoothstep(3.0, 0.0, dist) * uMouseForce;
    if(force > 0.0) {
        vec3 dir = normalize(currentPos - uMouse);
        currentPos += dir * force * 1.5;
    }
    
    // Breathing noise
    currentPos.y += sin(uTime * 2.0 + seed * 10.0) * 0.05 * p;
    
    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    
    // Size attenuation
    gl_PointSize = size * (20.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // Depth-based alpha
    float depthAlpha = smoothstep(-25.0, 5.0, mvPosition.z);
    vAlpha = depthAlpha * (0.2 + p * 0.8);
}
`

export const fragmentShader = `
uniform vec3 uColor;
uniform vec3 uAccent;

varying float vAlpha;
varying float vAccent;

void main() {
    // Soft round sprite
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Smooth edges
    float alpha = smoothstep(0.5, 0.1, dist);
    
    vec3 finalColor = mix(uColor, uAccent, vAccent);
    
    gl_FragColor = vec4(finalColor, alpha * vAlpha);
}
`
