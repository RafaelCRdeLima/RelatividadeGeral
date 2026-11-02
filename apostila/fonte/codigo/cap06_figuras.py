"""Gera as figuras expositivas do Capitulo 6.

Uso:
    python3 cap06_figuras.py

Salva os PDFs em ../figuras/. Sao quatro:

  cap06_triangulo_esferico.pdf  transporte no triangulo, e a rotacao de pi/2
  cap06_circuito.pdf            o circuito infinitesimal que produz Riemann
  cap06_desvio_familia.pdf      desvio geodesico, na esfera e como mare
  cap06_ricci_volume.pdf        Ricci como soma: volume contra forma
  cap06_tres_falhas.pdf         Lie, torcao e Riemann: tres falhas distintas

Nao usa Axes3D: a esfera e' projetada a mao, por rotacao e projecao
ortografica, o que da controle total sobre o que fica visivel e evita
depender de um backend 3D que nem sempre esta disponivel.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

plt.rcParams.update({
    "font.family": "serif",
    "mathtext.fontset": "cm",
    "font.size": 12,
    "axes.linewidth": 0.9,
})

HALO = [pe.withStroke(linewidth=3.0, foreground="white")]
AZUL, VERM, LARANJA, CINZA, VERDE = "#2A6F9E", "#B03A48", "#C2703A", "#555555", "#2E7D52"


def _limpa(ax):
    for lado in ("top", "right", "bottom", "left"):
        ax.spines[lado].set_visible(False)
    ax.set_xticks([]); ax.set_yticks([])


# --------------------------------------------------------------------
#  projecao da esfera: rotaciona e joga fora a profundidade
# --------------------------------------------------------------------
# Olhamos pela bissetriz do octante (phi = 45 graus), com o polo inclinado
# para a frente: so' assim as tres pernas do triangulo ficam todas visiveis.
_LAT, _LON = np.radians(-20.0), np.radians(45.0)


def _proj(p):
    """(x,y,z) -> (X,Y,profundidade). Profundidade > 0 e' o lado visivel."""
    p = np.asarray(p, float)
    cl, sl = np.cos(_LON), np.sin(_LON)
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    x, y = cl * x - sl * y, sl * x + cl * y
    ca, sa = np.cos(_LAT), np.sin(_LAT)
    y, z = ca * y - sa * z, sa * y + ca * z
    return np.stack([x, z, y], axis=-1)


def _ponto(th, ph):
    return np.array([np.sin(th) * np.cos(ph), np.sin(th) * np.sin(ph), np.cos(th)])


def _arco(ax, f, t0, t1, n=200, **kw):
    """Desenha um arco na esfera, escondendo o pedaco que passa por tras."""
    ts = np.linspace(t0, t1, n)
    P = _proj(np.array([f(t) for t in ts]))
    vis = P[:, 2] >= -1e-9
    seg, atual = [], []
    for k in range(n):
        if vis[k]:
            atual.append(P[k, :2])
        elif atual:
            seg.append(np.array(atual)); atual = []
    if atual:
        seg.append(np.array(atual))
    for s in seg:
        if len(s) > 1:
            ax.plot(s[:, 0], s[:, 1], **kw)


def _seta(ax, base, vetor, cor, lw=2.2, escala=0.42):
    b = _proj(base); p = _proj(base + escala * np.asarray(vetor, float))
    if b[2] < -1e-9:
        return
    ax.annotate("", xy=(p[0], p[1]), xytext=(b[0], b[1]),
                arrowprops=dict(arrowstyle="-|>", color=cor, lw=lw,
                                shrinkA=0, shrinkB=0, mutation_scale=13))


def e_th(th, ph):
    return np.array([np.cos(th) * np.cos(ph), np.cos(th) * np.sin(ph), -np.sin(th)])


def triangulo_esferico():
    """O transporte no triangulo, e os 90 graus que sobram (Secao 6.4).

    O vetor transportado e' sempre e_theta: ele e' tangente aos dois
    meridianos (que sao geodesicas) e perpendicular ao equador (idem), de
    modo que o transporte e' trivial em cada perna -- o giro todo vem de o
    triangulo ter area, nao de nada que aconteca dentro das pernas.
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.6, 4.6),
                                   gridspec_kw={"width_ratios": [1.25, 1]})

    # ---------- painel (a): a esfera ----------
    t = np.linspace(0, 2 * np.pi, 400)
    ax1.plot(np.cos(t), np.sin(t), color="#BBBBBB", lw=1.1)       # silhueta
    for ph in np.linspace(0, 2 * np.pi, 13)[:-1]:                  # meridianos
        _arco(ax1, lambda s, ph=ph: _ponto(s, ph), 0, np.pi,
              color="#E4E4E4", lw=0.7, zorder=1)
    for th in np.linspace(np.pi / 6, 5 * np.pi / 6, 5):            # paralelos
        _arco(ax1, lambda s, th=th: _ponto(th, s), 0, 2 * np.pi,
              color="#E4E4E4", lw=0.7, zorder=1)

    # o triangulo: meridiano phi=0, equador, meridiano phi=pi/2
    for f, t0, t1 in ((lambda s: _ponto(s, 0.0), 0.02, np.pi / 2),
                      (lambda s: _ponto(np.pi / 2, s), 0.0, np.pi / 2),
                      (lambda s: _ponto(s, np.pi / 2), 0.02, np.pi / 2)):
        _arco(ax1, f, t0, t1, color=AZUL, lw=2.4, zorder=3)

    # o vetor ao longo do percurso: sempre e_theta
    marcas = ([(th, 0.0) for th in (0.25, 0.70, 1.20)]
              + [(np.pi / 2, ph) for ph in (0.25, 0.78, 1.32)]
              + [(th, np.pi / 2) for th in (1.20, 0.70, 0.25)])
    for k, (th, ph) in enumerate(marcas):
        cor = LARANJA if k < 3 else (VERDE if k < 6 else VERM)
        _seta(ax1, _ponto(th, ph), e_th(th, ph), cor, lw=2.2, escala=0.34)

    P = _proj(_ponto(0.02, 0.0))
    ax1.text(P[0], P[1] + 0.10, "polo", ha="center", fontsize=10, color=CINZA)
    ax1.text(0.0, -1.22, r"o vetor é sempre $\vec e_\theta$:"
                         "\ntangente aos meridianos, normal ao equador",
             ha="center", fontsize=9.5, color=CINZA)
    ax1.set_xlim(-1.25, 1.25); ax1.set_ylim(-1.45, 1.30)
    ax1.set_aspect("equal"); _limpa(ax1)
    ax1.set_title("(a) as três pernas", fontsize=11)

    # ---------- painel (b): o que chega, visto do polo ----------
    ax2.plot(0, 0, "o", color="#333333", ms=6)
    ax2.annotate("", xy=(0.92, 0), xytext=(0, 0),
                 arrowprops=dict(arrowstyle="-|>", color=LARANJA, lw=2.6,
                                 mutation_scale=15))
    ax2.annotate("", xy=(0, 0.92), xytext=(0, 0),
                 arrowprops=dict(arrowstyle="-|>", color=VERM, lw=2.6,
                                 mutation_scale=15))
    ax2.text(0.99, 0.02, "partiu\n(meridiano $\\varphi=0$)", color=LARANJA,
             fontsize=10, va="center")
    ax2.text(0.03, 1.0, "voltou\n(meridiano $\\varphi=\\pi/2$)", color=VERM,
             fontsize=10, ha="left")
    arc = np.linspace(0, np.pi / 2, 80)
    ax2.plot(0.42 * np.cos(arc), 0.42 * np.sin(arc), color=CINZA, lw=1.2)
    ax2.text(0.36 * np.cos(np.pi / 4), 0.36 * np.sin(np.pi / 4), r"$\pi/2$",
             color=CINZA, fontsize=12, ha="center", va="center",
             path_effects=HALO)
    ax2.text(0.0, -0.55, r"holonomia $=\dfrac{\text{área}}{a^2}"
                         r"=\dfrac{4\pi a^2/8}{a^2}=\dfrac{\pi}{2}$",
             ha="center", fontsize=11)
    ax2.text(0.0, -1.15, "as componentes coordenadas, porém,\n"
                         r"são $(1,0)$ nos dois casos: a base girou junto",
             ha="center", fontsize=9.5, color=CINZA)
    ax2.set_xlim(-0.75, 1.85); ax2.set_ylim(-1.45, 1.30)
    ax2.set_aspect("equal"); _limpa(ax2)
    ax2.set_title("(b) no polo, comparando direções", fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap06_triangulo_esferico.pdf")
    plt.close(fig)


def circuito():
    """O circuito infinitesimal que produz Riemann (Secao 6.5).

    O desenho existe para numerar as quatro pernas da deducao e marcar
    QUAL Gamma e' avaliado ONDE -- que e' a unica sutileza da conta.
    """
    fig, ax = plt.subplots(figsize=(7.4, 4.5))

    A = np.array([0.0, 0.0]); da = np.array([2.3, 0.25]); db = np.array([0.55, 1.75])
    B, C, D = A + da, A + da + db, A + db

    ax.add_patch(plt.Polygon([A, B, C, D], closed=True, facecolor="#F3F6F8",
                             edgecolor="none", zorder=0))
    pernas = [(A, B, LARANJA, r"1", r"$+\delta a$"),
              (B, C, VERDE,   r"2", r"$+\delta b$"),
              (C, D, VERM,    r"3", r"$-\delta a$"),
              (D, A, AZUL,    r"4", r"$-\delta b$")]
    for (P, Q, cor, num, rot) in pernas:
        ax.annotate("", xy=Q, xytext=P,
                    arrowprops=dict(arrowstyle="-|>", color=cor, lw=2.6,
                                    mutation_scale=15))
        m = 0.5 * (P + Q)
        d = Q - P; nrm = np.array([-d[1], d[0]]); nrm = nrm / np.linalg.norm(nrm)
        ax.text(*(m + 0.17 * nrm), rot, color=cor, fontsize=12,
                ha="center", va="center", path_effects=HALO)
        ax.text(*(m - 0.19 * nrm), num, color=cor, fontsize=10,
                ha="center", va="center",
                bbox=dict(boxstyle="circle,pad=0.16", fc="white", ec=cor, lw=1.1))

    for P, rot, dx, dy in ((A, r"$x$", -0.13, -0.17), (B, r"$x+\delta a$", 0.05, -0.20),
                           (C, r"$x+\delta a+\delta b$", 0.06, 0.12),
                           (D, r"$x+\delta b$", -0.16, 0.14)):
        ax.plot(*P, "o", color="#333333", ms=5.5, zorder=4)
        ax.text(P[0] + dx, P[1] + dy, rot, fontsize=10.5, color="#333333",
                ha="left" if dx > 0 else "right", path_effects=HALO)

    # a sutileza: na perna 2, Gamma e' avaliado em x+da, nao em x
    ax.annotate(r"aqui $\Gamma$ já mudou:" "\n"
                r"$\Gamma+\partial_\mu\Gamma\,\delta a^\mu$",
                xy=(B[0] + 0.10, B[1] + 0.55), xytext=(B[0] + 0.62, B[1] + 0.30),
                fontsize=9.5, color=VERDE,
                arrowprops=dict(arrowstyle="->", color=VERDE, lw=1.2))
    ax.text(0.5 * (A[0] + C[0]), 0.5 * (A[1] + C[1]) - 0.08,
            r"$\delta V^\rho=-R^\rho{}_{\sigma\mu\nu}V^\sigma\,"
            r"\delta a^\mu\,\delta b^\nu$",
            ha="center", fontsize=12, path_effects=HALO)
    ax.text(0.5 * (A[0] + C[0]), -0.62,
            "as pernas 1 e 3 se cancelam em primeira ordem;\n"
            "o que sobra é de segunda, e é a curvatura",
            ha="center", fontsize=9.5, color=CINZA)

    ax.set_xlim(-0.75, 3.55); ax.set_ylim(-0.95, 2.45)
    ax.set_aspect("equal"); _limpa(ax)
    fig.tight_layout()
    fig.savefig(OUTDIR / "cap06_circuito.pdf")
    plt.close(fig)


def desvio_familia():
    """Desvio geodesico: a familia, U e xi; esfera e mare newtoniana."""
    fig, axs = plt.subplots(1, 3, figsize=(10.6, 3.9))

    # ---------- (a) a familia, U e xi ----------
    # Mostramos so' o trecho ANTES do cruzamento: a figura existe para
    # definir U e xi, nao para antecipar a focalizacao, que e' o painel (b).
    ax = axs[0]
    s_ = np.linspace(0, 2.2, 200)
    for k, x0 in enumerate(np.linspace(-0.72, 0.72, 5)):
        ax.plot(x0 * (1 - 0.17 * s_), s_,
                color=AZUL if k == 3 else "#C2D2DC",
                lw=2.4 if k == 3 else 1.3, zorder=2)
    s0 = 1.0
    xa = 0.36 * (1 - 0.17 * s0); xb = 0.72 * (1 - 0.17 * s0)
    ax.annotate("", xy=(xb, s0), xytext=(xa, s0),
                arrowprops=dict(arrowstyle="-|>", color=VERM, lw=2.4,
                                mutation_scale=14))
    ax.text(0.5 * (xa + xb), s0 + 0.13, r"$\vec\xi$", color=VERM,
            fontsize=14, ha="center", path_effects=HALO)
    ax.annotate("", xy=(xb * 0.985, s0 + 0.70), xytext=(xb, s0),
                arrowprops=dict(arrowstyle="-|>", color=VERDE, lw=2.4,
                                mutation_scale=14))
    ax.text(xb + 0.07, s0 + 0.40, r"$\vec U$", color=VERDE, fontsize=14,
            path_effects=HALO)
    ax.set_title("(a) a família", fontsize=11)
    ax.set_xlim(-1.05, 1.15); ax.set_ylim(-0.40, 2.50); _limpa(ax)
    ax.text(0.05, -0.30, r"$\nabla_{\vec U}\vec U=0$,"
                         r"   $[\vec U,\vec\xi]=0$",
            ha="center", fontsize=10, color=CINZA)

    # ---------- (b) esfera: K>0 foca ----------
    ax = axs[1]
    t = np.linspace(0, np.pi, 300)
    for x0 in (0.92, 0.55, 0.18, -0.18, -0.55, -0.92):
        ax.plot(x0 * np.sin(t), np.cos(t), color=AZUL, lw=1.5)
    ax.plot([0], [1.0], "o", color=VERM, ms=7, zorder=4)
    ax.plot([0], [-1.0], "o", color="#333333", ms=6, zorder=4)
    ax.text(0, 1.16, "voltam a se encontrar", color=VERM, fontsize=10,
            ha="center")
    ax.text(0, -1.22, "partem paralelas", color="#333333", fontsize=10,
            ha="center")
    ax.set_title(r"(b) esfera: $\ddot\xi=-\xi/a^2$", fontsize=11)
    ax.set_xlim(-1.30, 1.30); ax.set_ylim(-1.75, 1.60)
    ax.set_aspect("equal"); _limpa(ax)
    ax.text(0, -1.62, "curvatura positiva foca", ha="center", fontsize=10,
            color=CINZA)

    # ---------- (c) a mare newtoniana ----------
    ax = axs[2]
    ax.add_patch(plt.Circle((0, -2.05), 0.62, color="#4A6FA5", alpha=0.25))
    ax.text(0, -2.05, "M", ha="center", va="center", fontsize=11,
            color="#20405F")
    ax.plot([0, 0], [-1.43, 1.50], color="#DDDDDD", lw=0.9, ls=":", zorder=0)

    # par RADIAL: afastam-se (a de baixo cai mais)
    for y, L in ((1.30, 0.34), (0.45, -0.34)):
        ax.plot(0, y, "o", color=LARANJA, ms=8, zorder=3)
        ax.annotate("", xy=(0, y + L), xytext=(0, y),
                    arrowprops=dict(arrowstyle="-|>", color=VERM, lw=2.0,
                                    mutation_scale=13))
    ax.text(0.14, 0.88, "radial:\nafastam-se", color=VERM, fontsize=10,
            va="center")
    ax.text(-0.16, 0.88, r"$+\dfrac{2GM}{r^3}\xi$", color=VERM,
            fontsize=11, va="center", ha="right")

    # par TRANSVERSAL: aproximam-se
    for x in (-0.95, 0.95):
        ax.plot(x, -0.75, "o", color=LARANJA, ms=8, zorder=3)
        ax.annotate("", xy=(x - np.sign(x) * 0.34, -0.75), xytext=(x, -0.75),
                    arrowprops=dict(arrowstyle="-|>", color=AZUL, lw=2.0,
                                    mutation_scale=13))
    ax.text(0, -1.12, r"transversal: aproximam-se,  $-\dfrac{GM}{r^3}\xi$",
            color=AZUL, fontsize=10, ha="center")

    ax.set_title("(c) e isso é a maré", fontsize=11)
    ax.set_xlim(-1.75, 1.75); ax.set_ylim(-3.00, 1.95)
    ax.set_aspect("equal"); _limpa(ax)
    ax.text(0, -2.88, r"traço nulo: $2-1-1=0$", ha="center", fontsize=10,
            color=CINZA)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap06_desvio_familia.pdf")
    plt.close(fig)



# --------------------------------------------------------------------
#  Ricci: a soma das direcoes transversais, e o que ela nao ve
# --------------------------------------------------------------------
# Tubos de geodesicas em perspectiva, e nao secoes achatadas: o ponto da
# figura e' que as duas direcoes transversais podem ter TENDENCIAS
# OPOSTAS, e isso so' se ve num solido -- uma face fechando enquanto a
# outra abre. As tampas sao sombreadas para que as duas se comparem de
# relance.
#
# Projecao axonometrica simples: x corre ao longo do feixe, y e' a
# profundidade (e_2) e z a altura (e_1). Nao usa Axes3D, pela mesma razao
# das outras figuras deste arquivo.
ROXO = "#6B4E9B"

_DY, _DZ = 0.62, -0.46          # para onde a profundidade escorre na tela


def _ax3(x, y, z):
    return x + _DY * y, z + _DZ * y


def _quad(ax, cantos, cor, alpha, lw=0.0, z=2):
    pts = [_ax3(*c) for c in cantos]
    ax.add_patch(plt.Polygon(pts, closed=True, facecolor=cor, alpha=alpha,
                             edgecolor=cor, lw=lw, zorder=z))


def _tubo(ax, L, h0, h1, w0, w1):
    """O feixe como solido: faces sombreadas, tampas destacadas.

    Sem as faces o desenho vira uma chapa e some justamente o que ele
    tem de mostrar -- que as duas direcoes transversais podem ir para
    lados opostos. A aresta escondida vai tracejada, como num croqui.
    """
    def hw(t):
        return h0 + (h1 - h0) * t, w0 + (w1 - w0) * t

    # arestas de tras, primeiro e mais claras
    for sy, sz in ((-1, -1),):
        P = np.array([_ax3(L * t, sy * hw(t)[1], sz * hw(t)[0])
                      for t in np.linspace(0, 1, 40)])
        ax.plot(P[:, 0], P[:, 1], color=AZUL, lw=1.2, alpha=0.40,
                ls=(0, (4, 3)), zorder=1)

    # face de cima e face da frente: e' delas que vem o volume
    _quad(ax, [(0, -w0, h0), (L, -w1, h1), (L, w1, h1), (0, w0, h0)],
          AZUL, 0.13, z=2)
    _quad(ax, [(0, w0, -h0), (L, w1, -h1), (L, w1, h1), (0, w0, h0)],
          AZUL, 0.22, z=2)

    # arestas da frente
    for sy, sz in ((1, 1), (1, -1), (-1, 1)):
        P = np.array([_ax3(L * t, sy * hw(t)[1], sz * hw(t)[0])
                      for t in np.linspace(0, 1, 40)])
        ax.plot(P[:, 0], P[:, 1], color=AZUL, lw=1.5, zorder=4)

    # as duas secoes transversais, que e' o que se compara
    for x, (h, w) in ((0.0, (h0, w0)), (L, (h1, w1))):
        _quad(ax, [(x, -w, -h), (x, w, -h), (x, w, h), (x, -w, h)],
              ROXO, 0.50, lw=1.5, z=5)


def ricci_volume():
    """Tres feixes: as duas transversais apertam, se compensam, ou abrem.

    As areas das tampas sao exatas. No painel do meio o produto das
    meias-medidas vale 0.25 nas duas pontas, de modo que a igualdade que a
    legenda afirma se mede na figura.
    """
    L = 2.9
    PAINEIS = (
        (0.50, 0.30, 0.50, 0.30,
         r"(a) $R_{\mu\nu}U^\mu U^\nu>0$",
         (r"$\kappa_1>0$ fecha", r"$\kappa_2>0$ fecha"),
         "as duas fecham:\no volume encolhe", VERM),
        (0.50, 0.30, 0.50, 0.25 / 0.30,
         r"(b) $R_{\mu\nu}U^\mu U^\nu=0$",
         (r"$\kappa_1>0$ fecha", r"$\kappa_2<0$ abre"),
         "uma fecha o quanto a outra abre:\na área se conserva nesta ordem", VERDE),
        (0.50, 0.90, 0.50, 0.50,
         r"(c) $R_{\mu\nu}U^\mu U^\nu<0$",
         (r"$\kappa_1<0$ abre", r"$\kappa_2=0$ fica"),
         "uma abre, a outra fica:\no volume cresce", AZUL),
    )

    fig, axes = plt.subplots(1, 3, figsize=(8.6, 3.4))

    for ax, (h0, h1, w0, w1, titulo, kap, nota, cor) in zip(axes, PAINEIS):
        _tubo(ax, L, h0, h1, w0, w1)

        # o triedro na ponta de partida
        o = _ax3(0.0, 0.0, 0.0)
        for alvo, c, rot in ((_ax3(0, 0, h0 + 0.42), VERM, r"$\vec e_1$"),
                             (_ax3(0, w0 + 0.42, 0), LARANJA, r"$\vec e_2$"),
                             (_ax3(1.15, 0, 0), CINZA, r"$\vec U$")):
            ax.annotate("", xy=alvo, xytext=o,
                        arrowprops=dict(arrowstyle="-|>", color=c, lw=1.8),
                        zorder=5)
            ax.text(alvo[0] + 0.06, alvo[1] + 0.06, rot, color=c,
                    fontsize=13.5, path_effects=HALO, zorder=6)

        ax.text(-1.00, -1.95, kap[0], color=VERM, fontsize=12)
        ax.text(-1.00, -2.35, kap[1], color=LARANJA, fontsize=12)
        ax.text(1.55, -3.52, nota, fontsize=12, ha="center", color=cor)

        ax.set_title(titulo, fontsize=13)
        ax.set_xlim(-1.15, 4.35); ax.set_ylim(-4.05, 1.55)
        ax.set_aspect("equal"); _limpa(ax)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap06_ricci_volume.pdf")
    plt.close(fig)



# --------------------------------------------------------------------
#  Lie, torcao, Riemann: tres falhas que se parecem e nao sao a mesma
# --------------------------------------------------------------------
def tres_falhas():
    """As tres falhas da Secao 6.7, lado a lado.

    O ponto do desenho e' que as tres sao a MESMA tentativa -- fechar um
    quadrilatero -- falhando de tres jeitos. Nos dois primeiros paineis o
    quadrilatero nao fecha, e o que muda e' o que construiu as pernas:
    fluxos num caso, transporte paralelo no outro. No terceiro ele fecha,
    e quem nao volta igual e' o vetor.
    """
    fig, axs = plt.subplots(1, 3, figsize=(7.7, 3.25))
    E = 1.0                       # o "infinitesimal", exagerado para caber
    seta = dict(arrowstyle="-|>", lw=2.3, mutation_scale=13)
    ROXO = "#7E3F9D"

    def cabecalho(ax, titulo, rodape):
        ax.set_title(titulo, fontsize=9.5, color=CINZA, pad=10,
                     fontweight="bold")
        ax.text(0.5, -0.07, rodape, transform=ax.transAxes, ha="center",
                va="top", fontsize=8.2, color=CINZA, linespacing=1.5)

    def falha(ax, a, b, texto, dx=0.13, dy=0.0, ha="left"):
        """A seta curta que mede o quanto o quadrilatero deixou de fechar."""
        ax.annotate("", xy=b, xytext=a,
                    arrowprops=dict(arrowstyle="-|>", color=ROXO, lw=2.2,
                                    mutation_scale=12, shrinkA=0, shrinkB=0))
        m = 0.5 * (np.asarray(a, float) + np.asarray(b, float))
        ax.text(m[0] + dx, m[1] + dy, texto, color=ROXO, fontsize=9.5,
                ha=ha, va="center", path_effects=HALO)

    def ponto(ax, P, rot=None, dx=-0.08, dy=-0.16, ha="right"):
        ax.plot(*P, "o", color="#333333", ms=4.4, zorder=6)
        if rot:
            ax.text(P[0] + dx, P[1] + dy, rot, fontsize=10.5, ha=ha,
                    path_effects=HALO)

    rot = lambda v, a: np.array([np.cos(a) * v[0] - np.sin(a) * v[1],
                                 np.sin(a) * v[0] + np.cos(a) * v[1]])

    # ---------- 1. comutador de Lie: as pernas sao fluxos ----------
    #  X = d/dx;  Y = (1 + 0.55 x) d/dy.  Logo [X,Y] = 0.55 d/dy != 0: a
    #  subida e' mais rapida a direita, e e' so' disso que o comutador vive.
    ax = axs[0]
    k, p0 = 0.55, np.array([0.0, 0.0])
    alto = E * (1 + k * E)
    for xx in (0.0, E):                       # linhas de fluxo de Y, ao fundo
        ax.plot([xx, xx], [-0.10, alto + 0.16], color="#CCD6DD", lw=0.9, zorder=0)

    q1 = np.array([E, alto])                  # X depois Y  (sobe mais)
    q2 = np.array([E, E])                     # Y depois X
    ax.annotate("", xy=(E, 0.0), xytext=p0, arrowprops=dict(color=LARANJA, **seta))
    ax.annotate("", xy=q1, xytext=(E, 0.0), arrowprops=dict(color=VERDE, **seta))
    ax.annotate("", xy=(0.0, E), xytext=p0, arrowprops=dict(color=VERDE, **seta))
    ax.annotate("", xy=q2, xytext=(0.0, E), arrowprops=dict(color=LARANJA, **seta))

    ax.text(E * 0.5, -0.19, r"$\vec X$", color=LARANJA, fontsize=11,
            ha="center", path_effects=HALO)
    ax.text(-0.11, E * 0.5, r"$\vec Y$", color=VERDE, fontsize=11,
            ha="right", va="center", path_effects=HALO)
    ax.text(E * 0.5, E + 0.09, r"$\vec X$", color=LARANJA, fontsize=11,
            ha="center", path_effects=HALO)
    ax.annotate("$\\vec Y$ é maior\naqui", xy=(E + 0.03, 0.78), xytext=(E + 0.17, 0.52),
                fontsize=8.6, color=VERDE, ha="left", va="center",
                linespacing=1.4,
                arrowprops=dict(arrowstyle="->", color=VERDE, lw=1.0))
    falha(ax, q2, q1, r"$\varepsilon^2[\vec X,\vec Y]$", dx=0.12)
    ponto(ax, p0, r"$p$"); ponto(ax, q1); ponto(ax, q2)
    ax.set_xlim(-0.42, 1.92); ax.set_ylim(-0.38, 1.80)
    cabecalho(ax, "COMUTADOR DE LIE",
              "pernas = fluxos\nnão fecha: os pontos diferem")

    # ---------- 2. torcao: as pernas sao transporte paralelo ----------
    ax = axs[1]
    p0 = np.array([0.0, 0.0]); X = np.array([E, 0.0]); Y = np.array([0.0, E])
    #  o transporte gira cada vetor um pouco, e os dois se abrem: e' esse
    #  descasamento das pontas que a torcao mede.
    g = np.radians(11.0)
    q1 = X + rot(Y, -g)                       # Y transportado ao longo de X
    q2 = Y + rot(X, +g)                       # X transportado ao longo de Y
    #  onde o paralelogramo teria fechado
    ax.plot(*np.array([X, X + Y]).T, ls=(0, (3, 2.6)), color="#AFBCC6", lw=1.0, zorder=1)
    ax.plot(*np.array([Y, X + Y]).T, ls=(0, (3, 2.6)), color="#AFBCC6", lw=1.0, zorder=1)
    ax.plot(*(X + Y), "o", color="#AFBCC6", ms=3.6, zorder=1)

    ax.annotate("", xy=X, xytext=p0, arrowprops=dict(color=LARANJA, **seta))
    ax.annotate("", xy=q1, xytext=X, arrowprops=dict(color=VERDE, **seta))
    ax.annotate("", xy=Y, xytext=p0, arrowprops=dict(color=VERDE, **seta))
    ax.annotate("", xy=q2, xytext=Y, arrowprops=dict(color=LARANJA, **seta))

    ax.text(E * 0.5, -0.19, r"$\vec X$", color=LARANJA, fontsize=11,
            ha="center", path_effects=HALO)
    ax.text(-0.11, E * 0.5, r"$\vec Y$", color=VERDE, fontsize=11,
            ha="right", va="center", path_effects=HALO)
    ax.text(E * 0.47, E + 0.26, r"$\vec X$", color=LARANJA, fontsize=11,
            ha="center", path_effects=HALO)
    ax.text(E + 0.20, E * 0.52, r"$\vec Y$", color=VERDE, fontsize=11,
            ha="left", va="center", path_effects=HALO)
    falha(ax, q1, q2, r"$\varepsilon^2\vec T(\vec X,\vec Y)$", dx=0.10, dy=0.17)
    ponto(ax, p0, r"$p$"); ponto(ax, q1); ponto(ax, q2)
    ax.set_xlim(-0.42, 1.92); ax.set_ylim(-0.38, 1.80)
    cabecalho(ax, "TORÇÃO",
              "pernas = transporte paralelo\nnão fecha: os pontos diferem")

    # ---------- 3. Riemann: o circuito fecha, o vetor nao volta igual -----
    ax = axs[2]
    A = np.array([0.0, 0.0]); B = np.array([E, 0.0])
    C = np.array([E, E]);     D = np.array([0.0, E])
    ax.add_patch(plt.Polygon([A, B, C, D], closed=True, facecolor="#EFF4F7",
                             edgecolor="none", zorder=0))
    for (P, Q, cor) in ((A, B, LARANJA), (B, C, VERDE),
                        (C, D, LARANJA), (D, A, VERDE)):
        ax.annotate("", xy=Q, xytext=P,
                    arrowprops=dict(arrowstyle="-|>", color=cor, lw=1.8,
                                    mutation_scale=11, alpha=0.6))
    V = np.array([0.80, 0.26])
    Vl = rot(V, np.radians(38.0))
    ax.annotate("", xy=A + V, xytext=A, arrowprops=dict(color=AZUL, **seta))
    ax.annotate("", xy=A + Vl, xytext=A,
                arrowprops=dict(arrowstyle="-|>", color=VERM, lw=2.3,
                                mutation_scale=13, ls=(0, (4, 2))))
    th = np.linspace(np.arctan2(V[1], V[0]), np.arctan2(Vl[1], Vl[0]), 60)
    r = 0.56
    ax.plot(r * np.cos(th), r * np.sin(th), color=VERM, lw=1.1)
    ax.text(0.66 * np.cos(th.mean()), 0.66 * np.sin(th.mean()) + 0.03,
            r"$\delta\vec V$", color=VERM, fontsize=10.5,
            ha="center", va="bottom", path_effects=HALO)
    ax.text(A[0] + V[0] + 0.06, A[1] + V[1] - 0.03, r"$\vec V$", color=AZUL,
            fontsize=11, ha="left", va="center", path_effects=HALO)
    ax.text(A[0] + Vl[0] - 0.14, A[1] + Vl[1] + 0.04, r"$\vec V'$", color=VERM,
            fontsize=11, ha="right", va="center", path_effects=HALO)
    ponto(ax, A, r"$p$")
    ax.set_xlim(-0.42, 1.92); ax.set_ylim(-0.38, 1.80)
    cabecalho(ax, "RIEMANN",
              "o circuito fecha\no vetor volta girado")

    for ax in axs:
        ax.set_aspect("equal"); _limpa(ax)
    fig.tight_layout()
    fig.subplots_adjust(bottom=0.19, wspace=0.05)
    fig.savefig(OUTDIR / "cap06_tres_falhas.pdf")
    plt.close(fig)


if __name__ == "__main__":
    triangulo_esferico()
    circuito()
    desvio_familia()
    ricci_volume()
    tres_falhas()
    print("figuras do capitulo 6 geradas em", OUTDIR)
