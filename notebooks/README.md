# Notebooks da disciplina

Todos os notebooks abrem no Google Colab com um clique pela página
<https://rafaelcrdelima.github.io/RelatividadeGeral/codigos/>. Localmente,
usam uma base científica aberta: SymPy, NumPy, SciPy e Matplotlib.

## Laboratórios

Escritos à mão, para exploração conceitual:

- `00_ambiente_e_escala_gravitacional.ipynb`: verificação do ambiente,
  dedução do raio de Schwarzschild e exploração numérica de escalas de massa.
- `01_transformacoes_de_lorentz.ipynb`: transformações de eventos, diagramas de
  Minkowski com velocidade ajustável, simultaneidade, tempo próprio, paradoxo
  dos gêmeos e problemas orientados do capítulo 2.

## `programas/` — gerados, não editar à mão

Os 13 notebooks em `programas/` correspondem um a um aos scripts de
`apostila/fonte/codigo/*.py`, que são a fonte de verdade. São produzidos por:

```bash
python3 apostila/fonte/codigo/gerar_notebooks.py
```

Editar um deles diretamente é desperdício: a próxima geração sobrescreve.
Altere o `.py` correspondente e rode o conversor.

Cada capítulo da apostila termina em uma seção **Conteúdo extra** com três
problemas que pedem para modificar esses programas — é para isso que eles
existem em formato de notebook.

## Instalação local

```bash
python -m venv .venv
python -m pip install jupyterlab sympy numpy scipy matplotlib
jupyter lab
```
