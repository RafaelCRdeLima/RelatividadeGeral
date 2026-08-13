"""Tempo proprio do gemeo viajante para um perfil de velocidade suave.

O gemeo viajante nao muda de velocidade instantaneamente; aqui usamos
v(t) = v0 * sin(pi t / T), que sai e volta ao repouso em t=0 e t=T.
O tempo proprio acumulado e obtido por integracao numerica de

    tau(t) = integral_0^t sqrt(1 - v(t')^2) dt'

e comparado com o tempo coordenado (o gemeo que fica em casa).
"""

import numpy as np
from scipy.integrate import quad, cumulative_trapezoid
import matplotlib.pyplot as plt
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"

T = 10.0      # tempo coordenado total (ida e volta), unidades geometrizadas
v0 = 0.8      # velocidade maxima


def v(t):
    return v0 * np.sin(np.pi * t / T)


def integrando(t):
    return np.sqrt(1.0 - v(t)**2)


# tempo proprio total, via quadratura adaptativa
tau_total, erro_estimado = quad(integrando, 0.0, T)
print(f"tau_total (integracao numerica) = {tau_total:.6f}")
print(f"erro estimado pela quadratura   = {erro_estimado:.2e}")
print(f"tempo coordenado T              = {T:.6f}")
print(f"razao tau_total / T             = {tau_total / T:.6f}")

# comparacao com a estimativa ingenua de usar o fator de Lorentz medio
v_medio = quad(v, 0, T)[0] / T
gamma_medio = 1 / np.sqrt(1 - v_medio**2)
tau_ingenuo = T / gamma_medio
print(f"[errado] T/gamma(v_medio)        = {tau_ingenuo:.6f}  "
      "(subestima o efeito -- gamma nao comuta com a media)")

# tau(t) acumulado, para o grafico
t_grid = np.linspace(0, T, 400)
integrando_grid = integrando(t_grid)
tau_acumulado = cumulative_trapezoid(integrando_grid, t_grid, initial=0.0)

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(5.4, 5.6), sharex=True)
ax1.plot(t_grid, v(t_grid), color="#4C72B0")
ax1.set_ylabel(r"$v(t)$")
ax1.axhline(0, color="0.6", lw=0.6)

ax2.plot(t_grid, tau_acumulado, color="#B0413E", label=r"$\tau(t)$ do viajante")
ax2.plot(t_grid, t_grid, color="0.4", ls="--", label=r"$t$ (gêmeo em casa)")
ax2.set_xlabel(r"$t$ (tempo coordenado)")
ax2.set_ylabel(r"tempo próprio acumulado")
ax2.legend(fontsize=9, frameon=False)

fig.tight_layout()
fig.savefig(OUTDIR / "cap01_tempo_proprio_numerico.pdf", bbox_inches="tight")
print("Figura salva em", OUTDIR / "cap01_tempo_proprio_numerico.pdf")
