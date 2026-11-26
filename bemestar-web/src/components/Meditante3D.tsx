import { useEffect, useRef } from "react";

// Pessoa meditando (posição de lótus) esculpida em 3D em tempo real, em WebGL puro.
// Técnica: raymarching de formas com distância assinada (esferas, cápsulas, elipsoides)
// unidas com "smooth min" — como uma escultura de jade/porcelana — com luz principal,
// luz de borda, translucidez falsa (subsurface), oclusão ambiente e sombra suave no chão.
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

// retorna (distância, material): 1 = corpo, 2 = almofada
vec2 cena(vec3 p) {
  float b = respiro;
  vec3 q = vec3(abs(p.x), p.y, p.z); // simetria esquerda/direita

  // tronco: quadril + barriga + peito (o peito expande ao inspirar)
  float d = sdElipsoide(p - vec3(0.0, 0.02, 0.0), vec3(0.23, 0.13, 0.17));
  d = smin(d, sdElipsoide(p - vec3(0.0, 0.2, 0.01), vec3(0.18, 0.16, 0.13 + 0.006 * b)), 0.08);
  d = smin(d, sdElipsoide(p - vec3(0.0, 0.41 + 0.012 * b, 0.0), vec3(0.205 + 0.008 * b, 0.15 + 0.01 * b, 0.125 + 0.014 * b)), 0.08);
  // ombros e braços
  float ombroY = 0.49 + 0.016 * b;
  d = smin(d, sdCapsula(q, vec3(0.0, ombroY + 0.03, -0.01), vec3(0.17, ombroY - 0.02, -0.01), 0.07), 0.09);
  d = smin(d, sdCapsula(q, vec3(0.18, ombroY - 0.04, 0.0), vec3(0.28, 0.24, 0.09), 0.052), 0.05);
  d = smin(d, sdCapsula(q, vec3(0.28, 0.24, 0.09), vec3(0.3, 0.07, 0.26), 0.043), 0.03);
  d = smin(d, sdElipsoide(q - vec3(0.29, 0.045, 0.3), vec3(0.05, 0.028, 0.06)), 0.02);
  // pernas cruzadas: coxas espelhadas, canelas cruzando à frente
  d = smin(d, sdCapsula(q, vec3(0.09, -0.03, 0.03), vec3(0.4, -0.08, 0.24), 0.1), 0.06);
  d = smin(d, sdCapsula(p, vec3(0.4, -0.1, 0.26), vec3(-0.08, -0.105, 0.37), 0.072), 0.04);
  d = smin(d, sdCapsula(p, vec3(-0.4, -0.12, 0.25), vec3(0.08, -0.135, 0.35), 0.072), 0.04);
  d = smin(d, sdElipsoide(p - vec3(-0.12, -0.095, 0.38), vec3(0.085, 0.035, 0.05)), 0.03);
  d = smin(d, sdElipsoide(p - vec3(0.12, -0.13, 0.36), vec3(0.085, 0.035, 0.05)), 0.03);
  // pescoço e cabeça (levemente inclinada para a frente, sobe com o respiro)
  float cabY = 0.79 + 0.012 * b;
  d = smin(d, sdCapsula(p, vec3(0.0, 0.54 + 0.01 * b, 0.0), vec3(0.0, cabY - 0.12, 0.015), 0.055), 0.04);
  vec3 pc = p - vec3(0.0, cabY, 0.025);
  float c = cos(0.14), s = sin(0.14);
  pc.yz = mat2(c, -s, s, c) * pc.yz;
  d = smin(d, sdElipsoide(pc, vec3(0.118, 0.142, 0.13)), 0.03);
  d = smin(d, sdEsfera(p - vec3(0.0, cabY + 0.12, -0.095), 0.065), 0.04); // coque

  float almofada = sdAlmofada(p - vec3(0.0, -0.215, 0.12), 0.5, 0.045, 0.05);
  return d < almofada ? vec2(d, 1.0) : vec2(almofada, 2.0);
}

vec3 normal(vec3 p) {
  vec2 e = vec2(0.0012, -0.0012);
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
    float h = 0.03 * float(i);
    o += (h - cena(p + n * h).x) * peso;
    peso *= 0.7;
  }
  return clamp(1.0 - 3.2 * o, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  respiro = 0.5 + 0.5 * sin(uTempo * 0.7853982 - 1.5708); // 0..1, ciclo de 8 s

  // câmera orbitando: balanço lento + mouse + giro ao trocar de modo
  float yaw = 0.28 * sin(uTempo * 0.13) + uMouse.x * 0.35 + uModo * 0.75 - 0.15;
  float pitch = 0.16 - uMouse.y * 0.1;
  float dist = mix(4.3, 3.35, uIntro);
  vec3 alvo = vec3(0.0, 0.3, 0.08);
  vec3 ro = alvo + dist * vec3(sin(yaw) * cos(pitch), sin(pitch), cos(yaw) * cos(pitch));
  vec3 fw = normalize(alvo - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 2.0 * fw);

  vec3 menta = mix(vec3(0.62, 0.86, 0.73), vec3(0.66, 0.9, 0.86), uModo);

  // aura atrás da cabeça, pulsando com a respiração
  vec2 centroAura = vec2(0.0, 0.14);
  float vinheta = smoothstep(0.5, 0.32, length(uv * vec2(1.0, 0.9)));
  float aura = exp(-length(uv - centroAura) * mix(3.4, 2.8, respiro)) * (0.22 + 0.16 * respiro) * uIntro * vinheta;
  vec3 cor = menta * aura;
  float alfa = aura;

  // limite: só marcha dentro de uma esfera que envolve a figura
  vec3 oc = ro - vec3(0.0, 0.25, 0.1);
  float bb = dot(oc, rd), cc = dot(oc, oc) - 0.95 * 0.95;
  float disc = bb * bb - cc;
  float t = 0.0;
  bool acertou = false;
  vec2 hitInfo = vec2(0.0);
  if (disc > 0.0) {
    t = max(0.0, -bb - sqrt(disc));
    float tMax = -bb + sqrt(disc);
    for (int i = 0; i < 96; i++) {
      hitInfo = cena(ro + rd * t);
      if (hitInfo.x < 0.0007) { acertou = true; break; }
      t += hitInfo.x * 0.9;
      if (t > tMax) break;
    }
  }

  vec3 luz = normalize(vec3(-0.55, 0.85, 0.65));
  vec3 luzQuente = vec3(1.0, 0.96, 0.9);

  // chão: só a sombra macia e um brilho que se apaga para as bordas
  float tChao = (-0.265 - ro.y) / rd.y;
  if (!acertou && rd.y < 0.0 && tChao > 0.0) {
    vec3 pc = ro + rd * tChao;
    float r = length(pc.xz - vec2(0.0, 0.12));
    float borda = smoothstep(0.85, 0.15, r) * vinheta;
    float sh = sombraSuave(pc, luz);
    float contato = 1.0 - smoothstep(0.0, 0.7, r) * 0.0;
    vec3 chao = mix(vec3(0.02, 0.07, 0.05), menta * 0.22, (0.35 + 0.65 * sh) * contato);
    float a = borda * 0.85 * uIntro;
    cor = mix(cor, chao, a);
    alfa = max(alfa, a);
  }

  if (acertou) {
    vec3 p = ro + rd * t;
    vec3 n = normal(p);
    vec3 v = -rd;
    float ao = oclusao(p, n);
    float sh = sombraSuave(p + n * 0.003, luz);
    float dif = clamp((dot(n, luz) + 0.35) / 1.35, 0.0, 1.0) * mix(0.45, 1.0, sh); // luz "envolvente"
    float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);
    vec3 h = normalize(luz + v);
    float spec = pow(clamp(dot(n, h), 0.0, 1.0), 36.0) * sh;
    float borda = pow(clamp(dot(n, normalize(vec3(0.7, 0.3, -0.7))), 0.0, 1.0), 2.0);
    // translucidez: a luz "atravessa" as partes finas (como jade)
    float sss = (pow(clamp(dot(v, -luz) + 0.3, 0.0, 1.0), 2.0) * 0.3 + (1.0 - clamp(dot(n, v), 0.0, 1.0)) * 0.22);
    float ceu = 0.5 + 0.5 * n.y;

    vec3 base = hitInfo.y < 1.5
      ? mix(vec3(0.66, 0.84, 0.75), vec3(0.7, 0.87, 0.84), uModo) // jade claro
      : vec3(0.1, 0.27, 0.21);                                    // almofada verde
    float brilho = hitInfo.y < 1.5 ? 1.0 : 0.25;

    cor = base * (0.18 * ceu * ao + 0.9 * dif * luzQuente * ao);
    cor += base * menta * sss;
    cor += menta * borda * 0.45 * ao;
    cor += vec3(1.0) * spec * 0.28 * brilho;
    cor += menta * fres * 0.32 * brilho;
    // luz da aura batendo de leve no corpo ao inspirar
    cor += menta * 0.08 * respiro * ao;

    cor = cor / (cor + vec3(0.9)) * 1.75; // tom "fotográfico"
    cor = pow(cor, vec3(0.95));
    // nasce da luz: começa claro/translúcido e ganha corpo
    cor = mix(menta, cor, uIntro);
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
