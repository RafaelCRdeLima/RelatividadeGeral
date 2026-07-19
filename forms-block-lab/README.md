# Forms Block Lab — protótipo visual (beta)

App irmão do `rg-interactive-lab`, para ensinar álgebra de formas
diferenciais (1-formas, 2-formas, produto wedge, derivada exterior, e depois
Hodge star, pullback e integração/Stokes) por manipulação de blocos.

**Este é ainda um protótipo**, mas desde já com matemática de verdade: a
camada visual (`src/blocks/`) e o motor simbólico (`src/algebra/`) estão
ligados — os dois demos chamam `formWedge`/`exteriorDerivative` a cada
interação e mostram o resultado real (inclusive a expansão em derivadas
parciais de `df`, não um rótulo fixo). Falta:

- currículo de atividades (`activities.ts`, competências, pontuação);
- sessão persistida, telemetria, retomada;
- Professor Viewer, exportação `.rglab`;
- os operadores f* (pullback) e ∫/Stokes da Fase 3 — ⋆, ι e o pareamento
  ⟨,⟩ já estão prontos, além de ∧, soma e `d`;
- orientação na barra de contexto (carta, coordenadas e métrica diagonal já
  existem; orientação ainda não afeta nada);
- métrica dependente de posição (esféricas de verdade: g_θθ=r², g_φφ=r²sin²θ)
  — `hodgeStar` só aceita métrica diagonal **constante** (`Metric =
  Record<string, number>`), porque isso evita precisar de raiz quadrada
  simbólica no motor escalar. "Esféricas" na barra de contexto usa métrica
  euclidiana como placeholder, não a métrica esférica real;
- mover um operador inteiro (com sua subárvore) já colocado no canvas livre
  — só blocos-folha (0-forma, 1-forma, vetor) são arrastáveis para iniciar
  o movimento (arrastar um operador inteiro exigiria lidar com draggables
  aninhados no dnd-kit, o que não foi resolvido ainda), mas o **alvo** pode
  ser qualquer coisa: arrastar uma folha para cima de um soquete já
  ocupado — mesmo com um operador inteiro lá dentro — troca as posições
  (swap), não só move para vazio;
- o bloco "vetor" só aceita coeficientes **numéricos** por coordenada (ex.:
  2∂ₓ-∂ᵧ) — `interiorProduct` no motor já aceita componentes simbólicas
  quaisquer (`VectorField = Record<string, Scalar>`), mas expor isso na UI
  exigiria um parser de expressão pra texto livre, que ainda não existe.

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
  operador ∧, produzindo um bloco de 2-forma (2 dentes) com o resultado
  canônico real de `formWedge` (índices ordenados, sinal correto). Arraste
  um bloco sobre o outro para trocar a ordem — o sinal muda porque o motor
  recalcula a permutação; se os dois índices ficarem iguais,
  `isZeroForm` detecta e o resultado colapsa para 0.
- **Derivada exterior**: aplicar `d` chama `exteriorDerivative` de verdade —
  o resultado de `df` é a soma real das derivadas parciais formais vezes
  cada `dx` (ex.: `∂ₓf dx + ∂ᵧf dy + ∂_z f dz`). Aplicar `d` de novo
  recalcula e o motor produz a forma zero (`d²=0`), não um estado
  roteirizado.
- **Canvas livre**: paleta de blocos (0-forma, 1-forma, vetor, ∧, +, d, ι, ⋆)
  à esquerda, área de montagem no centro, expressão calculada ao vivo à
  direita. Diferente dos dois demos guiados, aqui a árvore é genérica e
  recursiva (`src/blocks/canvasModel.ts`) — dá pra montar qualquer
  combinação, incluindo operadores aninhados (`d(dx∧dy)`, `ι[∂ₓ; dx∧dy]`,
  `⋆(dx)`). Soquete vazio mostra "expressão incompleta"; soma de graus
  incompatíveis mostra o erro do motor em vez de travar o encaixe — o bloco
  engata fisicamente, é a matemática que rejeita. Cada bloco/soquete aceita
  **arrastar OU clicar para selecionar e depois clicar para encaixar** — o
  clique existe porque arrastar-e-soltar segurando o botão é difícil em
  trackpad. O botão "+ Nova equação" na coluna de blocos cria uma área de
  equação independente adicional — cada uma tem sua própria árvore, seu
  próprio resultado no painel à direita, e pode ser removida individualmente
  (menos a última). Blocos de 1-forma com uma tag que não é coordenada da
  carta ativa (ex.: "w" numa carta 3D `x,y,z`) ganham contorno vermelho
  tracejado e um ⚠ — aviso visual, não bloqueia nada (o motor ainda calcula
  normalmente, só que "dw" nunca aparece nas somas de `d`). O bloco "vetor"
  mostra um campo numérico por coordenada da carta ativa (ex.: `∂ₓ`, `∂ᵧ`,
  `∂_z`) — dá pra montar qualquer combinação linear com coeficiente
  constante (ex.: `2∂ₓ-∂ᵧ`), não só uma direção de base. Blocos-folha já
  colocados (0-forma, 1-forma, vetor) podem ser **arrastados para outro
  soquete** — em qualquer equação, não só na mesma — para mover sem
  precisar apagar e reconstruir; se o destino já estiver ocupado (mesmo por
  uma subárvore inteira), as posições **trocam** em vez de recusar o
  encaixe. O operador ⟨,⟩ empareia uma 1-forma com um
  vetor e devolve um escalar (⟨ω,X⟩ = ω(X), a definição de covetor como
  funcional linear) — matematicamente é ι aplicado a uma 1-forma, só que
  dedicado e rotulado como o conceito fundamental que é. 1-formas e vetores
  continuam livres para uso normal em ∧/d/ι quando não emparelhados; o
  pareamento é só mais uma opção, não obrigatória.
- **Barra de contexto**: seletor de carta ativa (2D, 3D, espaço-tempo 1+3,
  esféricas) no topo da página, compartilhado pelas três abas via
  `CoordsContext` — inclui a métrica diagonal associada a cada carta (chips
  `gₓₓ=1` etc.). Trocar a carta muda de verdade os parâmetros `coords` e
  `metric` passados para `exteriorDerivative`/`formWedge`/`hodgeStar` —
  testável visualmente trocando para "Espaço-tempo" e vendo `⋆dt` dar
  `−dx∧dy∧dz` (assinatura de Minkowski) em vez do resultado euclidiano.

## Decisões de implementação (ver plano completo na conversa)

- Blocos são HTML/CSS (`clip-path` gerado por `src/blocks/shape.ts`), não
  SVG — porque o conteúdo é KaTeX (HTML) e o contorno precisa se
  redimensionar ao texto.
- `@dnd-kit/core` para arraste, com `PointerSensor` usando
  `activationConstraint: { distance: 8 }` para não conflitar com o clique de
  editar uma tag.
- Todo input de texto/número dentro de um bloco arrastável precisa de
  `onKeyDown={(e) => e.stopPropagation()}` — sem isso, teclas como Enter e
  Espaço (usadas por `MathTag` para confirmar edição) borbulham até o
  ancestral arrastável e o `KeyboardSensor` do dnd-kit as interpreta como
  ativação de arraste por teclado, deixando o bloco "preso" em estado de
  drag sem nenhum arraste real ter acontecido. Encontrado ao implementar
  mover blocos-folha (ver histórico do `MathTag.tsx`).
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
