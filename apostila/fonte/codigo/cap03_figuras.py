"""Gera as figuras do Capitulo 3 (Vetores e momento relativistico).

Uso:
    python3 cap03_figuras.py

Salva os PDFs em ../figuras/. Unidades geometrizadas (c=1).
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
    fig.savefig(OUTDIR / "cap03_casca_massa.pdf", bbox_inches="tight")
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
    fig.savefig(OUTDIR / "cap03_colisor_alvo_fixo.pdf", bbox_inches="tight")
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
    fig.savefig(OUTDIR / "cap03_compton.pdf", bbox_inches="tight")
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
    fig.savefig(OUTDIR / "cap03_foguete.pdf", bbox_inches="tight")
    plt.close(fig)

    return tau_total, t_total


if __name__ == "__main__":
    fig_casca_de_massa()
    fig_colisor_vs_alvo_fixo()
    fig_compton()
    tau_total, t_total = fig_foguete()
    print(f"Foguete: tau_total={tau_total:.4f} anos, t_total={t_total:.4f} anos")
    print("Figuras salvas em", OUTDIR)
