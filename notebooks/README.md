# Notebooks da disciplina

Os laboratórios computacionais usam Jupyter com uma base científica aberta:
SymPy, NumPy, SciPy e Matplotlib.

## Notebooks disponíveis

- `00_ambiente_e_escala_gravitacional.ipynb`: verificação do ambiente,
  dedução do raio de Schwarzschild e exploração numérica de escalas de massa.
- `01_transformacoes_de_lorentz.ipynb`: transformações de eventos, diagramas de
  Minkowski com velocidade ajustável, simultaneidade, tempo próprio, paradoxo
  dos gêmeos e problemas orientados do capítulo 2.

## Instalação local

Com Python instalado, crie um ambiente virtual e instale as dependências:

```bash
python -m venv .venv
python -m pip install jupyterlab sympy numpy scipy matplotlib
jupyter lab
```

Os notebooks também podem ser abertos diretamente no Google Colab por meio da
página da disciplina.
