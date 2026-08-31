"""Gera os notebooks Jupyter a partir dos scripts .py deste diretório.

Os arquivos .py são a fonte de verdade: os notebooks em ../../../notebooks/
programas/ são derivados deles e não devem ser editados à mão. Para
regenerar todos:

    python3 gerar_notebooks.py

O que a conversão faz, além de fatiar o script em células:

  * troca o diretório de saída das figuras, porque `__file__` não existe em
    um notebook e o Colab não tem a árvore da apostila;
  * troca `plt.close(fig)` por `plt.show()`, para que as figuras apareçam
    embaixo da célula em vez de irem só para o disco;
  * remove a guarda `if __name__ == "__main__":`, promovendo o corpo dela a
    células de nível superior.
"""

import json
import re
import textwrap
from pathlib import Path

AQUI = Path(__file__).resolve().parent
DESTINO = AQUI.parents[2] / "notebooks" / "programas"

TITULOS = {
    "cap01_boosts": ("Capítulo 1", "Invariância do intervalo e adição de velocidades"),
    "cap01_tempo_proprio": ("Capítulo 1", "Tempo próprio do gêmeo viajante"),
    "cap01_figuras": ("Capítulo 1", "Figuras: simultaneidade, gêmeos e cone de luz"),
    "cap02_quadrivetores": ("Capítulo 2", "Quadrivetores, casca de massa e energia de limiar"),
    "cap02_compton_foguete": ("Capítulo 2", "Espalhamento Compton e foguete relativístico"),
    "cap02_figuras": ("Capítulo 2", "Figuras: colisor, casca de massa, Compton e foguete"),
    "cap03_tensores": ("Capítulo 3", "Base dual, simetrias e invariância do traço"),
    "cap03_figuras": ("Capítulo 3", "Figuras: 1-forma como pilha e base oblíqua"),
    "cap06_curvatura": ("Capítulo 6", "Holonomia, tensor de Riemann numérico e desvio geodésico"),
    "cap09_ondas": ("Capítulo 9", "Anel de partículas, quadrupolo e inspiral"),
    "cap10_geodesicas_schwarzschild": ("Capítulo 10", "ISCO, precessão, deflexão e queda radial"),
    "cap11_buracos_negros": ("Capítulo 11", "Cones de luz, Kruskal, marés, Hawking e Kerr"),
    "cap12_friedmann": ("Capítulo 12", "Idade do universo, fator de escala e distâncias"),
}

URL_APOSTILA = "https://rafaelcrdelima.github.io/RelatividadeGeral/"

CABECALHO = """# {cap} — {titulo}

Este notebook é gerado a partir de `{arquivo}`, o programa que acompanha a
seção de *Resolução numérica* do {cap_min} da apostila.

> **Faça uma cópia.** No Colab, use *Arquivo → Salvar uma cópia no Drive*
> antes de alterar qualquer coisa. O *Conteúdo extra* do {cap_min} propõe três
> modificações neste programa; é aqui que você as faz.

Apostila e demais programas: {url}
"""


def limpa_para_notebook(codigo: str) -> str:
    """Ajustes necessários para o código rodar num notebook/Colab."""
    #  A pasta de saída passa a ser local. O mkdir é acrescentado aqui
    #  porque nem todo script cria a pasta -- na árvore da apostila ela já
    #  existe, mas num notebook recém-aberto no Colab, não.
    for var in ("OUTDIR", "OUT"):
        codigo = re.sub(
            rf'{var} = Path\(__file__\)\.resolve\(\)\.parent\.parent / "figuras"',
            f'{var} = Path("figuras")   # no notebook, ao lado deste arquivo\n'
            f'{var}.mkdir(exist_ok=True)',
            codigo)
    # se o script já criava a pasta, a linha vira duplicata inofensiva
    codigo = re.sub(r'(\n(OUTDIR|OUT)\.mkdir\(exist_ok=True\))\1', r"\1",
                    codigo)
    # qualquer outro uso de __file__ vira o diretório corrente
    codigo = codigo.replace("Path(__file__).resolve().parent.parent",
                            'Path(".")')
    codigo = codigo.replace("Path(__file__).resolve().parent", 'Path(".")')
    # mostrar as figuras em vez de apenas fechá-las
    codigo = re.sub(r"^(\s*)plt\.close\((?:fig\d?|'all'|\"all\")\)\s*$",
                    r"\1plt.show()", codigo, flags=re.M)
    return codigo


def separa_docstring(fonte: str):
    m = re.match(r'\s*(?:"""|\'\'\')(.*?)(?:"""|\'\'\')\s*\n', fonte, re.S)
    if not m:
        return "", fonte
    return m.group(1).strip(), fonte[m.end():]


def desdobra_main(corpo: str):
    """Separa o corpo do script do bloco `if __name__ == '__main__':`."""
    m = re.search(r'^if __name__ == "__main__":\s*\n', corpo, re.M)
    if not m:
        return corpo, ""
    return corpo[:m.start()], textwrap.dedent(corpo[m.end():])


#  Pontos de corte: a faixa de comentário `# ====` que os scripts maiores
#  usam para separar blocos, e o comentário numerado `# 1)` dos menores.
CORTE = re.compile(r"^# (?:[=-]{10,}|\d+\)\s)")


def fatia(codigo: str, maximo=28):
    """Quebra o código em pedaços legíveis, cortando nos marcadores."""
    linhas = codigo.split("\n")
    cortes, atual = [], []

    def fecha():
        if any(x.strip() and not x.strip().startswith("#") for x in atual):
            cortes.append("\n".join(atual).strip("\n"))
            return True
        return False

    for i, l in enumerate(linhas):
        anterior = linhas[i - 1] if i else ""
        if CORTE.match(l) and atual and not CORTE.match(anterior):
            if fecha():
                atual = []
        atual.append(l)
    fecha()

    # um pedaço muito longo e sem marcador vira várias células, cortando em
    # linha em branco no nível zero de indentação
    saida = []
    for pedaco in cortes:
        linhas = pedaco.split("\n")
        if len(linhas) <= maximo:
            saida.append(pedaco)
            continue
        bloco = []
        for j, l in enumerate(linhas):
            proxima = linhas[j + 1] if j + 1 < len(linhas) else ""
            bloco.append(l)
            corta = (not l.strip() and len(bloco) >= maximo
                     and proxima[:1] not in (" ", "\t", "", ")", "]", "}"))
            if corta:
                saida.append("\n".join(bloco).strip("\n"))
                bloco = []
        if any(x.strip() for x in bloco):
            saida.append("\n".join(bloco).strip("\n"))
    return [c for c in saida if c.strip()]


def celula(tipo, fonte):
    base = {"cell_type": tipo, "metadata": {},
            "source": fonte.rstrip("\n").split("\n")}
    base["source"] = [l + "\n" for l in base["source"][:-1]] + [base["source"][-1]]
    if tipo == "code":
        base["execution_count"] = None
        base["outputs"] = []
    return base


def converte(arquivo: Path) -> dict:
    nome = arquivo.stem
    cap, titulo = TITULOS[nome]
    fonte = limpa_para_notebook(arquivo.read_text())
    doc, corpo = separa_docstring(fonte)
    corpo, main = desdobra_main(corpo)

    celulas = [celula("markdown", CABECALHO.format(
        cap=cap, titulo=titulo, arquivo=arquivo.name,
        cap_min=cap.lower(), url=URL_APOSTILA))]
    if doc:
        celulas.append(celula("markdown",
                              "## O que este programa faz\n\n" + doc))
    for pedaco in fatia(corpo):
        celulas.append(celula("code", pedaco))
    if main.strip():
        celulas.append(celula("markdown", "## Resultados"))
        for pedaco in fatia(main):
            celulas.append(celula("code", pedaco))
    return {
        "cells": celulas,
        "metadata": {
            "colab": {"name": nome + ".ipynb", "provenance": []},
            "kernelspec": {"display_name": "Python 3", "language": "python",
                           "name": "python3"},
            "language_info": {"name": "python", "version": "3.12"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


if __name__ == "__main__":
    DESTINO.mkdir(parents=True, exist_ok=True)
    for arquivo in sorted(AQUI.glob("cap*.py")):
        if arquivo.stem not in TITULOS:
            continue
        nb = converte(arquivo)
        saida = DESTINO / (arquivo.stem + ".ipynb")
        saida.write_text(json.dumps(nb, ensure_ascii=False, indent=1) + "\n")
        codigo = sum(1 for c in nb["cells"] if c["cell_type"] == "code")
        print(f"  {saida.name:42} {len(nb['cells']):2} células "
              f"({codigo} de código)")
    print(f"\nNotebooks gravados em {DESTINO}")
