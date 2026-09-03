// Navegação dos slides. Sem dependências.
//
// O slide corrente vive no fragmento da URL (#7), e não só numa
// variável: assim recarregar a página não devolve o professor ao começo
// no meio da aula, e um slide específico pode ser enviado por link.

(function () {
  "use strict";

  const slides = Array.from(document.querySelectorAll("#quadro section"));
  const progresso = document.getElementById("progresso");
  const contador = document.getElementById("contador");
  let atual = 0;

  function mostrar(i, empurrarHash) {
    atual = Math.max(0, Math.min(i, slides.length - 1));
    slides.forEach((s, k) => s.classList.toggle("ativo", k === atual));
    progresso.style.width = ((atual + 1) / slides.length) * 100 + "%";
    contador.textContent = atual + 1 + " / " + slides.length;
    if (empurrarHash !== false) history.replaceState(null, "", "#" + (atual + 1));
    // Um slide mais alto que a tela rola; ao trocar, sempre começar do
    // topo -- senão o próximo aparece no meio, sem título.
    slides[atual].scrollTop = 0;
  }

  // O quadro tem 1440x810 fixos; quem se ajusta à janela é a escala.
  // `Math.min` das duas razões preserva a proporção 16:9 -- a dimensão
  // que sobra vira margem, como a tarja preta de uma projeção.
  //
  // Diminuir esta referência aumenta tudo na tela na mesma proporção,
  // porque a escala cresce junto: é o único lugar a mexer para dar mais
  // corpo à apresentação numa sala grande.
  const QUADRO_W = 1440, QUADRO_H = 810;
  const quadro = document.getElementById("quadro");
  function ajustarEscala() {
    const e = Math.min(window.innerWidth / QUADRO_W, window.innerHeight / QUADRO_H);
    quadro.style.transform = "scale(" + e + ")";
  }
  window.addEventListener("resize", ajustarEscala);
  // Entrar e sair de tela cheia muda o tamanho da janela sem disparar
  // `resize` em todos os navegadores.
  document.addEventListener("fullscreenchange", ajustarEscala);
  ajustarEscala();

  const avancar = () => mostrar(atual + 1);
  const voltar = () => mostrar(atual - 1);

  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case "ArrowRight": case "PageDown": case " ": case "n": avancar(); break;
      case "ArrowLeft": case "PageUp": case "p": voltar(); break;
      case "Home": mostrar(0); break;
      case "End": mostrar(slides.length - 1); break;
      case "f":
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        break;
      default: return;
    }
    e.preventDefault();
  });

  document.querySelector(".zona.dir").addEventListener("click", avancar);
  document.querySelector(".zona.esq").addEventListener("click", voltar);

  // Deslizar o dedo, para quem apresenta de tablet.
  let x0 = null;
  document.addEventListener("touchstart", (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60) (dx < 0 ? avancar : voltar)();
    x0 = null;
  }, { passive: true });

  const inicial = parseInt((location.hash || "").slice(1), 10);
  mostrar(Number.isFinite(inicial) && inicial > 0 ? inicial - 1 : 0, false);

  // Fórmulas: cada uma vive num elemento próprio, `<span class="m">` para
  // linha e `<div class="M">` para display, com o TeX como conteúdo.
  //
  // Marcar explicitamente, em vez de varrer o texto atrás de `$`, evita
  // o pacote `auto-render` do KaTeX (que não está vendorizado aqui) e,
  // mais importante, evita que um cifrão solto no texto -- ou um `$` de
  // um trecho de código -- vire início de fórmula por engano.
  //
  // Tudo é renderizado de uma vez, e não a cada troca de slide: um
  // slide oculto ainda mede fontes corretamente, e renderizar sob
  // demanda produzia um salto visível na primeira aparição de cada
  // fórmula.
  if (window.katex) {
    document.querySelectorAll(".m, .M").forEach((el) => {
      try {
        katex.render(el.textContent, el, {
          displayMode: el.classList.contains("M"),
          throwOnError: false,
          // Os mesmos apelidos da apostila, para que uma fórmula possa ser
          // copiada de lá para cá sem tradução. O KaTeX não traz nenhum
          // deles: sem isto, \dd sai como erro em vermelho no meio da aula.
          macros: {
            "\\dd": "\\mathrm{d}",
            "\\ket": "\\lvert #1 \\rangle",
            "\\bra": "\\langle #1 \\rvert",
          },
        });
      } catch (e) {
        // Uma fórmula malformada não pode derrubar a apresentação
        // inteira no meio da aula: ela fica como texto e o resto segue.
        el.style.color = "#e6b75c";
      }
    });
  }
})();
