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
- os operadores da Fase 3 (⋆, ι, f*, ∫, Stokes) na UI — o motor simbólico só
  cobre ∧, soma e `d` por enquanto;
- orientação e métrica na barra de contexto (só carta/coordenadas por
  enquanto — necessárias para ⋆ e ∫, ainda não implementadas);
- reordenar/mover subárvores já colocadas no canvas livre — hoje só dá pra
  preencher soquetes vazios ou apagar (o que apaga a subárvore inteira);
- validar se as tags digitadas correspondem às coordenadas da carta ativa
  (hoje uma tag "w" numa carta 3D só não aparece nas somas de `d`, não gera
  aviso).

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
- **Canvas livre**: paleta de blocos (0-forma, 1-forma, ∧, +, d) à esquerda,
  área de montagem no centro, expressão calculada ao vivo à direita.
  Diferente dos dois demos guiados, aqui a árvore é genérica e recursiva
  (`src/blocks/canvasModel.ts`) — dá pra montar qualquer combinação, incluindo
  operadores aninhados (`d(dx∧dy)`, por exemplo). Soquete vazio mostra
  "expressão incompleta"; soma de graus incompatíveis mostra o erro do motor
  em vez de travar o encaixe — o bloco engata fisicamente, é a matemática que
  rejeita. Cada bloco/soquete aceita **arrastar OU clicar para
  selecionar e depois clicar para encaixar** — o clique existe porque
  arrastar-e-soltar segurando o botão é difícil em trackpad.
- **Barra de contexto**: seletor de carta ativa (2D, 3D, espaço-tempo 1+3,
  esféricas) no topo da página, compartilhado pelas três abas via
  `CoordsContext`. Trocar a carta muda de verdade o parâmetro `coords`
  passado para `exteriorDerivative`/`formWedge` — testável visualmente
  trocando para "Espaço-tempo" e vendo `df` somar sobre `t,x,y,z` em vez de
  só `x,y,z`.

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
