# Apostila de Relatividade Geral - 72 aulas

Material original de apoio para uma disciplina de Relatividade Geral com 72 encontros de 50 minutos. A versão atual inclui capítulos conceituais ampliados, calendário, exemplos resolvidos, problemas orientados, exercícios e projetos finais.

Arquivos principais:

- `rg_72_aulas.tex`: fonte LaTeX da apostila.
- `estilo-rg.sty`: identidade visual (fontes, paleta, títulos, cabeçalhos, caixas e listagens). Todo o desenho da apostila está aqui; o `.tex` só carrega o pacote e define o que é específico do texto.
- `secoes/`: seções longas mantidas em arquivos próprios e trazidas com `\input` — as seções de resolução numérica dos Capítulos 7, 10, 11, 12 e 13.
- `figuras/`: PDFs das figuras (geradas por scripts em `codigo/`), incluídas via `\includegraphics`.
- `codigo/`: scripts Python (`.py`) e Mathematica/Wolfram Language (`.wl`) de apoio a cada capítulo.

## Os programas não são impressos na apostila

Nenhum código aparece no PDF. Os 21 programas ficam para download na subpágina
[`codigos/`](../../codigos/) do site da disciplina,
<https://rafaelcrdelima.github.io/RelatividadeGeral/codigos/>, e o texto aponta
para eles com a caixa `\programa{arquivo}`:

```latex
\programa[uma linha dizendo o que o programa faz]{codigo/cap07\_curvatura.py}
```

Duas consequências práticas para quem edita a apostila:

- **As caixas `saida` são saída real.** Os números impressos nelas vêm da
  execução dos scripts, não são transcritos à mão. Ao alterar um programa,
  rode-o e atualize a caixa correspondente.
- **Ao acrescentar um programa novo**, inclua-o em `codigo/`, aponte para ele
  com `\programa`, rode `python3 codigo/gerar_notebooks.py` e acrescente o
  cartão correspondente em [`codigos/index.html`](../../codigos/index.html).
  O `.zip` de download é montado pelo workflow do GitHub Pages a partir de
  `codigo/`.

## Notebooks

Os `.py` são a fonte de verdade; os notebooks em `notebooks/programas/` são
**gerados** a partir deles por `codigo/gerar_notebooks.py` e não devem ser
editados à mão. O conversor fatia o script em células, troca o diretório de
figuras (porque `__file__` não existe em um notebook) e faz as figuras
aparecerem embaixo da célula. Depois de alterar qualquer `.py`:

```bash
python3 codigo/gerar_notebooks.py
```

Cada capítulo termina em uma seção **Conteúdo extra** com três problemas que
pedem para modificar um desses programas e obter um resultado que não está no
texto.

O PDF compilado, usado pela página do curso, fica em `../Relatividade_Geral_72_Aulas.pdf` (um nível acima).

A referência principal de organização é Bernard Schutz, *A First Course in General Relativity*, 3ª edição. O texto da apostila foi escrito em formulação própria e não reproduz o livro.

## Compilação

Compile com **XeLaTeX** (ou LuaLaTeX) para obter o desenho pretendido:

```bash
xelatex -interaction=nonstopmode -halt-on-error rg_72_aulas.tex
xelatex -interaction=nonstopmode -halt-on-error rg_72_aulas.tex
xelatex -interaction=nonstopmode -halt-on-error rg_72_aulas.tex
cp rg_72_aulas.pdf ../Relatividade_Geral_72_Aulas.pdf
```

São três passadas por causa do sumário e das referências cruzadas. Com **pdfLaTeX** também compila sem erro — `estilo-rg.sty` detecta o motor e cai em Palatino/Helvetica —, só com menos refinamento tipográfico.

Fontes usadas quando disponíveis: TeX Gyre Pagella no corpo (math casado via `mathpazo`), Poppins nos títulos e JetBrains Mono no código. Poppins e JetBrains Mono são gratuitas; se não estiverem instaladas, o pacote cai sozinho em TeX Gyre Adventor e DejaVu Sans Mono.

## Paleta

| cor           | hex       | uso                                   |
|---------------|-----------|---------------------------------------|
| `rgTinta`     | `#16222B` | corpo do texto (preto frio)           |
| `rgPetroleo`  | `#0E5A6B` | primária: títulos, filetes, caixas    |
| `rgAmbar`     | `#C1832F` | acento: resultados centrais, ênfase   |
| `rgTerracota` | `#A6503C` | alerta: caixas "onde se erra"         |
| `rgGrafite`   | `#5A6B75` | texto secundário, legendas, cabeçalho |

As figuras usam exatamente as mesmas cores; a definição está no topo de cada script Python.

## Ambientes disponíveis

Vindos de `estilo-rg.sty`:

- `objetivos` — abertura de capítulo
- `central` — resultado central
- `atencao` — erro comum ("onde se erra")
- `saida` + `lstlisting[style=rgsaida]` — saída de programa
- `\programa[descrição]{arquivo}` — ponteiro para um programa no site; **é este que se usa hoje**
- `caixacodigo` + `lstlisting` e `\rgcodigo{título}{linguagem}{arquivo}` — imprimem código no PDF; continuam definidos, mas não são mais usados

Definidos no preâmbulo do `.tex`, na mesma paleta: `resultado`, `roteiro`, `leitura` e os ambientes de teorema `definition`, `example`, `exercise`, `activity`, `proposition`, `remark`.

Capítulos de título longo devem usar título curto para o cabeçalho, como em
`\chapter[Soluções esféricas e Schwarzschild]{Soluções esféricas, estrelas e Schwarzschild}`.

## Figuras

Para regenerar as figuras de um capítulo (exemplos):

```bash
python3 codigo/cap02_figuras.py
python3 codigo/cap02_tempo_proprio.py
python3 codigo/cap07_curvatura.py
python3 codigo/cap10_ondas.py
python3 codigo/cap11_geodesicas_schwarzschild.py
python3 codigo/cap12_buracos_negros.py
python3 codigo/cap13_friedmann.py
```

Os scripts rodam sem argumentos, escrevem em `figuras/` e imprimem no terminal exatamente os números citados no texto das seções de resolução numérica.

Convenção de nomes: cada script/figura leva o prefixo `capNN_` do capítulo a que pertence, para manter a correspondência entre `codigo/`, `figuras/` e as seções do `.tex` à medida que novos capítulos forem revisados.
