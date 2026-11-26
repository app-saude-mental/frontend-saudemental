import { useEffect, useRef } from "react";

// Esfera 3D "de vidro líquido" desenhada em WebGL puro (sem biblioteca).
// Técnica: raymarching de uma esfera com deformação orgânica (soma de senos) + iluminação
// (difusa, especular, borda/fresnel, reflexo de um "céu" e brilho interno). Ela respira no
// mesmo ritmo do texto (ciclo de 8 s), nasce do centro ao carregar, inclina com o mouse e
// muda de forma/tom ao alternar entre Entrar (modo 0) e Criar conta (modo 1).
// Sem WebGL ou com "reduzir movimento": devolve false em onSuporte e a tela usa o anel em CSS.

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

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

float deformacao(vec3 p) {
  float t = uTempo;
  float forca = mix(1.0, 1.65, uModo);
  float d = 0.05 * sin(2.6 * p.x + t * 0.55) * sin(2.9 * p.y + t * 0.47) * sin(2.4 * p.z + t * 0.61);
  d += 0.022 * sin(5.3 * p.x - t * 0.8 + 1.7) * sin(4.7 * p.y + t * 0.73) * sin(5.1 * p.z - t * 0.5);
  d += 0.007 * sin(11.0 * p.y + t * 1.2) * sin(9.0 * p.x - t);
  return d * forca;
}

float cena(vec3 p) {
  float respira = 0.055 * sin(uTempo * 0.7853982); // 2*pi/8: ciclo de 8 s
  float raio = (0.62 + respira) * uIntro;
  return length(p) - raio - deformacao(p) * uIntro;
}

vec3 normal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    cena(p + e.xyy) - cena(p - e.xyy),
    cena(p + e.yxy) - cena(p - e.yxy),
    cena(p + e.yyx) - cena(p - e.yyx)));
}

// "céu" refletido: luz suave em cima, verde profundo embaixo
vec3 ceu(vec3 d) {
  float t = d.y * 0.5 + 0.5;
  vec3 baixo = vec3(0.03, 0.09, 0.07);
  vec3 alto = mix(vec3(0.78, 0.92, 0.84), vec3(0.88, 0.95, 0.86), uModo);
  vec3 c = mix(baixo, alto, smoothstep(0.15, 1.0, t));
  // janela de luz (reflexo retangular suave)
  float janela = smoothstep(0.55, 0.9, d.y) * smoothstep(0.6, 0.0, abs(d.x + 0.35));
  return c + janela * 0.6;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  vec3 ro = vec3(0.0, 0.0, 2.6);
  vec3 rd = normalize(vec3(uv, -1.55));
  mat3 giro = rotY(uMouse.x * 0.35 + uTempo * 0.05) * rotX(-uMouse.y * 0.25);
  ro = giro * ro;
  rd = giro * rd;

  float t = 0.0;
  float menor = 10.0;
  bool acertou = false;
  for (int i = 0; i < 72; i++) {
    vec3 p = ro + rd * t;
    float d = cena(p);
    menor = min(menor, d);
    if (d < 0.0008) { acertou = true; break; }
    t += d * 0.8;
    if (t > 6.0) break;
  }

  vec3 verde = mix(vec3(0.11, 0.32, 0.25), vec3(0.16, 0.42, 0.36), uModo);
  vec3 menta = mix(vec3(0.62, 0.86, 0.73), vec3(0.72, 0.92, 0.84), uModo);

  if (!acertou) {
    // halo em volta da esfera (some com a distância)
    // some antes da borda do canvas (sem "quadrado" visível)
    float halo = exp(-menor * 13.0) * 0.42 * uIntro * smoothstep(0.5, 0.36, length(uv));
    gl_FragColor = vec4(menta * halo, halo);
    return;
  }

  vec3 p = ro + rd * t;
  vec3 n = normal(p);
  vec3 v = -rd;
  vec3 luz = normalize(vec3(-0.6, 0.75, 0.55));
  vec3 luzBorda = normalize(vec3(0.8, -0.2, -0.6));

  float dif = max(dot(n, luz), 0.0);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 h = normalize(luz + v);
  float spec = pow(max(dot(n, h), 0.0), 90.0);
  float specLargo = pow(max(dot(n, h), 0.0), 12.0) * 0.18;
  float borda = pow(max(dot(n, luzBorda), 0.0), 2.0);
  // "luz por dentro": mais clara onde a superfície se volta para o observador
  float interno = smoothstep(0.0, 1.0, dot(n, v)) * 0.35;

  vec3 cor = verde * (0.28 + 0.62 * dif);
  cor += menta * interno * 0.5;
  cor += ceu(reflect(rd, n)) * (0.12 + 0.55 * fres);
  cor += menta * borda * 0.45;
  cor += vec3(1.0) * (spec * 0.9 + specLargo);
  cor = mix(cor, menta, fres * 0.25);

  // correção de cor suave (tons mais "fotográficos")
  cor = cor / (cor + vec3(0.85)) * 1.6;
  cor = pow(cor, vec3(0.92));
  gl_FragColor = vec4(cor * uIntro, uIntro);
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

export default function Orbe3D({ modo, className = "", onSuporte }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const alvoModo = useRef(modo === "cadastro" ? 1 : 0);

  // o loop lê o alvo pelo ref (não reinicia o WebGL ao trocar de modo)
  useEffect(() => {
    alvoModo.current = modo === "cadastro" ? 1 : 0;
  }, [modo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true, alpha: true });
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

    // um triângulo que cobre a tela inteira
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

    function ajustarTamanho() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { width, height } = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.round(width * dpr));
      canvas!.height = Math.max(1, Math.round(height * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    ajustarTamanho();
    const observador = new ResizeObserver(ajustarTamanho);
    observador.observe(canvas);

    // mouse com inércia (só no notebook; no celular a esfera gira sozinha devagar)
    const mouse = { x: 0, y: 0, alvoX: 0, alvoY: 0 };
    function aoMover(e: PointerEvent) {
      mouse.alvoX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.alvoY = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", aoMover);

    const inicio = performance.now();
    let modoAtual = alvoModo.current;
    let quadro = 0;

    function desenhar(agora: number) {
      const seg = semMovimento ? 2 : (agora - inicio) / 1000;
      // intro: nasce do centro em ~2,2 s (ease-out)
      const intro = semMovimento ? 1 : 1 - Math.pow(1 - Math.min(seg / 2.2, 1), 3);
      modoAtual += (alvoModo.current - modoAtual) * 0.06;
      mouse.x += (mouse.alvoX - mouse.x) * 0.05;
      mouse.y += (mouse.alvoY - mouse.y) * 0.05;

      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(u.res, canvas!.width, canvas!.height);
      gl!.uniform1f(u.tempo, seg);
      gl!.uniform1f(u.modo, modoAtual);
      gl!.uniform1f(u.intro, intro);
      gl!.uniform2f(u.mouse, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      if (!semMovimento && !document.hidden) quadro = requestAnimationFrame(desenhar);
    }
    quadro = requestAnimationFrame(desenhar);

    // aba em segundo plano: para de desenhar (economiza bateria)
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

  // sem WebGL o canvas fica transparente e a tela mostra o anel em CSS (via onSuporte)
  return <canvas ref={canvasRef} className={`orbe-3d ${className}`} aria-hidden="true" />;
}
