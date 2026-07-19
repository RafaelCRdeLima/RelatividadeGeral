"""Gera as figuras do Capitulo 2 (Relatividade especial) da apostila.

Uso:
    python3 cap02_figuras.py

Salva os PDFs em ../figuras/. Unidades geometrizadas (c=1).
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

plt.rcParams.update({
    "font.family": "serif",
    "mathtext.fontset": "cm",
    "font.size": 12,
    "axes.linewidth": 0.9,
})


def novo_eixo(xlim=(-3, 3), ylim=(-3, 3)):
    fig, ax = plt.subplots(figsize=(4.6, 4.6))
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    ax.set_aspect("equal")
    ax.axhline(0, color="black", lw=0.6, zorder=1)
    ax.axvline(0, color="black", lw=0.6, zorder=1)
    ax.set_xlabel(r"$x$")
    ax.set_ylabel(r"$ct$")
    return fig, ax


# ---------------------------------------------------------------------
# Figura 1: cone de luz e estrutura causal
# ---------------------------------------------------------------------
def fig_cone_luz():
    fig, ax = novo_eixo((-3, 3), (-3, 3))

    x = np.linspace(-3, 3, 200)
    ax.plot(x, np.abs(x), color="0.15", lw=1.4)
    ax.plot(x, -np.abs(x), color="0.15", lw=1.4)

    # regiao causal futura/passada (preenchimento leve)
    ax.fill_between(x, np.abs(x), 3, color="#4C72B0", alpha=0.12, lw=0)
    ax.fill_between(x, -np.abs(x), -3, color="#4C72B0", alpha=0.12, lw=0)
    ax.fill_betweenx(x, np.abs(x), 3, where=(x >= -3), color="#DD8452", alpha=0.10, lw=0)

    ax.text(0, 2.55, "futuro causal", ha="center", fontsize=10.5)
    ax.text(0, -2.75, "passado causal", ha="center", fontsize=10.5)
    ax.text(2.15, 0.15, "alhures", ha="center", fontsize=10.5)
    ax.text(-2.15, 0.15, "alhures", ha="center", fontsize=10.5)

    # eventos de exemplo (retomam os Exemplos resolvidos do texto)
    ax.plot([0], [0], "o", color="black", ms=4, zorder=5)
    ax.annotate("$O$", (0, 0), textcoords="offset points", xytext=(-10, -14))

    ax.plot([0.6], [2.0], "o", color="#2E7D32", ms=5, zorder=5)
    ax.annotate(r"temporal ($\Delta s^2<0$)", (0.6, 2.0), textcoords="offset points",
                xytext=(8, -4), fontsize=9.5, color="#2E7D32")

    ax.plot([2.0], [0.7], "o", color="#B0413E", ms=5, zorder=5)
    ax.annotate(r"espacial ($\Delta s^2>0$)", (2.0, 0.7), textcoords="offset points",
                xytext=(-70, 8), fontsize=9.5, color="#B0413E")

    ax.plot([1.4], [1.4], "o", color="black", ms=5, zorder=5)
    ax.annotate(r"nula ($\Delta s^2=0$)", (1.4, 1.4), textcoords="offset points",
                xytext=(6, 6), fontsize=9.5)

    ax.set_title("Cone de luz e estrutura causal", fontsize=12)
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_cone_luz.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 2: relatividade da simultaneidade (eixos de S e de S')
# ---------------------------------------------------------------------
def fig_simultaneidade(v=0.5):
    gamma = 1 / np.sqrt(1 - v**2)
    fig, ax = novo_eixo((-3, 3), (-3, 3))

    # eixos de S: ja desenhados por novo_eixo (linhas pretas em x=0 e ct=0)
    ax.text(2.85, -0.28, "$x$", fontsize=12)
    ax.text(0.12, 2.75, "$ct$", fontsize=12)

    # eixo ct' (reta x = v*ct, ou seja x/ct = v) e eixo x' (reta ct = v*x)
    s = np.linspace(-2.6, 2.6, 50)
    ax.plot(v * s, s, color="#4C72B0", lw=1.3)
    ax.plot(s, v * s, color="#4C72B0", lw=1.3)
    ax.text(v * 2.6 + 0.08, 2.6, "$ct'$", color="#4C72B0", fontsize=12)
    ax.text(2.7, v * 2.6 - 0.05, "$x'$", color="#4C72B0", fontsize=12)

    # dois eventos simultaneos em S (mesma ct), unidos por uma reta de simultaneidade de S
    ctA, xA = 1.2, -1.6
    ctB, xB = 1.2, 1.6
    ax.plot([xA, xB], [ctA, ctB], color="black", lw=1.1, ls="--")
    ax.plot([xA, xB], [ctA, ctB], "o", color="black", ms=5, zorder=5)
    ax.annotate("$A$", (xA, ctA), textcoords="offset points", xytext=(-14, 4))
    ax.annotate("$B$", (xB, ctB), textcoords="offset points", xytext=(6, 4))

    # reta de simultaneidade de S' passando por A: ct - ctA = v (x - xA)
    xs = np.linspace(-2.9, 2.9, 50)
    cts = ctA + v * (xs - xA)
    mask = (cts > -2.9) & (cts < 2.9)
    ax.plot(xs[mask], cts[mask], color="#4C72B0", lw=1.1, ls=":")

    ax.set_title(rf"Simultaneidade relativa ($v={v}\,c$)", fontsize=12)
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_simultaneidade.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 3: paradoxo dos gemeos com marcacao de tempo proprio
# ---------------------------------------------------------------------
def fig_paradoxo_gemeos(v=0.8, T=10.0, n_ticks=10):
    gamma = 1 / np.sqrt(1 - v**2)

    fig, ax = plt.subplots(figsize=(4.8, 5.4))
    ax.set_xlim(-4.5, 4.5)
    ax.set_ylim(-0.5, T + 1)
    ax.set_xlabel(r"$x$")
    ax.set_ylabel(r"$ct$")

    # gemeo que fica em casa: x=0
    ax.plot([0, 0], [0, T], color="#B0413E", lw=1.8, label="gêmeo que fica em casa")
    for k in range(n_ticks + 1):
        ct = k * T / n_ticks
        ax.plot([-0.08, 0.08], [ct, ct], color="#B0413E", lw=1.2)

    # gemeo viajante: vai com +v ate T/2, volta com -v
    ct_out = np.array([0, T / 2])
    x_out = v * ct_out
    ct_in = np.array([T / 2, T])
    x_in = v * (T - ct_in)
    ax.plot(x_out, ct_out, color="#4C72B0", lw=1.8, label="gêmeo viajante")
    ax.plot(x_in, ct_in, color="#4C72B0", lw=1.8)

    # marcas de tempo proprio do viajante: espacadas por dtau = (T/n_ticks)/gamma em ct
    dtau_ct = (T / n_ticks) / gamma
    ct_marks = np.arange(0, T / 2 + 1e-9, dtau_ct)
    for ct in ct_marks:
        x = v * ct
        ax.plot(x, ct, "|", color="#4C72B0", ms=10, mew=1.4)
    ct_marks2 = T - np.arange(0, T / 2 + 1e-9, dtau_ct)[::-1]
    for ct in ct_marks2:
        x = v * (T - ct)
        ax.plot(x, ct, "|", color="#4C72B0", ms=10, mew=1.4)

    ax.plot([0], [0], "o", color="black", zorder=5)
    ax.plot([0], [T], "o", color="black", zorder=5)
    ax.annotate("partida", (0, 0), textcoords="offset points", xytext=(-40, -4))
    ax.annotate("reencontro", (0, T), textcoords="offset points", xytext=(-45, 4))

    tau_viajante = T * np.sqrt(1 - v**2)
    ax.text(-4.3, T * 0.5, rf"$\tau_{{\rm casa}}={T:.0f}$" + "\n"
            rf"$\tau_{{\rm viajante}}={tau_viajante:.2f}$", fontsize=10,
            va="center", bbox=dict(boxstyle="round", fc="white", ec="0.6"))

    ax.legend(loc="upper left", fontsize=9, frameon=False, bbox_to_anchor=(1.0, 0.65))
    ax.set_title(rf"Paradoxo dos gêmeos ($v={v}\,c$)"
                 "\n" r"marcas a intervalos iguais de $\tau$", fontsize=11)
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_paradoxo_gemeos.pdf", bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    fig_cone_luz()
    fig_simultaneidade()
    fig_paradoxo_gemeos()
    print("Figuras salvas em", OUTDIR)
