"""Ondas gravitacionais: anel de particulas, quadrupolo e inspiral.

Tres blocos independentes:

  1) deformacao de um anel de particulas teste pelas polarizacoes + e x,
     obtida da equacao de desvio geodesico em gauge TT;
  2) verificacao da formula do quadrupolo -- a potencia irradiada por uma
     binaria circular e' calculada derivando numericamente o momento de
     quadrupolo reduzido e comparada com a forma fechada
     P = (32/5) G^4 m1^2 m2^2 (m1+m2) / (c^5 a^5);
  3) inspiral: evolucao da frequencia, massa de chirp, amplitude e tempo
     ate' a coalescencia, validados contra PSR B1913+16 (Hulse-Taylor) e
     contra os parametros de GW150914.

Unidades SI em todo o script; as conversoes aparecem apenas na impressao.
"""

import numpy as np
from scipy.integrate import solve_ivp
import matplotlib as mpl
import matplotlib.pyplot as plt
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

# constantes (CODATA / IAU)
G = 6.67430e-11
C = 299792458.0
MSOL = 1.98892e30
PC = 3.0856775814913673e16
MPC = 1.0e6 * PC
DIA = 86400.0
ANO = 3.15576e7

# paleta da apostila
PETROLEO, AMBAR, TERRACOTA, GRAFITE = "#0E5A6B", "#C1832F", "#A6503C", "#3E4C54"
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
# 1) Anel de particulas teste em gauge TT
# ----------------------------------------------------------------------
def desloca_anel(theta, h_mais, h_vezes, raio=1.0):
    """Posicao de particulas de um anel sob uma onda em gauge TT.

    Em gauge TT as coordenadas das particulas livres NAO mudam; o que muda
    e' a distancia propria. A elipse abaixo e' o lugar geometrico dos
    pontos a distancia propria constante, que e' o que um interferometro
    mede:  delta x^i = (1/2) h^TT_ij x^j.
    """
    x0, y0 = raio * np.cos(theta), raio * np.sin(theta)
    x = x0 + 0.5 * (h_mais * x0 + h_vezes * y0)
    y = y0 + 0.5 * (h_vezes * x0 - h_mais * y0)
    return x, y


def figura_anel():
    theta = np.linspace(0.0, 2.0 * np.pi, 400)
    fases = [0.0, 0.25, 0.5, 0.75]
    h = 0.45                       # amplitude exagerada para visualizacao
    fig, axs = plt.subplots(2, 4, figsize=(9.4, 4.9))
    for j, frac in enumerate(fases):
        fase = 2.0 * np.pi * frac
        for i, (rot, cor, nome) in enumerate(
                [(0.0, PETROLEO, r"polarização $+$"),
                 (1.0, AMBAR, r"polarização $\times$")]):
            hp = h * np.cos(fase) * (1.0 - rot)
            hx = h * np.cos(fase) * rot
            ax = axs[i, j]
            ax.plot(*desloca_anel(theta, 0.0, 0.0), color=GRAFITE,
                    lw=0.7, ls=":", alpha=0.8)
            ax.plot(*desloca_anel(theta, hp, hx), color=cor, lw=1.8)
            pts = np.linspace(0.0, 2.0 * np.pi, 12, endpoint=False)
            ax.plot(*desloca_anel(pts, hp, hx), "o", color=cor, ms=3.2)
            ax.set_xlim(-1.6, 1.6)
            ax.set_ylim(-1.6, 1.6)
            ax.set_aspect("equal")
            ax.set_xticks([])
            ax.set_yticks([])
            for lado in ("left", "bottom"):
                ax.spines[lado].set_visible(False)
            if j == 0:
                ax.set_ylabel(nome, color=cor)
            if i == 0:
                ax.set_title(rf"$\omega t = {frac:.2f}\times 2\pi$")
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap09_anel_polarizacoes.pdf", bbox_inches="tight")
    plt.close(fig)


# ----------------------------------------------------------------------
# 2) Formula do quadrupolo, verificada por derivacao numerica
# ----------------------------------------------------------------------
def quadrupolo_reduzido(t, m1, m2, a):
    """Q_ij sem traco de uma binaria circular de separacao a, no plano xy."""
    mu = m1 * m2 / (m1 + m2)
    omega = np.sqrt(G * (m1 + m2) / a**3)
    x, y = a * np.cos(omega * t), a * np.sin(omega * t)
    Q = np.zeros((3, 3))
    pos = np.array([x, y, 0.0])
    for i in range(3):
        for j in range(3):
            Q[i, j] = mu * (pos[i] * pos[j] - (i == j) * a**2 / 3.0)
    return Q


def terceira_derivada(f, t, h):
    """Estencil de 7 pontos, erro O(h^4)."""
    return (-f(t - 3*h) + 8*f(t - 2*h) - 13*f(t - h)
            + 13*f(t + h) - 8*f(t + 2*h) + f(t + 3*h)) / (8.0 * h**3)


def potencia_numerica(m1, m2, a, t=0.0):
    omega = np.sqrt(G * (m1 + m2) / a**3)
    h = (2.0 * np.pi / omega) / 400.0
    d3Q = terceira_derivada(lambda s: quadrupolo_reduzido(s, m1, m2, a), t, h)
    return (G / (5.0 * C**5)) * np.sum(d3Q * d3Q)


def potencia_fechada(m1, m2, a):
    return (32.0 / 5.0) * G**4 * m1**2 * m2**2 * (m1 + m2) / (C**5 * a**5)


# ----------------------------------------------------------------------
# 3) Inspiral
# ----------------------------------------------------------------------
def massa_chirp(m1, m2):
    return (m1 * m2) ** (3.0 / 5.0) / (m1 + m2) ** (1.0 / 5.0)


def dfdt(f, Mc):
    """Taxa de variacao da frequencia da ONDA (f_gw = 2 f_orb)."""
    return (96.0 / 5.0) * np.pi ** (8.0 / 3.0) \
        * (G * Mc / C**3) ** (5.0 / 3.0) * f ** (11.0 / 3.0)


def tempo_ate_coalescer(f, Mc):
    """Forma fechada obtida integrando dfdt de f ate' infinito."""
    return (5.0 / 256.0) * (G * Mc / C**3) ** (-5.0 / 3.0) \
        * (np.pi * f) ** (-8.0 / 3.0)


def amplitude(f, Mc, d):
    """Amplitude h da onda, media sobre orientacoes ja' embutida no fator 4."""
    return (4.0 / d) * (G * Mc / C**2) ** (5.0 / 3.0) * (np.pi * f / C) ** (2.0 / 3.0)


def f_isco(mtot):
    """Frequencia da onda na ISCO: f_gw = c^3 / (6^(3/2) pi G M)."""
    return C**3 / (6.0 ** 1.5 * np.pi * G * mtot)


def decaimento_periodo(m1, m2, Pb, e):
    """dP_b/dt pela formula de Peters (1964), com o realce de excentricidade."""
    fe = (1.0 + 73.0 / 24.0 * e**2 + 37.0 / 96.0 * e**4) / (1.0 - e**2) ** 3.5
    return (-192.0 * np.pi / 5.0) * (2.0 * np.pi * G / Pb) ** (5.0 / 3.0) \
        * m1 * m2 / (m1 + m2) ** (1.0 / 3.0) / C**5 * fe


def figura_chirp(m1, m2, d):
    Mc = massa_chirp(m1, m2)
    f0, ff = 20.0, f_isco(m1 + m2)
    sol = solve_ivp(lambda t, y: dfdt(y[0], Mc), [0.0, 10.0], [f0],
                    max_step=1e-3, rtol=1e-10, atol=1e-12, dense_output=True,
                    events=[lambda t, y: y[0] - ff])
    sol.t_events[0][0]
    tfim = sol.t_events[0][0]
    t = np.linspace(0.0, tfim, 6000)
    f = sol.sol(t)[0]
    fase = 2.0 * np.pi * np.cumsum(f) * (t[1] - t[0])
    h = amplitude(f, Mc, d) * np.cos(fase)

    fig, axs = plt.subplots(2, 1, figsize=(6.6, 4.4), sharex=True,
                            gridspec_kw={"height_ratios": [2, 1]})
    axs[0].plot(t - tfim, h * 1e21, color=PETROLEO, lw=0.9)
    axs[0].set_ylabel(r"$h \times 10^{21}$")
    axs[0].set_title("Inspiral de uma binária de "
                     rf"${m1/MSOL:.0f}+{m2/MSOL:.0f}\,M_\odot$ a "
                     rf"${d/MPC:.0f}$ Mpc")
    axs[1].plot(t - tfim, f, color=AMBAR, lw=1.6)
    axs[1].axhline(ff, color=TERRACOTA, lw=0.9, ls="--")
    axs[1].text(t[0] - tfim, ff * 1.06, rf"$f_{{\rm ISCO}}={ff:.0f}$ Hz",
                color=TERRACOTA, fontsize=8)
    axs[1].set_ylabel(r"$f_{\rm gw}$ [Hz]")
    axs[1].set_xlabel("tempo até a coalescência [s]")
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap09_chirp.pdf", bbox_inches="tight")
    plt.close(fig)
    return tfim, Mc, ff


# ----------------------------------------------------------------------
if __name__ == "__main__":
    print("== Formula do quadrupolo: numerico vs fechado ==")
    m1, m2 = 1.4 * MSOL, 1.4 * MSOL
    print(f"{'a [km]':>10}{'P numerico [W]':>18}{'P fechado [W]':>18}{'erro rel.':>12}")
    for a_km in (1e5, 1e6, 1e7):
        a = a_km * 1e3
        pn, pf = potencia_numerica(m1, m2, a), potencia_fechada(m1, m2, a)
        print(f"{a_km:10.0f}{pn:18.6e}{pf:18.6e}{abs(pn/pf - 1):12.2e}")

    print("\n-- para comparacao, o sistema Terra-Sol --")
    mT, mS, aTS = 5.9722e24, 1.98892e30, 1.495978707e11
    print(f"P (Terra-Sol) = {potencia_fechada(mS, mT, aTS):.1f} W"
          f"   (a luminosidade do Sol e' 3.8e26 W)")

    print("\n== PSR B1913+16 (Hulse-Taylor): teste da formula ==")
    m1h, m2h = 1.4414 * MSOL, 1.3867 * MSOL
    Pb, ecc = 0.322997448918 * DIA, 0.6171334
    dPdt = decaimento_periodo(m1h, m2h, Pb, ecc)
    obs_bruto, obs_corrigido = -2.423e-12, -2.398e-12
    print(f"dP_b/dt previsto pela RG  = {dPdt:.4e}")
    print(f"dP_b/dt observado (bruto) = {obs_bruto:.4e}")
    print(f"dP_b/dt observado, ja' descontada a aceleracao galactica"
          f" = {obs_corrigido:.4e}")
    print(f"razao previsto/observado = {dPdt / obs_corrigido:.4f}")
    fe = (1 + 73/24*ecc**2 + 37/96*ecc**4) / (1 - ecc**2)**3.5
    print(f"realce por excentricidade f(e) = {fe:.2f}"
          f"   (orbita circular irradiaria {fe:.0f}x menos)")

    print("\n== Binaria tipo GW150914 ==")
    mA, mB, dist = 36.0 * MSOL, 29.0 * MSOL, 410.0 * MPC
    Mc = massa_chirp(mA, mB)
    print(f"massa de chirp M_c = {Mc/MSOL:.2f} M_sol")
    print(f"f_gw na ISCO       = {f_isco(mA + mB):.1f} Hz")
    print(f"{'f [Hz]':>8}{'t ate coalescer [s]':>22}{'h':>14}")
    for f in (20.0, 35.0, 70.0, 130.0):
        print(f"{f:8.0f}{tempo_ate_coalescer(f, Mc):22.3f}{amplitude(f, Mc, dist):14.3e}")

    tfim, _, fisco = figura_chirp(mA, mB, dist)
    print(f"integracao numerica de 20 Hz ate' a ISCO: {tfim:.3f} s")
    print(f"forma fechada (20 Hz -> infinito):        "
          f"{tempo_ate_coalescer(20.0, Mc):.3f} s")

    figura_anel()
    print(f"\nFiguras salvas em {OUTDIR}")
