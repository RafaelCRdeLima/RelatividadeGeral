"""Figuras do capítulo de fluidos relativísticos.

Tres figuras, todas conceituais (nao ha' calculo numerico aqui):

  1) densidade e fluxo: a contracao de Lorentz do volume e o paralelepipedo
     de particulas que atravessa uma superficie em Delta t;
  2) densidade como fluxo temporal: as MESMAS linhas de mundo contadas
     atravessando uma superficie x = const (fluxo) e uma superficie
     t = const (densidade). E' o desenho que unifica as duas nocoes;
  3) tensoes em um elemento de fluido e o argumento de torque que prova
     T^{ij} = T^{ji}.

Aviso sobre o prefixo do arquivo: 'cap04' aqui e' o capitulo 4 IMPRESSO
(Fluidos relativisticos). Os arquivos cap02/cap03/cap04 mais antigos usam a
numeracao anterior, de quando o Plano do curso era o capitulo 1.
"""

import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, FancyArrow
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

PETROLEO, AMBAR, TERRACOTA, GRAFITE = "#0E5A6B", "#C1832F", "#A6503C", "#3E4C54"
LINHA, NEVOA = "#D6DEE1", "#EDF3F4"
mpl.rcParams.update({
    "font.family": "serif",
    "font.serif": ["TeX Gyre Pagella", "Palatino", "DejaVu Serif"],
    "mathtext.fontset": "dejavuserif",
    "axes.edgecolor": GRAFITE, "axes.labelcolor": GRAFITE,
    "xtick.color": GRAFITE, "ytick.color": GRAFITE, "text.color": GRAFITE,
    "axes.spines.top": False, "axes.spines.right": False,
    "font.size": 9, "axes.titlesize": 10,
})


# ----------------------------------------------------------------------
# 1) Contração do volume e o paralelepípedo do fluxo
# ----------------------------------------------------------------------
def figura_densidade_fluxo():
    fig, axs = plt.subplots(1, 2, figsize=(9.2, 3.9))
    rng = np.random.default_rng(3)

    # --- painel A: mesma quantidade de partículas, volume contraído ----
    ax = axs[0]
    v = 0.8
    gama = 1.0 / np.sqrt(1 - v * v)
    pts = rng.uniform(0, 1, size=(26, 2))
    for x0, larg, cor, rot in ((0.0, 1.0, PETROLEO, "no MCRF"),
                               (1.45, 1.0 / gama, AMBAR, r"em $\bar O$")):
        ax.add_patch(Polygon([(x0, 0), (x0 + larg, 0), (x0 + larg, 1), (x0, 1)],
                             closed=True, facecolor=NEVOA, edgecolor=cor, lw=1.6))
        ax.plot(x0 + pts[:, 0] * larg, pts[:, 1], "o", color=cor, ms=3)
        ax.text(x0 + larg / 2, -0.16, rot, ha="center", color=cor, fontsize=9)
    ax.annotate("", xy=(1.42, 1.16), xytext=(1.03, 1.16),
                arrowprops=dict(arrowstyle="->", color=GRAFITE, lw=1.0))
    ax.text(1.22, 1.22, r"$\times\,1/\gamma$", ha="center", color=GRAFITE, fontsize=9)
    ax.text(1.22, 0.5, r"$n \to \gamma n$", ha="center", color=TERRACOTA, fontsize=10)
    ax.set_xlim(-0.15, 2.7)
    ax.set_ylim(-0.35, 1.45)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("Mesmas partículas, volume menor")

    # --- painel B: quem atravessa a superfície em Delta t --------------
    ax = axs[1]
    ax.add_patch(Polygon([(0, 0), (1.25, 0), (1.25, 1), (0, 1)], closed=True,
                         facecolor=NEVOA, edgecolor=LINHA, lw=1.2, ls="--"))
    ax.plot([1.25, 1.25], [-0.1, 1.1], color=PETROLEO, lw=2.4)
    ax.text(1.32, 1.02, r"superfície $S$", color=PETROLEO, fontsize=9)
    ax.text(1.32, 0.86, r"($x=\,$const)", color=PETROLEO, fontsize=8)
    p = rng.uniform([0, 0.08], [1.25, 0.92], size=(16, 2))
    for x0, y0 in p:
        ax.arrow(x0, y0, 0.22, 0.0, color=AMBAR, lw=0.9,
                 head_width=0.035, length_includes_head=True)
        ax.plot(x0, y0, "o", color=AMBAR, ms=3)
    ax.annotate("", xy=(1.25, -0.22), xytext=(0, -0.22),
                arrowprops=dict(arrowstyle="<->", color=GRAFITE, lw=1.0))
    ax.text(0.62, -0.36, r"$v^{\bar x}\,\Delta\bar t$", ha="center",
            color=GRAFITE, fontsize=10)
    ax.text(0.62, 1.22, r"volume $= v^{\bar x}\Delta\bar t\,\Delta A$",
            ha="center", color=TERRACOTA, fontsize=9.5)
    ax.set_xlim(-0.2, 2.35)
    ax.set_ylim(-0.5, 1.4)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("Só quem está a menos de $v\\,\\Delta t$ atravessa")
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap04_densidade_fluxo.pdf", bbox_inches="tight")
    plt.close(fig)


# ----------------------------------------------------------------------
# 2) Densidade como fluxo temporal  --  a figura central do capítulo
# ----------------------------------------------------------------------
def figura_fluxo_temporal():
    fig, axs = plt.subplots(1, 2, figsize=(9.2, 4.3))
    v = 0.45                      # inclinação das linhas de mundo
    x0s = np.arange(-1.6, 2.2, 0.32)

    for ax, modo in zip(axs, ("fluxo", "densidade")):
        for x0 in x0s:
            t = np.array([-1.3, 1.6])
            ax.plot(x0 + v * t, t, color=AMBAR, lw=1.1, alpha=0.9)
        if modo == "fluxo":
            ax.plot([0.6, 0.6], [-1.3, 1.6], color=LINHA, lw=1.0)
            ax.plot([0.6, 0.6], [0.0, 1.0], color=PETROLEO, lw=3.2,
                    solid_capstyle="butt")
            ax.annotate("", xy=(0.44, 1.0), xytext=(0.44, 0.0),
                        arrowprops=dict(arrowstyle="<->", color=PETROLEO, lw=1.0))
            ax.text(0.30, 0.5, r"$\Delta \bar t$", color=PETROLEO,
                    ha="right", fontsize=11)
            ax.set_title(r"Superfície $\bar x=$ const: conta o \emph{fluxo}"
                         .replace("\\emph{", "").replace("}", ""))
            ax.text(-1.55, -1.15, "linhas de mundo que cruzam\n"
                    r"o segmento $\Delta\bar t$", color=PETROLEO, fontsize=8.5)
        else:
            ax.plot([-1.9, 2.5], [0.5, 0.5], color=LINHA, lw=1.0)
            ax.plot([0.0, 1.0], [0.5, 0.5], color=PETROLEO, lw=3.2,
                    solid_capstyle="butt")
            ax.annotate("", xy=(1.0, 0.34), xytext=(0.0, 0.34),
                        arrowprops=dict(arrowstyle="<->", color=PETROLEO, lw=1.0))
            ax.text(0.5, 0.14, r"$\Delta \bar x$", color=PETROLEO,
                    ha="center", fontsize=11)
            ax.set_title(r"Superfície $\bar t=$ const: conta a densidade")
            ax.text(-1.55, -1.15, "as MESMAS linhas de mundo,\n"
                    r"agora cruzando $\Delta\bar x$", color=PETROLEO, fontsize=8.5)
        ax.set_xlim(-1.9, 2.5)
        ax.set_ylim(-1.35, 1.65)
        ax.set_xlabel(r"$\bar x$")
        ax.set_ylabel(r"$\bar t$")
        ax.set_xticks([])
        ax.set_yticks([])
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap04_fluxo_temporal.pdf", bbox_inches="tight")
    plt.close(fig)


# ----------------------------------------------------------------------
# 3) Tensões e a simetria de T^{ij}
# ----------------------------------------------------------------------
def figura_tensoes():
    fig, axs = plt.subplots(1, 2, figsize=(9.2, 4.0))

    # --- painel A: as componentes T^{ij} como forças nas faces --------
    ax = axs[0]
    ax.add_patch(Polygon([(0, 0), (1, 0), (1, 1), (0, 1)], closed=True,
                         facecolor=NEVOA, edgecolor=PETROLEO, lw=1.6))
    setas = [((1.0, 0.5), (0.42, 0.0), r"$T^{xx}$", TERRACOTA),
             ((1.0, 0.5), (0.0, 0.34), r"$T^{yx}$", AMBAR),
             ((0.5, 1.0), (0.0, 0.42), r"$T^{yy}$", TERRACOTA),
             ((0.5, 1.0), (0.34, 0.0), r"$T^{xy}$", AMBAR)]
    for (px, py), (dx, dy), rot, cor in setas:
        ax.arrow(px, py, dx, dy, color=cor, lw=1.4, head_width=0.055,
                 length_includes_head=True)
        ax.text(px + dx * 1.25 + (0.10 if dy else 0.0),
                py + dy * 1.25 + (0.10 if dx else 0.0),
                rot, color=cor, fontsize=10, ha="center")
    ax.text(0.5, 0.5, "elemento\nde fluido", ha="center", va="center",
            color=GRAFITE, fontsize=9)
    ax.text(0.5, -0.30, "a face de normal $x$ recebe as duas componentes:\n"
            r"$T^{xx}$ é pressão, $T^{yx}$ é cisalhamento",
            ha="center", color=GRAFITE, fontsize=8.5)
    ax.set_xlim(-0.55, 1.85)
    ax.set_ylim(-0.55, 1.75)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("As componentes espaciais são forças por área")

    # --- painel B: o torque que força a simetria ----------------------
    ax = axs[1]
    ax.add_patch(Polygon([(0, 0), (1, 0), (1, 1), (0, 1)], closed=True,
                         facecolor=NEVOA, edgecolor=LINHA, lw=1.4))
    for (px, py), (dx, dy), cor in (((1.0, 0.5), (0.0, 0.40), AMBAR),
                                    ((0.0, 0.5), (0.0, -0.40), AMBAR),
                                    ((0.5, 1.0), (0.40, 0.0), PETROLEO),
                                    ((0.5, 0.0), (-0.40, 0.0), PETROLEO)):
        ax.arrow(px, py, dx, dy, color=cor, lw=1.5, head_width=0.055,
                 length_includes_head=True)
    ang = np.linspace(0.35 * np.pi, 1.65 * np.pi, 100)
    ax.plot(0.5 + 0.24 * np.cos(ang), 0.5 + 0.24 * np.sin(ang),
            color=TERRACOTA, lw=1.6)
    ax.arrow(0.5 + 0.24 * np.cos(ang[-1]), 0.5 + 0.24 * np.sin(ang[-1]),
             0.05, 0.05, color=TERRACOTA, lw=1.6, head_width=0.07,
             length_includes_head=True)
    ax.text(0.5, 0.5, r"$\tau_z$", ha="center", va="center",
            color=TERRACOTA, fontsize=12)
    ax.text(1.18, 0.72, r"$T^{yx}$", color=AMBAR, fontsize=10)
    ax.text(0.80, 1.16, r"$T^{xy}$", color=PETROLEO, fontsize=10)
    ax.text(0.5, -0.30, r"$\tau_z = \ell^3\,(T^{xy}-T^{yx})$ e $I\propto \ell^5$:"
            "\n" r"se $T^{xy}\neq T^{yx}$, a rotação diverge quando $\ell\to0$",
            ha="center", color=GRAFITE, fontsize=8.5)
    ax.set_xlim(-0.65, 1.75)
    ax.set_ylim(-0.55, 1.75)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("O torque obriga $T^{ij}$ a ser simétrico")
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap04_tensoes.pdf", bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    figura_densidade_fluxo()
    figura_fluxo_temporal()
    figura_tensoes()
    print(f"Figuras salvas em {OUTDIR}")
