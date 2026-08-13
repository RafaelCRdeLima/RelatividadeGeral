"""Geodesicas no plano equatorial de Schwarzschild.

Unidades geometrizadas G = c = 1 e M = 1, de modo que r e' medido em massas
gravitacionais (r = 6 significa r = 6GM/c^2). Para uma particula massiva,
com E e L conservados por unidade de massa de repouso,

    (dr/dtau)^2 = E^2 - V(r),      V(r) = (1 - 2M/r) (1 + L^2/r^2),

e a equacao radial exata, obtida derivando a expressao acima, e'

    d^2r/dtau^2 = -M/r^2 + L^2/r^3 - 3 M L^2/r^4.

Integramos essa forma (e nao a raiz quadrada) para atravessar os pontos de
retorno sem problema de sinal.
"""

import numpy as np
from scipy.integrate import solve_ivp, quad
from scipy.optimize import brentq
import matplotlib as mpl
import matplotlib.pyplot as plt
from pathlib import Path

M = 1.0
OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

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
# 1) Potencial efetivo, orbitas circulares e ISCO
# ----------------------------------------------------------------------
def V(r, L):
    """Potencial efetivo para particula massiva."""
    return (1.0 - 2.0 * M / r) * (1.0 + L**2 / r**2)


def dV(r, L):
    return 2.0 * M / r**2 + (6.0 * M * L**2) / r**4 - 2.0 * L**2 / r**3


def d2V(r, L):
    return -4.0 * M / r**3 - 24.0 * M * L**2 / r**5 + 6.0 * L**2 / r**4


def L_circular(r):
    """Momento angular de uma orbita circular de raio r (exige r > 3M)."""
    return np.sqrt(M * r**2 / (r - 3.0 * M))


# A ISCO e' o raio em que o minimo e o maximo de V se fundem: V'' = 0 ao longo
# da familia de orbitas circulares. Achamos a raiz numericamente.
r_isco = brentq(lambda r: d2V(r, L_circular(r)), 4.5 * M, 20.0 * M)
L_isco = L_circular(r_isco)
E_isco = np.sqrt(V(r_isco, L_isco))

print("== Orbitas circulares e ISCO ==")
print(f"r_ISCO (numerico) = {r_isco:.10f} M      (exato: 6 M)")
print(f"L_ISCO            = {L_isco:.10f} M      (exato: sqrt(12) = {np.sqrt(12):.10f})")
print(f"E_ISCO            = {E_isco:.10f}        (exato: sqrt(8/9) = {np.sqrt(8/9):.10f})")
print(f"eficiencia de acrecao 1 - E_ISCO = {1 - E_isco:.6f}  "
      f"({100 * (1 - E_isco):.2f} % da massa de repouso)")

# raio da orbita circular de fotons: maximo de (1-2M/r) L^2/r^2
r_ph = brentq(lambda r: 2.0 / r**3 - 6.0 * M / r**4, 2.1 * M, 10.0 * M)
print(f"orbita de fotons  = {r_ph:.10f} M       (exato: 3 M)")


# ----------------------------------------------------------------------
# 2) Orbita ligada e precessao do perielio
# ----------------------------------------------------------------------
def EL_de_pe(p, e):
    """E e L a partir do semi-latus rectum p e da excentricidade e."""
    L2 = p**2 * M / (p - 3.0 * M - M * e**2)
    E2 = (p - 2.0 * M - 2.0 * M * e) * (p - 2.0 * M + 2.0 * M * e) \
        / (p * (p - 3.0 * M - M * e**2))
    return np.sqrt(E2), np.sqrt(L2)


def rhs(tau, y, L):
    r, vr, phi = y
    return [vr,
            -M / r**2 + L**2 / r**3 - 3.0 * M * L**2 / r**4,
            L / r**2]


def integra_orbita(p, e, n_orbitas=3.5):
    E, L = EL_de_pe(p, e)
    r0 = p / (1.0 + e)                       # perielio
    a_semi = p / (1.0 - e**2)                  # semieixo maior
    T_est = 2.0 * np.pi * a_semi**1.5 / np.sqrt(M)  # escala kepleriana
    sol = solve_ivp(rhs, [0.0, n_orbitas * T_est], [r0, 0.0, 0.0],
                    args=(L,), rtol=1e-11, atol=1e-12, dense_output=True,
                    max_step=T_est / 500)
    return sol, E, L, r0


p, e = 20.0 * M, 0.40
sol, E, L, r_peri = integra_orbita(p, e)
tau = np.linspace(sol.t[0], sol.t[-1], 40000)
r, vr, phi = sol.sol(tau)

# perielios sucessivos: vr muda de - para +
sinal = np.sign(vr)
idx = np.where((sinal[:-1] < 0) & (sinal[1:] >= 0))[0]
phi_peri = [np.interp(0.0, [vr[i], vr[i + 1]], [phi[i], phi[i + 1]]) for i in idx]
dphi_num = np.mean(np.diff(phi_peri)) - 2.0 * np.pi if len(phi_peri) > 1 else np.nan
dphi_teo = 6.0 * np.pi * M / p

print("\n== Precessao do perielio (campo forte, p = 20 M, e = 0.4) ==")
print(f"turning points: r_min = {r.min():.6f} M  (p/(1+e) = {p/(1+e):.6f})")
print(f"                r_max = {r.max():.6f} M  (p/(1-e) = {p/(1-e):.6f})")
print(f"Delta phi por orbita, numerico = {dphi_num:.6f} rad")
print(f"Delta phi por orbita, 6 pi M/p = {dphi_teo:.6f} rad")
print(f"erro relativo = {abs(dphi_num - dphi_teo)/dphi_teo:.2e}  "
      "(a formula e' so' o termo de primeira ordem em M/p)")

# resultado exato no limite quase circular (e -> 0), obtido no bloco simbolico:
dphi_exato = 2.0 * np.pi * (1.0 / np.sqrt(1.0 - 6.0 * M / p) - 1.0)
print(f"exato para e -> 0: 2 pi [(1-6M/p)^(-1/2) - 1] = {dphi_exato:.6f} rad")

# a formula 6 pi M/p e' o primeiro termo de uma serie em M/p: veja convergir
print("\n  p/M      numerico        6 pi M/p      razao")
for p_teste in (20.0, 50.0, 200.0, 1000.0):
    s, *_ = integra_orbita(p_teste, 0.40, n_orbitas=3.5)
    tt = np.linspace(s.t[0], s.t[-1], 60000)
    _, vv, pp = s.sol(tt)
    sg = np.sign(vv)
    ii = np.where((sg[:-1] < 0) & (sg[1:] >= 0))[0]
    ph = [np.interp(0.0, [vv[i], vv[i + 1]], [pp[i], pp[i + 1]]) for i in ii]
    d_num = np.mean(np.diff(ph)) - 2.0 * np.pi
    d_teo = 6.0 * np.pi * M / p_teste
    print(f"{p_teste:6.0f} {d_num:14.6e} {d_teo:14.6e} {d_num/d_teo:10.4f}")

# aplicacao a Mercurio, em unidades SI
GM_sol = 1.32712440018e20      # m^3/s^2
c = 2.99792458e8               # m/s
a_merc, e_merc = 5.790905e10, 0.205630
T_merc = 87.9691 * 86400.0
p_merc = a_merc * (1.0 - e_merc**2)
dphi_merc = 6.0 * np.pi * GM_sol / (c**2 * p_merc)          # rad por orbita
arcsec_seculo = dphi_merc * (100.0 * 365.25 * 86400.0 / T_merc) * (180.0 / np.pi) * 3600.0
print(f"\nMercurio: {dphi_merc:.4e} rad/orbita  ->  {arcsec_seculo:.2f} arcsec/seculo")


# ----------------------------------------------------------------------
# 3) Deflexao da luz: u'' + u = 3 M u^2, com u = 1/r
# ----------------------------------------------------------------------
def deflexao(b):
    def f(phi, y):
        u, du = y
        return [du, 3.0 * M * u**2 - u]

    def toca_infinito(phi, y):
        return y[0]
    toca_infinito.terminal, toca_infinito.direction = True, -1

    sol = solve_ivp(f, [0.0, 4.0 * np.pi], [1e-12, 1.0 / b],
                    events=toca_infinito, rtol=1e-11, atol=1e-14)
    return sol.t_events[0][0] - np.pi


print("\n== Deflexao da luz ==")
print(f"{'b/M':>8} {'numerico':>12} {'4M/b':>12} {'+ 15 pi M^2/(4b^2)':>20}")
for b in (10.0, 50.0, 200.0, 1000.0):
    d = deflexao(b)
    print(f"{b:8.0f} {d:12.6e} {4*M/b:12.6e} {4*M/b + 15*np.pi*M**2/(4*b**2):20.6e}")

R_sol, M_sol = 6.957e8, GM_sol / c**2
d_sol = 4.0 * M_sol / R_sol * (180.0 / np.pi) * 3600.0
print(f"borda do Sol: {d_sol:.3f} arcsec")


# ----------------------------------------------------------------------
# 4) Queda radial: tempo proprio finito, tempo coordenado divergente
# ----------------------------------------------------------------------
r0 = 10.0 * M
E_queda = np.sqrt(1.0 - 2.0 * M / r0)

tau_horizonte = quad(lambda r: 1.0 / np.sqrt(2 * M / r - 2 * M / r0), 2 * M, r0)[0]
tau_centro = quad(lambda r: 1.0 / np.sqrt(2 * M / r - 2 * M / r0), 0.0, r0)[0]
print("\n== Queda radial a partir do repouso em r = 10 M ==")
print(f"tempo proprio ate' o horizonte  = {tau_horizonte:.6f} M")
print(f"tempo proprio ate' r = 0        = {tau_centro:.6f} M")
for r_alvo in (3.0, 2.1, 2.01, 2.001):
    t_coord = quad(lambda r: E_queda / ((1 - 2 * M / r) * np.sqrt(2 * M / r - 2 * M / r0)),
                   r_alvo, r0, limit=200)[0]
    tau_r = quad(lambda r: 1.0 / np.sqrt(2 * M / r - 2 * M / r0), r_alvo, r0)[0]
    print(f"  ate' r = {r_alvo:6.3f} M :  tau = {tau_r:9.4f} M   t = {t_coord:12.4f} M")


# ----------------------------------------------------------------------
# Figuras
# ----------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.2, 3.0))

rr = np.linspace(3.0, 40.0, 1200)
for Lval, cor, estilo in ((3.4, GRAFITE, ":"), (L_isco, AMBAR, "-"),
                          (4.6, PETROLEO, "-"), (6.0, TERRACOTA, "--")):
    ax1.plot(rr, V(rr, Lval), estilo, color=cor, lw=1.4,
             label=rf"$L = {Lval:.2f}\,M$")
ax1.plot(r_isco, V(r_isco, L_isco), "o", color=AMBAR, ms=5, zorder=5)
ax1.annotate("ISCO", (r_isco, V(r_isco, L_isco)), textcoords="offset points",
             xytext=(6, -12), color=AMBAR, fontsize=8)
ax1.set_xlabel(r"$r/M$"); ax1.set_ylabel(r"$V_{\rm ef}(r)$")
ax1.set_title("Potencial efetivo")
ax1.set_ylim(0.86, 1.06); ax1.legend(frameon=False, fontsize=7.5, loc="lower right")

x, y = r * np.cos(phi), r * np.sin(phi)
ax2.plot(x, y, color=PETROLEO, lw=0.9)
th = np.linspace(0, 2 * np.pi, 200)
ax2.fill(2 * M * np.cos(th), 2 * M * np.sin(th), color=GRAFITE, zorder=3)
phi_p = np.array(phi_peri)
ax2.plot(r_peri * np.cos(phi_p), r_peri * np.sin(phi_p), "o",
         color=AMBAR, ms=3.5, zorder=4, label="periélios sucessivos")
ax2.legend(frameon=False, fontsize=7.5, loc="lower right")
ax2.set_aspect("equal"); ax2.set_xlabel(r"$x/M$"); ax2.set_ylabel(r"$y/M$")
ax2.set_title(rf"Órbita com $p = {p:.0f}M$, $e = {e}$")
ax2.spines["left"].set_visible(False); ax2.spines["bottom"].set_visible(False)
ax2.tick_params(labelsize=7)

fig.tight_layout()
fig.savefig(OUTDIR / "cap10_potencial_orbita.pdf", bbox_inches="tight")

# queda radial
fig2, ax = plt.subplots(figsize=(4.6, 2.9))
r_grid = np.linspace(2.0005 * M, r0, 600)
tau_de_r = np.array([quad(lambda s: 1.0 / np.sqrt(2 * M / s - 2 * M / r0), rg, r0)[0]
                     for rg in r_grid])
t_de_r = np.array([quad(lambda s: E_queda / ((1 - 2 * M / s) * np.sqrt(2 * M / s - 2 * M / r0)),
                        rg, r0, limit=200)[0] for rg in r_grid])
ax.plot(tau_de_r, r_grid, color=PETROLEO, lw=1.6, label=r"tempo próprio $\tau$")
ax.plot(t_de_r, r_grid, color=AMBAR, lw=1.6, ls="--", label=r"tempo coordenado $t$")
ax.axhline(2 * M, color=TERRACOTA, lw=1.0, ls=":")
ax.text(1.0, 2.0 * M + 0.15, r"horizonte $r=2M$", color=TERRACOTA, fontsize=7.5)
ax.set_xlim(0, 60); ax.set_ylim(0, 10.5)
ax.set_xlabel("tempo decorrido $/M$"); ax.set_ylabel(r"$r/M$")
ax.set_title("Queda radial a partir do repouso em $r=10M$")
ax.legend(frameon=False, fontsize=8)
fig2.tight_layout()
fig2.savefig(OUTDIR / "cap10_queda_radial.pdf", bbox_inches="tight")
print(f"\nFiguras salvas em {OUTDIR}")
