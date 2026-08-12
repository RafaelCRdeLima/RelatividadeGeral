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
