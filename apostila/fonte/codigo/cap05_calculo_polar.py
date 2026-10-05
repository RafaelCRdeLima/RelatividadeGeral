"""Capitulo 5 -- cálculo tensorial em uma carta curvilínea.

Monta, para qualquer carta do plano dada por x(q1,q2) e y(q1,q2):

    jacobiano -> base -> metrica -> Christoffel -> derivada covariante
    -> divergencia -> laplaciano

e confere cada resultado contra a conta cartesiana correspondente, que e'
a unica maneira honesta de saber se a maquinaria esta certa.

O ponto do capitulo e' que NADA disso e' curvatura: o plano continua plano
em qualquer carta. O programa torna isso verificavel -- os simbolos de
Christoffel sao nao nulos, e mesmo assim o gradiente de f = x sai o campo
constante e_x em toda parte.

Uso:
    python3 cap05_calculo_polar.py
"""

import sympy as sp


def geometria(x, y, q):
    """Devolve (base, metrica, metrica inversa, Christoffel) da carta."""
    X = sp.Matrix([x, y])
    J = X.jacobian(q)                       # colunas = vetores de base
    g = sp.simplify(J.T * J)                # g_ij = e_i . e_j
    gi = sp.simplify(g.inv())
    n = len(q)
    Gam = [[[sp.simplify(sum(
                gi[k, l] * (sp.diff(g[l, i], q[j])
                            + sp.diff(g[l, j], q[i])
                            - sp.diff(g[i, j], q[l])) / 2
                for l in range(n)))
             for j in range(n)] for i in range(n)] for k in range(n)]
    return J, g, gi, Gam


def derivada_covariante(V, q, Gam):
    """nabla_j V^i = d_j V^i + Gamma^i_jk V^k."""
    n = len(q)
    return [[sp.simplify(sp.diff(V[i], q[j])
                         + sum(Gam[i][j][k] * V[k] for k in range(n)))
             for j in range(n)] for i in range(n)]


def divergencia(V, q, Gam):
    n = len(q)
    return sp.simplify(sum(sp.diff(V[i], q[i]) for i in range(n))
                       + sum(Gam[i][i][k] * V[k]
                             for i in range(n) for k in range(n)))


def gradiente(f, q, gi):
    """O VETOR gradiente: a 1-forma d_i f com o indice subido pela metrica."""
    n = len(q)
    return [sp.simplify(sum(gi[i, j] * sp.diff(f, q[j]) for j in range(n)))
            for i in range(n)]


def laplaciano(f, q, gi, Gam):
    return divergencia(gradiente(f, q, gi), q, Gam)


def nome(k, q):
    return str(q[k])


def relatorio(titulo, x, y, q):
    print("=" * 66)
    print(titulo)
    print("=" * 66)
    J, g, gi, Gam = geometria(x, y, q)
    n = len(q)

    print("\nmetrica:")
    sp.pprint(g)

    print("\nsimbolos de Christoffel nao nulos:")
    achou = False
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if Gam[k][i][j] != 0:
                    print(f"  Gamma^{nome(k,q)}_({nome(i,q)}{nome(j,q)}) "
                          f"= {Gam[k][i][j]}")
                    achou = True
    if not achou:
        print("  (nenhum: a base nao varia)")
    return J, g, gi, Gam


def main():
    r, th = sp.symbols("r theta", positive=True)
    q = [r, th]
    J, g, gi, Gam = relatorio("CARTA POLAR:  x = r cos(theta),  y = r sin(theta)",
                              r * sp.cos(th), r * sp.sin(th), q)

    # --- 1) o gradiente de f = x e' o campo constante e_x -----------------
    f = r * sp.cos(th)                       # f = x
    V = gradiente(f, q, gi)
    print(f"\ngradiente de f = x, em componentes polares: "
          f"({sp.simplify(V[0])}, {sp.simplify(V[1])})")
    cart = sp.simplify(J * sp.Matrix(V))     # de volta a cartesianas
    print(f"  reconstruido em cartesianas: {cart.T}  (esperado: [1, 0])")

    # --- 2) e a sua derivada covariante e' nula em toda parte -------------
    cov = derivada_covariante(V, q, Gam)
    print("\nderivada covariante desse campo:")
    for i in range(2):
        for j in range(2):
            print(f"  nabla_{nome(j,q)} V^{nome(i,q)} = {cov[i][j]}")
    assert all(cov[i][j] == 0 for i in range(2) for j in range(2))
    print("  -> todas nulas: as componentes variam, o campo nao.")

    # --- 3) divergencia e laplaciano, conferidos em cartesianas ----------
    print("\nverificacoes contra a conta cartesiana:")
    for descr, obtido, esperado in (
        ("div de V = r e_r      ", divergencia([r, 0], q, Gam), 2),
        ("laplaciano de f = r^2 ", laplaciano(r**2, q, gi, Gam), 4),
        ("laplaciano de f = ln r", laplaciano(sp.log(r), q, gi, Gam), 0),
    ):
        ok = sp.simplify(obtido - esperado) == 0
        print(f"  {descr}: {obtido}   esperado {esperado}   "
              f"{'OK' if ok else 'FALHOU'}")
        assert ok

    # --- 4) a forma fechada da divergencia e do laplaciano ---------------
    Vr, Vt = sp.Function("V^r")(r, th), sp.Function("V^t")(r, th)
    div = divergencia([Vr, Vt], q, Gam)
    fechada = sp.diff(r * Vr, r) / r + sp.diff(Vt, th)
    print(f"\ndivergencia geral bate com (1/r) d_r(r V^r) + d_theta V^theta: "
          f"{sp.simplify(div - fechada) == 0}")

    ff = sp.Function("f")(r, th)
    lap = laplaciano(ff, q, gi, Gam)
    lap_fechada = sp.diff(r * sp.diff(ff, r), r) / r + sp.diff(ff, th, 2) / r**2
    print(f"laplaciano geral bate com (1/r) d_r(r d_r f) + (1/r^2) d^2_theta f: "
          f"{sp.simplify(lap - lap_fechada) == 0}")

    # --- 5) o mesmo plano, em outra carta: nada muda geometricamente -----
    u, v, a = sp.symbols("u v a", positive=True)
    relatorio("CARTA ELIPTICA:  x = a cosh(u) cos(v),  y = a sinh(u) sin(v)",
              a * sp.cosh(u) * sp.cos(v), a * sp.sinh(u) * sp.sin(v), [u, v])
    print("\nOutros simbolos de Christoffel, a mesma geometria: o plano nao")
    print("mudou ao trocar de carta. E' o ponto da Secao 5.4.")


if __name__ == "__main__":
    main()
