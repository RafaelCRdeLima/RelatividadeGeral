"""Buracos negros: cones de luz, Kruskal, mares, Hawking e Kerr.

Quatro blocos:

  1) inclinacao dos cones de luz em Schwarzschild e em Eddington-Finkelstein
     entrante -- a mesma geometria, dois mapas, um deles regular em r = 2M;
  2) diagrama de Kruskal-Szekeres: horizontes, singularidade e curvas de
     r e t constantes;
  3) mares no horizonte: por que um buraco negro estelar destroi quem cai e
     um supermassivo nao;
  4) termodinamica (T_H, S, tempo de evaporacao) e Kerr (horizontes,
     ergosfera, ISCO e eficiencia de acrecao em funcao do spin).

Os blocos 1 e 2 usam G = c = M = 1. Os blocos 3 e 4 usam SI e imprimem em
unidades astronomicas.
"""

import numpy as np
from scipy.optimize import brentq
import matplotlib as mpl
import matplotlib.pyplot as plt
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

G = 6.67430e-11
C = 299792458.0
HBAR = 1.054571817e-34
KB = 1.380649e-23
MSOL = 1.98892e30
ANO = 3.15576e7

PETROLEO, AMBAR, TERRACOTA, GRAFITE = "#0E5A6B", "#C1832F", "#A6503C", "#3E4C54"
LINHA = "#D6DEE1"
mpl.rcParams.update({
    "font.family": "serif",
    "font.serif": ["TeX Gyre Pagella", "Palatino", "DejaVu Serif"],
    "mathtext.fontset": "dejavuserif",
    "axes.edgecolor": GRAFITE, "axes.labelcolor": GRAFITE,
    "xtick.color": GRAFITE, "ytick.color": GRAFITE, "text.color": GRAFITE,
    "axes.spines.top": False, "axes.spines.right": False,
    "font.size": 9, "axes.titlesize": 10,
})

M = 1.0


# ----------------------------------------------------------------------
# 1) Cones de luz: Schwarzschild x Eddington-Finkelstein entrante
# ----------------------------------------------------------------------
def inclinacoes_schwarzschild(r):
    """dt/dr dos dois raios nulos radiais em coordenadas de Schwarzschild."""
    f = 1.0 - 2.0 * M / r
    return 1.0 / f, -1.0 / f          # saindo, entrando


def inclinacoes_ef(r):
    """dv/dr dos dois raios nulos radiais em EF entrante (v = t + r*).

    ds^2 = 0 com v constante (entrando)  ->  dv/dr = 0
    o outro ramo                          ->  dv/dr = 2/(1 - 2M/r)
    """
    f = 1.0 - 2.0 * M / r
    return (np.inf if f == 0.0 else 2.0 / f), 0.0


def direcoes_futuras_ef(r):
    """Os dois vetores nulos radiais que apontam para o futuro em EF entrante.

    Um deles e' sempre (dr, dv) = (-1, 0): o raio entrante, que em EF e'
    simplesmente v = const. O outro satisfaz dv/dr = 2/(1 - 2M/r) e deve
    ser orientado de modo que dv > 0, ja' que v cresce para o futuro.
    """
    f = 1.0 - 2.0 * M / r
    entrante = np.array([-1.0, 0.0])
    if f == 0.0:
        saindo = np.array([0.0, 1.0])          # preso sobre o horizonte
    elif f > 0.0:
        saindo = np.array([1.0, 2.0 / f])      # escapa
    else:
        saindo = np.array([-1.0, -2.0 / f])    # tambem cai
    return entrante, saindo / np.linalg.norm(saindo)


def figura_cones():
    fig, axs = plt.subplots(1, 2, figsize=(9.2, 4.3))

    # --- painel A: Schwarzschild, valido apenas fora do horizonte --------
    ax = axs[0]
    dt = 0.9
    for r in (2.15, 2.5, 3.2, 4.2, 5.4, 6.4):
        f = 1.0 - 2.0 * M / r
        ax.fill([r, r - f * dt, r + f * dt], [0.0, dt, dt],
                color=PETROLEO, alpha=0.20, lw=0)
        ax.plot([r, r + f * dt], [0.0, dt], color=PETROLEO, lw=1.3)
        ax.plot([r, r - f * dt], [0.0, dt], color=AMBAR, lw=1.3)
        ax.plot(r, 0.0, "o", color=GRAFITE, ms=2.6)
    ax.axvspan(0.8, 2.0, color=LINHA, alpha=0.6, lw=0)
    ax.axvline(2.0, color=TERRACOTA, lw=1.3, ls="--")
    ax.text(1.4, 0.62, "fora da carta", color=TERRACOTA, fontsize=8.5,
            ha="center")
    ax.text(2.1, -0.52, r"$r=2M$", color=TERRACOTA, fontsize=9)
    ax.set_xlim(0.8, 7.0)
    ax.set_ylim(-0.7, 1.1)
    ax.set_xlabel(r"$r/M$")
    ax.set_ylabel(r"$t/M$")
    ax.set_title("Schwarzschild: o cone fecha e a carta acaba")

    # --- painel B: EF entrante, a mesma geometria atravessando o horizonte
    ax = axs[1]
    L = 0.60
    for r in (1.15, 1.55, 2.0, 2.5, 3.2, 4.2, 5.4, 6.4):
        d1, d2 = direcoes_futuras_ef(r)
        p1 = np.array([r, 0.0]) + L * d1
        p2 = np.array([r, 0.0]) + L * d2
        ax.fill([r, p1[0], p2[0]], [0.0, p1[1], p2[1]],
                color=PETROLEO, alpha=0.20, lw=0)
        ax.plot([r, p2[0]], [0.0, p2[1]], color=PETROLEO, lw=1.6)
        ax.plot([r, p1[0]], [0.0, p1[1]], color=AMBAR, lw=2.4)
        ax.plot(r, 0.0, "o", color=GRAFITE, ms=2.6)
    ax.axvline(2.0, color=TERRACOTA, lw=1.3, ls="--")
    ax.text(2.1, -0.52, r"$r=2M$", color=TERRACOTA, fontsize=9)
    ax.annotate("raio entrante:\n$v$ constante", xy=(5.9, 0.0),
                xytext=(4.7, -0.55), color=AMBAR, fontsize=8,
                arrowprops=dict(arrowstyle="->", color=AMBAR, lw=0.8))
    ax.annotate("raio saindo", xy=(2.72, 0.5), xytext=(3.3, 0.86),
                color=PETROLEO, fontsize=8,
                arrowprops=dict(arrowstyle="->", color=PETROLEO, lw=0.8))
    ax.set_xlim(0.8, 7.0)
    ax.set_ylim(-0.7, 1.1)
    ax.set_xlabel(r"$r/M$")
    ax.set_ylabel(r"$v/M$")
    ax.set_title("Eddington--Finkelstein: o cone apenas tomba")
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap11_cones_luz.pdf", bbox_inches="tight")
    plt.close(fig)


# ----------------------------------------------------------------------
# 2) Diagrama de Kruskal-Szekeres
# ----------------------------------------------------------------------
def kruskal_exterior(r, t):
    """Regiao I (r > 2M): T e X a partir de (r, t)."""
    raiz = np.sqrt(r / (2.0 * M) - 1.0) * np.exp(r / (4.0 * M))
    return raiz * np.sinh(t / (4.0 * M)), raiz * np.cosh(t / (4.0 * M))


def kruskal_interior(r, t):
    """Regiao II (r < 2M)."""
    raiz = np.sqrt(1.0 - r / (2.0 * M)) * np.exp(r / (4.0 * M))
    return raiz * np.cosh(t / (4.0 * M)), raiz * np.sinh(t / (4.0 * M))


def figura_kruskal():
    fig, ax = plt.subplots(figsize=(5.6, 5.2))
    lim = 2.0

    # singularidade r = 0:  T^2 - X^2 = 1
    X = np.linspace(-lim, lim, 400)
    ax.plot(X, np.sqrt(1.0 + X**2), color=TERRACOTA, lw=2.2)
    ax.plot(X, -np.sqrt(1.0 + X**2), color=TERRACOTA, lw=2.2, alpha=0.45)
    ax.text(0.0, 1.13, r"singularidade  $r=0$", color=TERRACOTA,
            ha="center", va="bottom", fontsize=8.5)

    # horizontes T = +- X
    ax.plot([-lim, lim], [-lim, lim], color=PETROLEO, lw=1.6)
    ax.plot([-lim, lim], [lim, -lim], color=PETROLEO, lw=1.6)
    ax.text(1.72, 1.60, r"$r=2M$", color=PETROLEO, fontsize=9,
            rotation=45, ha="center", va="bottom")

    # uma linha de mundo que cai: cruza o horizonte sem nada de especial
    tq = np.linspace(-1.5, 1.5, 300)
    Xq = 1.35 - 0.16 * (tq + 1.5) ** 2
    ok = (Xq > 0.05) & (np.abs(tq) < np.sqrt(1.0 + Xq**2))
    ax.plot(Xq[ok], tq[ok], color=AMBAR, lw=1.8)
    ax.text(0.62, -1.05, "quem cai", color=AMBAR, fontsize=8.5)

    # curvas de r constante
    t = np.linspace(-30.0, 30.0, 800)
    for r in (2.5, 3.5, 5.0):
        T, Xc = kruskal_exterior(r, t)
        ok = (abs(T) < lim) & (abs(Xc) < lim)
        ax.plot(Xc[ok], T[ok], color=GRAFITE, lw=0.8, ls="--")
        ax.plot(-Xc[ok], T[ok], color=GRAFITE, lw=0.8, ls="--", alpha=0.4)
    for r in (0.8, 1.4):
        T, Xc = kruskal_interior(r, t)
        ok = (abs(T) < lim) & (abs(Xc) < lim)
        ax.plot(Xc[ok], T[ok], color=GRAFITE, lw=0.8, ls="--")

    # curvas de t constante (retas pela origem)
    for tt in (2.0, 6.0, 14.0):
        s = np.tanh(tt / (4.0 * M))
        ax.plot([-lim, lim], [-lim * s, lim * s], color=LINHA, lw=0.8)
        ax.plot([-lim * s, lim * s], [-lim, lim], color=LINHA, lw=0.8)

    for txt, (x, y) in (("I", (1.35, 0.0)), ("II", (0.0, 0.75)),
                        ("III", (-1.4, 0.0)), ("IV", (0.0, -0.75))):
        ax.text(x, y, txt, color=GRAFITE, fontsize=11, ha="center",
                style="italic")

    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)
    ax.set_aspect("equal")
    ax.set_xlabel(r"$X$")
    ax.set_ylabel(r"$T$")
    ax.set_title("Kruskal--Szekeres: raios de luz radiais a $45^\\circ$")
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap11_kruskal.pdf", bbox_inches="tight")
    plt.close(fig)


# ----------------------------------------------------------------------
# 3) Mares no horizonte
# ----------------------------------------------------------------------
def mare_radial(massa_kg, r_m, comprimento_m):
    """Aceleracao de mare radial: 2GM/r^3 vezes a separacao propria."""
    return 2.0 * G * massa_kg * comprimento_m / r_m**3


def raio_horizonte(massa_kg):
    return 2.0 * G * massa_kg / C**2


# ----------------------------------------------------------------------
# 4) Termodinamica e Kerr
# ----------------------------------------------------------------------
def temperatura_hawking(massa_kg):
    return HBAR * C**3 / (8.0 * np.pi * G * massa_kg * KB)


def entropia(massa_kg):
    A = 4.0 * np.pi * raio_horizonte(massa_kg) ** 2
    return KB * C**3 * A / (4.0 * G * HBAR)


def tempo_evaporacao(massa_kg):
    return 5120.0 * np.pi * G**2 * massa_kg**3 / (HBAR * C**4)


def r_isco_kerr(a, prograda=True):
    """ISCO de Kerr no plano equatorial, com M = 1 e 0 <= a < 1."""
    Z1 = 1.0 + (1.0 - a*a) ** (1.0/3.0) * ((1.0 + a) ** (1.0/3.0)
                                           + (1.0 - a) ** (1.0/3.0))
    Z2 = np.sqrt(3.0 * a * a + Z1 * Z1)
    s = -1.0 if prograda else 1.0
    return 3.0 + Z2 + s * np.sqrt((3.0 - Z1) * (3.0 + Z1 + 2.0 * Z2))


def eficiencia_kerr(a, prograda=True):
    """1 - E_ISCO, a fracao da massa de repouso irradiavel por um disco fino."""
    r = r_isco_kerr(a, prograda)
    sa = a if prograda else -a
    E = (r*r - 2.0*r + sa*np.sqrt(r)) / (r * np.sqrt(r*r - 3.0*r + 2.0*sa*np.sqrt(r)))
    return 1.0 - E


# ----------------------------------------------------------------------
if __name__ == "__main__":
    print("== Mares: 2GM dx / r^3, avaliada no proprio horizonte ==")
    print(f"{'objeto':<26}{'M/M_sol':>12}{'r_s [km]':>12}"
          f"{'mare em 1.8 m [g]':>20}")
    for nome, mm in (("estelar", 10.0), ("Cygnus X-1", 21.0),
                     ("Sgr A*", 4.297e6), ("M87*", 6.5e9)):
        mkg = mm * MSOL
        rs = raio_horizonte(mkg)
        g_mare = mare_radial(mkg, rs, 1.8) / 9.80665
        print(f"{nome:<26}{mm:12.3g}{rs/1e3:12.4g}{g_mare:20.3g}")
    print("a mare no horizonte cai como 1/M^2: o horizonte de um supermassivo")
    print("e' um lugar inteiramente pacifico para um corpo humano.")

    print("\n== Termodinamica ==")
    print(f"{'M/M_sol':>12}{'T_H [K]':>14}{'S/k_B':>14}"
          f"{'t_evap [anos]':>16}")
    for mm in (1.0, 10.0, 4.297e6):
        mkg = mm * MSOL
        print(f"{mm:12.4g}{temperatura_hawking(mkg):14.4g}"
              f"{entropia(mkg)/KB:14.4g}{tempo_evaporacao(mkg)/ANO:16.4g}")
    T_cmb = 2.7255
    m_eq = HBAR * C**3 / (8.0 * np.pi * G * KB * T_cmb)
    print(f"buraco negro em equilibrio com a CMB (T = {T_cmb} K):")
    print(f"  M = {m_eq/MSOL:.4g} M_sol = {m_eq:.4g} kg"
          f"   (~{m_eq/7.342e22:.3g} massas lunares)")
    print("  acima disso, todo buraco negro do Universo hoje ABSORVE mais do")
    print("  que irradia: a evaporacao so' comeca quando a CMB esfriar.")

    print("\n== Kerr: horizontes, ergosfera e eficiencia (M = 1) ==")
    print(f"{'a/M':>6}{'r_+':>9}{'r_-':>9}{'r_ergo(eq)':>12}"
          f"{'ISCO prog':>11}{'ISCO retr':>11}{'eficiencia':>12}")
    for a in (0.0, 0.5, 0.9, 0.99, 0.998):
        rp = 1.0 + np.sqrt(1.0 - a*a)
        rm = 1.0 - np.sqrt(1.0 - a*a)
        print(f"{a:6.3f}{rp:9.4f}{rm:9.4f}{2.0:12.1f}"
              f"{r_isco_kerr(a):11.4f}{r_isco_kerr(a, False):11.4f}"
              f"{100*eficiencia_kerr(a):11.2f}%")
    print("a ISCO prograda de a -> 1 tende a M e a eficiencia a 1 - 1/sqrt(3):")
    print(f"  limite extremo: {100*(1 - 1/np.sqrt(3)):.2f}%")
    print("valor de Thorne para acrecao com fotons de retorno, a = 0.998:"
          f" {100*eficiencia_kerr(0.998):.1f}%")

    print("\n== Kretschmann no horizonte: K = 48 M^2 / r^6 ==")
    for mm in (10.0, 4.297e6):
        mgeo = G * mm * MSOL / C**2          # M em metros
        K = 48.0 * mgeo**2 / (2.0 * mgeo) ** 6
        print(f"M = {mm:9.4g} M_sol:  K(r_s) = {K:.4g} m^-4"
              f"   -> raio de curvatura {K**-0.25/1e3:.4g} km")

    figura_cones()
    figura_kruskal()
    print(f"\nFiguras salvas em {OUTDIR}")
