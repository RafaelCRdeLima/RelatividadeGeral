"""Verificacoes numericas: quadrivelocidade, quadrimomento, decaimento e limiar.

Unidades geometrizadas (c=1). Convencao de sinais (-,+,+,+).
"""

import numpy as np

rng = np.random.default_rng(0)
eta = np.diag([-1.0, 1.0, 1.0, 1.0])


def produto4(a, b):
    return a @ eta @ b


def velocidade_aleatoria(speed):
    """Vetor 3D com modulo |v|=speed e direcao uniforme na esfera."""
    n = rng.normal(size=3)
    n /= np.linalg.norm(n)
    return speed * n


# 1) Normalizacao da quadrivelocidade: U.U = -1 para qualquer 3-velocidade
print("Normalizacao de U (deve dar -1):")
for _ in range(4):
    v = velocidade_aleatoria(rng.uniform(0.05, 0.95))
    gamma = 1.0 / np.sqrt(1.0 - v @ v)
    U = np.array([gamma, *(gamma * v)])
    print(f"  |v|={np.linalg.norm(v):.3f}  U.U={produto4(U, U):.6f}")

# 2) Casca de massa do quadrimomento: p.p = -m^2 (massivas e foton)
print("\nCasca de massa (deve reproduzir m):")
for m in [0.5, 1.0]:
    v = velocidade_aleatoria(rng.uniform(0.05, 0.9))
    gamma = 1.0 / np.sqrt(1.0 - v @ v)
    p = np.array([gamma * m, *(gamma * m * v)])
    print(f"  m={m}  -p.p={-produto4(p, p):.6f}")

n_foton = velocidade_aleatoria(1.0) / 1.0  # direcao unitaria
E_foton = 2.3
p_foton = np.array([E_foton, *(E_foton * n_foton)])
m2_foton = -produto4(p_foton, p_foton) + 0.0  # remove -0.0 de arredondamento
print(f"  m=0 (fóton)  -p.p={m2_foton:.6f}")

# 3) Decaimento em dois corpos iguais: M -> m + m, no referencial de repouso
print("\nDecaimento M -> m + m (verificacao contra formula fechada):")
M, m = 2.0, 0.3
E_final = M / 2
p_mag_formula = np.sqrt(M**2 / 4 - m**2)
# monta os quadrimomentos finais e verifica conservacao e casca de massa
p1 = np.array([E_final, p_mag_formula, 0, 0])
p2 = np.array([E_final, -p_mag_formula, 0, 0])
P_inicial = np.array([M, 0, 0, 0])
print(f"  |p| (formula) = {p_mag_formula:.6f}")
print(f"  conservacao de quadrimomento: {np.allclose(p1 + p2, P_inicial)}")
print(f"  casca de massa de p1: -p1.p1 = {-produto4(p1, p1):.6f} (esperado m^2={m**2:.6f})")

# 4) Energia de limiar para producao de um pion neutro em p + p(repouso) -> p + p + pi0.
#    A conta sai do criterio de limiar, nao da formula fechada: no limiar todos
#    os produtos ficam parados no centro de momento, logo s = (soma das massas
#    finais)^2.  Com o alvo em repouso, s = m_proj^2 + m_alvo^2 + 2 m_alvo E.
def energia_de_limiar(m_proj, m_alvo, massa_final_total):
    """Energia MINIMA do projetil, no referencial em que o alvo esta parado.

    m_proj, m_alvo       massas do projetil e do alvo
    massa_final_total    soma das massas das particulas produzidas
    """
    return (massa_final_total**2 - m_proj**2 - m_alvo**2) / (2 * m_alvo)


print("\nEnergia de limiar (p + p_repouso -> p + p + pi0):")
m_p = 938.272     # MeV
m_pi = 134.9768   # MeV
E_thr = energia_de_limiar(m_p, m_p, 2 * m_p + m_pi)
E_thr_formula = m_p + 2 * m_pi + m_pi**2 / (2 * m_p)   # fechada, do script .wl
print(f"  E_thr = {E_thr:.3f} MeV   (energia cinetica de limiar = {E_thr - m_p:.3f} MeV)")
print(f"  formula fechada m + 2M + M^2/2m: {E_thr_formula:.3f} MeV   "
      f"(diferenca = {abs(E_thr - E_thr_formula):.2e})")
print("  valor de referencia conhecido experimentalmente: ~279-280 MeV")
