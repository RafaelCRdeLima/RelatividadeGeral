# Forms Block Lab — protótipo visual (beta)

App irmão do `rg-interactive-lab`, para ensinar álgebra de formas
diferenciais (1-formas, 2-formas, produto wedge, derivada exterior, e depois
Hodge star, pullback e integração/Stokes) por manipulação de blocos.

**Este é ainda um protótipo.** A camada visual (`src/blocks/`) valida forma,
cor e animação dos blocos; a camada simbólica nova (`src/algebra/`) é o motor
real de álgebra exterior, mas as duas ainda não estão conectadas — os dois
demos visuais têm estado próprio ad-hoc, não usam o motor ainda. Falta:

- ligar `src/blocks/*` a `src/algebra/*` (hoje a UI só simula os dois casos
  específicos já validados; o motor sabe fazer muito mais que isso);
- currículo de atividades (`activities.ts`, competências, pontuação);
- sessão persistida, telemetria, retomada;
- Professor Viewer, exportação `.rglab`;
- os operadores da Fase 3 (⋆, ι, f*, ∫, Stokes) na UI — o motor simbólico só
  cobre ∧, soma e `d` por enquanto;
- a barra de contexto (carta ativa, orientação, métrica) do layout-alvo.

### Escopo do motor simbólico (`src/algebra/`)

Formas são representadas sobre **coordenadas nomeadas concretas** (`dx`,
`dy`, `dz`, ...), não a notação de índice abstrato do tipo `a_i dx^i` com
soma de Einstein implícita — isso exigiria uma camada extra (variância de
índice, distinção livre/mudo, contração) e fica para depois. Coeficientes
podem ser números, coordenadas, símbolos opacos (funções nomeadas como `f`)
ou combinações por soma/produto; a derivada de um símbolo opaco é formal
(`∂f/∂x`, não avaliada), exceto quando o próprio símbolo é uma coordenada
ativa (`∂x/∂x = 1`).

Antissimetria, a nulidade `dx∧dx=0` e a identidade `d²=0` não são regras
especiais no código — emergem da normalização (`canonicalizeIndices`, que
conta a paridade da permutação) e do fato de que `d` de uma base já
canônica é sempre zero, o que colapsa a regra de Leibniz graduada para "só
derive o coeficiente". Isso é testado diretamente em
`tests/unit/form.test.ts` (24 testes, incluindo `d²=0` para coeficientes
compostos por soma e produto de símbolos).

## O que dá para ver

- **Produto wedge**: dois blocos de 1-forma (grau = 1 dente) encaixados num
  operador ∧, produzindo um bloco de 2-forma (2 dentes). Arraste um bloco
  sobre o outro para trocar a ordem — o sinal muda (antissimetria); se os
  dois índices ficarem iguais, o resultado colapsa para 0.
- **Derivada exterior**: aplicar `d` sobe o grau em 1; aplicar `d` de novo
  colapsa para 0 (identidade d²=0), construído pela manipulação, não
  declarado em texto.

## Decisões de implementação (ver plano completo na conversa)

- Blocos são HTML/CSS (`clip-path` gerado por `src/blocks/shape.ts`), não
  SVG — porque o conteúdo é KaTeX (HTML) e o contorno precisa se
  redimensionar ao texto.
- `@dnd-kit/core` para arraste, com `PointerSensor` usando
  `activationConstraint: { distance: 8 }` para não conflitar com o clique de
  editar uma tag.
- `framer-motion` (já usado no `rg-interactive-lab`) para as animações de
  consequência (troca de sinal, colapso de d²).
- Paleta de cores copiada do `rg-interactive-lab` (`--orange` = covetor,
  `--cyan` = operador/transformação) para manter a linguagem visual do
  projeto.

## Rodar

Requer Node.js 22+.

```bash
npm install
npm run dev     # UI em http://localhost:5173
npm run test    # suíte do motor simbólico (src/algebra)
npm run typecheck
```
