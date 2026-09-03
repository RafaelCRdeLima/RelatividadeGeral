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
  const lidoNA = document.getElementById("orto-na");
  const lidoNB = document.getElementById("orto-nb");

  function arco(de, ate, r) {
    const p = [];
    for (let i = 0; i <= 40; i++) {
      const t = de + (ate - de) * (i / 40);
      p.push((i ? "L" : "M") + fx(r * Math.cos(t)) + " " + fy(r * Math.sin(t)));
    }
    return p.join(" ");
  }

  function desenhar() {
    // O controle é o PRÓPRIO ângulo, e não a rapidez. Parametrizar pela
    // rapidez, como antes, empilhava todo o fim do curso num canto: theta
    // = arctan(coth phi) - 45° é assintótico, de modo que os últimos 30%
    // do slider mudavam o ângulo em um grau e o par nunca colapsava. Quem
    // arrastava via o controle "travar". Pelo ângulo o curso é linear no
    // que se vê, e theta = 0 é alcançável -- que é o caso nulo prometido.
    //
    // É a mesma família de pares: A a 45°+theta, B a 45°-theta, um o
    // reflexo do outro no espelho. E o produto continua saindo da conta,
    // não da construção: é ele que tem de dar zero.
    const theta = ((450 - Number(controle.value)) / 10) * Math.PI / 180;
    const R = 1.72;                       // raio comum, mantém tudo no quadro
    const ax = R * Math.cos(Math.PI / 4 + theta), ay = R * Math.sin(Math.PI / 4 + theta);
    const bx = R * Math.cos(Math.PI / 4 - theta), by = R * Math.sin(Math.PI / 4 - theta);

    vA.setAttribute("x1", fx(0)); vA.setAttribute("y1", fy(0));
    vA.setAttribute("x2", fx(ax)); vA.setAttribute("y2", fy(ay));
    vB.setAttribute("x1", fx(0)); vB.setAttribute("y1", fy(0));
    vB.setAttribute("x2", fx(bx)); vB.setAttribute("y2", fy(by));
    rA.setAttribute("x", fx(ax) - 26); rA.setAttribute("y", fy(ay) - 6);
    rB.setAttribute("x", fx(bx) + 10); rB.setAttribute("y", fy(by) + 4);

    const aA = Math.atan2(ay, ax), aB = Math.atan2(by, bx), q = Math.PI / 4;
    arcoA.setAttribute("d", arco(q, aA, 1.1));
    arcoB.setAttribute("d", arco(aB, q, 1.1));

    const grau = theta * 180 / Math.PI;
    const prod = -ay * by + ax * bx;      // produto de Minkowski: tem de dar 0
    const nA = -ay * ay + ax * ax;        // A é temporal:  < 0
    const nB = -by * by + bx * bx;        // B é espacial:  > 0
    const zero = (u) => (Math.abs(u) < 1e-9 ? "0" : u.toFixed(3).replace(".", ","));
    const sinal = (u) => (u > 1e-9 ? "+" : "") + zero(u);
    if (lidoAng) lidoAng.textContent = grau.toFixed(1).replace(".", ",") + "°";
    if (lidoProd) lidoProd.textContent = Math.abs(prod) < 1e-9 ? "0" : prod.toFixed(6).replace(".", ",");
    if (lidoNA) lidoNA.textContent = sinal(nA);
    if (lidoNB) lidoNB.textContent = sinal(nB);
    // theta=45° põe A e B sobre os próprios eixos ct e x -- o único caso em
    // que ortogonal COINCIDE com perpendicular no papel. theta=0 fecha o par
    // sobre o espelho: as duas normas zeram junto, e sobra um vetor nulo.
    if (lidoTipo) {
      lidoTipo.textContent =
        grau > 44.6 ? "θ = 45°: aqui, e só aqui, ortogonal coincide com perpendicular no papel"
        : grau < 0.15 ? "colapsados sobre o espelho: A = B é nulo, e as duas normas zeraram junto"
        : "um temporal (norma < 0), um espacial (norma > 0) — e o produto, zero";
    }
  }
  controle.addEventListener("input", desenhar);
  desenhar();
})();


// ====================================================================
// Aceleração própria constante: a linha de mundo sendo construída
// ====================================================================
//
// Duas coisas que a figura estática não consegue dizer, e esta consegue.
//
// A primeira é o começo: no vértice a partícula está PARADA, e a linha de
// mundo sobe reta -- U aponta só no tempo. A animação parte dali, e o que
// se vê é a tangente se deitando aos poucos na direção da luz, sem jamais
// alcançá-la. É v = tanh(a0 tau) saturando em 1, desenhado.
//
// A segunda é o papel de a0. O quadro é fixo, então mexer no controle move
// o vértice: acelerar mais forte é passar mais perto do vértice do cone de
// luz. O 1/a0 deixa de ser um número na fórmula e vira uma distância.
//
// Os pontos deixados para trás marcam passos IGUAIS de tempo próprio. Eles
// se espalham conforme sobem, e essa é a dilatação temporal aparecendo sem
// que se precise falar dela.

(function () {
  "use strict";
  const svg = document.getElementById("aceleracao");
  const cA0 = document.getElementById("a0-acel");
  const cTau = document.getElementById("tau-acel");
  if (!svg || !cA0 || !cTau) return;

  const NS = "http://www.w3.org/2000/svg";
  const cria = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const a in attrs) el.setAttribute(a, attrs[a]);
    return el;
  };
  const br = (v, n) => v.toFixed(n).replace(".", ",");

  const L = 560, XMIN = -0.35, XMAX = 3.15;
  const k = L / (XMAX - XMIN);
  const fx = (x) => (x - XMIN) * k, fy = (y) => L - (y - XMIN) * k;
  // até onde a linha de mundo é desenhada: um pouco dentro da moldura, para
  // que a seta da quadrivelocidade caiba no quadro no último instante.
  const XFIM = 2.78;
  const G = 1.0323;                      // 1g em ano^-1, com c = 1

  const COR = {
    eixo: "rgba(238,247,246,0.40)",
    luz: "#8dd7dc",
    trilho: "rgba(127,178,255,0.22)",
    mundo: "#7fb2ff",
    seta: "#f2836b",
    ouro: "#e6b75c",
    texto: "rgba(238,247,246,0.62)",
  };

  // ---------------- moldura, desenhada uma vez ----------------------
  const defs = cria("defs", {});
  const m = cria("marker", { id: "ponta-acel", viewBox: "0 0 10 10", refX: 8, refY: 5,
                             markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" });
  m.appendChild(cria("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: COR.seta }));
  defs.appendChild(m);
  const clip = cria("clipPath", { id: "quadro-acel" });
  clip.appendChild(cria("rect", { x: 0, y: 0, width: L, height: L }));
  defs.appendChild(clip);
  svg.appendChild(defs);

  const fundo = cria("g", {});
  svg.appendChild(fundo);
  fundo.appendChild(cria("line", { x1: fx(XMIN), y1: fy(0), x2: fx(XMAX), y2: fy(0),
                                   stroke: COR.eixo, "stroke-width": 1.2 }));
  fundo.appendChild(cria("line", { x1: fx(0), y1: fy(XMIN), x2: fx(0), y2: fy(XMAX),
                                   stroke: COR.eixo, "stroke-width": 1.2 }));
  fundo.appendChild(cria("line", { x1: fx(0), y1: fy(0), x2: fx(XMAX), y2: fy(XMAX),
                                   stroke: COR.luz, "stroke-width": 2.2,
                                   "stroke-dasharray": "7 5", opacity: 0.9 }));
  const rot = (x, y, txt, cor, extra) => {
    const t = cria("text", Object.assign({ x: x, y: y, fill: cor, "font-size": 17 }, extra || {}));
    t.textContent = txt;
    fundo.appendChild(t);
    return t;
  };
  rot(fx(2.62), fy(2.72), "linha de luz", COR.luz, { "text-anchor": "end", opacity: 0.9 });
  rot(fx(XMAX) - 4, fy(0) + 26, "x (anos-luz)", COR.eixo, { "text-anchor": "end" });
  rot(fx(0) - 12, fy(XMAX) + 18, "ct (anos)", COR.eixo, { "text-anchor": "end" });

  // ---------------- o que muda ---------------------------------------
  const movel = cria("g", { "clip-path": "url(#quadro-acel)" });
  svg.appendChild(movel);

  const trilho = cria("path", { fill: "none", stroke: COR.trilho, "stroke-width": 2.4 });
  const mundo = cria("path", { fill: "none", stroke: COR.mundo, "stroke-width": 3.4,
                               "stroke-linecap": "round" });
  const medida = cria("line", { stroke: COR.ouro, "stroke-width": 2, opacity: 0.85 });
  const vertice = cria("circle", { r: 5, fill: COR.ouro });
  const marcas = cria("g", {});
  const agora = cria("circle", { r: 6.5, fill: COR.mundo, stroke: "#04121e", "stroke-width": 2 });
  const seta = cria("line", { stroke: COR.seta, "stroke-width": 3.2,
                              "marker-end": "url(#ponta-acel)" });
  const rotU = cria("text", { fill: COR.seta, "font-size": 20, "font-style": "italic" });
  rotU.textContent = "U";
  const rotVert = cria("text", { fill: COR.ouro, "font-size": 17, "text-anchor": "middle" });
  movel.append(trilho, medida, mundo, marcas, vertice, seta, agora, rotU, rotVert);

  const lidoG = document.getElementById("acel-g");
  const lidoVert = document.getElementById("acel-vertice");
  const lidoTau = document.getElementById("acel-tau");
  const lidoT = document.getElementById("acel-t");
  const lidoV = document.getElementById("acel-v");
  const lidoGama = document.getElementById("acel-gama");
  const nota = document.getElementById("acel-nota");

  const arco = (a0, de, ate) => {
    const p = [];
    for (let i = 0; i <= 90; i++) {
      const f = de + (ate - de) * (i / 90);
      p.push((i ? "L" : "M") + fx(Math.cosh(f) / a0) + " " + fy(Math.sinh(f) / a0));
    }
    return p.join(" ");
  };

  function desenhar() {
    const a0 = Number(cA0.value) / 100;          // em ano^-1 (c = 1)
    const fim = Math.acosh(XFIM * a0);            // rapidez em que sai do quadro
    const s = Number(cTau.value) / 1000;
    const phi = s * fim;

    const tau = phi / a0, t = Math.sinh(phi) / a0, x = Math.cosh(phi) / a0;
    const v = Math.tanh(phi), gama = Math.cosh(phi);

    trilho.setAttribute("d", arco(a0, 0, fim));
    mundo.setAttribute("d", arco(a0, 0, Math.max(phi, 1e-6)));

    medida.setAttribute("x1", fx(0)); medida.setAttribute("y1", fy(0));
    medida.setAttribute("x2", fx(1 / a0)); medida.setAttribute("y2", fy(0));
    vertice.setAttribute("cx", fx(1 / a0)); vertice.setAttribute("cy", fy(0));
    const curto = 1 / a0 < 0.8;
    rotVert.setAttribute("x", fx(curto ? 1 / a0 : 0.5 / a0) + (curto ? 10 : 0));
    rotVert.setAttribute("y", fy(0) + 26);
    rotVert.setAttribute("text-anchor", curto ? "start" : "middle");
    rotVert.textContent = "1/a₀";

    // passos iguais de tempo próprio já percorridos
    while (marcas.firstChild) marcas.removeChild(marcas.firstChild);
    const passo = fim / 7;
    for (let f = passo; f <= phi + 1e-9; f += passo) {
      marcas.appendChild(cria("circle", {
        cx: fx(Math.cosh(f) / a0), cy: fy(Math.sinh(f) / a0), r: 4.2,
        fill: "#d7e7ff", stroke: "#04121e", "stroke-width": 1.4,
      }));
    }

    agora.setAttribute("cx", fx(x)); agora.setAttribute("cy", fy(t));
    // U = (cosh, sinh) em (t, x): no vértice aponta só no tempo, e vai se deitando
    const dx = Math.sinh(phi), dt = Math.cosh(phi), n = Math.hypot(dx, dt);
    const px = fx(x) + 62 * (dx / n), py = fy(t) - 62 * (dt / n);
    seta.setAttribute("x1", fx(x)); seta.setAttribute("y1", fy(t));
    seta.setAttribute("x2", px); seta.setAttribute("y2", py);
    // perto da borda direita o rótulo sairia do quadro: passa para o outro lado
    const rotDir = px < 470;
    rotU.setAttribute("x", px + (rotDir ? 9 : -11));
    rotU.setAttribute("y", py + 6);
    rotU.setAttribute("text-anchor", rotDir ? "start" : "end");

    if (lidoG) lidoG.textContent = br(a0 / G, 1);
    if (lidoVert) lidoVert.textContent = br(1 / a0, 2);
    if (lidoTau) lidoTau.textContent = br(tau, 2);
    if (lidoT) lidoT.textContent = br(t, 2);
    if (lidoV) lidoV.textContent = br(v, 3);
    if (lidoGama) lidoGama.textContent = br(gama, 2);
    if (nota) {
      nota.textContent =
        s < 0.02 ? "Parada no vértice: U aponta só no tempo, e a linha de mundo sobe reta."
        : s > 0.93 ? "A tangente quase acompanha a luz — e a curva continua sem cruzá-la."
        : "A tangente vai se deitando: a inclinação da linha de mundo é a velocidade.";
    }
  }

  // ---------------- a animação ---------------------------------------
  const botao = document.getElementById("acel-play");
  const DURACAO = 7000;                     // ms para varrer o trecho inteiro
  let pedido = null, t0 = 0, base = 0;

  function parar() {
    if (pedido) cancelAnimationFrame(pedido);
    pedido = null;
    if (botao) botao.textContent = "▶ animar";
  }
  function quadro(agoraMs) {
    const s = base + (agoraMs - t0) / DURACAO;
    cTau.value = String(Math.min(1000, Math.round(s * 1000)));
    desenhar();
    if (s >= 1) { parar(); return; }
    pedido = requestAnimationFrame(quadro);
  }
  if (botao) {
    botao.addEventListener("click", () => {
      if (pedido) { parar(); return; }
      // no fim da trilha, o play recomeça do vértice
      if (Number(cTau.value) >= 1000) cTau.value = "0";
      base = Number(cTau.value) / 1000;
      t0 = performance.now();
      botao.textContent = "⏸ pausar";
      pedido = requestAnimationFrame(quadro);
    });
  }
  cTau.addEventListener("input", () => { parar(); desenhar(); });
  cA0.addEventListener("input", desenhar);   // mexer em a0 não interrompe a animação
  desenhar();
})();

// ====================================================================
// Um vetor, três referenciais: as componentes mudam, o vetor não
// ====================================================================
//
// É o interlúdio dos vetores da base posto para funcionar. O vetor A é
// desenhado UMA vez e nunca mais se mexe -- é o objeto geométrico. O que
// os dois controles giram são as bases: os eixos de O′ e de O″, e com
// eles os dois paralelogramos que reconstroem o MESMO A.
//
// Os números na tabela são o outro lado da mesma afirmação: as colunas
// A⁰ e A¹ mudam com os controles, a coluna A·A não muda nunca. É a
// diferença entre o que depende de quem olha e o que não depende.
//
// Um achado que vale procurar com o slider: em v = A¹/A⁰ a componente
// espacial zera, e o vetor fica puramente temporal. Esse é o referencial
// de repouso de quem tem A como quadrivelocidade -- a mesma manobra da
// Seção 2.3, agora à mão.

(function () {
  "use strict";
  const svg = document.getElementById("tres-bases");
  const c1 = document.getElementById("v-base1");
  const c2 = document.getElementById("v-base2");
  if (!svg || !c1 || !c2) return;

  const NS = "http://www.w3.org/2000/svg";
  const cria = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const a in attrs) el.setAttribute(a, attrs[a]);
    return el;
  };

  // A janela é generosa dos quatro lados porque o paralelogramo cresce
  // depressa: em v = -0,5 o vértice temporal de A sobe a ct = 3,3 e o
  // espacial desce a ct = -1,3. Cortar isso seria pior do que zoom
  // nenhum -- o desenho existe para mostrar o paralelogramo FECHANDO, e
  // um vértice fora do quadro não fecha nada. É também por isso que os
  // controles param em ±0,5: além disso a construção sai da página, e a
  // escala teria de mudar junto, o que estragaria a única coisa que o
  // gráfico afirma -- que o vetor não se mexe.
  //
  // A escala k é uma só para os dois eixos: 45° tem de continuar sendo a
  // linha de luz.
  const XMIN = -1.9, XMAX = 2.9, YMIN = -1.5, YMAX = 3.5;
  const LARG = 560;
  const k = LARG / (XMAX - XMIN);
  const ALT = (YMAX - YMIN) * k;
  const fx = (x) => (x - XMIN) * k;
  const fy = (y) => ALT - (y - YMIN) * k;

  const COR = {
    eixo: "rgba(238,247,246,0.45)",
    luz: "#8dd7dc",
    o0: "rgba(238,247,246,0.62)",   // o laboratório
    o1: "#e6b75c",                  // O′
    o2: "#a9aef0",                  // O″
    vetor: "#7ee0a0",
  };

  // O vetor, de uma vez por todas. (2,1) não é escolha inocente: A¹/A⁰ =
  // 0,5 é um valor redondo, então o referencial em que A fica puramente
  // temporal é alcançável com o slider e cai num número que se reconhece.
  const A0 = 2, A1 = 1;

  const defs = cria("defs", {});
  for (const cor of [COR.o1, COR.o2, COR.vetor]) {
    const m = cria("marker", { id: "base-ponta-" + cor.slice(1), viewBox: "0 0 10 10",
                               refX: 8, refY: 5, markerWidth: 5, markerHeight: 5,
                               orient: "auto-start-reverse" });
    m.appendChild(cria("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: cor }));
    defs.appendChild(m);
  }
  svg.appendChild(defs);

  // ---------------- moldura, desenhada uma vez ----------------------
  const fundo = cria("g", {});
  svg.appendChild(fundo);
  fundo.appendChild(cria("line", { x1: fx(XMIN), y1: fy(0), x2: fx(XMAX), y2: fy(0),
                                   stroke: COR.eixo, "stroke-width": 1.2 }));
  fundo.appendChild(cria("line", { x1: fx(0), y1: fy(YMIN), x2: fx(0), y2: fy(YMAX),
                                   stroke: COR.eixo, "stroke-width": 1.2 }));
  // as duas linhas de luz, cada uma até onde o quadro permite
  for (const s of [1, -1]) {
    const limite = s > 0 ? Math.min(XMAX, YMAX) : Math.min(-XMIN, YMAX);
    fundo.appendChild(cria("line", {
      x1: fx(0), y1: fy(0), x2: fx(s * limite), y2: fy(limite),
      stroke: COR.luz, "stroke-width": 1.4, "stroke-dasharray": "7 5", opacity: 0.7,
    }));
  }
  const rotulo = (x, y, texto, cor, tam, ancora) => {
    const t = cria("text", { x: x, y: y, fill: cor, "font-size": tam || 18,
                             "font-style": "italic" });
    if (ancora) t.setAttribute("text-anchor", ancora);
    t.textContent = texto;
    return t;
  };
  fundo.appendChild(rotulo(fx(XMAX) - 4, fy(0) + 24, "x", COR.o0, 19, "end"));
  fundo.appendChild(rotulo(fx(0) - 10, fy(YMAX) + 16, "ct", COR.o0, 19, "end"));

  // ---------------- o que muda com os controles ---------------------
  // Um grupo por referencial. O do laboratório também é um deles: tem
  // velocidade zero e paralelogramo retangular, mas é um referencial como
  // os outros dois, e desenhá-lo pela mesma função é o que impede que
  // pareça privilegiado.
  const movel = cria("g", {});
  svg.appendChild(movel);

  function grupo(cor, nomeT, nomeX, comEixos) {
    const g = {
      eixoT: cria("line", { stroke: cor, "stroke-width": 2, opacity: comEixos ? 0.95 : 0 }),
      eixoX: cria("line", { stroke: cor, "stroke-width": 2, opacity: comEixos ? 0.95 : 0 }),
      rotT: rotulo(0, 0, nomeT, cor, 19, "end"),
      rotX: rotulo(0, 0, nomeX, cor, 19),
      guia0: cria("line", { stroke: cor, "stroke-width": 1.4, "stroke-dasharray": "5 4",
                            opacity: 0.75 }),
      guia1: cria("line", { stroke: cor, "stroke-width": 1.4, "stroke-dasharray": "5 4",
                            opacity: 0.75 }),
      p0: cria("circle", { r: 5.5, fill: cor }),
      p1: cria("circle", { r: 5.5, fill: cor }),
    };
    movel.append(g.eixoT, g.eixoX, g.guia0, g.guia1, g.p0, g.p1, g.rotT, g.rotX);
    return g;
  }
  const gO = grupo(COR.o0, "", "", false);
  const g1 = grupo(COR.o1, "ct′", "x′", true);
  const g2 = grupo(COR.o2, "ct″", "x″", true);

  const vetor = cria("line", { stroke: COR.vetor, "stroke-width": 4,
                               "marker-end": "url(#base-ponta-" + COR.vetor.slice(1) + ")" });
  const rotA = rotulo(0, 0, "A", COR.vetor, 24);
  movel.append(vetor, rotA);

  // Até onde a semirreta que sai da origem na direção (dx,dy) cabe no
  // quadro. Sem isso, um eixo com v próximo de ±0,9 sai pela lateral e o
  // rótulo vai parar fora do SVG.
  function alcance(dx, dy) {
    let t = Infinity;
    if (dx > 1e-9) t = Math.min(t, XMAX / dx);
    if (dx < -1e-9) t = Math.min(t, XMIN / dx);
    if (dy > 1e-9) t = Math.min(t, YMAX / dy);
    if (dy < -1e-9) t = Math.min(t, YMIN / dy);
    return t === Infinity ? 0 : t * 0.97;
  }

  function eixo(linha, rot, dx, dy, folgaX, folgaY) {
    const t = alcance(dx, dy);
    linha.setAttribute("x1", fx(0)); linha.setAttribute("y1", fy(0));
    linha.setAttribute("x2", fx(t * dx)); linha.setAttribute("y2", fy(t * dy));
    rot.setAttribute("x", fx(t * dx) + folgaX);
    rot.setAttribute("y", fy(t * dy) + folgaY);
  }

  const num = (u, casas) => u.toFixed(casas).replace(".", ",");
  const leia = (id) => document.getElementById(id);
  const escreva = (id, texto) => { const el = leia(id); if (el) el.textContent = texto; };

  // Desenha um referencial e devolve suas componentes. É a mesma conta do
  // interlúdio: e_0′ e e_1′ em componentes do laboratório, e A^0′ e A^1′
  // como quanto se toma de cada um.
  function referencial(g, v) {
    const gama = 1 / Math.sqrt(1 - v * v);
    const e0 = [gama * v, gama];          // (x, ct)
    const e1 = [gama, gama * v];
    const a0 = gama * (A0 - v * A1);
    const a1 = gama * (A1 - v * A0);
    const P0 = [a0 * e0[0], a0 * e0[1]];
    const P1 = [a1 * e1[0], a1 * e1[1]];

    eixo(g.eixoT, g.rotT, v, 1, -8, 18);
    eixo(g.eixoX, g.rotX, 1, v, 8, 6);
    g.p0.setAttribute("cx", fx(P0[0])); g.p0.setAttribute("cy", fy(P0[1]));
    g.p1.setAttribute("cx", fx(P1[0])); g.p1.setAttribute("cy", fy(P1[1]));
    g.guia0.setAttribute("x1", fx(P0[0])); g.guia0.setAttribute("y1", fy(P0[1]));
    g.guia0.setAttribute("x2", fx(A1)); g.guia0.setAttribute("y2", fy(A0));
    g.guia1.setAttribute("x1", fx(P1[0])); g.guia1.setAttribute("y1", fy(P1[1]));
    g.guia1.setAttribute("x2", fx(A1)); g.guia1.setAttribute("y2", fy(A0));
    return { gama: gama, a0: a0, a1: a1, norma: -a0 * a0 + a1 * a1 };
  }

  function desenhar() {
    const v1 = Number(c1.value) / 100;
    const v2 = Number(c2.value) / 100;

    vetor.setAttribute("x1", fx(0)); vetor.setAttribute("y1", fy(0));
    vetor.setAttribute("x2", fx(A1)); vetor.setAttribute("y2", fy(A0));
    rotA.setAttribute("x", fx(A1) + 12);
    rotA.setAttribute("y", fy(A0) + 4);

    const r0 = referencial(gO, 0);
    const r1 = referencial(g1, v1);
    const r2 = referencial(g2, v2);

    escreva("base-v1", num(v1, 2));
    escreva("base-g1", num(r1.gama, 2));
    escreva("base-v2", num(v2, 2));
    escreva("base-g2", num(r2.gama, 2));
    for (const [suf, r] of [["0", r0], ["1", r1], ["2", r2]]) {
      escreva("base-a0" + suf, num(r.a0, 2));
      escreva("base-a1" + suf, num(r.a1, 2));
      escreva("base-n" + suf, num(r.norma, 2));
    }

    // A nota comenta o que está na tela, e o caso que vale caçar é o
    // v = A¹/A⁰: ali a componente espacial some e sobra a norma pura.
    const puro = (r, nome) => Math.abs(r.a1) < 0.015 ? nome : null;
    const achado = puro(r1, "O′") || puro(r2, "O″");
    escreva("base-nota", achado
      ? "em " + achado + " o vetor ficou puramente temporal: A¹ = 0 e A⁰ = √3 = 1,73, "
        + "a própria norma. É o referencial de repouso de quem tem A como quadrivelocidade."
      : "as seis componentes mudam com os controles; a coluna A·A não muda nunca — "
        + "é o mesmo vetor, lido de três ângulos.");
  }

  c1.addEventListener("input", desenhar);
  c2.addEventListener("input", desenhar);
  desenhar();
})();

// ====================================================================
// Por que a base anda ao contrário das componentes -- em Euclides
// ====================================================================
//
// A lei e_beta = Lambda^alpha'_beta e_alpha' desconcerta porque parece
// arbitrária: por que a base iria para o outro lado? A resposta não tem
// nada de relativística, e é por isso que este laboratório abandona
// Minkowski e desenha um plano cartesiano comum.
//
// Os controles mudam o TAMANHO de e_x e e_y, e com eles a malha inteira
// -- que é a régua com que se mede. O vetor A é desenhado em coordenadas
// absolutas e não se mexe. Então dobrar e_x é trocar a régua por uma duas
// vezes maior, e o número de réguas que cabem em A cai pela metade.
//
// A coluna que não muda é a prova: A^x |e_x| é a projeção de A, e ela é
// um fato sobre o vetor, não sobre quem o mede. Componente e base são
// inversas uma da outra porque o produto das duas tem de sobreviver.

(function () {
  "use strict";
  const svg = document.getElementById("base-euclidiana");
  const cx = document.getElementById("ex-tam");
  const cy = document.getElementById("ey-tam");
  if (!svg || !cx || !cy) return;

  const NS = "http://www.w3.org/2000/svg";
  const cria = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const a in attrs) el.setAttribute(a, attrs[a]);
    return el;
  };

  // Coordenadas absolutas: o plano existe antes de qualquer base, e é
  // isso que o gráfico precisa mostrar. A malha é que é escolha nossa.
  const XMIN = -0.75, XMAX = 4.3, YMIN = -0.75, YMAX = 3.3;
  const LARG = 560;
  const k = LARG / (XMAX - XMIN);
  const ALT = (YMAX - YMIN) * k;
  const fx = (x) => (x - XMIN) * k;
  const fy = (y) => ALT - (y - YMIN) * k;

  const COR = {
    eixo: "rgba(238,247,246,0.45)",
    ex: "#e6b75c",                  // e_x e a malha que ele gera
    ey: "#a9aef0",                  // e_y idem
    vetor: "#7ee0a0",
    texto: "rgba(238,247,246,0.55)",
  };

  const AX = 3, AY = 2;             // o vetor, em coordenadas absolutas

  const defs = cria("defs", {});
  for (const cor of [COR.ex, COR.ey, COR.vetor]) {
    const m = cria("marker", { id: "euc-ponta-" + cor.slice(1), viewBox: "0 0 10 10",
                               refX: 8, refY: 5, markerWidth: 5, markerHeight: 5,
                               orient: "auto-start-reverse" });
    m.appendChild(cria("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: cor }));
    defs.appendChild(m);
  }
  svg.appendChild(defs);

  // A malha vem primeiro, para ficar por trás de tudo o que importa.
  const malhaX = cria("path", { fill: "none", stroke: COR.ex, "stroke-width": 1,
                                opacity: 0.34 });
  const malhaY = cria("path", { fill: "none", stroke: COR.ey, "stroke-width": 1,
                                opacity: 0.34 });
  const numeros = cria("g", {});
  svg.append(malhaX, malhaY, numeros);

  const fundo = cria("g", {});
  svg.appendChild(fundo);
  fundo.appendChild(cria("line", { x1: fx(XMIN), y1: fy(0), x2: fx(XMAX), y2: fy(0),
                                   stroke: COR.eixo, "stroke-width": 1.4 }));
  fundo.appendChild(cria("line", { x1: fx(0), y1: fy(YMIN), x2: fx(0), y2: fy(YMAX),
                                   stroke: COR.eixo, "stroke-width": 1.4 }));

  const movel = cria("g", {});
  svg.appendChild(movel);

  // as duas quedas de A sobre os eixos: absolutas, e por isso PARADAS
  const guiaX = cria("line", { stroke: COR.vetor, "stroke-width": 1.3,
                               "stroke-dasharray": "5 4", opacity: 0.6 });
  const guiaY = cria("line", { stroke: COR.vetor, "stroke-width": 1.3,
                               "stroke-dasharray": "5 4", opacity: 0.6 });
  const setaEx = cria("line", { stroke: COR.ex, "stroke-width": 5,
                                "marker-end": "url(#euc-ponta-" + COR.ex.slice(1) + ")" });
  const setaEy = cria("line", { stroke: COR.ey, "stroke-width": 5,
                                "marker-end": "url(#euc-ponta-" + COR.ey.slice(1) + ")" });
  const vetor = cria("line", { stroke: COR.vetor, "stroke-width": 4,
                               "marker-end": "url(#euc-ponta-" + COR.vetor.slice(1) + ")" });
  const texto = (cor, tam, ancora) => {
    const t = cria("text", { fill: cor, "font-size": tam, "font-style": "italic" });
    if (ancora) t.setAttribute("text-anchor", ancora);
    return t;
  };
  const rotEx = texto(COR.ex, 20), rotEy = texto(COR.ey, 20, "end");
  const rotA = texto(COR.vetor, 24);
  rotA.textContent = "A";
  for (const [rot, letra, cor] of [[rotEx, "x", COR.ex], [rotEy, "y", COR.ey]]) {
    rot.textContent = "e";
    const sub = cria("tspan", { dy: 6, "font-size": 14, fill: cor });
    sub.textContent = letra;
    rot.appendChild(sub);
  }
  movel.append(guiaX, guiaY, setaEx, setaEy, vetor, rotEx, rotEy, rotA);

  const num = (u, casas) => u.toFixed(casas).replace(".", ",");
  const escreva = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };

  function desenhar() {
    const h = Number(cx.value) / 100;      // |e_x|, em unidades absolutas
    const j = Number(cy.value) / 100;      // |e_y|

    // A malha: uma linha por múltiplo da base. É ela que muda de passo
    // quando a base muda de tamanho, e é olhando para ela que se vê o
    // vetor ficar com "menos quadrados" sem ter mudado de lugar.
    const linhas = (passo, vertical) => {
      const d = [];
      const de = Math.ceil((vertical ? XMIN : YMIN) / passo);
      const ate = Math.floor((vertical ? XMAX : YMAX) / passo);
      for (let n = de; n <= ate; n++) {
        const u = n * passo;
        d.push(vertical
          ? "M" + fx(u) + " " + fy(YMIN) + "L" + fx(u) + " " + fy(YMAX)
          : "M" + fx(XMIN) + " " + fy(u) + "L" + fx(XMAX) + " " + fy(u));
      }
      return d.join(" ");
    };
    malhaX.setAttribute("d", linhas(h, true));
    malhaY.setAttribute("d", linhas(j, false));

    // Os números da régua. Sem eles a malha é decorativa; com eles dá
    // para contar quantos e_x cabem até A -- que é a componente.
    while (numeros.firstChild) numeros.removeChild(numeros.firstChild);
    const rotular = (passo, vertical) => {
      const ate = Math.floor((vertical ? XMAX : YMAX) / passo);
      const salto = ate > 8 ? 2 : 1;       // malha fina: numera de dois em dois
      for (let n = salto; n <= ate; n += salto) {
        const u = n * passo;
        const t = cria("text", {
          x: vertical ? fx(u) : fx(0) - 9,
          y: vertical ? fy(0) + 19 : fy(u) + 5,
          fill: COR.texto, "font-size": 13,
          "text-anchor": vertical ? "middle" : "end",
        });
        t.textContent = String(n);
        numeros.appendChild(t);
      }
    };
    rotular(h, true);
    rotular(j, false);

    setaEx.setAttribute("x1", fx(0)); setaEx.setAttribute("y1", fy(0));
    setaEx.setAttribute("x2", fx(h)); setaEx.setAttribute("y2", fy(0));
    setaEy.setAttribute("x1", fx(0)); setaEy.setAttribute("y1", fy(0));
    setaEy.setAttribute("x2", fx(0)); setaEy.setAttribute("y2", fy(j));
    rotEx.setAttribute("x", fx(h) + 6); rotEx.setAttribute("y", fy(0) - 10);
    rotEy.setAttribute("x", fx(0) - 12); rotEy.setAttribute("y", fy(j) - 6);

    vetor.setAttribute("x1", fx(0)); vetor.setAttribute("y1", fy(0));
    vetor.setAttribute("x2", fx(AX)); vetor.setAttribute("y2", fy(AY));
    rotA.setAttribute("x", fx(AX) + 12); rotA.setAttribute("y", fy(AY) - 4);
    guiaX.setAttribute("x1", fx(AX)); guiaX.setAttribute("y1", fy(AY));
    guiaX.setAttribute("x2", fx(AX)); guiaX.setAttribute("y2", fy(0));
    guiaY.setAttribute("x1", fx(AX)); guiaY.setAttribute("y1", fy(AY));
    guiaY.setAttribute("x2", fx(0)); guiaY.setAttribute("y2", fy(AY));

    const ax = AX / h, ay = AY / j;        // as componentes: inversas da base
    escreva("euc-ex", num(h, 2));
    escreva("euc-ey", num(j, 2));
    escreva("euc-ax", num(ax, 2));
    escreva("euc-ay", num(ay, 2));
    escreva("euc-px", num(ax * h, 2));
    escreva("euc-py", num(ay * j, 2));
    escreva("euc-soma", "A = " + num(ax, 2) + " e" + "ₓ" + " + "
                        + num(ay, 2) + " e" + "ᵧ");

    // O comentário compara com a base padrão (|e| = 1), que é o caso em
    // que componente e projeção coincidem e a distinção some de vista.
    const fator = (u) => (u >= 1 ? "×" + num(u, 2) : "÷" + num(1 / u, 2));
    escreva("euc-nota", Math.abs(h - 1) < 0.005 && Math.abs(j - 1) < 0.005
      ? "com |e| = 1 nos dois eixos, componente e projeção coincidem — e é por isso "
        + "que a distinção passa despercebida na base canônica."
      : "e" + "ₓ" + " " + fator(h) + " ⇒ A" + "ˣ" + " " + fator(1 / h)
        + " · e" + "ᵧ" + " " + fator(j) + " ⇒ A" + "ʸ" + " " + fator(1 / j)
        + " — sempre ao contrário, e sempre pelo mesmo fator.");
  }

  cx.addEventListener("input", desenhar);
  cy.addEventListener("input", desenhar);
  desenhar();
})();


// ====================================================================
// Quem está quadrado? A obliquidade troca de lado
// ====================================================================
//
// O trecho da Seção 3.8.2 avisa que os eixos inclinados de um diagrama
// de Minkowski PARECEM uma base oblíqua e não são. Dizer isso em texto
// convence pouco; o que convence é desenhar a mesma física duas vezes.
//
// À esquerda, a folha está riscada para S: a malha de S é quadrada e a
// de S' sai torta. À direita, a folha está riscada para S': agora é a
// malha de S que sai torta. Nenhuma das duas é a verdadeira, e o evento
// E é o mesmo ponto nas duas -- só as réguas mudaram.
//
// É a ideia do papel monolog. Uma tabela que segue lei de potência sai
// curva no papel milimetrado e reta no dilog, e ninguém conclui que o
// papel dilog "corrigiu" os dados: ele foi riscado para aquela lei. Aqui
// cada folha está riscada para um observador.
//
// O que NÃO se pode fazer, e é o limite honesto da analogia: riscar uma
// folha em que os dois apareçam quadrados ao mesmo tempo. A assinatura
// (-,+) não vira (+,+) por reparametrização nenhuma -- o obstáculo é o
// cone de luz, que as duas folhas desenham igual, em verde, exatamente
// porque ele é o que ninguém consegue torcer.

(function () {
  "use strict";
  const svg = document.getElementById("quem-quadrado");
  const controle = document.getElementById("v-quadrado");
  if (!svg || !controle) return;

  const NS = "http://www.w3.org/2000/svg";
  const cria = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const a in attrs) el.setAttribute(a, attrs[a]);
    return el;
  };

  const LADO = 470, VAO = 60, M = 1.55;   // meia-largura do quadro, em unidades
  const k = LADO / (2 * M);
  // dois painéis, cada um com a sua origem de tela
  const OX = [LADO / 2, LADO + VAO + LADO / 2], OY = LADO / 2;
  const fx = (p, x) => OX[p] + x * k;
  const fy = (y) => OY - y * k;

  const COR = { reta: "rgba(238,247,246,0.34)", torta: "#8dd7dc",
                luz: "#7ee0a0", ev: "#e6b75c", rot: "rgba(238,247,246,0.55)" };

  // ---- estrutura fixa: moldura, cone de luz, rótulos -----------------
  const fundo = cria("g", {});
  svg.appendChild(fundo);
  for (let p = 0; p < 2; p++) {
    fundo.appendChild(cria("rect", { x: fx(p, -M), y: fy(M), width: 2 * M * k,
                                     height: 2 * M * k, fill: "rgba(255,255,255,0.02)",
                                     stroke: "rgba(238,247,246,0.16)" }));
    // o cone de luz é o MESMO desenho nos dois painéis: é o que não torce
    for (const s of [1, -1]) {
      fundo.appendChild(cria("line", { x1: fx(p, -M), y1: fy(-s * M), x2: fx(p, M),
                                       y2: fy(s * M), stroke: COR.luz,
                                       "stroke-width": 2, opacity: 0.85 }));
    }
    const t = cria("text", { x: fx(p, -M), y: fy(M) - 11, fill: COR.rot,
                             "font-size": 18, "font-family": "DM Mono, monospace" });
    t.textContent = p === 0 ? "folha riscada para S" : "folha riscada para S′";
    fundo.appendChild(t);
  }

  const movel = cria("g", {});
  svg.appendChild(movel);

  // uma malha é um feixe de segmentos; guardamos os elementos e só
  // reescrevemos as coordenadas, para não recriar nós a cada arraste
  function feixe(n, cor, largura, tracejado) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      const l = cria("line", { stroke: cor, "stroke-width": largura });
      if (tracejado) l.setAttribute("stroke-dasharray", tracejado);
      movel.appendChild(l);
      arr.push(l);
    }
    return arr;
  }
  const PASSO = 0.5, N = 7;               // linhas de −1,5 a +1,5 de meio em meio
  // malha quadrada (a do dono da folha) e malha torta (a do outro)
  const retaH = [], retaV = [], tortaH = [], tortaV = [];
  for (let p = 0; p < 2; p++) {
    retaH.push(feixe(N, COR.reta, 1.1));
    retaV.push(feixe(N, COR.reta, 1.1));
    tortaH.push(feixe(N, COR.torta, 1.4, "5 4"));
    tortaV.push(feixe(N, COR.torta, 1.4, "5 4"));
  }
  // o evento, e o rótulo dele
  const pontos = [], rotulos = [];
  for (let p = 0; p < 2; p++) {
    pontos.push(movel.appendChild(cria("circle", { r: 6.5, fill: COR.ev })));
    const r = cria("text", { fill: COR.ev, "font-size": 20, "font-style": "italic" });
    r.textContent = "E";
    rotulos.push(movel.appendChild(r));
  }

  const lidoV = document.getElementById("qq-v");
  const lidoG = document.getElementById("qq-gama");
  const lidoS = document.getElementById("qq-s");
  const lidoSl = document.getElementById("qq-sl");
  const lidoDs = document.getElementById("qq-ds");

  // o evento é fixo em S -- são as folhas que mudam debaixo dele
  const tE = 0.9, xE = 0.35;
  const num = (u) => (u < 0 ? "−" : "") + Math.abs(u).toFixed(2).replace(".", ",");

  function reta(el, x1, y1, x2, y2, p) {
    el.setAttribute("x1", fx(p, x1)); el.setAttribute("y1", fy(y1));
    el.setAttribute("x2", fx(p, x2)); el.setAttribute("y2", fy(y2));
  }

  // Recorta a reta t = a x + b (ou x = const) ao quadrado [−M,M]². Sem o
  // recorte as linhas tortas atravessariam o painel vizinho, que foi o
  // primeiro sintoma quando isto tinha só dois painéis lado a lado.
  function corta(a, b) {
    const pts = [];
    for (const x of [-M, M]) { const t = a * x + b; if (Math.abs(t) <= M + 1e-9) pts.push([x, t]); }
    for (const t of [-M, M]) { const x = (t - b) / a; if (Math.abs(x) <= M + 1e-9) pts.push([x, t]); }
    return pts.length >= 2 ? [pts[0], pts[1]] : null;
  }

  function desenhar() {
    const v = Number(controle.value) / 100;
    const g = 1 / Math.sqrt(1 - v * v);

    for (let p = 0; p < 2; p++) {
      // sinal da velocidade relativa vista de quem é dono da folha
      const s = p === 0 ? v : -v;
      for (let i = 0; i < N; i++) {
        const c = -1.5 + i * PASSO;
        // malha quadrada: t = c e x = c
        reta(retaH[p][i], -M, c, M, c, p);
        reta(retaV[p][i], c, -M, c, M, p);
        // malha torta: linhas de t′ constante têm inclinação s;
        // linhas de x′ constante têm inclinação 1/s (verticais se s=0)
        const lh = corta(s, c / g);
        if (lh) reta(tortaH[p][i], lh[0][0], lh[0][1], lh[1][0], lh[1][1], p);
        else reta(tortaH[p][i], 0, 0, 0, 0, p);
        if (Math.abs(s) < 1e-6) {
          reta(tortaV[p][i], c, -M, c, M, p);
        } else {
          const lv = corta(1 / s, -c / (g * s));
          if (lv) reta(tortaV[p][i], lv[0][0], lv[0][1], lv[1][0], lv[1][1], p);
          else reta(tortaV[p][i], 0, 0, 0, 0, p);
        }
      }
    }

    // o mesmo evento, nas duas leituras
    const tl = g * (tE - v * xE), xl = g * (xE - v * tE);
    const coord = [[tE, xE], [tl, xl]];
    for (let p = 0; p < 2; p++) {
      const [t, x] = coord[p];
      pontos[p].setAttribute("cx", fx(p, x)); pontos[p].setAttribute("cy", fy(t));
      rotulos[p].setAttribute("x", fx(p, x) + 11);
      rotulos[p].setAttribute("y", fy(t) - 10);
    }

    if (lidoV) lidoV.textContent = v.toFixed(2).replace(".", ",");
    if (lidoG) lidoG.textContent = g.toFixed(3).replace(".", ",");
    if (lidoS) lidoS.textContent = "(" + num(tE) + " ; " + num(xE) + ")";
    if (lidoSl) lidoSl.textContent = "(" + num(tl) + " ; " + num(xl) + ")";
    // o intervalo é o mesmo nas duas folhas -- é o que sobrevive à troca de régua
    if (lidoDs) {
      const ds = -tE * tE + xE * xE, dsl = -tl * tl + xl * xl;
      lidoDs.textContent = num(ds) + "  e  " + num(dsl);
    }
  }
  controle.addEventListener("input", desenhar);
  desenhar();
})();


// ====================================================================
// O disco das rapidezas: a folha em que tudo fica reto
// ====================================================================
//
// Este é o análogo honesto do papel monolog -- e a lição é que a folha
// hiperbólica existe, só não é o espaçotempo: é o espaço das VELOCIDADES.
//
// O conjunto das velocidades com |v| < 1, munido da métrica que o
// hiperboloide U.U = -1 induz, é um plano hiperbólico. Nele:
//
//   - a rapidez É a distância;
//   - os boosts SÃO movimentos rígidos, não deformações;
//   - e compor dois boosts é percorrer dois lados de um triângulo.
//
// No modelo do disco de Poincaré a velocidade v entra no raio tanh(phi/2),
// e não tanh(phi) = v. Parece um capricho e não é: é o que faz os ÂNGULOS
// do desenho serem os ângulos de verdade. Sem isso a rotação de Wigner não
// apareceria como ângulo nenhum.
//
// Os círculos concêntricos são a "malha" desta folha: passos IGUAIS de
// rapidez, meio a meio. Eles se apertam contra a borda, e é aí que se vê
// de uma vez por que v satura em 1 enquanto phi cresce sem limite -- a
// borda está a distância infinita.
//
// O fecho: a soma dos três ângulos do triângulo é menor que 180°, e o
// que falta é EXATAMENTE a rotação de Wigner. Verificado contra o produto
// das matrizes de Lorentz em quatro configurações antes de escrever isto.

(function () {
  "use strict";
  const svg = document.getElementById("disco-rapidez");
  const c1 = document.getElementById("rap1");
  const c2 = document.getElementById("rap2");
  if (!svg || !c1 || !c2) return;

  const NS = "http://www.w3.org/2000/svg";
  const cria = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const a in attrs) el.setAttribute(a, attrs[a]);
    return el;
  };
  const L = 500, CX = L / 2, CY = L / 2, R = L / 2 - 26;
  const px = (z) => CX + z.re * R, py = (z) => CY - z.im * R;

  const COR = { borda: "#7ee0a0", malha: "rgba(238,247,246,0.16)",
                l1: "#8dd7dc", l2: "#e6b75c", hip: "#f2836b",
                rot: "rgba(238,247,246,0.55)" };

  // aritmética complexa mínima -- o disco pede Möbius, e Möbius pede isto
  const C = (re, im) => ({ re, im });
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const add = (a, b) => C(a.re + b.re, a.im + b.im);
  const sub = (a, b) => C(a.re - b.re, a.im - b.im);
  const conj = (a) => C(a.re, -a.im);
  const div = (a, b) => { const d = b.re * b.re + b.im * b.im;
                          return C((a.re * b.re + a.im * b.im) / d,
                                   (a.im * b.re - a.re * b.im) / d); };
  const eit = (t) => C(Math.cos(t), Math.sin(t));

  // desloca z0 por uma distância d na direção theta, ao longo da geodésica
  const desloca = (z0, d, th) => {
    const w = mul(C(Math.tanh(d / 2), 0), eit(th));
    return div(add(w, z0), add(C(1, 0), mul(conj(z0), w)));
  };
  const dist = (a, b) => {
    const q = div(sub(a, b), sub(C(1, 0), mul(conj(a), b)));
    return 2 * Math.atanh(Math.hypot(q.re, q.im));
  };

  // ---- fixo: a borda e a malha de rapidez constante -------------------
  const fundo = cria("g", {});
  svg.appendChild(fundo);
  fundo.appendChild(cria("circle", { cx: CX, cy: CY, r: R, fill: "rgba(255,255,255,0.02)",
                                     stroke: COR.borda, "stroke-width": 2.4,
                                     "stroke-dasharray": "7 5" }));
  const legBorda = cria("text", { x: CX, y: CY - R - 9, fill: COR.borda, "font-size": 16,
                                  "text-anchor": "middle" });
  legBorda.textContent = "a borda é v = 1, e está a distância infinita";
  fundo.appendChild(legBorda);
  for (let i = 1; i <= 7; i++) {
    const phi = i * 0.5;
    fundo.appendChild(cria("circle", { cx: CX, cy: CY, r: Math.tanh(phi / 2) * R,
                                       fill: "none", stroke: COR.malha, "stroke-width": 1.1 }));
  }
  const legMalha = cria("text", { x: CX, y: CY + R + 20, fill: COR.rot, "font-size": 15,
                                  "text-anchor": "middle",
                                  "font-family": "DM Mono, monospace" });
  legMalha.textContent = "círculos: passos iguais de rapidez (Δφ = 0,5)";
  fundo.appendChild(legMalha);

  // ---- móvel: o triângulo ---------------------------------------------
  const movel = cria("g", {});
  svg.appendChild(movel);
  const lado1 = movel.appendChild(cria("line", { stroke: COR.l1, "stroke-width": 3.2 }));
  const lado2 = movel.appendChild(cria("path", { fill: "none", stroke: COR.l2,
                                                 "stroke-width": 3.2 }));
  const hipot = movel.appendChild(cria("line", { stroke: COR.hip, "stroke-width": 3.2 }));
  const arcoO = movel.appendChild(cria("path", { fill: "none", stroke: COR.hip,
                                                 "stroke-width": 1.6 }));
  const canto = movel.appendChild(cria("path", { fill: "none", stroke: COR.l2,
                                                 "stroke-width": 1.6 }));
  const pO = movel.appendChild(cria("circle", { r: 5, fill: "rgba(246,243,236,0.9)" }));
  const p1 = movel.appendChild(cria("circle", { r: 5.5, fill: COR.l1 }));
  const p2 = movel.appendChild(cria("circle", { r: 5.5, fill: COR.hip }));
  const rot = (txt, cor) => {
    const t = cria("text", { fill: cor, "font-size": 18, "font-style": "italic" });
    t.textContent = txt; return movel.appendChild(t);
  };
  const r1 = rot("1", COR.l1), r2 = rot("2", COR.hip);

  const lido = (id) => document.getElementById(id);
  const oV1 = lido("dr-v1"), oV2 = lido("dr-v2"), oPhi = lido("dr-phi"),
        oV = lido("dr-v"), oAng = lido("dr-ang"), oEps = lido("dr-eps");
  const n2 = (u) => u.toFixed(2).replace(".", ",");
  const n3 = (u) => u.toFixed(3).replace(".", ",");
  const gr = (u) => (u * 180 / Math.PI).toFixed(1).replace(".", ",") + "°";

  function desenhar() {
    const f1 = Number(c1.value) / 100, f2 = Number(c2.value) / 100;
    const O = C(0, 0);
    const P1 = C(Math.tanh(f1 / 2), 0);
    // o segundo boost é perpendicular ao primeiro NO REFERENCIAL 1: por
    // isso o ângulo interno em P1 é reto, e é daí que sai o Pitágoras
    // hiperbólico cosh(phi) = cosh(phi1) cosh(phi2)
    const P2 = desloca(P1, f2, Math.PI / 2);

    lado1.setAttribute("x1", px(O)); lado1.setAttribute("y1", py(O));
    lado1.setAttribute("x2", px(P1)); lado1.setAttribute("y2", py(P1));
    hipot.setAttribute("x1", px(O)); hipot.setAttribute("y1", py(O));
    hipot.setAttribute("x2", px(P2)); hipot.setAttribute("y2", py(P2));

    // o lado 1->2 é geodésica: reta só se passar pelo centro, senão arco.
    // Em vez de achar o círculo ortogonal à borda, amostramos a própria
    // geodésica pela Möbius -- não tem caso degenerado.
    const passos = 48, d12 = dist(P1, P2), p = [];
    for (let i = 0; i <= passos; i++) {
      const z = desloca(P1, d12 * (i / passos), Math.PI / 2);
      p.push((i ? "L" : "M") + px(z).toFixed(2) + " " + py(z).toFixed(2));
    }
    lado2.setAttribute("d", p.join(" "));

    // ângulo em O: as duas geodésicas que saem do centro são raios, e o
    // disco de Poincaré é conforme -- então o ângulo do desenho é o de verdade
    const aO = Math.atan2(P2.im, P2.re);
    const rr = 0.30 * R, arc = [];
    for (let i = 0; i <= 24; i++) {
      const t = aO * (i / 24);
      arc.push((i ? "L" : "M") + (CX + rr * Math.cos(t)).toFixed(2) + " " +
               (CY - rr * Math.sin(t)).toFixed(2));
    }
    arcoO.setAttribute("d", arc.join(" "));
    // o esquadro em P1: as direções ali são −x (de volta a O) e +y (rumo a P2)
    const q = 15, x1 = px(P1), y1 = py(P1);
    canto.setAttribute("d", `M ${x1 - q} ${y1} L ${x1 - q} ${y1 - q} L ${x1} ${y1 - q}`);

    pO.setAttribute("cx", px(O)); pO.setAttribute("cy", py(O));
    p1.setAttribute("cx", px(P1)); p1.setAttribute("cy", py(P1));
    p2.setAttribute("cx", px(P2)); p2.setAttribute("cy", py(P2));
    r1.setAttribute("x", px(P1) - 4); r1.setAttribute("y", py(P1) + 24);
    r2.setAttribute("x", px(P2) + 10); r2.setAttribute("y", py(P2) - 8);

    // ---- os números -------------------------------------------------
    const phi = Math.acosh(Math.cosh(f1) * Math.cosh(f2));   // Pitágoras hiperbólico
    const angO = Math.atan(Math.tanh(f2) / Math.sinh(f1));
    const angP2 = Math.atan(Math.tanh(f1) / Math.sinh(f2));
    const soma = angO + Math.PI / 2 + angP2;
    const eps = Math.PI - soma;                              // defeito = Wigner
    if (oV1) oV1.textContent = n3(Math.tanh(f1));
    if (oV2) oV2.textContent = n3(Math.tanh(f2));
    if (oPhi) oPhi.textContent = n3(phi);
    if (oV) oV.textContent = n3(Math.tanh(phi));
    if (oAng) oAng.textContent = gr(angO) + " + 90° + " + gr(angP2) + " = " + gr(soma);
    if (oEps) oEps.textContent = gr(eps);
  }
  c1.addEventListener("input", desenhar);
  c2.addEventListener("input", desenhar);
  desenhar();
})();
