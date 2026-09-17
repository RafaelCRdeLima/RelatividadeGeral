"""Figuras do capítulo de fluidos relativísticos.

Tres figuras, todas conceituais (nao ha' calculo numerico aqui):

  1) densidade e fluxo: a contracao de Lorentz do volume e o paralelepipedo
     de particulas que atravessa uma superficie em Delta t;
  2) densidade como fluxo temporal: as MESMAS linhas de mundo contadas
     atravessando uma superficie x = const (fluxo) e uma superficie
     t = const (densidade). E' o desenho que unifica as duas nocoes;
  3) tensoes em um elemento de fluido e o argumento de torque que prova
     T^{ij} = T^{ji}.

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
    setas = [((1.0, 0.5), (0.42, 0.0), r"$T^{xx}$", TERRACOTA,
              (1.48, 0.50), "left", "center"),
             ((1.0, 0.5), (0.0, 0.34), r"$T^{yx}$", AMBAR,
              (1.06, 0.67), "left", "center"),
             ((0.5, 1.0), (0.0, 0.42), r"$T^{yy}$", TERRACOTA,
              (0.50, 1.49), "center", "bottom"),
             ((0.5, 1.0), (0.34, 0.0), r"$T^{xy}$", AMBAR,
              (0.67, 1.06), "center", "bottom")]
    for (px, py), (dx, dy), rot, cor, (tx, ty), ha, va in setas:
        ax.arrow(px, py, dx, dy, color=cor, lw=1.4, head_width=0.055,
                 length_includes_head=True)
        ax.text(tx, ty, rot, color=cor, fontsize=10, ha=ha, va=va)
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
    ax.text(0.5, -0.30, r"$\tau_z = \ell^3\,(T^{yx}-T^{xy})$ e $I\propto \ell^5$:"
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


# ----------------------------------------------------------------------
# 4) O projetor h: as tres contas do Exemplo 4.3, em desenho
# ----------------------------------------------------------------------
def figura_projetor(v=0.5):
    """As tres propriedades de h^mu_beta = delta^mu_beta + U^mu U_beta.

    Sai um arquivo por propriedade, para que cada desenho fique ao lado da
    sua conta no Exemplo 4.3.  O MESMO vetor A aparece nos tres, decomposto
    como A = a U + b e_perp com a = 1,3 e b = 0,9 (a != 1 de proposito: no
    painel (c) a componente temporal de A tem de ser distinguivel de U).

      _a  h aniquila U: a reta de deslizamento coincide com o proprio U, e
          por isso a sombra de U sobre a reta ortogonal e' a origem.
      _b  idempotencia: projetado uma vez, A cai sobre a reta; a segunda
          projecao nao tem para onde mover.
      _c  no MCRF a mesma operacao e' a projecao perpendicular de sempre.
    """
    g = 1.0 / np.sqrt(1.0 - v**2)
    U = np.array([g * v, g])            # tipo-tempo, norma -1, em (x, ct)
    E = np.array([g, g * v])            # tipo-espaco, ortogonal a U, norma +1
    a, b = 1.3, 0.9
    A = a * U + b * E
    hA = b * E
    CINZA = "#9FAEB4"
    L0, L1 = -0.85, 2.60

    def nova(rotulos=("$x$", "$ct$")):
        fig, ax = plt.subplots(figsize=(4.3, 4.0))
        ax.set_xlim(L0, L1); ax.set_ylim(L0, L1)
        ax.set_aspect("equal")
        ax.axhline(0, color=LINHA, lw=0.8, zorder=0)
        ax.axvline(0, color=LINHA, lw=0.8, zorder=0)
        ax.set_xlabel(rotulos[0]); ax.set_ylabel(rotulos[1])
        ax.set_xticks([]); ax.set_yticks([])
        return fig, ax

    def seta(ax, vec, cor, rot, dx=8, dy=6, lw=2.2, tam=12):
        ax.annotate("", xy=tuple(vec), xytext=(0, 0),
                    arrowprops=dict(arrowstyle="-|>", color=cor, lw=lw), zorder=5)
        if rot:
            ax.annotate(rot, xy=tuple(vec), xytext=(dx, dy),
                        textcoords="offset points", fontsize=tam, color=cor,
                        zorder=6)

    def cenario(ax):
        t = np.array([-0.95, 2.45])
        ax.plot(t * E[0], t * E[1], color=AMBAR, lw=1.5, zorder=2)
        ax.plot([0, 2.5], [0, 2.5], color=LINHA, lw=1.2, ls=(0, (6, 4)),
                zorder=1)
        seta(ax, U, PETROLEO, r"$\vec{U}$", dx=-32, dy=-2)
        ax.text(2.50, 1.38, r"$\perp\vec{U}$", fontsize=11.5, color=AMBAR,
                ha="right", va="bottom")

    def salvar(fig, nome):
        fig.tight_layout()
        fig.savefig(OUTDIR / nome, bbox_inches="tight")
        plt.close(fig)

    # ---------------- (a) o projetor aniquila U ------------------------
    fig, ax = nova()
    cenario(ax)
    ax.plot([U[0], -0.62 * U[0]], [U[1], -0.62 * U[1]], color=TERRACOTA,
            lw=1.4, ls=(0, (4, 3)), zorder=4)
    ax.plot([0], [0], "o", color=TERRACOTA, ms=9, zorder=7)
    ax.annotate(r"$h(\vec{U})=0$", xy=(0, 0), xytext=(14, -26),
                textcoords="offset points", fontsize=12, color=TERRACOTA,
                zorder=7)
    ax.text(L0 + 0.08, 2.50,
            "projetar é deslizar paralelamente\n"
            r"a $\vec{U}$ até a reta $\perp\vec{U}$; para o" "\n"
            r"próprio $\vec{U}$, essa reta passa" "\n"
            "pela origem",
            fontsize=8.6, color=GRAFITE, ha="left", va="top")
    salvar(fig, "cap04_projetor_a.pdf")

    # ---------------- (b) projetar duas vezes = projetar uma -----------
    fig, ax = nova()
    cenario(ax)
    seta(ax, A, GRAFITE, r"$\vec{A}$", dx=4, dy=4)
    ax.annotate("", xy=tuple(hA), xytext=tuple(A),
                arrowprops=dict(arrowstyle="-|>", color=TERRACOTA, lw=1.4,
                                ls=(0, (4, 3))), zorder=4)
    seta(ax, hA, TERRACOTA, "", lw=2.4)
    ax.plot([hA[0]], [hA[1]], "o", color=TERRACOTA, ms=7, zorder=7)
    ax.annotate(r"$h\vec{A}$", xy=tuple(hA * 0.55), xytext=(0, -22),
                textcoords="offset points", fontsize=12, color=TERRACOTA,
                ha="center", zorder=7)
    ax.annotate("2ª projeção: já está\nsobre a reta, não se move",
                xy=tuple(hA + np.array([0.06, -0.03])), xytext=(2.50, 0.02),
                textcoords="data", fontsize=8.6, color=TERRACOTA,
                ha="right", va="bottom",
                arrowprops=dict(arrowstyle="-|>", color=TERRACOTA, lw=1.0,
                                connectionstyle="arc3,rad=-0.3"), zorder=6)
    salvar(fig, "cap04_projetor_b.pdf")

    # ---------------- (c) no MCRF: diag(0,1,1,1) -----------------------
    fig, ax = nova(rotulos=("$x'$", "$ct'$"))
    ax.plot([-0.95, 2.45], [0, 0], color=AMBAR, lw=1.5, zorder=2)
    ax.plot([0, 2.5], [0, 2.5], color=LINHA, lw=1.2, ls=(0, (6, 4)), zorder=1)
    seta(ax, (0.0, 1.0), PETROLEO, r"$\vec{U}=\vec{e}_{0'}$", dx=-14, dy=2)
    Am = np.array([b, a])                      # componentes de A no MCRF
    seta(ax, Am, GRAFITE, r"$\vec{A}$", dx=6, dy=4)
    ax.plot([0, Am[0]], [Am[1], Am[1]], color=LINHA, lw=1.1, ls=(0, (3, 3)),
            zorder=2)
    ax.annotate("", xy=(Am[0], Am[1]), xytext=(Am[0], 0),
                arrowprops=dict(arrowstyle="-|>", color=CINZA, lw=2.2), zorder=4)
    ax.text(Am[0] + 0.10, Am[1] * 0.5, r"$A^{0'}\to 0$", fontsize=10,
            color=CINZA, ha="left", va="center")
    seta(ax, (Am[0], 0.0), TERRACOTA, "", lw=2.6)
    ax.text(Am[0] * 0.5, -0.20, r"$A^{1'}$ fica", fontsize=10,
            color=TERRACOTA, ha="center", va="top")
    ax.text(L0 + 0.08, 2.50,
            r"$h^{\mu\nu}=\mathrm{diag}(0,1,1,1)$" "\n"
            "no referencial do próprio elemento\na projeção é a de sempre",
            fontsize=8.6, color=GRAFITE, ha="left", va="top")
    salvar(fig, "cap04_projetor_c.pdf")


if __name__ == "__main__":
    figura_densidade_fluxo()
    figura_fluxo_temporal()
    figura_tensoes()
    figura_projetor()
    print(f"Figuras salvas em {OUTDIR}")
