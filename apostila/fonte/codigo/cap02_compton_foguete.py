"""Verificacoes numericas: espalhamento Compton e foguete relativistico.

Unidades geometrizadas (c=1). Convencao de sinais (-,+,+,+).
"""

import numpy as np
from scipy.optimize import brentq

eta = np.diag([-1.0, 1.0, 1.0, 1.0])


def produto4(a, b):
    return a @ eta @ b


# 1) Espalhamento Compton: resolve a conservacao de quadrimomento
#    NUMERICAMENTE (sem usar a formula fechada) e compara com ela.
def energia_espalhada_numerica(E, theta, me):
    """Encontra E' tal que o eletron final fique na casca de massa correta,
    resolvendo p_e'.p_e' = -me^2 por busca de raiz (sem usar a formula
    fechada 1/E' - 1/E = (1-cos theta)/me)."""
    p_gamma = np.array([E, E, 0.0, 0.0])
    p_e = np.array([me, 0.0, 0.0, 0.0])

    def residuo(Ep):
        p_gamma_linha = np.array([Ep, Ep * np.cos(theta), Ep * np.sin(theta), 0.0])
        p_e_linha = p_gamma + p_e - p_gamma_linha
        return produto4(p_e_linha, p_e_linha) + me**2  # deve ser 0

    return brentq(residuo, 1e-6, E)


me = 0.511  # MeV
print("Espalhamento Compton -- solucao numerica vs. formula fechada:")
for E, theta_graus in [(0.1, 60), (0.511, 90), (2.0, 150)]:
    theta = np.radians(theta_graus)
    Ep_numerico = energia_espalhada_numerica(E, theta, me)
    Ep_formula = E * me / (E * (1 - np.cos(theta)) + me)
    print(f"  E={E} MeV, theta={theta_graus} graus: "
          f"E'(numerico)={Ep_numerico:.6f}  E'(formula)={Ep_formula:.6f}  "
          f"diferenca={abs(Ep_numerico - Ep_formula):.2e}")

# 2) Foguete relativistico com aceleracao propria constante a0 = 1g
print("\nFoguete relativistico (a0 = 1g, destino = Proxima Centauri):")
a0 = 1.0323   # 1g em anos-luz/ano^2 (equivalentemente 1/ano, com c=1 ano-luz/ano)
D = 4.2465    # anos-luz


def meio_percurso(tau_meio):
    return (1 / a0) * (np.cosh(a0 * tau_meio) - 1) - D / 2


tau_meio = brentq(meio_percurso, 1e-3, 20)
tau_total = 2 * tau_meio
t_total = 2 * (1 / a0) * np.sinh(a0 * tau_meio)
v_max = np.tanh(a0 * tau_meio)

print(f"  tempo proprio total (nave):  tau = {tau_total:.4f} anos")
print(f"  tempo coordenado total (Terra): t = {t_total:.4f} anos")
print(f"  velocidade maxima (meio do percurso): v/c = {v_max:.4f}")
