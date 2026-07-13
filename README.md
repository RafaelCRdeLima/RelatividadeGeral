# Relatividade Geral

Material didático da disciplina de Relatividade Geral da UDESC/CCT.

O repositório reúne:

- a apostila do curso em PDF e seu fonte LaTeX;
- laboratórios computacionais em Jupyter Notebook;
- dashboards de exploração visual sem programação;
- a página pública para leitura e download dos materiais.

## Acesso

Depois de habilitado o GitHub Pages, a página estará disponível em:

<https://rafaelcrdelima.github.io/RelatividadeGeral/>

## Estrutura

```text
apostila/        PDF e fonte LaTeX
notebooks/       laboratórios computacionais
dashboards/      laboratórios visuais interativos
rg-interactive-lab/ aplicação avaliativa do Capítulo 4 e Professor Viewer
index.html       página da disciplina
styles.css       apresentação visual da página
```

O RG Interactive Lab possui documentação, testes e build próprios em
[`rg-interactive-lab/`](rg-interactive-lab/README.md).

## Executar os notebooks localmente

```bash
python -m venv .venv
python -m pip install -r requirements.txt
jupyter lab
```

Este material está em desenvolvimento. Uma licença de distribuição ainda não
foi especificada.
