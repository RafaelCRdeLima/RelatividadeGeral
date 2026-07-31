"""Integracao numerica das equacoes de Friedmann.

Com a normalizacao a(t_0) = 1, a primeira equacao de Friedmann pode ser escrita
como uma unica funcao do fator de escala,

    H(a)^2 = H_0^2 [ Om_r a^-4 + Om_m a^-3 + Om_k a^-2 + Om_L ],

com Om_k = 1 - Om_r - Om_m - Om_L. Toda a cosmologia de fundo esta' nessa
expressao: a evolucao a(t), a idade do universo, as distancias e os horizontes
sao integrais dela. Medimos tempo em unidades de 1/H_0 e distancia em c/H_0,
convertendo no final.
"""

import numpy as np
from scipy.integrate import solve_ivp, quad
from scipy.optimize import brentq
import matplotlib as mpl
import matplotlib.pyplot as plt
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

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

# parametros de fundo (valores proximos aos de Planck 2018)
h = 0.674
Om_r, Om_m, Om_L = 9.24e-5, 0.315, 0.685
Om_k = 1.0 - Om_r - Om_m - Om_L

HUBBLE_GYR = 9.778 / h      # 1/H_0 em Gyr
HUBBLE_MPC = 2997.92458 / h  # c/H_0 em Mpc


def Efunc(a, om_r=Om_r, om_m=Om_m, om_L=Om_L, om_k=Om_k):
    """E(a) = H(a)/H_0."""
    return np.sqrt(om_r / a**4 + om_m / a**3 + om_k / a**2 + om_L)


# ----------------------------------------------------------------------
# 1) Idade do universo e marcos temporais
# ----------------------------------------------------------------------
def idade_ate(a, **kw):
    """Tempo cosmico decorrido de a = 0 ate' a, em unidades de 1/H_0."""
    return quad(lambda x: 1.0 / (x * Efunc(x, **kw)), 0.0, a, limit=200)[0]


t0 = idade_ate(1.0)
print("== Escalas temporais ==")
print(f"Om_k = {Om_k:+.2e}  (curvatura compativel com zero)")
print(f"1/H_0 = {HUBBLE_GYR:.3f} Gyr")
print(f"idade do universo t_0 = {t0:.5f}/H_0 = {t0 * HUBBLE_GYR:.3f} Gyr")

# solucao fechada para materia + Lambda plano (sem radiacao):
#   a(t) = (Om_m/Om_L)^(1/3) sinh^(2/3)(3/2 sqrt(Om_L) H_0 t)
t0_ana = 2.0 / (3.0 * np.sqrt(Om_L)) * np.arcsinh(np.sqrt(Om_L / Om_m))
print(f"t_0 analitico (sem radiacao) = {t0_ana:.5f}/H_0 = "
      f"{t0_ana * HUBBLE_GYR:.3f} Gyr   "
      f"[diferenca: {(t0_ana - t0) * HUBBLE_GYR * 1e3:.1f} Myr, "
      "que e' o efeito da radiacao]")

z_eq = Om_m / Om_r - 1.0
a_eq = 1.0 / (1.0 + z_eq)
print(f"igualdade materia-radiacao: z_eq = {z_eq:.1f}, "
      f"t = {idade_ate(a_eq) * HUBBLE_GYR * 1e3:.3f} Myr")

a_mL = (Om_m / Om_L) ** (1.0 / 3.0)
print(f"igualdade materia-Lambda:   z   = {1/a_mL - 1:.4f}, "
      f"t = {idade_ate(a_mL) * HUBBLE_GYR:.3f} Gyr")

# aceleracao comeca quando addot = 0, isto e', quando Om_m/a^3 = 2 Om_L
a_acc = (Om_m / (2.0 * Om_L)) ** (1.0 / 3.0)
print(f"inicio da aceleracao:       z   = {1/a_acc - 1:.4f}, "
      f"t = {idade_ate(a_acc) * HUBBLE_GYR:.3f} Gyr")


# ----------------------------------------------------------------------
# 2) Evolucao a(t): integracao direta de da/dt = a E(a)
# ----------------------------------------------------------------------
def evolui(a_ini, t_fim, **kw):
    sol = solve_ivp(lambda t, y: y[0] * Efunc(y[0], **kw), [0.0, t_fim],
                    [a_ini], rtol=1e-10, atol=1e-12, dense_output=True)
    return sol


modelos = {
    r"$\Lambda$CDM": dict(om_r=Om_r, om_m=Om_m, om_L=Om_L, om_k=Om_k),
    "só matéria (EdS)": dict(om_r=0.0, om_m=1.0, om_L=0.0, om_k=0.0),
    "só radiação": dict(om_r=1.0, om_m=0.0, om_L=0.0, om_k=0.0),
    "aberto, $\\Omega_m=0{,}3$": dict(om_r=0.0, om_m=0.3, om_L=0.0, om_k=0.7),
}

print("\n== Verificacao das solucoes analiticas ==")
sol_m = evolui(1e-6, 2.0, om_r=0.0, om_m=1.0, om_L=0.0, om_k=0.0)
t_teste = 0.5
a_num = sol_m.sol(t_teste)[0]
a_ana = (1.5 * t_teste) ** (2.0 / 3.0)
print(f"Einstein-de Sitter em t = 0.5/H_0: a_num = {a_num:.8f}, "
      f"(3t/2)^(2/3) = {a_ana:.8f}")

sol_r = evolui(1e-6, 2.0, om_r=1.0, om_m=0.0, om_L=0.0, om_k=0.0)
a_num_r, a_ana_r = sol_r.sol(t_teste)[0], (2.0 * t_teste) ** 0.5
print(f"dominio de radiacao em t = 0.5/H_0: a_num = {a_num_r:.8f}, "
      f"(2t)^(1/2)   = {a_ana_r:.8f}")


# ----------------------------------------------------------------------
# 3) Distancias
# ----------------------------------------------------------------------
def dist_comovel(z):
    """Distancia comovel, em Mpc."""
    I = quad(lambda zz: 1.0 / Efunc(1.0 / (1.0 + zz)), 0.0, z, limit=200)[0]
    return HUBBLE_MPC * I


def dist_luminosidade(z):
    return (1.0 + z) * dist_comovel(z)


def dist_angular(z):
    return dist_comovel(z) / (1.0 + z)


print("\n== Distancias ==")
print(f"{'z':>6} {'D_C [Mpc]':>12} {'D_L [Mpc]':>12} {'D_A [Mpc]':>12}")
for z in (0.1, 0.5, 1.0, 2.0, 5.0, 1100.0):
    print(f"{z:6.1f} {dist_comovel(z):12.1f} {dist_luminosidade(z):12.1f} "
          f"{dist_angular(z):12.1f}")

# a distancia de diametro angular tem um maximo: objetos alem dele voltam a
# crescer no ceu
z_max = brentq(lambda z: (dist_angular(z + 1e-4) - dist_angular(z - 1e-4)) / 2e-4,
               0.5, 3.0)
print(f"\nmaximo de D_A em z = {z_max:.4f}, D_A = {dist_angular(z_max):.1f} Mpc")

# horizonte de particulas hoje
d_hor = HUBBLE_MPC * quad(lambda a: 1.0 / (a**2 * Efunc(a)), 0.0, 1.0, limit=200)[0]
print(f"horizonte de particulas hoje = {d_hor:.1f} Mpc = "
      f"{d_hor * 3.2616e6 / 1e9:.2f} Glyr")


# ----------------------------------------------------------------------
# Figuras
# ----------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.2, 3.0))

cores = [PETROLEO, AMBAR, TERRACOTA, GRAFITE]
estilos = ["-", "--", ":", "-."]
for (nome, kw), cor, est in zip(modelos.items(), cores, estilos):
    s = evolui(1e-8, 3.0, **kw)
    tt = np.linspace(0, 3.0, 800)
    ax1.plot(tt, s.sol(tt)[0], est, color=cor, lw=1.5, label=nome)
ax1.axvline(t0, color=GRAFITE, lw=0.7, ls=":")
ax1.axhline(1.0, color=GRAFITE, lw=0.7, ls=":")
ax1.plot([t0], [1.0], "o", color=PETROLEO, ms=4)
ax1.annotate("hoje", (t0, 1.0), textcoords="offset points", xytext=(4, -14),
             fontsize=8, color=PETROLEO)
ax1.set_xlabel(r"$H_0 t$"); ax1.set_ylabel(r"$a(t)$")
ax1.set_xlim(0, 3.0); ax1.set_ylim(0, 3.0)
ax1.set_title("Evolução do fator de escala")
ax1.legend(frameon=False, fontsize=7.5, loc="upper left")

zz = np.logspace(-2, np.log10(10.0), 300)
ax2.plot(zz, [dist_comovel(z) for z in zz], color=PETROLEO, lw=1.5, label=r"$D_C$")
ax2.plot(zz, [dist_luminosidade(z) for z in zz], "--", color=AMBAR, lw=1.5, label=r"$D_L$")
ax2.plot(zz, [dist_angular(z) for z in zz], ":", color=TERRACOTA, lw=1.8, label=r"$D_A$")
ax2.plot([z_max], [dist_angular(z_max)], "o", color=TERRACOTA, ms=4)
ax2.annotate(rf"máx. em $z={z_max:.2f}$", (z_max, dist_angular(z_max)),
             textcoords="offset points", xytext=(6, 6), fontsize=7.5, color=TERRACOTA)
ax2.set_xscale("log"); ax2.set_yscale("log")
ax2.set_xlabel(r"$z$"); ax2.set_ylabel("distância [Mpc]")
ax2.set_title("Distâncias em $\\Lambda$CDM")
ax2.legend(frameon=False, fontsize=8, loc="upper left")

fig.tight_layout()
fig.savefig(OUTDIR / "cap13_friedmann.pdf", bbox_inches="tight")
print(f"\nFiguras salvas em {OUTDIR}")
