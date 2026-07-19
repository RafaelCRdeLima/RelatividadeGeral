import { useState } from "react";
import { WedgeDemo } from "./blocks/WedgeDemo";
import { ExteriorDDemo } from "./blocks/ExteriorDDemo";
import { FreeCanvas } from "./blocks/FreeCanvas";
import { CoordsProvider } from "./blocks/CoordsContext";
import { ContextBar } from "./blocks/ContextBar";

type Tab = "wedge" | "d" | "canvas";

export default function App() {
  const [tab, setTab] = useState<Tab>("wedge");

  return (
    <CoordsProvider>
      <div className="fb-app">
        <header className="fb-header">
          <span className="fb-eyebrow">Forms Block Lab · protótipo visual</span>
          <h1>Blocos para álgebra de formas diferenciais</h1>
          <p className="fb-banner">
            Isto valida a linguagem visual (forma, cor, animação) antes de virar o app completo — Fases 1–3,
            currículo de atividades e Professor Viewer ainda não existem aqui.
          </p>
        </header>

        <ContextBar />

        <nav className="fb-tabs">
          <button className={tab === "wedge" ? "active" : ""} onClick={() => setTab("wedge")}>
            Produto wedge
          </button>
          <button className={tab === "d" ? "active" : ""} onClick={() => setTab("d")}>
            Derivada exterior
          </button>
          <button className={tab === "canvas" ? "active" : ""} onClick={() => setTab("canvas")}>
            Canvas livre
          </button>
        </nav>

        <main className="fb-stage">
          {tab === "wedge" && (
            <section>
              <p className="fb-intro">
                Cada 1-forma é um bloco com um dente (grau 1); o produto ∧ produz um bloco de dois dentes (grau 2). O
                soquete só aceita o grau certo — a gramática de índices vira geometria.
              </p>
              <WedgeDemo />
            </section>
          )}
          {tab === "d" && (
            <section>
              <p className="fb-intro">
                O operador d sempre sobe o grau em 1. Aplicado duas vezes seguidas, o resultado colapsa — a
                identidade d²=0 aparece como consequência de montar o bloco, não como regra decorada.
              </p>
              <ExteriorDDemo />
            </section>
          )}
          {tab === "canvas" && (
            <section>
              <p className="fb-intro">
                Monte qualquer expressão arrastando blocos da paleta para os soquetes — ou, se preferir (ou estiver
                num trackpad), clique num bloco da paleta para selecioná-lo e depois clique num soquete vazio para
                encaixar. O painel à direita mostra o resultado calculado pelo motor em tempo real — inclusive
                quando a expressão está incompleta ou quando uma soma não encaixa por grau.
              </p>
              <FreeCanvas />
            </section>
          )}
        </main>
      </div>
    </CoordsProvider>
  );
}
