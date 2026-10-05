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

AZUL, VERM, LARANJA, CINZA = "#2A6F9E", "#B03A48", "#C2703A", "#555555"


def _limpa(ax, lados=("top", "right")):
    for lado in lados:
        ax.spines[lado].set_visible(False)
    ax.set_xticks([])
    ax.set_yticks([])


def torre_redshift():
    """O argumento de Schild, em dois paineis (Secao 5.1).

    A versao anterior desta figura desenhava, num unico eixo de tempo, duas
    separacoes DIFERENTES entre emissoes e recepcoes, e concluia que "o
    quadrilatero nao fecha". Isso confundia duas coisas distintas:

      * o tempo COORDENADO t, que a estaticidade do campo torna igual nos
        dois lados -- as duas cristas percorrem caminhos congruentes;
      * o tempo PROPRIO tau de cada relogio local, que e' o que a frequencia
        mede, tau = 1/nu, e que de fato difere.

    E o quadrilatero fecha: quatro eventos ligados por duas linhas de mundo
    e dois sinais formam um quadrilatero. O que falha e' interpretar suas
    medidas como as de uma rede inercial de Minkowski. Dai os dois paineis:
    (a) a hipotese, com os lados iguais; (b) a medida, com os relogios
    locais em desacordo.
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.4, 4.3))

    for ax in (ax1, ax2):
        for x, rot in ((0.0, "base"), (1.0, "topo")):
            ax.plot([x, x], [0, 3.3], color="#333333", lw=2.0, zorder=3)
            ax.text(x, -0.22, rot, ha="center", va="top", fontsize=11)
        ax.set_xlim(-0.72, 1.80)
        ax.set_ylim(-0.45, 4.35)
        _limpa(ax, ("top", "right", "bottom"))

    # --- (a) a hipotese: cristas CONGRUENTES, logo lados iguais -----------
    t0, dt = 0.30, 1.05
    for k in (0, 1):
        s = np.linspace(0, 1, 120)
        # as duas curvas sao identicas a menos de uma translacao em t:
        # e' isso que a estaticidade do campo garante
        ax1.plot(s, t0 + k * dt + 1.25 * s + 0.22 * np.sin(np.pi * s),
                 color=LARANJA, lw=1.8, zorder=2)
    for x, a, cor, dx, rot in ((0.0, t0, AZUL, -0.09, r"$\Delta t$"),
                               (1.0, t0 + 1.25, VERM, +0.09, r"$\Delta t$")):
        ax1.annotate("", xy=(x + dx, a + dt), xytext=(x + dx, a),
                     arrowprops=dict(arrowstyle="<->", color=cor, lw=1.6))
        ax1.text(x + 2.1 * dx, a + dt / 2, rot, color=cor, fontsize=12,
                 ha="right" if dx < 0 else "left", va="center",
                 path_effects=HALO)
    ax1.text(0.5, 4.00, "(a) se o referencial fosse de Lorentz",
             ha="center", fontsize=11, style="italic")
    ax1.text(0.5, 0.05, "cristas congruentes", color=LARANJA, fontsize=10,
             ha="center", path_effects=HALO)
    ax1.set_ylabel("tempo coordenado $t$")

    # --- (b) o que se mede: relogios locais, tempo PROPRIO ----------------
    # Mesmo Delta t nos dois lados; o que difere e' o ritmo de cada relogio.
    ax2.annotate("", xy=(-0.09, t0 + dt), xytext=(-0.09, t0),
                 arrowprops=dict(arrowstyle="<->", color=AZUL, lw=1.6))
    ax2.annotate("", xy=(1.09, t0 + 1.25 + dt), xytext=(1.09, t0 + 1.25),
                 arrowprops=dict(arrowstyle="<->", color=VERM, lw=1.6))
    # Rotulos curtos e do lado de FORA das duas verticais: acima das setas
    # eles caiam sobre as curvas das cristas, e "= 1/nu" nao cabia na
    # horizontal. A igualdade tau = 1/nu fica dita uma vez so, no canto.
    ax2.text(-0.66, t0 + dt / 2, r"$\Delta\tau_{\rm base}$",
             color=AZUL, fontsize=11, ha="left", va="center",
             path_effects=HALO)
    ax2.text(1.74, t0 + 1.25 + dt / 2, r"$\Delta\tau_{\rm topo}$",
             color=VERM, fontsize=11, ha="right", va="center",
             path_effects=HALO)
    ax2.text(0.5, -0.30, r"cada relógio mede $\Delta\tau=1/\nu$",
             ha="center", fontsize=9.5, color=CINZA, path_effects=HALO)
    for k in (0, 1):
        s = np.linspace(0, 1, 120)
        ax2.plot(s, t0 + k * dt + 1.25 * s + 0.22 * np.sin(np.pi * s),
                 color=LARANJA, lw=1.8, zorder=2, alpha=0.45)
    # tiques dos relogios: o do topo corre mais depressa
    for x, passo, cor in ((0.0, 0.30, AZUL), (1.0, 0.42, VERM)):
        for n in range(11):
            y = 0.15 + n * passo
            if y < 3.25:
                ax2.plot([x - 0.045, x + 0.045], [y, y], color=cor, lw=1.3,
                         zorder=4)
    ax2.text(0.5, 4.00, r"(b) $\nu'<\nu$: os relógios discordam",
             ha="center", fontsize=11, style="italic")
    ax2.set_ylabel(r"tempo próprio de cada relógio")

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap05_torre_redshift.pdf")
    plt.close(fig)


def queda_livre():
    """A mesma torre vista do referencial em queda livre (Secao 5.1)."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.0, 3.9))

    # --- apoiado ---
    ax1.plot([0, 0], [0, 2.6], color="#333333", lw=2.2)
    ax1.plot([1.3, 1.3], [0, 2.6], color="#333333", lw=2.2)
    ax1.annotate("", xy=(1.22, 2.15), xytext=(0.08, 0.45),
                 arrowprops=dict(arrowstyle="->", color=LARANJA, lw=2.0))
    ax1.text(0.62, 1.55, r"$\nu$", color=LARANJA, fontsize=13,
             path_effects=HALO)
    ax1.text(1.36, 2.15, r"$\nu'=\nu\,(1-gH/c^2)$", color=VERM, fontsize=11,
             va="center", path_effects=HALO)
    ax1.text(0.65, 2.95, "laboratório apoiado", ha="center", fontsize=11,
             style="italic")
    ax1.text(-0.12, 1.3, r"$H$", fontsize=12, ha="right", color=CINZA)
    ax1.annotate("", xy=(-0.05, 2.6), xytext=(-0.05, 0.0),
                 arrowprops=dict(arrowstyle="<->", color=CINZA, lw=1.1))
    ax1.set_xlim(-0.65, 2.6)
    ax1.set_ylim(-0.3, 3.35)
    _limpa(ax1, ("top", "right", "bottom", "left"))

    # --- em queda livre ---
    ax2.plot([0, 0], [0, 2.6], color="#333333", lw=2.2)
    ax2.plot([1.3, 1.3], [0, 2.6], color="#333333", lw=2.2)
    ax2.annotate("", xy=(1.22, 2.15), xytext=(0.08, 0.45),
                 arrowprops=dict(arrowstyle="->", color=LARANJA, lw=2.0))
    for y in (0.5, 1.3, 2.1):
        ax2.annotate("", xy=(2.05, y - 0.42), xytext=(2.05, y),
                     arrowprops=dict(arrowstyle="->", color=AZUL, lw=1.5))
    ax2.text(2.16, 1.3, r"$v=gH/c$", color=AZUL, fontsize=11, va="center",
             path_effects=HALO)
    ax2.text(0.62, 1.55, r"$\nu$", color=LARANJA, fontsize=13,
             path_effects=HALO)
    ax2.text(1.36, 2.15, r"$\nu$", color="#2E7D52", fontsize=13,
             va="center", path_effects=HALO)
    ax2.text(0.65, 2.95, "visto de quem cai", ha="center", fontsize=11,
             style="italic")
    ax2.text(0.65, -0.18, "o Doppler cancela o redshift", ha="center",
             fontsize=10, color="#2E7D52")
    ax2.set_xlim(-0.65, 2.9)
    ax2.set_ylim(-0.3, 3.35)
    _limpa(ax2, ("top", "right", "bottom", "left"))

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap05_queda_livre.pdf")
    plt.close(fig)


def mares():
    """Mare radial, mare transversal e o referencial que nao pode ser rigido."""
    fig, axs = plt.subplots(1, 3, figsize=(10.2, 3.6))

    terra = dict(color="#4A6FA5", alpha=0.25)

    # --- (a) separacao radial: afastam-se ---
    ax = axs[0]
    ax.add_patch(plt.Circle((0, -1.9), 1.0, **terra))
    ax.text(0, -1.9, "Terra", ha="center", va="center", fontsize=9,
            color="#20405F")
    for y, L in ((0.95, 0.30), (0.20, 0.62)):
        ax.plot(0, y, "o", color=LARANJA, ms=8, zorder=3)
        ax.annotate("", xy=(0, y - L), xytext=(0, y),
                    arrowprops=dict(arrowstyle="->", color=AZUL, lw=1.8))
    ax.text(0.14, 0.62, "a de baixo\ncai mais", fontsize=9.5, color=AZUL,
            va="center")
    ax.set_title("(a) radial: afastam-se", fontsize=11)
    ax.set_xlim(-1.5, 1.5); ax.set_ylim(-3.1, 1.6)

    # --- (b) separacao transversal: aproximam-se ---
    ax = axs[1]
    ax.add_patch(plt.Circle((0, -1.9), 1.0, **terra))
    ax.text(0, -1.9, "Terra", ha="center", va="center", fontsize=9,
            color="#20405F")
    for x in (-0.62, 0.62):
        ax.plot(x, 0.80, "o", color=LARANJA, ms=8, zorder=3)
        # cada uma cai em direcao ao centro, e as direcoes convergem
        dx, dy = -x * 0.22, -0.55
        ax.annotate("", xy=(x + dx, 0.80 + dy), xytext=(x, 0.80),
                    arrowprops=dict(arrowstyle="->", color=AZUL, lw=1.8))
    ax.plot([-0.62, 0.62], [0.80, 0.80], color=CINZA, lw=0.8, ls=":")
    ax.text(0, 1.15, "as direções convergem", ha="center", fontsize=9.5,
            color=AZUL)
    ax.set_title("(b) transversal: aproximam-se", fontsize=11)
    ax.set_xlim(-1.5, 1.5); ax.set_ylim(-3.1, 1.6)

    # --- (c) o referencial rigido nao pode cair livremente ---
    ax = axs[2]
    ax.add_patch(plt.Circle((0, -1.9), 1.0, **terra))
    ax.add_patch(plt.Rectangle((-0.85, 0.20), 1.70, 1.10, fill=False,
                               edgecolor=VERM, lw=1.8))
    for x, y in ((-0.85, 1.30), (0.0, 1.30), (0.85, 1.30),
                 (-0.85, 0.20), (0.0, 0.20), (0.85, 0.20)):
        dx, dy = -x * 0.20, -0.42
        ax.annotate("", xy=(x + dx, y + dy), xytext=(x, y),
                    arrowprops=dict(arrowstyle="->", color=AZUL, lw=1.4))
    ax.text(0, 1.62, "rígido e em queda livre:\nincompatíveis", ha="center",
            fontsize=9.5, color=VERM)
    ax.set_title("(c) e por isso só localmente", fontsize=11)
    ax.set_xlim(-1.6, 1.6); ax.set_ylim(-3.1, 2.3)

    for ax in axs:
        ax.set_aspect("equal")
        _limpa(ax, ("top", "right", "bottom", "left"))

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap05_mares.pdf")
    plt.close(fig)


def base_dual():
    """Base polar e base dual em dois raios (Secao 5.2).

    A figura existe para mostrar o que a Secao 5.2 afirma: quando e_theta
    DOBRA de tamanho, a pilha de omega^theta fica duas vezes mais RALA, de
    modo que o pareamento omega^theta(e_theta) = 1 vale nos dois pontos.
    """
    fig, axs = plt.subplots(2, 2, figsize=(9.0, 7.0))

    pontos = [(1.0, np.pi / 5), (2.0, np.pi / 5)]

    for col, (r0, th0) in enumerate(pontos):
        x0, y0 = r0 * np.cos(th0), r0 * np.sin(th0)

        # ---- linha de cima: os vetores de base ----
        ax = axs[0][col]
        for rr in (0.5, 1.0, 1.5, 2.0, 2.5):
            t = np.linspace(0, np.pi / 2, 100)
            ax.plot(rr * np.cos(t), rr * np.sin(t), color="#CCCCCC", lw=0.7)
        for tt in np.linspace(0, np.pi / 2, 7):
            ax.plot([0, 2.8 * np.cos(tt)], [0, 2.8 * np.sin(tt)],
                    color="#CCCCCC", lw=0.7)
        er = np.array([np.cos(th0), np.sin(th0)])
        eth = r0 * np.array([-np.sin(th0), np.cos(th0)])
        ax.annotate("", xy=(x0 + er[0], y0 + er[1]), xytext=(x0, y0),
                    arrowprops=dict(arrowstyle="->", color=AZUL, lw=2.2))
        ax.annotate("", xy=(x0 + eth[0], y0 + eth[1]), xytext=(x0, y0),
                    arrowprops=dict(arrowstyle="->", color=VERM, lw=2.2))
        ax.text(x0 + er[0] * 1.12, y0 + er[1] * 1.12, r"$\vec e_r$",
                color=AZUL, fontsize=12, path_effects=HALO)
        ax.text(x0 + eth[0] * 1.08, y0 + eth[1] * 1.08, r"$\vec e_\theta$",
                color=VERM, fontsize=12, path_effects=HALO)
        ax.plot(x0, y0, "o", color="#333333", ms=5, zorder=4)
        ax.set_title(rf"$r={r0:.0f}$:  $|\vec e_\theta|={r0:.0f}$",
                     fontsize=11)
        ax.set_xlim(-0.35, 3.3); ax.set_ylim(-0.35, 3.3)
        ax.set_aspect("equal")
        _limpa(ax, ("top", "right", "bottom", "left"))

        # ---- linha de baixo: a pilha da 1-forma omega^theta ----
        ax = axs[1][col]
        # As folhas de omega^theta sao os raios de theta INTEIRO: espacadas
        # de 1 radiano, porque e' esse o valor que a 1-forma conta. O vetor
        # e_theta tem componentes (0,1), isto e', abrange exatamente um
        # radiano -- logo atravessa exatamente UMA folha, em qualquer raio.
        #
        # A versao anterior desta figura usava folhas de 0,5 rad, de modo
        # que a seta cruzava duas e a legenda dizia uma.
        for tt in (0.0, 1.0, 2.0):
            ax.plot([0, 3.1 * np.cos(tt)], [0, 3.1 * np.sin(tt)],
                    color=VERM, lw=1.6, alpha=0.8)
            ax.text(3.25 * np.cos(tt), 3.25 * np.sin(tt),
                    rf"$\theta={tt:.0f}$", color=VERM, fontsize=9,
                    ha="center", va="center")
        th_b = 0.25                      # base da seta, entre duas folhas
        xb, yb = r0 * np.cos(th_b), r0 * np.sin(th_b)
        ethb = r0 * np.array([-np.sin(th_b), np.cos(th_b)])
        ax.annotate("", xy=(xb + ethb[0], yb + ethb[1]), xytext=(xb, yb),
                    arrowprops=dict(arrowstyle="->", color="#333333", lw=2.4))
        ax.plot(xb, yb, "o", color="#333333", ms=5, zorder=4)
        ax.text(xb + ethb[0] * 0.55 + 0.12, yb + ethb[1] * 0.55 + 0.12,
                r"$\vec e_\theta$", color="#333333", fontsize=12,
                path_effects=HALO)
        ax.set_title(r"atravessa $1$ folha: "
                     r"$\tilde\omega^\theta(\vec e_\theta)=1$",
                     fontsize=10.5)
        ax.set_xlim(-2.6, 3.6); ax.set_ylim(-0.4, 3.5)
        ax.set_aspect("equal")
        _limpa(ax, ("top", "right", "bottom", "left"))

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap05_base_dual.pdf")
    plt.close(fig)


def base_varia():
    """Como a base gira, e o campo constante visto sobre ela (Secao 5.3)."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.6, 4.4))

    # --- (a) a diferenca e_r(theta+d) - e_r(theta) aponta como e_theta ---
    r0, th0, dth = 2.0, 0.55, 0.62
    for th, alpha in ((th0, 1.0), (th0 + dth, 1.0)):
        x0, y0 = r0 * np.cos(th), r0 * np.sin(th)
        er = np.array([np.cos(th), np.sin(th)])
        ax1.annotate("", xy=(x0 + er[0], y0 + er[1]), xytext=(x0, y0),
                     arrowprops=dict(arrowstyle="->", color=AZUL, lw=2.2,
                                     alpha=alpha))
        ax1.plot(x0, y0, "o", color="#333333", ms=5, zorder=4)
    t = np.linspace(0, np.pi / 2, 100)
    ax1.plot(r0 * np.cos(t), r0 * np.sin(t), color="#CCCCCC", lw=0.9)

    # a diferenca, transportada para o primeiro ponto
    xa, ya = r0 * np.cos(th0), r0 * np.sin(th0)
    era = np.array([np.cos(th0), np.sin(th0)])
    erb = np.array([np.cos(th0 + dth), np.sin(th0 + dth)])
    dif = erb - era
    ax1.annotate("", xy=(xa + era[0] + dif[0], ya + era[1] + dif[1]),
                 xytext=(xa + era[0], ya + era[1]),
                 arrowprops=dict(arrowstyle="->", color=VERM, lw=2.0))
    ax1.text(xa + era[0] + dif[0] * 0.6 + 0.10,
             ya + era[1] + dif[1] * 0.6 + 0.10,
             r"$\delta\vec e_r \parallel \vec e_\theta$", color=VERM,
             fontsize=12, path_effects=HALO)
    ax1.text(0.08, 2.95, r"$\partial_\theta\vec e_r=\vec e_\theta/r$",
             fontsize=12, color=AZUL)
    ax1.set_title("(a) a base gira", fontsize=11)
    ax1.set_xlim(-0.2, 3.3); ax1.set_ylim(-0.2, 3.3)
    ax1.set_aspect("equal")
    _limpa(ax1, ("top", "right", "bottom", "left"))

    # --- (b) o campo constante e_x sobre bases que giram ---
    for rr in (1.1, 2.0, 2.9):
        for th in (0.25, 0.75, 1.25):
            x0, y0 = rr * np.cos(th), rr * np.sin(th)
            er = 0.55 * np.array([np.cos(th), np.sin(th)])
            eth = 0.55 * np.array([-np.sin(th), np.cos(th)])
            for v, cor in ((er, "#9DB8CE"), (eth, "#D8A9AF")):
                ax2.annotate("", xy=(x0 + v[0], y0 + v[1]), xytext=(x0, y0),
                             arrowprops=dict(arrowstyle="->", color=cor,
                                             lw=1.3))
            ax2.annotate("", xy=(x0 + 0.62, y0), xytext=(x0, y0),
                         arrowprops=dict(arrowstyle="->", color=LARANJA,
                                         lw=2.2))
    ax2.text(0.12, 3.30, r"$\vec e_x$: sempre a mesma seta", color=LARANJA,
             fontsize=11.5)
    ax2.text(0.12, 3.00, r"componentes $(\cos\theta,\,-\sin\theta/r)$",
             color=CINZA, fontsize=10.5)
    ax2.set_title("(b) campo constante, componentes variáveis", fontsize=11)
    ax2.set_xlim(-0.2, 3.9); ax2.set_ylim(-0.2, 3.7)
    ax2.set_aspect("equal")
    _limpa(ax2, ("top", "right", "bottom", "left"))

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap05_base_varia.pdf")
    plt.close(fig)


def duas_bases():
    """O mesmo vetor nas bases coordenada e ortonormal (Secao 5.5)."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.0, 4.2))

    r0, th0 = 2.0, np.pi / 6
    x0, y0 = r0 * np.cos(th0), r0 * np.sin(th0)
    er = np.array([np.cos(th0), np.sin(th0)])
    eth_c = r0 * np.array([-np.sin(th0), np.cos(th0)])      # coordenada
    eth_o = np.array([-np.sin(th0), np.cos(th0)])           # ortonormal

    # o MESMO vetor geometrico nos dois paineis
    V = 0.8 * er + 0.5 * eth_c           # V^r = 0,8 ; V^theta = 0,5

    for ax, eth, rot, comp in (
        (ax1, eth_c, (r"$\vec e_r$", r"$\vec e_\theta$"),
         r"$V^r=0{,}8$" "\n" r"$V^\theta=0{,}5$"),
        (ax2, eth_o, (r"$\vec e_{\hat r}$", r"$\vec e_{\hat\theta}$"),
         r"$V^{\hat r}=0{,}8$" "\n" r"$V^{\hat\theta}=rV^\theta=1{,}0$"),
    ):
        for rr in (1.0, 2.0, 3.0):
            t = np.linspace(0, np.pi / 2, 100)
            ax.plot(rr * np.cos(t), rr * np.sin(t), color="#DDDDDD", lw=0.7)
        for v, cor, rotulo in ((er, AZUL, rot[0]), (eth, VERM, rot[1])):
            ax.annotate("", xy=(x0 + v[0], y0 + v[1]), xytext=(x0, y0),
                        arrowprops=dict(arrowstyle="->", color=cor, lw=2.2))
            ax.text(x0 + v[0] * 1.10, y0 + v[1] * 1.10, rotulo, color=cor,
                    fontsize=12, path_effects=HALO)
        ax.annotate("", xy=(x0 + V[0], y0 + V[1]), xytext=(x0, y0),
                    arrowprops=dict(arrowstyle="->", color="#2E7D52", lw=2.6))
        ax.text(x0 + V[0] * 1.06 + 0.06, y0 + V[1] * 1.06, r"$\vec V$",
                color="#2E7D52", fontsize=13, path_effects=HALO)
        ax.plot(x0, y0, "o", color="#333333", ms=5, zorder=4)
        ax.text(0.05, 2.95, comp, fontsize=11, color=CINZA, va="top")
        ax.set_xlim(-0.25, 3.4); ax.set_ylim(-0.25, 3.3)
        ax.set_aspect("equal")
        _limpa(ax, ("top", "right", "bottom", "left"))

    ax1.set_title("base coordenada", fontsize=11)
    ax2.set_title("base ortonormal", fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap05_duas_bases.pdf")
    plt.close(fig)


if __name__ == "__main__":
    torre_redshift()
    queda_livre()
    mares()
    base_dual()
    base_varia()
    duas_bases()
    print("figuras do capitulo 5 geradas em", OUTDIR)
