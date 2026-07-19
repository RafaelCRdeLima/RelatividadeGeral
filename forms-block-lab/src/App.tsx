import { useState } from "react";
import { WedgeDemo } from "./blocks/WedgeDemo";
import { ExteriorDDemo } from "./blocks/ExteriorDDemo";

type Tab = "wedge" | "d";

export default function App() {
  const [tab, setTab] = useState<Tab>("wedge");

  return (
    <div className="fb-app">
      <header className="fb-header">
        <span className="fb-eyebrow">Forms Block Lab · protótipo visual</span>
        <h1>Blocos para álgebra de formas diferenciais</h1>
        <p className="fb-banner">
          Isto valida a linguagem visual (forma, cor, animação) antes de virar o app completo — Fases 1–3,
          currículo de atividades e Professor Viewer ainda não existem aqui.
        </p>
      </header>

      <nav className="fb-tabs">
        <button className={tab === "wedge" ? "active" : ""} onClick={() => setTab("wedge")}>
          Produto wedge
        </button>
        <button className={tab === "d" ? "active" : ""} onClick={() => setTab("d")}>
          Derivada exterior
        </button>
      </nav>

      <main className="fb-stage">
        {tab === "wedge" ? (
          <section>
            <p className="fb-intro">
              Cada 1-forma é um bloco com um dente (grau 1); o produto ∧ produz um bloco de dois dentes (grau 2). O
              soquete só aceita o grau certo — a gramática de índices vira geometria.
            </p>
            <WedgeDemo />
          </section>
        ) : (
          <section>
            <p className="fb-intro">
              O operador d sempre sobe o grau em 1. Aplicado duas vezes seguidas, o resultado colapsa — a identidade
              d²=0 aparece como consequência de montar o bloco, não como regra decorada.
            </p>
            <ExteriorDDemo />
          </section>
        )}
      </main>
    </div>
  );
}
