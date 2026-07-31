"""Curvatura: holonomia, tensor de Riemann numerico e desvio geodesico.

Tres blocos:

  1) transporte paralelo em torno de um circuito fechado. No plano em
     coordenadas polares os Christoffel sao nao nulos e a holonomia e' zero;
     na esfera a holonomia e' exatamente a area envolvida. E' a distincao
     entre conexao e curvatura, medida em numeros;
  2) tensor de Riemann obtido por diferencas finitas diretamente da metrica,
     sem algebra a mao. Validado na esfera (R = 2/a^2), no plano hiperbolico
     (R = -2) e em Schwarzschild (Ricci = 0, Kretschmann = 48 M^2/r^6);
  3) desvio geodesico: a separacao entre geodesicas vizinhas comparada com a
     solucao de xi'' + K xi = 0.

Unidades geometrizadas em todo o script.
"""

import numpy as np
from scipy.integrate import solve_ivp
import matplotlib as mpl
import matplotlib.pyplot as plt
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

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


# ======================================================================
# Maquinaria: Christoffel e Riemann por diferencas finitas
# ======================================================================
def d_metrica(g, x, h=1e-5):
    """dg[c][a,b] = d_c g_ab, por diferenca central."""
    n = len(x)
    saida = []
    for c in range(n):
        dx = np.zeros(n)
        dx[c] = h
        saida.append((g(x + dx) - g(x - dx)) / (2.0 * h))
    return np.array(saida)


def christoffel(g, x, h=1e-5):
    """Gamma[a][b,c] = (1/2) g^{ad} (d_b g_dc + d_c g_db - d_d g_bc)."""
    n = len(x)
    gi = np.linalg.inv(g(x))
    dg = d_metrica(g, x, h)
    Gam = np.zeros((n, n, n))
    for a in range(n):
        for b in range(n):
            for c in range(n):
                Gam[a, b, c] = 0.5 * sum(
                    gi[a, d] * (dg[b][d, c] + dg[c][d, b] - dg[d][b, c])
                    for d in range(n))
    return Gam


def riemann(g, x, h=1e-4):
    """R^a_{bcd} = d_c Gam^a_{db} - d_d Gam^a_{cb} + Gam.Gam - Gam.Gam."""
    n = len(x)
    Gam = christoffel(g, x, h)
    dGam = []
    for c in range(n):
        dx = np.zeros(n)
        dx[c] = h
        dGam.append((christoffel(g, x + dx, h) - christoffel(g, x - dx, h))
                    / (2.0 * h))
    R = np.zeros((n, n, n, n))
    for a in range(n):
        for b in range(n):
            for c in range(n):
                for d in range(n):
                    R[a, b, c, d] = (
                        dGam[c][a, d, b] - dGam[d][a, c, b]
                        + sum(Gam[a, c, e] * Gam[e, d, b]
                              - Gam[a, d, e] * Gam[e, c, b] for e in range(n)))
    return R


def invariantes(g, x, h=1e-4):
    """Devolve (Ricci, escalar R, Kretschmann)."""
    n = len(x)
    gm, gi = g(x), np.linalg.inv(g(x))
    R = riemann(g, x, h)
    Ric = np.einsum("abac->bc", R)
    Rs = np.einsum("bc,bc->", gi, Ric)
    Rdown = np.einsum("ae,ebcd->abcd", gm, R)
    Rup = np.einsum("ae,bf,cg,dh,efgh->abcd", gi, gi, gi, gi, Rdown)
    K = np.einsum("abcd,abcd->", Rdown, Rup)
    return Ric, Rs, K


def componentes_independentes(R, g, tol=1e-6):
    """Conta componentes independentes de R_{abcd} usando as simetrias."""
    n = R.shape[0]
    Rd = np.einsum("ae,ebcd->abcd", g, R)
    vistos = {}
    for a in range(n):
        for b in range(n):
            for c in range(n):
                for d in range(n):
                    if abs(Rd[a, b, c, d]) < tol:
                        continue
                    # classe de equivalencia sob as simetrias do Riemann
                    chave = min([(a, b, c, d), (b, a, c, d), (a, b, d, c),
                                 (b, a, d, c), (c, d, a, b), (d, c, a, b),
                                 (c, d, b, a), (d, c, b, a)])
                    vistos[chave] = Rd[a, b, c, d]
    return len(vistos)


# ======================================================================
# 1) Transporte paralelo e holonomia
# ======================================================================
def transporta(g, curva, dcurva, V0, lam=(0.0, 2.0 * np.pi)):
    """Transporta V0 paralelamente ao longo de uma curva fechada."""
    def rhs(l, V):
        x, xp = curva(l), dcurva(l)
        Gam = christoffel(g, x)
        return [-sum(Gam[a, b, c] * V[b] * xp[c]
                     for b in range(len(V)) for c in range(len(V)))
                for a in range(len(V))]
    sol = solve_ivp(rhs, lam, V0, rtol=1e-11, atol=1e-13, dense_output=True)
    return sol


def g_polar(x):
    r = x[0]
    return np.array([[1.0, 0.0], [0.0, r * r]])


def g_esfera(x):
    th = x[0]
    return np.array([[1.0, 0.0], [0.0, np.sin(th) ** 2]])


def angulo_ortonormal(g, x, V):
    """Angulo de V no referencial ortonormal local."""
    gm = g(x)
    return np.arctan2(np.sqrt(gm[1, 1]) * V[1], np.sqrt(gm[0, 0]) * V[0])


def holonomia(g, coord0, n=2000):
    """Angulo total de rotacao do vetor apos um circuito fechado.

    O angulo e' medido no referencial ortonormal local, que ele proprio da'
    uma volta completa ao percorrer o circuito. Por isso somamos 2 pi ao
    acumulado: o que interessa e' a rotacao em relacao a uma direcao fixa,
    nao em relacao a uma base que gira junto.
    """
    curva = lambda l: np.array([coord0, l])
    dcurva = lambda l: np.array([0.0, 1.0])
    sol = transporta(g, curva, dcurva, [1.0, 0.0])
    ls = np.linspace(0.0, 2.0 * np.pi, n)
    ang = np.unwrap([angulo_ortonormal(g, curva(l), sol.sol(l)) for l in ls])
    return (ang[-1] - ang[0]) + 2.0 * np.pi


holonomia_esfera = lambda t0: holonomia(g_esfera, t0)
holonomia_plano = lambda r: holonomia(g_polar, r)


def figura_holonomia():
    fig, axs = plt.subplots(1, 2, figsize=(9.2, 4.0))

    # --- esquerda: o circuito na esfera, em projecao ortografica --------
    ax = axs[0]
    th0 = 1.0
    u = np.linspace(0, 2 * np.pi, 400)
    ax.plot(np.cos(u), np.sin(u), color=LINHA, lw=1.2)          # contorno
    # calota: circulo de colatitude th0, projetado
    ax.plot(np.sin(th0) * np.cos(u), 0.42 * np.sin(th0) * np.sin(u) + np.cos(th0),
            color=PETROLEO, lw=1.8)
    ax.fill(np.sin(th0) * np.cos(u), 0.42 * np.sin(th0) * np.sin(u) + np.cos(th0),
            color=PETROLEO, alpha=0.10, lw=0)
    # vetor transportado em algumas posicoes
    sol = transporta(g_esfera, lambda l: np.array([th0, l]),
                     lambda l: np.array([0.0, 1.0]), [1.0, 0.0])
    for phi in np.linspace(0, 2 * np.pi, 9)[:-1]:
        V = sol.sol(phi)
        px = np.sin(th0) * np.cos(phi)
        py = 0.42 * np.sin(th0) * np.sin(phi) + np.cos(th0)
        # componentes ortonormais -> direcoes na projecao
        vth, vph = V[0], np.sin(th0) * V[1]
        dx = -vth * np.cos(th0) * np.cos(phi) - vph * np.sin(phi)
        dy = 0.42 * (-vth * np.cos(th0) * np.sin(phi) + vph * np.cos(phi)) \
            + vth * np.sin(th0)
        nrm = 0.22 / np.hypot(dx, dy)
        ax.arrow(px, py, dx * nrm, dy * nrm, color=AMBAR, lw=1.1,
                 head_width=0.045, length_includes_head=True)
    ax.set_xlim(-1.15, 1.15)
    ax.set_ylim(-1.15, 1.25)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title("Transporte ao longo de um paralelo")

    # --- direita: holonomia contra area envolvida ----------------------
    ax = axs[1]
    ths = np.linspace(0.25, np.pi - 0.25, 22)
    hol = np.array([holonomia_esfera(t) for t in ths])
    area = 2.0 * np.pi * (1.0 - np.cos(ths))
    ax.plot(area, area, color=LINHA, lw=3.0, label=r"identidade $\alpha = A$")
    ax.plot(area, hol, "o", color=PETROLEO, ms=4.5,
            label="esfera (numérico)")
    raios = np.linspace(0.4, 3.0, 10)
    ax.plot(np.pi * raios ** 2, [holonomia_plano(r) for r in raios], "s",
            color=AMBAR, ms=4.5, label="plano em polares (numérico)")
    ax.set_xlabel("área envolvida pelo circuito")
    ax.set_ylabel(r"holonomia $\alpha$ [rad]")
    ax.set_xlim(0, 13)
    ax.set_ylim(-0.4, 13)
    ax.legend(frameon=False, fontsize=8, loc="upper left")
    ax.set_title("A holonomia mede a curvatura, não a conexão")
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap07_holonomia.pdf", bbox_inches="tight")
    plt.close(fig)


# ======================================================================
# 3) Desvio geodesico
# ======================================================================
#  Em coordenadas polares geodesicas, ds^2 = drho^2 + f(rho)^2 dphi^2, com
#  f'' = -K f. Geodesicas radiais partem de um ponto comum e a separacao
#  propria entre duas delas, a angulo dphi, e' exatamente f(rho) dphi.
FAMILIAS = {
    1.0:  (np.sin,  lambda r: np.cos(r)),
    0.0:  (lambda r: r, lambda r: np.ones_like(r)),
    -1.0: (np.sinh, np.cosh),
}


def g_polar_geodesica(f):
    def g(x):
        return np.array([[1.0, 0.0], [0.0, f(x[0]) ** 2]])
    return g


def curvatura_gaussiana(g, x, h=1e-4):
    """K = R_{1212}/det(g), extraida do Riemann obtido por diferencas finitas.

    Em duas dimensoes o tensor de Riemann tem uma unica componente
    independente, e ela e' a curvatura de Gauss vezes o determinante.
    """
    gm = g(x)
    Rd = np.einsum("ae,ebcd->abcd", gm, riemann(g, x, h))
    return Rd[0, 1, 0, 1] / np.linalg.det(gm)


def separacao_numerica(f, dphi, s_max, s0=0.05, n=60):
    """Integra xi'' + K xi = 0 com K medido numericamente da metrica.

    Nada aqui usa a forma fechada de f: a curvatura vem do tensor de
    Riemann calculado por diferencas finitas, ponto a ponto. A comparacao
    com f(s) dphi no fim e' que e' o teste.
    """
    g = g_polar_geodesica(f)

    def rhs(s, y):
        K = curvatura_gaussiana(g, np.array([s, 0.0]))
        return [y[1], -K * y[0]]

    # condicao inicial: separacao e taxa de separacao em s0
    eps = 1e-4
    xi0 = f(np.array([s0]))[0] * dphi
    dxi0 = (f(np.array([s0 + eps]))[0] - f(np.array([s0 - eps]))[0]) \
        / (2.0 * eps) * dphi
    sol = solve_ivp(rhs, [s0, s_max], [xi0, dxi0],
                    rtol=1e-10, atol=1e-14, dense_output=True)
    s = np.linspace(s0, s_max, n)
    return s, sol.sol(s)[0]


def figura_desvio():
    fig, ax = plt.subplots(figsize=(6.4, 4.2))
    dphi = 0.02
    cores = {1.0: PETROLEO, 0.0: GRAFITE, -1.0: TERRACOTA}
    nomes = {1.0: r"$K=+1$  (esfera):  $\xi \propto \sin s$",
             0.0: r"$K=0$  (plano):  $\xi \propto s$",
             -1.0: r"$K=-1$  (hiperbólico):  $\xi \propto \sinh s$"}
    for K, (f, _) in FAMILIAS.items():
        s_max = np.pi - 0.15 if K > 0 else 2.4
        s, sep = separacao_numerica(f, dphi, s_max)
        ax.plot(s, f(s) * dphi, color=cores[K], lw=2.6, alpha=0.35)
        ax.plot(s, sep, "o", color=cores[K], ms=3.4, label=nomes[K])
    ax.set_xlabel(r"comprimento de arco $s$ ao longo da geodésica")
    ax.set_ylabel(r"separação própria $\xi(s)$")
    ax.legend(frameon=False, fontsize=8.5, loc="upper left")
    ax.set_title(r"Desvio geodésico: solução de $\xi'' + K\,\xi = 0$")
    ax.set_ylim(0, 0.12)
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap07_desvio_geodesico.pdf", bbox_inches="tight")
    plt.close(fig)


# ======================================================================
def g_schwarzschild(x):
    """Schwarzschild com M = 1, coordenadas (t, r, theta, phi)."""
    _, r, th, _ = x
    f = 1.0 - 2.0 / r
    return np.diag([-f, 1.0 / f, r * r, r * r * np.sin(th) ** 2])


if __name__ == "__main__":
    print("== 1) Holonomia: transporte paralelo em circuito fechado ==")
    print("plano euclidiano em coordenadas polares (Christoffel nao nulos):")
    for raio in (0.5, 1.0, 2.0, 4.0):
        print(f"   circuito r = {raio:4.1f}:  holonomia = "
              f"{holonomia_plano(raio):+.3e} rad")
    print("esfera unitaria (a holonomia deve ser a area da calota):")
    print(f"{'theta_0':>10}{'holonomia':>14}{'area 2pi(1-cos)':>18}{'erro':>12}")
    for t0 in (0.5, 1.0, np.pi / 2, 2.0, 2.6):
        h, A = holonomia_esfera(t0), 2 * np.pi * (1 - np.cos(t0))
        print(f"{t0:10.4f}{h:14.8f}{A:18.8f}{abs(h - A):12.2e}")

    print("\n== 2) Riemann por diferencas finitas, direto da metrica ==")
    x2 = np.array([1.1, 0.7])
    for nome, g, esperado in (("esfera unitaria", g_esfera, 2.0),
                              ("plano em polares", g_polar, 0.0)):
        _, Rs, _ = invariantes(g, x2)
        print(f"   {nome:<22} R = {Rs:+.8f}   (exato: {esperado:+.1f})")

    xs = np.array([0.0, 8.0, 1.0, 0.0])
    Ric, Rs, K = invariantes(g_schwarzschild, xs, h=1e-3)
    print(f"   Schwarzschild em r = 8 M:")
    print(f"      max |R_munu|  = {np.abs(Ric).max():.3e}   (exato: 0)")
    print(f"      R             = {Rs:+.3e}          (exato: 0)")
    print(f"      Kretschmann   = {K:.10f}")
    print(f"      48 M^2/r^6    = {48.0 / 8.0**6:.10f}")
    R4 = riemann(g_schwarzschild, xs, h=1e-3)
    print(f"      componentes nao nulas de R_abcd: "
          f"{int((np.abs(np.einsum('ae,ebcd->abcd', g_schwarzschild(xs), R4)) > 1e-6).sum())}"
          f" de {4**4}")
    print(f"      independentes sob as simetrias:  "
          f"{componentes_independentes(R4, g_schwarzschild(xs))}"
          f"   (o maximo em 4D e' 20)")

    print("\n== 3) Desvio geodesico: xi'' + K xi = 0 ==")
    print("K vem do Riemann numerico; xi e' integrado; a coluna analitica e'")
    print("a solucao fechada, usada so' para conferir no fim.")
    dphi = 0.02
    print(f"{'K exato':>9}{'K medido':>12}{'s':>7}{'xi integrado':>16}"
          f"{'xi analitico':>16}{'erro rel.':>12}")
    for K, (f, _) in FAMILIAS.items():
        Kmed = curvatura_gaussiana(g_polar_geodesica(f), np.array([1.0, 0.0]))
        for smax in (0.5, 1.5, 2.4):
            s, sep = separacao_numerica(f, dphi, smax)
            ana = f(np.array([s[-1]]))[0] * dphi
            print(f"{K:9.0f}{Kmed:12.6f}{s[-1]:7.2f}{sep[-1]:16.10f}"
                  f"{ana:16.10f}{abs(sep[-1] / ana - 1):12.2e}")

    figura_holonomia()
    figura_desvio()
    print(f"\nFiguras salvas em {OUTDIR}")
