"""Gera as figuras do Capitulo 3 (Tensores no espaco-tempo plano).

Uso:
    python3 cap03_figuras.py

Salva os PDFs em ../figuras/.
"""

import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

plt.rcParams.update({
    "font.family": "serif",
    "mathtext.fontset": "cm",
    "font.size": 12,
    "axes.linewidth": 0.9,
})


# ---------------------------------------------------------------------
# Figura 1: uma-forma como pilha de superficies (mesmo exemplo do texto:
# omega=(2,1), V=(3,4), omega(V)=10)
# ---------------------------------------------------------------------
def fig_umaforma_pilha():
    omega = np.array([2.0, 1.0])
    V = np.array([3.0, 4.0])

    fig, ax = plt.subplots(figsize=(5.2, 5.2))

    # linhas de nivel de phi(x,y) = omega . (x,y) = k, para k inteiro
    xs = np.linspace(-1, 6, 50)
    k_vals = range(-2, 13)
    for k in k_vals:
        # 2x + y = k  =>  y = k - 2x
        ys = k - omega[0] * xs
        dentro = (ys > -1.5) & (ys < 6.5)
        cor = "0.75" if k != 0 and k != 10 else "#B0413E"
        lw = 0.8 if k != 0 and k != 10 else 1.4
        ax.plot(xs[dentro], ys[dentro], color=cor, lw=lw, zorder=1)

    ax.annotate("", xy=tuple(V), xytext=(0, 0),
                arrowprops=dict(arrowstyle="-|>", color="#4C72B0", lw=2.2),
                zorder=5)
    ax.plot([0], [0], "o", color="black", zorder=6, ms=4)
    ax.text(-0.55, -0.35, r"$\varphi=0$", color="#B0413E", fontsize=10)
    ax.text(V[0] + 0.15, V[1] + 0.35, r"$\varphi=10$", color="#B0413E", fontsize=10)
    ax.text(V[0] * 0.5 + 0.3, V[1] * 0.5 - 0.3, r"$V$", color="#4C72B0", fontsize=13)

    ax.set_xlim(-1, 5.5)
    ax.set_ylim(-1.5, 6.5)
    ax.set_aspect("equal")
    ax.set_xlabel("$x$")
    ax.set_ylabel("$y$")
    ax.set_title(r"Uma-forma $\omega=(2,1)$ como pilha de superfícies",
                 fontsize=12)
    ax.text(0.03, 0.03,
            r"$\omega(V)=$ nº de superfícies perfuradas $=10$",
            transform=ax.transAxes, fontsize=9.5,
            bbox=dict(boxstyle="round", fc="white", ec="0.6"))

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap03_umaforma_pilha.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 2: base obliqua -- componentes contravariantes (paralelogramo)
# vs. covariantes (projecao perpendicular)
# ---------------------------------------------------------------------
def fig_base_obliqua():
    e1 = np.array([1.0, 0.0])
    e2 = np.array([0.4, 1.0])
    V = np.array([1.3, 0.9])

    g = np.array([[e1 @ e1, e1 @ e2], [e2 @ e1, e2 @ e2]])
    Vcontra = np.linalg.solve(np.array([e1, e2]).T, V)  # V = V^1 e1 + V^2 e2
    Vco = np.array([V @ e1, V @ e2])                    # V_i = V . e_i

    fig, axs = plt.subplots(1, 2, figsize=(9.6, 4.8))

    for ax, titulo in zip(axs, ["Componentes contravariantes $V^i$ (paralelogramo)",
                                 "Componentes covariantes $V_i$ (projeção perpendicular)"]):
        ax.annotate("", xy=tuple(e1), xytext=(0, 0),
                     arrowprops=dict(arrowstyle="-|>", color="0.2", lw=1.8))
        ax.annotate("", xy=tuple(e2), xytext=(0, 0),
                     arrowprops=dict(arrowstyle="-|>", color="0.2", lw=1.8))
        ax.text(*(e1 + [0.05, -0.13]), r"$\mathbf{e}_1$", fontsize=12)
        ax.text(*(e2 + [0.05, 0.03]), r"$\mathbf{e}_2$", fontsize=12)

        ax.annotate("", xy=tuple(V), xytext=(0, 0),
                     arrowprops=dict(arrowstyle="-|>", color="#4C72B0", lw=2.2),
                     zorder=5)
        ax.text(*(V + [0.03, 0.05]), r"$V$", color="#4C72B0", fontsize=13)

        # eixos (retas que contem e1 e e2), estendidos
        for e, cor in [(e1, "0.6"), (e2, "0.6")]:
            t = np.linspace(-0.5, 2.0, 10)
            pts = np.outer(t, e)
            ax.plot(pts[:, 0], pts[:, 1], color=cor, lw=0.7, ls=":", zorder=0)

        ax.set_xlim(-0.5, 1.8)
        ax.set_ylim(-0.5, 1.6)
        ax.set_aspect("equal")
        ax.set_title(titulo, fontsize=10.5)

    # --- painel 1: paralelogramo (contravariante) ---
    ax = axs[0]
    p1 = Vcontra[0] * e1
    p2 = Vcontra[1] * e2
    ax.plot([p1[0], V[0]], [p1[1], V[1]], color="#B0413E", lw=1.2, ls="--")
    ax.plot([p2[0], V[0]], [p2[1], V[1]], color="#B0413E", lw=1.2, ls="--")
    ax.plot(*p1, "o", color="#B0413E", ms=4)
    ax.plot(*p2, "o", color="#B0413E", ms=4)
    ax.text(p1[0], p1[1] - 0.15, rf"$V^1 e_1$", color="#B0413E", fontsize=9)
    ax.text(p2[0] - 0.35, p2[1] + 0.05, rf"$V^2 e_2$", color="#B0413E", fontsize=9)

    # --- painel 2: projecao perpendicular (covariante) ---
    ax = axs[1]
    for e, comp, cor in [(e1, Vco[0], "#B0413E"), (e2, Vco[1], "#55A868")]:
        ehat = e / np.linalg.norm(e)
        pe = (V @ ehat) * ehat
        ax.plot([pe[0], V[0]], [pe[1], V[1]], color=cor, lw=1.0, ls="--")
        ax.plot(*pe, "o", color=cor, ms=4)
    ax.text(V[0] - 0.55, -0.25, r"$V_1=V\!\cdot\!e_1$", color="#B0413E", fontsize=9)
    ax.text(0.15, 1.35, r"$V_2=V\!\cdot\!e_2$", color="#55A868", fontsize=9)

    fig.suptitle("Base oblíqua: duas maneiras de decompor o mesmo vetor $V$",
                 fontsize=12, y=1.03)
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap03_base_obliqua.pdf", bbox_inches="tight")
    plt.close(fig)

    return g, Vcontra, Vco


# ---------------------------------------------------------------------
# Figura 3: a base coordenada das polares, em tres pontos. O ponto e' que
# ela muda de ponto a ponto -- em direcao E em comprimento -- embora o
# plano seja o mesmo plano euclidiano de sempre.
# ---------------------------------------------------------------------
def fig_base_polar():
    # Dois pontos no mesmo raio angular (r = 1 e 3) mostram o COMPRIMENTO
    # crescendo com r; o terceiro, noutro angulo, mostra a DIRECAO mudando.
    pontos = [(1.0, 0.25), (3.0, 0.25), (2.0, 0.75)]

    fig, ax = plt.subplots(figsize=(6.2, 5.6))

    # linhas coordenadas: as curvas cujas tangentes sao os vetores de base
    for rc in (1.0, 2.0, 3.0, 3.6):
        t = np.linspace(0, np.pi / 2, 200)
        ax.plot(rc * np.cos(t), rc * np.sin(t), color="0.87", lw=0.8, zorder=0)
    for tc in np.linspace(0, np.pi / 2, 7):
        ax.plot([0, 3.9 * np.cos(tc)], [0, 3.9 * np.sin(tc)],
                color="0.87", lw=0.8, zorder=0)

    for k, (r, th) in enumerate(pontos):
        P = np.array([r * np.cos(th), r * np.sin(th)])
        er = np.array([np.cos(th), np.sin(th)])           # |e_r| = 1 sempre
        et = np.array([-r * np.sin(th), r * np.cos(th)])  # |e_theta| = r
        ax.annotate("", xy=tuple(P + er), xytext=tuple(P),
                    arrowprops=dict(arrowstyle="-|>", color="#B0413E", lw=2.0), zorder=5)
        ax.annotate("", xy=tuple(P + et), xytext=tuple(P),
                    arrowprops=dict(arrowstyle="-|>", color="#4C72B0", lw=2.0), zorder=5)
        ax.plot(*P, "o", color="0.15", ms=4.5, zorder=6)
        ax.text(*(P + er + [0.05, -0.22]), r"$\vec e_r$", color="#B0413E", fontsize=11)
        ax.text(*(P + et + [-0.16, 0.10]), r"$\vec e_\theta$", color="#4C72B0", fontsize=11)
        ax.text(*(P + [-0.52, -0.30]), f"$r={r:g}$", color="0.35", fontsize=9.5)

    ax.set_xlim(-0.25, 4.0)
    ax.set_ylim(-0.25, 4.0)
    ax.set_aspect("equal")
    ax.set_xlabel("$x$")
    ax.set_ylabel("$y$")
    ax.set_title("A base coordenada das polares muda de ponto a ponto:\n"
                 "direção e comprimento", fontsize=11)
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap03_base_polar.pdf", bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    fig_umaforma_pilha()
    g, Vcontra, Vco = fig_base_obliqua()
    fig_base_polar()
    print("g =", g.tolist())
    print("V^i =", Vcontra.tolist())
    print("V_i =", Vco.tolist())
    print("Figuras salvas em", OUTDIR)
