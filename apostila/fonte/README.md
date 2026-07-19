# Apostila de Relatividade Geral - 72 aulas

Material original de apoio para uma disciplina de Relatividade Geral com 72 encontros de 50 minutos. A versão atual inclui capítulos conceituais ampliados, calendário, exemplos resolvidos, problemas orientados, exercícios e projetos finais.

Arquivos principais:

- `rg_72_aulas.tex`: fonte LaTeX da apostila.
- `figuras/`: PDFs das figuras (geradas por scripts em `codigo/`), incluídas via `\includegraphics`.
- `codigo/`: scripts Python (`.py`) e Mathematica/Wolfram Language (`.wl`) de apoio a cada capítulo. Os `.py` que geram figuras também são impressos no capítulo correspondente via `\lstinputlisting`; os `.wl` são verificações simbólicas, também impressas no texto.

O PDF compilado, usado pela página do curso, fica em `../Relatividade_Geral_72_Aulas.pdf` (um nível acima).

A referência principal de organização é Bernard Schutz, *A First Course in General Relativity*, 3ª edição. O texto da apostila foi escrito em formulação própria e não reproduz o livro.

Para recompilar:

```bash
pdflatex -interaction=nonstopmode -halt-on-error rg_72_aulas.tex
pdflatex -interaction=nonstopmode -halt-on-error rg_72_aulas.tex
cp rg_72_aulas.pdf ../Relatividade_Geral_72_Aulas.pdf
```

Para regenerar as figuras de um capítulo (exemplo, Capítulo 2):

```bash
python3 codigo/cap02_figuras.py
python3 codigo/cap02_tempo_proprio.py
```

Convenção de nomes: cada script/figura leva o prefixo `capNN_` do capítulo a que pertence, para manter a correspondência entre `codigo/`, `figuras/` e as seções do `.tex` à medida que novos capítulos forem revisados.
