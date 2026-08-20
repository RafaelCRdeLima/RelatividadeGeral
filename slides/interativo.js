// Gráficos interativos dos slides.
//
// Cada um procura o seu elemento pelo id e desiste em silêncio se ele não
// estiver nesta página -- assim o mesmo arquivo serve a todos os
// capítulos sem que nenhum precise saber o que os outros contêm.

(function () {
  "use strict";

  // ==================================================================
  // Hipérboles invariantes e os eixos de S'
  // ==================================================================
  //
  // O ponto que o gráfico existe para mostrar: as hipérboles NÃO se
  // mexem quando v muda. Elas são o lugar dos eventos a distância de
  // Minkowski fixa da origem, e essa distância é a mesma para todos os
  // observadores. O que gira são os eixos -- e as marcas de unidade
  // deslizam ao longo de hipérboles paradas.
  //
  // É a diferença entre "cada observador tem sua régua" e "há uma régua
  // só, lida de ângulos diferentes".

  const svg = document.getElementById("hiperboles");
  const controle = document.getElementById("v-hiperboles");
  if (!svg || !controle) return;

  const NS = "http://www.w3.org/2000/svg";
  const XMIN = -0.32, XMAX = 3.3;       // mesmo domínio nos dois eixos
  const LADO = 560;
  const k = LADO / (XMAX - XMIN);        // pixels por unidade geometrizada
  const fx = (x) => (x - XMIN) * k;
  const fy = (y) => LADO - (y - XMIN) * k;

  const COR = {
    eixo: "rgba(238,247,246,0.45)",
    luz: "#8dd7dc",
    temporal: "#7fb2ff",   // calibra ct'
    espacial: "#f2836b",   // calibra x'
    linha: "#e6b75c",      // os eixos de S'
  };
  // n=1 cheio, os múltiplos cada vez mais apagados: a unidade é o que
  // interessa, os outros ramos só mostram que a família continua.
  const OPACIDADE = { 1: 1, 2: 0.42, 3: 0.2 };

  function cria(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const a in attrs) el.setAttribute(a, attrs[a]);
    return el;
  }

  // ---------------- o que não muda: desenhado uma vez ---------------
  const fundo = cria("g", {});
  svg.appendChild(fundo);

  fundo.appendChild(cria("line", {
    x1: fx(XMIN), y1: fy(0), x2: fx(XMAX), y2: fy(0),
    stroke: COR.eixo, "stroke-width": 1.2,
  }));
  fundo.appendChild(cria("line", {
    x1: fx(0), y1: fy(XMIN), x2: fx(0), y2: fy(XMAX),
    stroke: COR.eixo, "stroke-width": 1.2,
  }));

  const nomeX = cria("text", {
    x: fx(XMAX) - 4, y: fy(0) + 26, fill: COR.eixo, "font-size": 19,
    "font-style": "italic", "text-anchor": "end",
  });
  nomeX.textContent = "x";
  const nomeT = cria("text", {
    x: fx(0) - 12, y: fy(XMAX) + 18, fill: COR.eixo, "font-size": 19,
    "font-style": "italic", "text-anchor": "end",
  });
  nomeT.textContent = "ct";
  fundo.append(nomeX, nomeT);

  // cone de luz: assíntota comum a todas as hipérboles
  fundo.appendChild(cria("line", {
    x1: fx(0), y1: fy(0), x2: fx(XMAX), y2: fy(XMAX),
    stroke: COR.luz, "stroke-width": 1.6, "stroke-dasharray": "7 5",
    opacity: 0.85,
  }));
  const rotLuz = cria("text", {
    x: fx(2.92), y: fy(2.98), fill: COR.luz, "font-size": 17,
    "text-anchor": "end", opacity: 0.85,
  });
  rotLuz.textContent = "ct = x";
  fundo.appendChild(rotLuz);

  // as hipérboles, uma família de cada tipo
  function caminho(pontos) {
    return pontos.map((p, i) => (i ? "L" : "M") + fx(p[0]) + " " + fy(p[1])).join(" ");
  }
  for (const n of [3, 2, 1]) {          // do mais apagado ao mais forte
    const temporal = [], espacial = [];
    for (let i = 0; i <= 160; i++) {
      const u = (i / 160) * Math.acosh(XMAX / n);   // parametriza por rapidez
      temporal.push([n * Math.sinh(u), n * Math.cosh(u)]);
      espacial.push([n * Math.cosh(u), n * Math.sinh(u)]);
    }
    fundo.appendChild(cria("path", {
      d: caminho(temporal), fill: "none", stroke: COR.temporal,
      "stroke-width": n === 1 ? 2.6 : 1.8, opacity: OPACIDADE[n],
    }));
    fundo.appendChild(cria("path", {
      d: caminho(espacial), fill: "none", stroke: COR.espacial,
      "stroke-width": n === 1 ? 2.6 : 1.8, opacity: OPACIDADE[n],
    }));
  }

  // ---------------- o que muda com v --------------------------------
  const movel = cria("g", {});
  svg.appendChild(movel);

  const eixoT = cria("line", { stroke: COR.linha, "stroke-width": 2.4 });
  const eixoX = cria("line", { stroke: COR.linha, "stroke-width": 2.4 });
  const rotT = cria("text", {
    fill: COR.linha, "font-size": 20, "font-style": "italic",
    "text-anchor": "end",
  });
  const rotX = cria("text", {
    fill: COR.linha, "font-size": 20, "font-style": "italic",
  });
  rotT.textContent = "ct′";
  rotX.textContent = "x′";
  movel.append(eixoT, eixoX, rotT, rotX);

  // as marcas de unidade, uma por ramo de cada família
  const marcas = [];
  for (const n of [1, 2, 3]) {
    const mt = cria("circle", { r: n === 1 ? 8 : 6, fill: COR.temporal, opacity: OPACIDADE[n] });
    const mx = cria("circle", { r: n === 1 ? 8 : 6, fill: COR.espacial, opacity: OPACIDADE[n] });
    const lt = cria("text", {
      fill: COR.temporal, "font-size": n === 1 ? 18 : 15, "text-anchor": "end",
      opacity: OPACIDADE[n],
    });
    const lx = cria("text", { fill: COR.espacial, "font-size": n === 1 ? 18 : 15, opacity: OPACIDADE[n] });
    lt.textContent = "ct′ = " + n;
    lx.textContent = "x′ = " + n;
    movel.append(mt, mx, lt, lx);
    marcas.push({ n, mt, mx, lt, lx });
  }

  const lidoV = document.getElementById("leitura-v");
  const lidoG = document.getElementById("leitura-gama");

  function desenhar() {
    const v = controle.value / 100;
    const g = 1 / Math.sqrt(1 - v * v);

    // O eixo ct' é x = vt; o eixo x' é ct = vx. Cada um vai até a borda.
    eixoT.setAttribute("x1", fx(0)); eixoT.setAttribute("y1", fy(0));
    eixoT.setAttribute("x2", fx(v * XMAX)); eixoT.setAttribute("y2", fy(XMAX));
    eixoX.setAttribute("x1", fx(0)); eixoX.setAttribute("y1", fy(0));
    eixoX.setAttribute("x2", fx(XMAX)); eixoX.setAttribute("y2", fy(v * XMAX));
    // A 85% do caminho, e não na ponta: na ponta o rótulo encostava na
    // borda do quadro e era cortado nos valores altos de v.
    const f = 0.85;
    rotT.setAttribute("x", fx(v * f * XMAX) - 12);
    rotT.setAttribute("y", fy(f * XMAX) + 6);
    rotX.setAttribute("x", fx(f * XMAX) + 6);
    rotX.setAttribute("y", fy(v * f * XMAX) - 12);

    // A unidade n de cada eixo está onde a hipérbole n o corta:
    // sobre ct', em (n*gamma*v, n*gamma); sobre x', o espelho disso.
    for (const m of marcas) {
      const d = m.n * g;
      const dentro = d <= XMAX && d * v <= XMAX;
      for (const el of [m.mt, m.mx, m.lt, m.lx]) {
        el.style.display = dentro ? "" : "none";
      }
      if (!dentro) continue;
      m.mt.setAttribute("cx", fx(d * v)); m.mt.setAttribute("cy", fy(d));
      m.mx.setAttribute("cx", fx(d)); m.mx.setAttribute("cy", fy(d * v));
      m.lt.setAttribute("x", fx(d * v) - 14); m.lt.setAttribute("y", fy(d) + 6);
      m.lx.setAttribute("x", fx(d) + 14); m.lx.setAttribute("y", fy(d * v) + 6);
    }

    if (lidoV) lidoV.textContent = v.toFixed(2).replace(".", ",");
    if (lidoG) lidoG.textContent = g.toFixed(3).replace(".", ",");
  }

  controle.addEventListener("input", desenhar);
  desenhar();
})();

// ====================================================================
// Composição de rotações: o ângulo soma, a inclinação não
// ====================================================================
//
// O par destes dois gráficos existe para mostrar UMA coisa: a lei
// esquisita de composição de velocidades não é uma esquisitice da
// relatividade. Ela é o que qualquer rotação faz quando descrita pelo
// parâmetro errado.
//
// No plano euclidiano, girar 20 graus e depois 30 é girar 50 -- soma
// trivial. Mas a INCLINAÇÃO m = tan(theta) das mesmas rotações compõe
// por (m1+m2)/(1-m1*m2). Do lado hiperbólico, a rapidez soma e a
// velocidade v = tanh(phi) compõe por (v1+v2)/(1+v1*v2).
//
// A única diferença entre as duas fórmulas é o sinal do denominador --
// e é esse sinal que decide se existe ou não velocidade limite.

(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const cria = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const a in attrs) el.setAttribute(a, attrs[a]);
    return el;
  };
  const COR = {
    eixo: "rgba(238,247,246,0.40)",
    guia: "#8dd7dc",
    um: "#7fb2ff",     // a primeira rotação
    dois: "#e6b75c",   // o resultado das duas
    curva: "rgba(238,247,246,0.55)",
  };
  const num = (x, casas) => x.toFixed(casas).replace(".", ",");

  // ---------------- painel euclidiano ------------------------------
  (function euclidiano() {
    const svg = document.getElementById("rot-euclidiana");
    const c1 = document.getElementById("ang1"), c2 = document.getElementById("ang2");
    if (!svg || !c1 || !c2) return;

    const L = 520, O = L / 2, R = 190;   // origem no centro, círculo de raio R
    const fx = (x) => O + x * R, fy = (y) => O - y * R;

    const fundo = cria("g", {});
    svg.appendChild(fundo);
    fundo.appendChild(cria("line", { x1: 18, y1: fy(0), x2: L - 18, y2: fy(0), stroke: COR.eixo, "stroke-width": 1.2 }));
    fundo.appendChild(cria("line", { x1: fx(0), y1: 18, x2: fx(0), y2: L - 18, stroke: COR.eixo, "stroke-width": 1.2 }));
    // o círculo é o que a rotação euclidiana preserva
    fundo.appendChild(cria("circle", { cx: fx(0), cy: fy(0), r: R, fill: "none", stroke: COR.curva, "stroke-width": 1.8 }));
    const rotC = cria("text", { x: fx(0) + 10, y: fy(1) - 12, fill: COR.curva, "font-size": 16 });
    rotC.textContent = "x² + y² = 1";
    fundo.appendChild(rotC);

    const movel = cria("g", {});
    svg.appendChild(movel);
    const raio1 = cria("line", { stroke: COR.um, "stroke-width": 2.6 });
    const raio2 = cria("line", { stroke: COR.dois, "stroke-width": 2.6 });
    const arco1 = cria("path", { fill: "none", stroke: COR.um, "stroke-width": 2, opacity: 0.75 });
    const arco2 = cria("path", { fill: "none", stroke: COR.dois, "stroke-width": 2, opacity: 0.75 });
    const rot1 = cria("text", { fill: COR.um, "font-size": 17 });
    const rot2 = cria("text", { fill: COR.dois, "font-size": 17 });
    movel.append(arco1, arco2, raio1, raio2, rot1, rot2);

    const arco = (de, ate, r) => {
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const a = de + (ate - de) * (i / 60);
        pts.push((i ? "L" : "M") + fx(r * Math.cos(a)) + " " + fy(r * Math.sin(a)));
      }
      return pts.join(" ");
    };

    const leituras = ["eu-t1","eu-t2","eu-soma","eu-m1","eu-m2","eu-ingenuo","eu-formula","eu-tan"]
      .map(id => document.getElementById(id));
    const aviso = document.getElementById("eu-aviso");

    function desenhar() {
      const t1 = Number(c1.value) * Math.PI / 180, t2 = Number(c2.value) * Math.PI / 180;
      const t3 = t1 + t2;
      raio1.setAttribute("x1", fx(0)); raio1.setAttribute("y1", fy(0));
      raio1.setAttribute("x2", fx(Math.cos(t1))); raio1.setAttribute("y2", fy(Math.sin(t1)));
      raio2.setAttribute("x1", fx(0)); raio2.setAttribute("y1", fy(0));
      raio2.setAttribute("x2", fx(Math.cos(t3))); raio2.setAttribute("y2", fy(Math.sin(t3)));
      arco1.setAttribute("d", arco(0, t1, 0.34));
      arco2.setAttribute("d", arco(t1, t3, 0.52));
      rot1.setAttribute("x", fx(0.40 * Math.cos(t1 / 2)) + 4);
      rot1.setAttribute("y", fy(0.40 * Math.sin(t1 / 2)));
      rot1.textContent = "θ₁";
      rot2.setAttribute("x", fx(0.58 * Math.cos((t1 + t3) / 2)) + 4);
      rot2.setAttribute("y", fy(0.58 * Math.sin((t1 + t3) / 2)));
      rot2.textContent = "θ₂";

      const m1 = Math.tan(t1), m2 = Math.tan(t2), den = 1 - m1 * m2;
      const perto = Math.abs(den) < 0.06;
      const val = [
        num(Number(c1.value), 0) + "°", num(Number(c2.value), 0) + "°",
        num(Number(c1.value) + Number(c2.value), 0) + "°",
        num(m1, 3), num(m2, 3), num(m1 + m2, 3),
        perto ? "→ ∞" : num((m1 + m2) / den, 3),
        perto ? "→ ∞" : num(Math.tan(t3), 3),
      ];
      leituras.forEach((el, i) => { if (el) el.textContent = val[i]; });
      if (aviso) aviso.style.visibility = perto ? "visible" : "hidden";
    }
    c1.addEventListener("input", desenhar);
    c2.addEventListener("input", desenhar);
    desenhar();
  })();

  // ---------------- painel hiperbólico -----------------------------
  (function hiperbolico() {
    const svg = document.getElementById("rot-hiperbolica");
    const c1 = document.getElementById("rap1"), c2 = document.getElementById("rap2");
    if (!svg || !c1 || !c2) return;

    const L = 520, XMIN = -0.25, XMAX = 3.15;
    const k = L / (XMAX - XMIN);
    const fx = (x) => (x - XMIN) * k, fy = (y) => L - (y - XMIN) * k;

    const fundo = cria("g", {});
    svg.appendChild(fundo);
    fundo.appendChild(cria("line", { x1: fx(XMIN), y1: fy(0), x2: fx(XMAX), y2: fy(0), stroke: COR.eixo, "stroke-width": 1.2 }));
    fundo.appendChild(cria("line", { x1: fx(0), y1: fy(XMIN), x2: fx(0), y2: fy(XMAX), stroke: COR.eixo, "stroke-width": 1.2 }));
    fundo.appendChild(cria("line", {
      x1: fx(0), y1: fy(0), x2: fx(XMAX), y2: fy(XMAX),
      stroke: COR.guia, "stroke-width": 1.6, "stroke-dasharray": "7 5", opacity: 0.8,
    }));
    // a hipérbole é o que a rotação hiperbólica preserva
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const u = (i / 200) * Math.acosh(XMAX);
      pts.push((i ? "L" : "M") + fx(Math.sinh(u)) + " " + fy(Math.cosh(u)));
    }
    fundo.appendChild(cria("path", { d: pts.join(" "), fill: "none", stroke: COR.curva, "stroke-width": 1.8 }));
    const rotH = cria("text", { x: fx(0.16), y: fy(2.15), fill: COR.curva, "font-size": 16 });
    rotH.textContent = "ct² − x² = 1";
    fundo.appendChild(rotH);
    const rotL = cria("text", { x: fx(2.72), y: fy(2.86), fill: COR.guia, "font-size": 15, "text-anchor": "end", opacity: 0.85 });
    rotL.textContent = "ct = x";
    fundo.appendChild(rotL);

    const movel = cria("g", {});
    svg.appendChild(movel);
    const r1 = cria("line", { stroke: COR.um, "stroke-width": 2.6 });
    const r2 = cria("line", { stroke: COR.dois, "stroke-width": 2.6 });
    const p1 = cria("circle", { r: 7.5, fill: COR.um });
    const p2 = cria("circle", { r: 7.5, fill: COR.dois });
    const l1 = cria("text", { fill: COR.um, "font-size": 17 });
    const l2 = cria("text", { fill: COR.dois, "font-size": 17 });
    movel.append(r1, r2, p1, p2, l1, l2);

    const leituras = ["hi-f1","hi-f2","hi-soma","hi-v1","hi-v2","hi-ingenuo","hi-formula","hi-tanh"]
      .map(id => document.getElementById(id));

    function desenhar() {
      const f1 = Number(c1.value) / 100, f2 = Number(c2.value) / 100, f3 = f1 + f2;
      const P = (f) => [Math.sinh(f), Math.cosh(f)];
      const [x1, y1] = P(f1), [x2, y2] = P(f3);
      r1.setAttribute("x1", fx(0)); r1.setAttribute("y1", fy(0));
      r1.setAttribute("x2", fx(x1)); r1.setAttribute("y2", fy(y1));
      r2.setAttribute("x1", fx(0)); r2.setAttribute("y1", fy(0));
      r2.setAttribute("x2", fx(x2)); r2.setAttribute("y2", fy(y2));
      p1.setAttribute("cx", fx(x1)); p1.setAttribute("cy", fy(y1));
      p2.setAttribute("cx", fx(x2)); p2.setAttribute("cy", fy(y2));
      l1.setAttribute("x", fx(x1) - 30); l1.setAttribute("y", fy(y1) - 12); l1.textContent = "φ₁";
      l2.setAttribute("x", fx(x2) - 30); l2.setAttribute("y", fy(y2) - 12); l2.textContent = "φ₁+φ₂";

      const v1 = Math.tanh(f1), v2 = Math.tanh(f2);
      const val = [
        num(f1, 2), num(f2, 2), num(f3, 2),
        num(v1, 4), num(v2, 4), num(v1 + v2, 4),
        num((v1 + v2) / (1 + v1 * v2), 4), num(Math.tanh(f3), 4),
      ];
      leituras.forEach((el, i) => { if (el) el.textContent = val[i]; });
    }
    c1.addEventListener("input", desenhar);
    c2.addEventListener("input", desenhar);
    desenhar();
  })();
})();

// ====================================================================
// Ortogonalidade em Minkowski: um vetor é o reflexo do outro
// ====================================================================
//
// A frase "um vetor nulo é ortogonal a si mesmo" soa mística até se ver
// o que ortogonalidade quer dizer aqui: A e B são ortogonais quando um é
// o REFLEXO do outro na linha de luz. O vetor nulo está deitado sobre o
// espelho, e por isso é o próprio reflexo -- não há mágica nenhuma.
//
// O controle move A; B acompanha como reflexo. Quando A se aproxima da
// linha de luz, B se aproxima também, e no limite os dois colapsam sobre
// ela: é o caso nulo.

(function () {
  "use strict";
  const svg = document.getElementById("ortogonalidade");
  const controle = document.getElementById("v-orto");
  if (!svg || !controle) return;

  const NS = "http://www.w3.org/2000/svg";
  const cria = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const a in attrs) el.setAttribute(a, attrs[a]);
    return el;
  };
  const L = 520, XMIN = -0.28, XMAX = 2.6;
  const k = L / (XMAX - XMIN);
  const fx = (x) => (x - XMIN) * k, fy = (y) => L - (y - XMIN) * k;
  const COR = { eixo: "rgba(238,247,246,0.40)", luz: "#7ee0a0",
                a: "#7fb2ff", b: "#f2836b", texto: "rgba(238,247,246,0.62)" };

  const fundo = cria("g", {});
  svg.appendChild(fundo);
  fundo.appendChild(cria("line", { x1: fx(XMIN), y1: fy(0), x2: fx(XMAX), y2: fy(0),
                                   stroke: COR.eixo, "stroke-width": 1.2 }));
  fundo.appendChild(cria("line", { x1: fx(0), y1: fy(XMIN), x2: fx(0), y2: fy(XMAX),
                                   stroke: COR.eixo, "stroke-width": 1.2 }));
  // o espelho
  fundo.appendChild(cria("line", { x1: fx(0), y1: fy(0), x2: fx(XMAX), y2: fy(XMAX),
                                   stroke: COR.luz, "stroke-width": 2.6 }));
  const rotL = cria("text", { x: fx(2.34), y: fy(2.44), fill: COR.luz, "font-size": 17 });
  rotL.textContent = "a linha de luz é o espelho";
  rotL.setAttribute("text-anchor", "end");
  fundo.appendChild(rotL);

  const movel = cria("g", {});
  svg.appendChild(movel);
  const seta = (cor) => cria("line", { stroke: cor, "stroke-width": 3,
                                       "marker-end": "url(#ponta-" + cor.slice(1) + ")" });
  // marcadores de ponta de seta, um por cor
  const defs = cria("defs", {});
  for (const cor of [COR.a, COR.b, COR.luz]) {
    const m = cria("marker", { id: "ponta-" + cor.slice(1), viewBox: "0 0 10 10",
                               refX: 8, refY: 5, markerWidth: 5, markerHeight: 5,
                               orient: "auto-start-reverse" });
    m.appendChild(cria("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: cor }));
    defs.appendChild(m);
  }
  svg.insertBefore(defs, svg.firstChild);

  const vA = seta(COR.a), vB = seta(COR.b);
  const arcoA = cria("path", { fill: "none", stroke: COR.a, "stroke-width": 2, opacity: 0.9 });
  const arcoB = cria("path", { fill: "none", stroke: COR.b, "stroke-width": 2, opacity: 0.9 });
  const rA = cria("text", { fill: COR.a, "font-size": 21, "font-style": "italic" });
  const rB = cria("text", { fill: COR.b, "font-size": 21, "font-style": "italic" });
  rA.textContent = "A"; rB.textContent = "B";
  movel.append(arcoA, arcoB, vA, vB, rA, rB);

  const lidoAng = document.getElementById("orto-ang");
  const lidoProd = document.getElementById("orto-prod");
  const lidoTipo = document.getElementById("orto-tipo");

  function arco(de, ate, r) {
    const p = [];
    for (let i = 0; i <= 40; i++) {
      const t = de + (ate - de) * (i / 40);
      p.push((i ? "L" : "M") + fx(r * Math.cos(t)) + " " + fy(r * Math.sin(t)));
    }
    return p.join(" ");
  }

  function desenhar() {
    const phi = Number(controle.value) / 100;
    // A é temporal: (x, ct) = (senh, cosh). B é o reflexo: (cosh, senh).
    const Ax = Math.sinh(phi), Ay = Math.cosh(phi);
    const Bx = Math.cosh(phi), By = Math.sinh(phi);
    const esc = 1.72 / Math.cosh(phi);   // mantém as setas dentro do quadro
    const ax = Ax * esc, ay = Ay * esc, bx = Bx * esc, by = By * esc;

    vA.setAttribute("x1", fx(0)); vA.setAttribute("y1", fy(0));
    vA.setAttribute("x2", fx(ax)); vA.setAttribute("y2", fy(ay));
    vB.setAttribute("x1", fx(0)); vB.setAttribute("y1", fy(0));
    vB.setAttribute("x2", fx(bx)); vB.setAttribute("y2", fy(by));
    rA.setAttribute("x", fx(ax) - 26); rA.setAttribute("y", fy(ay) - 6);
    rB.setAttribute("x", fx(bx) + 10); rB.setAttribute("y", fy(by) + 4);

    const aA = Math.atan2(ay, ax), aB = Math.atan2(by, bx), q = Math.PI / 4;
    arcoA.setAttribute("d", arco(q, aA, 1.1));
    arcoB.setAttribute("d", arco(aB, q, 1.1));

    const grau = (aA - q) * 180 / Math.PI;
    const prod = -ay * by + ax * bx;      // produto de Minkowski
    if (lidoAng) lidoAng.textContent = grau.toFixed(1).replace(".", ",") + "°";
    if (lidoProd) lidoProd.textContent = Math.abs(prod) < 1e-9 ? "0" : prod.toFixed(6).replace(".", ",");
    // phi=0 dá A e B sobre os próprios eixos ct e x -- o único caso em que
    // ortogonal COINCIDE com perpendicular no papel. phi grande fecha o par
    // sobre o espelho, que é o limite nulo.
    if (lidoTipo) {
      lidoTipo.textContent =
        phi < 0.05 ? "θ = 45°: aqui, e só aqui, ortogonal coincide com perpendicular no papel"
        : phi > 1.15 ? "quase colapsados sobre o espelho — o limite nulo"
        : "um temporal, um espacial";
    }
  }
  controle.addEventListener("input", desenhar);
  desenhar();
})();
