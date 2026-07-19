"""Verificacao numerica: invariancia do intervalo e adicao de velocidades.

Unidades geometrizadas (c=1).
"""

import numpy as np

rng = np.random.default_rng(0)


def boost(v):
    """Matriz de Lorentz 2x2 (t,x) -> (t',x') para velocidade v."""
    gamma = 1.0 / np.sqrt(1.0 - v**2)
    return np.array([[gamma, -gamma * v],
                      [-gamma * v, gamma]])


eta = np.diag([-1.0, 1.0])  # metrica de Minkowski em 1+1 D

# 1) A transformacao preserva o intervalo: Lambda^T eta Lambda = eta
print("Teste de invariancia do intervalo (deve dar ~0):")
for _ in range(4):
    v = rng.uniform(-0.95, 0.95)
    L = boost(v)
    residuo = L.T @ eta @ L - eta
    print(f"  v={v:+.3f}  |residuo|={np.abs(residuo).max():.2e}")

# 2) Composicao de dois boosts na mesma direcao = boost com velocidade
#    relativistica combinada (nao a soma ingenua v1+v2)
print("\nComposicao de boosts vs. formula de adicao de velocidades:")
for _ in range(4):
    v1, v2 = rng.uniform(-0.9, 0.9, size=2)
    L_composta = boost(v1) @ boost(v2)
    v_rel = (v1 + v2) / (1 + v1 * v2)
    L_direta = boost(v_rel)
    erro = np.abs(L_composta - L_direta).max()
    print(f"  v1={v1:+.3f} v2={v2:+.3f}  v_rel={v_rel:+.3f}  erro={erro:.2e}")

# 3) Rapidez: phi = artanh(v) e aditiva sob composicao de boosts colineares
print("\nAditividade da rapidez:")
for _ in range(3):
    v1, v2 = rng.uniform(-0.9, 0.9, size=2)
    phi1, phi2 = np.arctanh(v1), np.arctanh(v2)
    v_rel = (v1 + v2) / (1 + v1 * v2)
    phi_rel = np.arctanh(v_rel)
    print(f"  phi1+phi2={phi1+phi2:+.5f}   phi(v_rel)={phi_rel:+.5f}")
