"""Verificacoes numericas: base dual, simetria/antissimetria e invariancia de traco.

Nao assume nenhuma metrica de Minkowski especifica -- estas sao identidades
de algebra linear/tensorial, validas em qualquer espaco vetorial com produto
interno (ou, no caso do traco, em qualquer espaco vetorial).
"""

import numpy as np

rng = np.random.default_rng(0)


# 1) Base oblíqua e base dual (mesmo exemplo da Figura de base obliqua)
print("Base dual (reciproca) de uma base obliqua 2D:")
e1 = np.array([1.0, 0.0])
e2 = np.array([0.4, 1.0])
V = np.array([1.3, 0.9])

E = np.array([e1, e2])
g = E @ E.T                      # g_ij = e_i . e_j
ginv = np.linalg.inv(g)
edual = ginv @ E                 # e^i = g^{ij} e_j

print(f"  g = {g.tolist()}")
biortogonal = edual @ E.T
print(f"  e^i . e_j (deve ser a identidade):\n{np.round(biortogonal, 12)}")

Vcontra = np.linalg.solve(E.T, V)          # V = V^i e_i
Vco = E @ V                                # V_i = V . e_i
V_reconstruido = Vco @ edual               # V = V_i e^i
print(f"  V^i = {Vcontra}")
print(f"  V_i = {Vco}")
print(f"  V reconstruido a partir de V_i e da base dual: {V_reconstruido} "
      f"(original: {V})")

# 2) Decomposicao simetrica/antissimetrica e a identidade F:S = 0
print("\nDecomposicao M = M_(sym) + M_[antisym]:")
M = rng.uniform(-1, 1, size=(4, 4))
Msym = 0.5 * (M + M.T)
Manti = 0.5 * (M - M.T)
print(f"  |M - (Msym+Manti)| = {np.abs(M - (Msym + Manti)).max():.2e}")

print("\nContracao de tensor antissimetrico com simetrico (deve dar 0):")
F = Manti  # antissimetrico por construcao
S = rng.uniform(-1, 1, size=(4, 4))
S = 0.5 * (S + S.T)  # simetrico por construcao
contracao = np.sum(F * S)
print(f"  F_munu S^munu = {contracao:.2e}")

# 3) Invariancia do traco de um tensor misto sob mudanca de base
print("\nInvariancia do traco T^mu_mu sob mudanca de base:")
T = rng.uniform(-1, 1, size=(4, 4))
traco_original = np.trace(T)
for _ in range(3):
    L = rng.uniform(-1, 1, size=(4, 4))
    if abs(np.linalg.det(L)) < 1e-3:
        continue
    Tprime = L @ T @ np.linalg.inv(L)
    print(f"  tr(T)={traco_original:.6f}   tr(L T L^-1)={np.trace(Tprime):.6f}")
