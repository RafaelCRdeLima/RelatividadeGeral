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

## Calendário aula a aula

A coluna de números de seção do calendário é gerada, não escrita à mão. O
plano é declarado por *título* de seção em `codigo/gerar_calendario.py`, e os
números vêm do `.toc` da última compilação:

```bash
xelatex rg_72_aulas.tex          # atualiza o .toc
python3 codigo/gerar_calendario.py
xelatex rg_72_aulas.tex          # recompila com a coluna nova
```

Rode isso sempre que criar, apagar ou reordenar uma seção. Se algum título
declarado no script não existir mais, ele aborta apontando qual, em vez de
gerar uma referência errada. O script é idempotente: rodá-lo duas vezes não
duplica a coluna.

## Alocação de aulas: pendência conhecida

O calendário distribui 72 encontros entre os capítulos. Enquanto a expansão
dos capítulos estiver em curso, essa distribuição fica temporariamente
apertada: o capítulo 4, por exemplo, tem 14 seções de conteúdo para três
encontros. **A alocação precisa ser refeita quando a expansão terminar** — e
há uma aritmética a enfrentar: 12 capítulos de ~21 páginas pedem cerca de 6
aulas cada, o que consome os 72 encontros e não deixa nada para abertura,
revisão, projetos e síntese. Alguma coisa terá de ceder, e essa é uma decisão
pedagógica.

## Exercícios

Cinco por capítulo, para entrega, na proporção 2 fáceis / 2 médios / 1
difícil. Cada um traz a marca de dificuldade e a seção do Schutz que cobre o
assunto, via `\facil{1.6}`, `\medio{1.9}` ou `\dificil{1.11}`. Os enunciados
são originais, escritos sobre os tópicos e a sequência do Schutz — o livro é
protegido por direito autoral e a apostila é distribuída publicamente, então
os enunciados dele não podem ser reproduzidos aqui.

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

## A capa

O elemento gráfico é a órbita de Schwarzschild que não fecha, gerada por
`codigo/capa.py` a partir da equação de órbita
`u'' + u = M/L² + 3Mu²`. O termo `3Mu²` é o que produz a precessão; sem ele o
desenho seria uma elipse. O semilato reto foi escolhido para que a precessão
por órbita **não** seja fração racional simples de 2π — com `p = 15M` ela vale
exatamente 72° e o traçado se repete a cada cinco voltas.

A cor acompanha o **raio**, não a ordem ao longo da curva: com 42 voltas
sobrepostas, colorir por índice faz as cores se cancelarem em um creme
uniforme. Por raio, cada pétala fica dourada no periélio e ciano no afélio.

A capa é a única página com fundo escuro. Ela usa `\newgeometry` para ter
margens próprias, revertidas por `\restoregeometry` na linha seguinte, e um
retângulo TikZ ancorado em `current page` para o fundo — o que exige duas
passadas de compilação. As cores da capa (`rgNoite`, `rgCeu`, `rgBruma`,
`rgOuro`, `rgFileteNoite`) estão em `estilo-rg.sty` e são usadas só ali.

## Paleta

| cor           | hex       | uso                                   |
|---------------|-----------|---------------------------------------|
| `rgTinta`     | `#16222B` | corpo do texto (preto frio)           |
| `rgPetroleo`  | `#0E5A6B` | primária: títulos, filetes, caixas    |
| `rgAmbar`     | `#C1832F` | acento: resultados centrais, ênfase   |
| `rgTerracota` | `#A6503C` | alerta: caixas "onde se erra"         |
| `rgGrafite`   | `#5A6B75` | texto secundário, legendas, cabeçalho |

Só na capa, sobre fundo escuro:

| cor             | hex       | uso                          |
|-----------------|-----------|------------------------------|
| `rgNoite`       | `#0B2838` | fundo da capa                |
| `rgCeu`         | `#8DD7DC` | subtítulo                    |
| `rgBruma`       | `#9FB6C4` | texto secundário             |
| `rgOuro`        | `#E6B75C` | ano, acento                  |
| `rgFileteNoite` | `#28556E` | filetes                      |

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
python3 codigo/capa.py                 # a roseta da capa
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
