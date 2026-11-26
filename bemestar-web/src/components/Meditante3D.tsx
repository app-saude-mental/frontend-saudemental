import { useEffect, useRef } from "react";

// Pessoa meditando (posição de lótus) modelada em 3D em tempo real, em WebGL puro.
// Técnica: raymarching de formas com distância assinada (esferas, cápsulas, elipsoides)
// unidas com "smooth min". Rosto esculpido (olhos fechados, nariz, boca serena, orelhas),
// pele com subsurface, cabelo com coque, blusa de linho e calça; luz principal, luz de
// recorte, oclusão ambiente e sombra suave no chão.
// Ela RESPIRA no ciclo de 8 s (o mesmo do texto "Inspire… Expire…"): peito expande,
// ombros e cabeça sobem. A câmera gira em volta ao alternar Entrar/Criar conta.
// Sem WebGL: onSuporte(false) e a tela mostra o anel em CSS.

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTempo;
uniform float uModo;
uniform float uIntro;
uniform vec2 uMouse;

float respiro;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float smax(float a, float b, float k) { return -smin(-a, -b, k); }
float sdEsfera(vec3 p, float r) { return length(p) - r; }
float sdElipsoide(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}
float sdCapsula(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}
float sdAlmofada(vec3 p, float r, float h, float arred) {
  vec2 d = vec2(length(p.xz) - r, abs(p.y) - h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - arred;
}

// Cabeça em coordenadas locais (frente = +z). Retorna (pele, cabelo).
vec2 cabeca(vec3 l) {
  vec3 ls = vec3(abs(l.x), l.yz); // simetria do rosto
  // crânio + rosto (mandíbula mais estreita)
  float d = sdElipsoide(l - vec3(0.0, 0.018, -0.012), vec3(0.104, 0.124, 0.118));
  d = smin(d, sdElipsoide(l - vec3(0.0, -0.035, 0.018), vec3(0.082, 0.098, 0.098)), 0.045);
  // testa e arco das sobrancelhas
  d = smin(d, sdElipsoide(l - vec3(0.0, 0.042, 0.072), vec3(0.074, 0.03, 0.042)), 0.02);
  // maçãs do rosto
  d = smin(d, sdElipsoide(ls - vec3(0.05, -0.028, 0.08), vec3(0.034, 0.028, 0.03)), 0.03);
  // queixo
  d = smin(d, sdEsfera(l - vec3(0.0, -0.112, 0.092), 0.028), 0.03);
  // órbitas dos olhos (escavadas) e pálpebras fechadas
  d = smax(d, -sdElipsoide(ls - vec3(0.038, 0.012, 0.116), vec3(0.026, 0.016, 0.02)), 0.012);
  d = smin(d, sdElipsoide(ls - vec3(0.038, 0.009, 0.101), vec3(0.022, 0.0115, 0.0125)), 0.006);
  // linha dos cílios: olhos fechados, em arco suave (expressão serena)
  d = smax(d, -sdCapsula(ls, vec3(0.019, 0.003, 0.111), vec3(0.039, -0.0005, 0.1135), 0.0021), 0.0024);
  d = smax(d, -sdCapsula(ls, vec3(0.039, -0.0005, 0.1135), vec3(0.057, 0.004, 0.107), 0.0021), 0.0024);
  // sobrancelhas: leve relevo
  d = smin(d, sdCapsula(ls, vec3(0.02, 0.034, 0.112), vec3(0.06, 0.03, 0.1), 0.0045), 0.006);
  // nariz: dorso, ponta e asas
  d = smin(d, sdCapsula(l, vec3(0.0, 0.022, 0.112), vec3(0.0, -0.028, 0.136), 0.011), 0.016);
  d = smin(d, sdEsfera(l - vec3(0.0, -0.03, 0.133), 0.015), 0.01);
  d = smin(d, sdEsfera(ls - vec3(0.014, -0.038, 0.121), 0.0095), 0.008);
  // lábios com um sorriso sereno
  d = smin(d, sdElipsoide(l - vec3(0.0, -0.067, 0.117), vec3(0.025, 0.0075, 0.011)), 0.006);
  d = smin(d, sdElipsoide(l - vec3(0.0, -0.079, 0.115), vec3(0.021, 0.0085, 0.011)), 0.006);
  d = smax(d, -sdCapsula(ls, vec3(0.0, -0.0732, 0.1268), vec3(0.025, -0.0702, 0.1195), 0.0017), 0.002);
  // orelhas
  d = smin(d, sdElipsoide(ls - vec3(0.1, 0.002, -0.004), vec3(0.013, 0.033, 0.023)), 0.012);

  // cabelo: calota acima da linha do cabelo (alta na testa, baixa na nuca) + coque
  float linha = mix(-0.1, 0.095, smoothstep(-0.06, 0.1, l.z));
  float cabelo = sdElipsoide(l - vec3(0.0, 0.026, -0.016), vec3(0.111, 0.131, 0.126));
  cabelo = smax(cabelo, linha - l.y, 0.012);
  cabelo = smin(cabelo, sdEsfera(l - vec3(0.0, 0.118, -0.095), 0.056), 0.02);
  // fios: textura bem fina na direção do penteado
  cabelo += 0.0012 * sin(l.x * 260.0 + l.y * 40.0);
  return vec2(d, cabelo);
}

// (distância, material): 1 pele, 2 almofada, 3 blusa, 4 cabelo, 5 calça
vec2 cena(vec3 p) {
  float b = respiro;
  vec3 q = vec3(abs(p.x), p.y, p.z);

  // blusa: tronco e braços (o peito expande ao inspirar)
  float blusa = sdElipsoide(p - vec3(0.0, 0.05, 0.0), vec3(0.22, 0.12, 0.165));
  blusa = smin(blusa, sdElipsoide(p - vec3(0.0, 0.2, 0.01), vec3(0.175, 0.16, 0.13 + 0.006 * b)), 0.08);
  blusa = smin(blusa, sdElipsoide(p - vec3(0.0, 0.41 + 0.012 * b, 0.0), vec3(0.2 + 0.008 * b, 0.15 + 0.01 * b, 0.125 + 0.014 * b)), 0.08);
  float ombroY = 0.49 + 0.016 * b;
  blusa = smin(blusa, sdCapsula(q, vec3(0.0, ombroY + 0.03, -0.01), vec3(0.17, ombroY - 0.02, -0.01), 0.07), 0.09);
  blusa = smin(blusa, sdCapsula(q, vec3(0.18, ombroY - 0.04, 0.0), vec3(0.28, 0.24, 0.09), 0.054), 0.05);
  blusa = smin(blusa, sdCapsula(q, vec3(0.28, 0.24, 0.09), vec3(0.298, 0.09, 0.25), 0.047), 0.03);
  // pregas leves do tecido
  blusa += 0.0016 * sin(p.y * 70.0 + p.x * 12.0) * smoothstep(0.55, 0.1, p.y);

  // calça: quadril e pernas cruzadas
  float calca = sdElipsoide(p - vec3(0.0, -0.05, 0.02), vec3(0.225, 0.095, 0.165));
  calca = smin(calca, sdCapsula(q, vec3(0.09, -0.03, 0.03), vec3(0.4, -0.08, 0.24), 0.1), 0.06);
  calca = smin(calca, sdCapsula(p, vec3(0.4, -0.1, 0.26), vec3(-0.06, -0.105, 0.37), 0.072), 0.04);
  calca = smin(calca, sdCapsula(p, vec3(-0.4, -0.12, 0.25), vec3(0.06, -0.135, 0.35), 0.072), 0.04);

  // pele: pescoço, mãos sobre os joelhos, pés
  float cabY = 0.765 + 0.012 * b;
  float pele = sdCapsula(p, vec3(0.0, 0.52 + 0.01 * b, 0.0), vec3(0.0, cabY - 0.11, 0.02), 0.058);
  pele = min(pele, sdElipsoide(q - vec3(0.297, 0.052, 0.292), vec3(0.046, 0.025, 0.058)));
  pele = min(pele, sdElipsoide(p - vec3(-0.12, -0.095, 0.385), vec3(0.08, 0.034, 0.048)));
  pele = min(pele, sdElipsoide(p - vec3(0.12, -0.13, 0.365), vec3(0.08, 0.034, 0.048)));

  // cabeça: detalhe só perto dela (longe, uma esfera envolvente basta e é mais leve)
  vec3 cabC = vec3(0.0, cabY, 0.025);
  float dc = length(p - cabC);
  vec2 cab;
  const float ESC = 1.12; // cabeça um pouco maior: proporção mais humana
  if (dc > 0.33) {
    cab = vec2(dc - 0.27);
  } else {
    vec3 l = p - cabC;
    float c = cos(0.14), s = sin(0.14);
    l.yz = mat2(c, -s, s, c) * l.yz;
    cab = cabeca(l / ESC) * ESC;
  }
  pele = smin(pele, cab.x, 0.03);

  float almofada = sdAlmofada(p - vec3(0.0, -0.215, 0.12), 0.5, 0.045, 0.05);
  vec2 res = vec2(almofada, 2.0);
  if (calca < res.x) res = vec2(calca, 5.0);
  if (blusa < res.x) res = vec2(blusa, 3.0);
  if (pele < res.x) res = vec2(pele, 1.0);
  if (cab.y < res.x) res = vec2(cab.y, 4.0);
  return res;
}

vec3 normal(vec3 p) {
  vec2 e = vec2(0.0008, -0.0008);
  return normalize(
    e.xyy * cena(p + e.xyy).x + e.yyx * cena(p + e.yyx).x +
    e.yxy * cena(p + e.yxy).x + e.xxx * cena(p + e.xxx).x);
}

float sombraSuave(vec3 ro, vec3 rd) {
  float res = 1.0, t = 0.02;
  for (int i = 0; i < 22; i++) {
    float h = cena(ro + rd * t).x;
    res = min(res, 10.0 * h / t);
    t += clamp(h, 0.02, 0.12);
    if (res < 0.01 || t > 2.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

float oclusao(vec3 p, vec3 n) {
  float o = 0.0, peso = 1.0;
  for (int i = 1; i <= 4; i++) {
    float h = 0.02 * float(i);
    o += (h - cena(p + n * h).x) * peso;
    peso *= 0.7;
  }
  return clamp(1.0 - 3.5 * o, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  respiro = 0.5 + 0.5 * sin(uTempo * 0.7853982 - 1.5708); // 0..1, ciclo de 8 s

  // câmera: balanço lento + mouse + giro ao trocar de modo
  float yaw = 0.22 * sin(uTempo * 0.13) + uMouse.x * 0.3 + uModo * 0.7 - 0.12;
  float pitch = 0.14 - uMouse.y * 0.08;
  float dist = mix(4.1, 3.3, uIntro);
  vec3 alvo = vec3(0.0, 0.32, 0.1);
  vec3 ro = alvo + dist * vec3(sin(yaw) * cos(pitch), sin(pitch), cos(yaw) * cos(pitch));
  vec3 fw = normalize(alvo - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 2.0 * fw);

  vec3 menta = mix(vec3(0.62, 0.86, 0.73), vec3(0.66, 0.9, 0.86), uModo);

  // aura atrás da cabeça, pulsando com a respiração
  float vinheta = smoothstep(0.5, 0.32, length(uv * vec2(1.0, 0.9)));
  vec2 centroAura = vec2(0.0, 0.16);
  float aura = exp(-length(uv - centroAura) * mix(3.4, 2.8, respiro)) * (0.22 + 0.16 * respiro) * uIntro * vinheta;
  vec3 cor = menta * aura;
  float alfa = aura;

  // só marcha dentro de uma esfera que envolve a figura
  vec3 oc = ro - vec3(0.0, 0.3, 0.1);
  float bb = dot(oc, rd), cc = dot(oc, oc) - 0.98 * 0.98;
  float disc = bb * bb - cc;
  float t = 0.0;
  bool acertou = false;
  vec2 hitInfo = vec2(0.0);
  if (disc > 0.0) {
    t = max(0.0, -bb - sqrt(disc));
    float tMax = -bb + sqrt(disc);
    for (int i = 0; i < 120; i++) {
      hitInfo = cena(ro + rd * t);
      if (hitInfo.x < 0.0004) { acertou = true; break; }
      t += hitInfo.x * 0.85;
      if (t > tMax) break;
    }
  }

  vec3 luz = normalize(vec3(-0.5, 0.8, 0.75));
  vec3 luzQuente = vec3(1.0, 0.95, 0.88);

  // chão: sombra macia que se apaga para as bordas
  float tChao = (-0.265 - ro.y) / rd.y;
  if (!acertou && rd.y < 0.0 && tChao > 0.0) {
    vec3 pc = ro + rd * tChao;
    float r = length(pc.xz - vec2(0.0, 0.12));
    float borda = smoothstep(0.85, 0.15, r) * vinheta;
    float sh = sombraSuave(pc, luz);
    vec3 chao = mix(vec3(0.02, 0.07, 0.05), menta * 0.22, 0.35 + 0.65 * sh);
    float a = borda * 0.85 * uIntro;
    cor = mix(cor, chao, a);
    alfa = max(alfa, a);
  }

  if (acertou) {
    vec3 p = ro + rd * t;
    vec3 n = normal(p);
    vec3 v = -rd;
    float mat = hitInfo.y;
    float ao = oclusao(p, n);
    float sh = sombraSuave(p + n * 0.003, luz);
    float nl = dot(n, luz);
    float dif = clamp((nl + 0.3) / 1.3, 0.0, 1.0) * mix(0.4, 1.0, sh); // luz envolvente
    float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);
    vec3 h = normalize(luz + v);
    float nh = clamp(dot(n, h), 0.0, 1.0);
    float borda = pow(clamp(dot(n, normalize(vec3(0.75, 0.25, -0.65))), 0.0, 1.0), 2.0);
    float ceu = 0.5 + 0.5 * n.y;

    vec3 base;
    float spec;
    if (mat < 1.5) {        // pele morena clara, com leve rubor
      base = vec3(0.84, 0.63, 0.5);
      spec = pow(nh, 28.0) * 0.18 + pow(nh, 90.0) * 0.12;
    } else if (mat < 2.5) { // almofada verde
      base = vec3(0.1, 0.27, 0.21);
      spec = pow(nh, 16.0) * 0.04;
    } else if (mat < 3.5) { // blusa de linho cru
      base = mix(vec3(0.86, 0.84, 0.78), vec3(0.84, 0.88, 0.84), uModo);
      spec = pow(nh, 10.0) * 0.04;
    } else if (mat < 4.5) { // cabelo castanho-escuro com brilho de fios
      base = vec3(0.09, 0.062, 0.048);
      spec = pow(nh, 40.0) * 0.35;
    } else {                // calça sálvia
      base = vec3(0.33, 0.47, 0.4);
      spec = pow(nh, 10.0) * 0.03;
    }
    spec *= sh;

    float ambiente = mat < 1.5 ? 0.3 : 0.2;
    cor = base * (ambiente * ceu * ao + 0.88 * dif * luzQuente * ao);
    // luz de preenchimento vinda da câmera: tira a sombra dura do queixo e do pescoço
    cor += base * 0.16 * clamp(dot(n, v), 0.0, 1.0) * mix(0.6, 1.0, ao);
    // pele: a luz "atravessa" (subsurface) e aquece as bordas
    if (mat < 1.5) {
      float sss = pow(clamp(dot(v, -luz) + 0.35, 0.0, 1.0), 2.0) * 0.25 + (1.0 - clamp(dot(n, v), 0.0, 1.0)) * 0.18;
      cor += vec3(0.9, 0.38, 0.28) * sss * ao;
      cor += vec3(0.85, 0.3, 0.25) * 0.05 * smoothstep(-0.2, 0.6, nl); // rubor suave
    }
    cor += vec3(1.0) * spec;
    cor += menta * borda * 0.32 * ao;          // luz verde de recorte
    cor += menta * fres * 0.12;
    cor += menta * 0.05 * respiro * ao;        // aura tocando o corpo ao inspirar

    cor = cor / (cor + vec3(0.92)) * 1.78; // tom "fotográfico"
    cor = pow(cor, vec3(0.94));
    cor = mix(menta, cor, uIntro); // nasce da luz
    alfa = uIntro;
  }

  gl_FragColor = vec4(cor * alfa, alfa);
}
`;

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string) {
  const sh = gl.createShader(tipo);
  if (!sh) return null;
  gl.shaderSource(sh, fonte);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

interface Props {
  modo: "login" | "cadastro";
  className?: string;
  onSuporte?: (suportado: boolean) => void;
}

export default function Meditante3D({ modo, className = "", onSuporte }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const alvoModo = useRef(modo === "cadastro" ? 1 : 0);

  useEffect(() => {
    alvoModo.current = modo === "cadastro" ? 1 : 0;
  }, [modo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const celular = window.matchMedia("(max-width: 820px)").matches;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
    const vs = gl && compilar(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = gl && compilar(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const prog = gl && vs && fs ? gl.createProgram() : null;
    if (!gl || !vs || !fs || !prog) {
      onSuporte?.(false);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      onSuporte?.(false);
      return;
    }
    onSuporte?.(true);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "uRes"),
      tempo: gl.getUniformLocation(prog, "uTempo"),
      modo: gl.getUniformLocation(prog, "uModo"),
      intro: gl.getUniformLocation(prog, "uIntro"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
    };
    gl.clearColor(0, 0, 0, 0);

    // resolução interna menor no celular (o raymarching é pesado); o CSS estica o canvas
    const escala = celular ? 0.9 : 1;
    function ajustarTamanho() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * escala;
      const { width, height } = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    ajustarTamanho();
    const observador = new ResizeObserver(ajustarTamanho);
    observador.observe(canvas);

    const mouse = { x: 0, y: 0, alvoX: 0, alvoY: 0 };
    function aoMover(e: PointerEvent) {
      mouse.alvoX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.alvoY = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", aoMover);

    const inicio = performance.now();
    let modoAtual = alvoModo.current;
    let ultimo = 0;
    let quadro = 0;
    const intervaloMin = celular ? 1000 / 30 : 0; // celular: até 30 quadros/s (bateria)

    function desenhar(agora: number) {
      if (!semMovimento && !document.hidden) quadro = requestAnimationFrame(desenhar);
      if (agora - ultimo < intervaloMin) return;
      ultimo = agora;

      const seg = semMovimento ? 3 : (agora - inicio) / 1000;
      const intro = semMovimento ? 1 : 1 - Math.pow(1 - Math.min(seg / 2.6, 1), 3);
      modoAtual += (alvoModo.current - modoAtual) * 0.045; // giro suave da câmera
      mouse.x += (mouse.alvoX - mouse.x) * 0.04;
      mouse.y += (mouse.alvoY - mouse.y) * 0.04;

      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(u.res, canvas!.width, canvas!.height);
      gl!.uniform1f(u.tempo, seg);
      gl!.uniform1f(u.modo, modoAtual);
      gl!.uniform1f(u.intro, intro);
      gl!.uniform2f(u.mouse, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    quadro = requestAnimationFrame(desenhar);

    function aoMudarVisibilidade() {
      cancelAnimationFrame(quadro);
      if (!document.hidden) quadro = requestAnimationFrame(desenhar);
    }
    document.addEventListener("visibilitychange", aoMudarVisibilidade);

    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
      window.removeEventListener("pointermove", aoMover);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [onSuporte]);

  return <canvas ref={canvasRef} className={`meditante-3d ${className}`} aria-hidden="true" />;
}
