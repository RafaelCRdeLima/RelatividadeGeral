"""Gera as figuras do Capitulo 2 (Vetores e momento relativistico).

Uso:
    python3 cap02_figuras.py

Salva os PDFs em ../figuras/. Unidades geometrizadas (c=1).
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

# halo branco atras do texto, para os rotulos nao se confundirem
# com as linhas que passam por tras
HALO = [pe.withStroke(linewidth=3.0, foreground="white")]


# ---------------------------------------------------------------------
# Figura 1: diagrama de massa (E vs |p|) -- casca de massa
# ---------------------------------------------------------------------
def fig_casca_de_massa():
    fig, ax = plt.subplots(figsize=(4.8, 4.6))

    p = np.linspace(0, 3, 300)
    for m, cor in zip([0.0, 0.6, 1.2], ["black", "#4C72B0", "#B0413E"]):
        E = np.sqrt(p**2 + m**2)
        rotulo = r"$m=0$ (fóton)" if m == 0 else rf"$m={m}$"
        estilo = "--" if m == 0 else "-"
        ax.plot(p, E, estilo, color=cor, lw=1.6, label=rotulo)

    ax.set_xlim(0, 3)
    ax.set_ylim(0, 3)
    ax.set_aspect("equal")
    ax.set_xlabel(r"$|\mathbf{p}|$")
    ax.set_ylabel(r"$E$")
    ax.legend(fontsize=10, frameon=False, loc="upper left")
    ax.set_title(r"Casca de massa $E^2=|\mathbf{p}|^2+m^2$", fontsize=12)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_casca_massa.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 2: energia de centro de momento -- colisor vs. alvo fixo
# ---------------------------------------------------------------------
def fig_colisor_vs_alvo_fixo(m=1.0):
    fig, ax = plt.subplots(figsize=(5.0, 4.2))

    E = np.linspace(m, 30 * m, 400)  # energia de cada feixe / energia de laboratorio

    sqrt_s_colisor = 2 * E
    sqrt_s_alvo_fixo = np.sqrt(2 * m**2 + 2 * m * E)

    ax.plot(E / m, sqrt_s_colisor / m, color="#4C72B0", lw=1.8,
            label=r"colisor: $\sqrt{s}=2E$")
    ax.plot(E / m, sqrt_s_alvo_fixo / m, color="#B0413E", lw=1.8,
            label=r"alvo fixo: $\sqrt{s}=\sqrt{2m^2+2mE}$")

    ax.set_xlabel(r"$E/m$ (energia por partícula)")
    ax.set_ylabel(r"$\sqrt{s}/m$ (energia disponível no CM)")
    ax.legend(fontsize=10, frameon=False, loc="upper left")
    ax.set_title("Energia de centro de momento: colisor vs. alvo fixo", fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_colisor_alvo_fixo.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 3: espalhamento Compton -- E'/E em funcao do angulo
# ---------------------------------------------------------------------
def fig_compton(me=0.511):
    """me em MeV (massa de repouso do eletron); E em MeV."""
    fig, ax = plt.subplots(figsize=(5.0, 4.2))

    theta = np.linspace(0, np.pi, 300)
    for E, cor in zip([0.1, 0.511, 2.0], ["#4C72B0", "#55A868", "#B0413E"]):
        Ep = E * me / (E * (1 - np.cos(theta)) + me)
        ax.plot(np.degrees(theta), Ep / E, color=cor, lw=1.8,
                label=rf"$E={E}$ MeV ($E/m_e={E/me:.2f}$)")

    ax.axhline(1.0, color="0.6", lw=0.7, ls=":")
    ax.set_xlabel(r"ângulo de espalhamento $\theta$ (graus)")
    ax.set_ylabel(r"$E'/E$")
    ax.set_xlim(0, 180)
    ax.legend(fontsize=9.5, frameon=False, loc="upper right")
    ax.set_title("Espalhamento Compton: fração de energia do fóton espalhado",
                 fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_compton.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 4: foguete relativistico com aceleracao propria constante
# ---------------------------------------------------------------------
def fig_foguete(a0=1.0323, D=4.2465):
    """a0 em 1/ano (1g), D em anos-luz (distancia até Proxima Centauri)."""
    from scipy.optimize import brentq

    def meio_percurso(tau_h):
        return (1 / a0) * (np.cosh(a0 * tau_h) - 1) - D / 2

    tau_half = brentq(meio_percurso, 1e-3, 20)

    # perna de aceleracao: tau em [0, tau_half]
    tau1 = np.linspace(0, tau_half, 200)
    t1 = (1 / a0) * np.sinh(a0 * tau1)
    x1 = (1 / a0) * (np.cosh(a0 * tau1) - 1)

    # perna de desaceleracao, por simetria em torno do ponto medio
    t_mid, x_mid = t1[-1], x1[-1]
    tau2 = np.linspace(0, tau_half, 200)
    t2 = t_mid + ((1 / a0) * np.sinh(a0 * tau_half) - (1 / a0) * np.sinh(a0 * (tau_half - tau2)))
    x2 = x_mid + (x_mid - (1 / a0) * (np.cosh(a0 * (tau_half - tau2)) - 1))

    t = np.concatenate([t1, t2])
    x = np.concatenate([x1, x2])
    tau_total = 2 * tau_half
    t_total = t[-1]

    fig, ax = plt.subplots(figsize=(5.0, 5.2))
    ax.plot(t, x, color="#4C72B0", lw=2.0)
    ax.plot(t1[[0]], x1[[0]], "o", color="black", zorder=5)
    ax.plot([t[-1]], [x[-1]], "o", color="black", zorder=5)
    ax.plot(t1, t1, color="0.75", lw=1.0, ls="--")  # cone de luz t=x

    ax.annotate("partida (Terra)", (t[0], x[0]), textcoords="offset points",
                xytext=(10, 10), fontsize=9.5)
    ax.annotate("chegada\n(Proxima Centauri)", (t[-1], x[-1]),
                textcoords="offset points", xytext=(-120, -8), fontsize=9.5,
                ha="left", va="top")
    ax.annotate("meio do percurso\n(velocidade máxima)", (t_mid, x_mid),
                textcoords="offset points", xytext=(10, -30), fontsize=8.5,
                color="0.3")
    ax.plot([t_mid], [x_mid], "o", color="0.4", ms=4)

    ax.text(0.05, 0.82,
            rf"$\tau_{{\rm nave}}={tau_total:.2f}$ anos" "\n"
            rf"$t_{{\rm Terra}}={t_total:.2f}$ anos",
            transform=ax.transAxes, fontsize=10,
            bbox=dict(boxstyle="round", fc="white", ec="0.6"))

    ax.set_xlabel(r"$t$ (anos, referencial da Terra)")
    ax.set_ylabel(r"$x$ (anos-luz)")
    ax.set_ylim(-0.3, D * 1.28)
    ax.set_title(r"Foguete com aceleração própria $a_0=1g$ constante",
                 fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_foguete.pdf", bbox_inches="tight")
    plt.close(fig)

    return tau_total, t_total


# ---------------------------------------------------------------------
# Figura 5: classificacao dos vetores e ortogonalidade em Minkowski
# ---------------------------------------------------------------------
def fig_ortogonalidade():
    """Por que 'ortogonal' aqui nao quer dizer 'perpendicular no papel'.

    Painel esquerdo: o cone de luz separa os tres tipos de vetor, e a
    classificacao e' invariante porque o cone e' o mesmo para todos.

    Painel direito: a leitura geometrica da ortogonalidade. Dois vetores
    sao ortogonais quando um e' o REFLEXO do outro na linha de luz --
    equivalentemente, quando fazem angulos iguais com ela, em lados
    opostos. Dai o vetor nulo ser ortogonal a si mesmo: ele esta EM CIMA
    do espelho, e portanto e' o seu proprio reflexo.
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.4, 4.7))
    L = 2.35
    for ax in (ax1, ax2):
        ax.set_xlim(-L, L)
        ax.set_ylim(-0.45, L)
        ax.set_aspect("equal")
        ax.axhline(0, color="black", lw=0.6, zorder=1)
        ax.axvline(0, color="black", lw=0.6, zorder=1)
        ax.set_xlabel(r"$x$")
        ax.set_ylabel(r"$ct$")

    # ---------------- painel esquerdo: a classificacao ----------------
    ax1.plot([0, L], [0, L], color="0.45", lw=1.2, ls=(0, (6, 4)), zorder=2)
    ax1.plot([0, -L], [0, L], color="0.45", lw=1.2, ls=(0, (6, 4)), zorder=2)
    ax1.fill_between([-L, 0, L], [L, 0, L], [L, L, L], color="#4C72B0", alpha=0.07, zorder=0)

    for (vx, vy), cor, nome, sinal in [
        ((0.55, 1.75), "#4C72B0", "temporal", r"$\mathbf{A}\cdot\mathbf{A}<0$"),
        ((1.55, 1.55), "#2E7D32", "nulo",     r"$\mathbf{A}\cdot\mathbf{A}=0$"),
        ((1.95, 0.75), "#B0413E", "espacial", r"$\mathbf{A}\cdot\mathbf{A}>0$"),
    ]:
        ax1.annotate("", xy=(vx, vy), xytext=(0, 0),
                     arrowprops=dict(arrowstyle="-|>", color=cor, lw=2.0))
        ax1.annotate(f"{nome}\n{sinal}", xy=(vx, vy), xytext=(6, 4),
                     textcoords="offset points", fontsize=9.5, color=cor,
                     ha="left", va="bottom", path_effects=HALO)

    ax1.text(0, 2.05, "futuro", ha="center", fontsize=9.5, color="0.4",
             path_effects=HALO)
    ax1.set_title("O cone separa os três tipos — e o cone\n"
                  "é o mesmo para todo observador", fontsize=10.5)

    # ---------------- painel direito: a ortogonalidade ----------------
    # a linha de luz e' o ESPELHO: refletir nela troca (t,x) por (x,t)
    ax2.plot([0, L], [0, L], color="#2E7D32", lw=2.4, zorder=3)
    ax2.plot([0, -L], [0, L], color="0.78", lw=1.0, ls=(0, (6, 4)), zorder=2)

    phi = 0.62
    A = np.array([np.sinh(phi), np.cosh(phi)])      # (x, ct) temporal
    B = np.array([np.cosh(phi), np.sinh(phi)])      # o reflexo: espacial
    esc = 1.60
    for vec, cor, rot in [(A, "#4C72B0", r"$\mathbf{A}$"), (B, "#B0413E", r"$\mathbf{B}$")]:
        ax2.annotate("", xy=tuple(esc * vec), xytext=(0, 0),
                     arrowprops=dict(arrowstyle="-|>", color=cor, lw=2.2))
        ax2.annotate(rot, xy=tuple(esc * vec), xytext=(8, 4),
                     textcoords="offset points", fontsize=13, color=cor,
                     path_effects=HALO)

    # o vetor nulo, desenhado SOBRE o espelho
    N = np.array([1.0, 1.0]) / np.sqrt(2)
    ax2.annotate("", xy=tuple(1.15 * N), xytext=(0, 0),
                 arrowprops=dict(arrowstyle="-|>", color="#2E7D32", lw=2.2))
    ax2.annotate(r"$\mathbf{N}$", xy=tuple(1.15 * N), xytext=(10, -12),
                 textcoords="offset points", fontsize=13, color="#2E7D32",
                 path_effects=HALO)

    # os dois angulos ate' a bissetriz, iguais
    a_A = np.arctan2(A[1], A[0])
    a_B = np.arctan2(B[1], B[0])
    for de, ate, cor in [(np.pi / 4, a_A, "#4C72B0"), (a_B, np.pi / 4, "#B0413E")]:
        t = np.linspace(de, ate, 40)
        ax2.plot(1.42 * np.cos(t), 1.42 * np.sin(t), color=cor, lw=1.6, alpha=0.9)
    ax2.text(0.78, 1.68, r"$\theta$", fontsize=13, color="#4C72B0", path_effects=HALO)
    ax2.text(1.68, 0.78, r"$\theta$", fontsize=13, color="#B0413E", path_effects=HALO)

    ax2.text(-2.15, 1.66,
             "reflita na linha de luz\ne um vetor vira o outro:\n"
             r"$\mathbf{A}\cdot\mathbf{B}=0$",
             fontsize=9.2, color="0.30", ha="left", va="top", path_effects=HALO)
    ax2.text(-2.15, 0.62,
             r"$\mathbf{N}$ está sobre o espelho," "\n"
             "logo é o próprio reflexo\ne é ortogonal a si mesmo",
             fontsize=9.2, color="#2E7D32", ha="left", va="top", path_effects=HALO)

    ax2.set_title("Ortogonal aqui significa: um é o reflexo\ndo outro na linha de luz",
                  fontsize=10.5)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_ortogonalidade.pdf", bbox_inches="tight")
    plt.close(fig)

if __name__ == "__main__":
    fig_casca_de_massa()
    fig_colisor_vs_alvo_fixo()
    fig_compton()
    fig_ortogonalidade()
    tau_total, t_total = fig_foguete()
    print(f"Foguete: tau_total={tau_total:.4f} anos, t_total={t_total:.4f} anos")
    print("Figuras salvas em", OUTDIR)
