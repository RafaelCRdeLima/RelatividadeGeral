"""Gera as figuras do Capitulo 5 (Da gravidade a curvatura) da apostila.

Uso:
    python3 cap05_figuras.py

Salva os PDFs em ../figuras/.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

plt.rcParams.update({
    "font.family": "serif",
    "mathtext.fontset": "cm",
    "font.size": 12,
    "axes.linewidth": 0.9,
})

HALO = [pe.withStroke(linewidth=3.0, foreground="white")]


def torre_redshift():
    """O quadrilatero que nao fecha (Secao 5.1).

    Duas cristas sucessivas sobem da base ao topo de uma torre estatica.
    Se a geometria fosse a de Minkowski, a segunda linha de mundo seria a
    primeira transladada no tempo, e os dois lados verticais seriam
    IGUAIS. O redshift medido diz que o de cima e' maior -- entao a
    geometria nao e' plana.

    O exagero e' deliberado e esta dito na legenda: o efeito real numa
    torre de laboratorio e' de 1 parte em 10^15, invisivel em qualquer
    desenho honesto.
    """
    fig, ax = plt.subplots(figsize=(5.0, 4.4))

    x_base, x_topo = 0.0, 1.0
    # Emissoes na base e recepcoes no topo. O intervalo de cima e' maior:
    # e' o redshift, exagerado para caber no papel.
    t_e1, t_e2 = 0.35, 1.15          # duas cristas saem da base
    t_r1, t_r2 = 1.55, 2.65          # e chegam ao topo mais espacadas

    for x, rotulo in ((x_base, "base"), (x_topo, "topo")):
        ax.plot([x, x], [0, 3.2], color="#333333", lw=2.0, zorder=3)
        ax.text(x, -0.18, rotulo, ha="center", va="top", fontsize=11)

    # As duas linhas de mundo da luz, ligeiramente curvas -- porque a
    # geometria NAO e' plana, que e' justamente a conclusao.
    for (t0, t1, cor) in ((t_e1, t_r1, "#C2703A"), (t_e2, t_r2, "#C2703A")):
        s = np.linspace(0, 1, 100)
        x = x_base + s * (x_topo - x_base)
        t = t0 + s * (t1 - t0) + 0.10 * np.sin(np.pi * s)
        ax.plot(x, t, color=cor, lw=1.8, zorder=2)

    # Os dois lados verticais do quadrilatero, que deveriam ser iguais.
    for (x, a, b, cor, dx, rotulo) in (
        (x_base, t_e1, t_e2, "#2A6F9E", -0.08, r"$\Delta t_{\rm base}$"),
        (x_topo, t_r1, t_r2, "#B03A48", +0.08, r"$\Delta t_{\rm topo}$"),
    ):
        ax.annotate("", xy=(x + dx, b), xytext=(x + dx, a),
                    arrowprops=dict(arrowstyle="<->", color=cor, lw=1.6))
        ax.text(x + 1.9 * dx, 0.5 * (a + b), rotulo, color=cor, fontsize=11,
                ha="right" if dx < 0 else "left", va="center", path_effects=HALO)

    ax.text(0.5, 0.30, "cristas sucessivas", color="#C2703A", fontsize=10,
            ha="center", path_effects=HALO)
    # Acima do topo das verticais, para nao cruzar nenhuma linha.
    ax.text(0.5, 3.55, r"em Minkowski os dois lados seriam iguais",
            ha="center", fontsize=10.5, style="italic")

    ax.set_xlim(-0.42, 1.42)
    ax.set_ylim(-0.35, 3.8)
    ax.set_ylabel("tempo")
    ax.set_xticks([])
    ax.set_yticks([])
    for lado in ("top", "right", "bottom"):
        ax.spines[lado].set_visible(False)
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap05_torre_redshift.pdf")
    plt.close(fig)


if __name__ == "__main__":
    torre_redshift()
    print("figuras do capitulo 5 geradas em", OUTDIR)
