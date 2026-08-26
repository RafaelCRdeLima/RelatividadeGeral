"""Gera as figuras do Capitulo 2 (Vetores e momento relativistico).

Uso:
    python3 cap02_figuras.py

Salva os PDFs em ../figuras/. Unidades geometrizadas (c=1).
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

# halo branco atras do texto, para os rotulos nao se confundirem
# com as linhas que passam por tras
HALO = [pe.withStroke(linewidth=3.0, foreground="white")]


# ---------------------------------------------------------------------
# Figura 1: diagrama de massa (E vs |p|) -- casca de massa
# ---------------------------------------------------------------------
def fig_casca_de_massa():
    fig, ax = plt.subplots(figsize=(4.8, 4.6))

    p = np.linspace(0, 3, 300)
    for m, cor in zip([0.0, 0.6, 1.2], ["black", "#4C72B0", "#B0413E"]):
        E = np.sqrt(p**2 + m**2)
        rotulo = r"$m=0$ (fóton)" if m == 0 else rf"$m={m}$"
        estilo = "--" if m == 0 else "-"
        ax.plot(p, E, estilo, color=cor, lw=1.6, label=rotulo)

    ax.set_xlim(0, 3)
    ax.set_ylim(0, 3)
    ax.set_aspect("equal")
    ax.set_xlabel(r"$|\boldsymbol{p}|$")
    ax.set_ylabel(r"$E$")
    ax.legend(fontsize=10, frameon=False, loc="upper left")
    ax.set_title(r"Casca de massa $E^2=|\boldsymbol{p}|^2+m^2$", fontsize=12)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_casca_massa.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 2: energia de centro de momento -- colisor vs. alvo fixo
# ---------------------------------------------------------------------
def fig_colisor_vs_alvo_fixo(m=1.0):
    fig, ax = plt.subplots(figsize=(5.0, 4.2))

    E = np.linspace(m, 30 * m, 400)  # energia de cada feixe / energia de laboratorio

    sqrt_s_colisor = 2 * E
    sqrt_s_alvo_fixo = np.sqrt(2 * m**2 + 2 * m * E)

    ax.plot(E / m, sqrt_s_colisor / m, color="#4C72B0", lw=1.8,
            label=r"colisor: $\sqrt{s}=2E$")
    ax.plot(E / m, sqrt_s_alvo_fixo / m, color="#B0413E", lw=1.8,
            label=r"alvo fixo: $\sqrt{s}=\sqrt{2m^2+2mE}$")

    ax.set_xlabel(r"$E/m$ (energia por partícula)")
    ax.set_ylabel(r"$\sqrt{s}/m$ (energia disponível no CM)")
    ax.legend(fontsize=10, frameon=False, loc="upper left")
    ax.set_title("Energia de centro de momento: colisor vs. alvo fixo", fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_colisor_alvo_fixo.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 3: espalhamento Compton -- E'/E em funcao do angulo
# ---------------------------------------------------------------------
def fig_compton(me=0.511):
    """me em MeV (massa de repouso do eletron); E em MeV."""
    fig, ax = plt.subplots(figsize=(5.0, 4.2))

    theta = np.linspace(0, np.pi, 300)
    for E, cor in zip([0.1, 0.511, 2.0], ["#4C72B0", "#55A868", "#B0413E"]):
        Ep = E * me / (E * (1 - np.cos(theta)) + me)
        ax.plot(np.degrees(theta), Ep / E, color=cor, lw=1.8,
                label=rf"$E={E}$ MeV ($E/m_e={E/me:.2f}$)")

    ax.axhline(1.0, color="0.6", lw=0.7, ls=":")
    ax.set_xlabel(r"ângulo de espalhamento $\theta$ (graus)")
    ax.set_ylabel(r"$E'/E$")
    ax.set_xlim(0, 180)
    ax.legend(fontsize=9.5, frameon=False, loc="upper right")
    ax.set_title("Espalhamento Compton: fração de energia do fóton espalhado",
                 fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_compton.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 4: foguete relativistico com aceleracao propria constante
# ---------------------------------------------------------------------
def fig_foguete(a0=1.0323, D=4.2465):
    """a0 em 1/ano (1g), D em anos-luz (distancia até Proxima Centauri)."""
    from scipy.optimize import brentq

    def meio_percurso(tau_h):
        return (1 / a0) * (np.cosh(a0 * tau_h) - 1) - D / 2

    tau_half = brentq(meio_percurso, 1e-3, 20)

    # perna de aceleracao: tau em [0, tau_half]
    tau1 = np.linspace(0, tau_half, 200)
    t1 = (1 / a0) * np.sinh(a0 * tau1)
    x1 = (1 / a0) * (np.cosh(a0 * tau1) - 1)

    # perna de desaceleracao, por simetria em torno do ponto medio
    t_mid, x_mid = t1[-1], x1[-1]
    tau2 = np.linspace(0, tau_half, 200)
    t2 = t_mid + ((1 / a0) * np.sinh(a0 * tau_half) - (1 / a0) * np.sinh(a0 * (tau_half - tau2)))
    x2 = x_mid + (x_mid - (1 / a0) * (np.cosh(a0 * (tau_half - tau2)) - 1))

    t = np.concatenate([t1, t2])
    x = np.concatenate([x1, x2])
    tau_total = 2 * tau_half
    t_total = t[-1]

    fig, ax = plt.subplots(figsize=(5.0, 5.2))
    ax.plot(t, x, color="#4C72B0", lw=2.0)
    ax.plot(t1[[0]], x1[[0]], "o", color="black", zorder=5)
    ax.plot([t[-1]], [x[-1]], "o", color="black", zorder=5)
    ax.plot(t1, t1, color="0.75", lw=1.0, ls="--")  # cone de luz t=x

    ax.annotate("partida (Terra)", (t[0], x[0]), textcoords="offset points",
                xytext=(10, 10), fontsize=9.5)
    ax.annotate("chegada\n(Proxima Centauri)", (t[-1], x[-1]),
                textcoords="offset points", xytext=(-120, -8), fontsize=9.5,
                ha="left", va="top")
    ax.annotate("meio do percurso\n(velocidade máxima)", (t_mid, x_mid),
                textcoords="offset points", xytext=(10, -30), fontsize=8.5,
                color="0.3")
    ax.plot([t_mid], [x_mid], "o", color="0.4", ms=4)

    ax.text(0.05, 0.82,
            rf"$\tau_{{\rm nave}}={tau_total:.2f}$ anos" "\n"
            rf"$t_{{\rm Terra}}={t_total:.2f}$ anos",
            transform=ax.transAxes, fontsize=10,
            bbox=dict(boxstyle="round", fc="white", ec="0.6"))

    ax.set_xlabel(r"$t$ (anos, referencial da Terra)")
    ax.set_ylabel(r"$x$ (anos-luz)")
    ax.set_ylim(-0.3, D * 1.28)
    ax.set_title(r"Foguete com aceleração própria $a_0=1g$ constante",
                 fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_foguete.pdf", bbox_inches="tight")
    plt.close(fig)

    return tau_total, t_total


# ---------------------------------------------------------------------
# Figura 5: classificacao dos vetores e ortogonalidade em Minkowski
# ---------------------------------------------------------------------
def fig_ortogonalidade():
    """Por que 'ortogonal' aqui nao quer dizer 'perpendicular no papel'.

    Painel esquerdo: o cone de luz separa os tres tipos de vetor, e a
    classificacao e' invariante porque o cone e' o mesmo para todos.

    Painel direito: a leitura geometrica da ortogonalidade. Dois vetores
    sao ortogonais quando um e' o REFLEXO do outro na linha de luz --
    equivalentemente, quando fazem angulos iguais com ela, em lados
    opostos. Dai o vetor nulo ser ortogonal a si mesmo: ele esta EM CIMA
    do espelho, e portanto e' o seu proprio reflexo.
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.4, 4.7))
    L = 2.35
    for ax in (ax1, ax2):
        ax.set_xlim(-L, L)
        ax.set_ylim(-0.45, L)
        ax.set_aspect("equal")
        ax.axhline(0, color="black", lw=0.6, zorder=1)
        ax.axvline(0, color="black", lw=0.6, zorder=1)
        ax.set_xlabel(r"$x$")
        ax.set_ylabel(r"$ct$")

    # ---------------- painel esquerdo: a classificacao ----------------
    ax1.plot([0, L], [0, L], color="0.45", lw=1.2, ls=(0, (6, 4)), zorder=2)
    ax1.plot([0, -L], [0, L], color="0.45", lw=1.2, ls=(0, (6, 4)), zorder=2)
    ax1.fill_between([-L, 0, L], [L, 0, L], [L, L, L], color="#4C72B0", alpha=0.07, zorder=0)

    for (vx, vy), cor, nome, sinal in [
        ((0.55, 1.75), "#4C72B0", "temporal", r"$\vec{A}\cdot\vec{A}<0$"),
        ((1.55, 1.55), "#2E7D32", "nulo",     r"$\vec{A}\cdot\vec{A}=0$"),
        ((1.95, 0.75), "#B0413E", "espacial", r"$\vec{A}\cdot\vec{A}>0$"),
    ]:
        ax1.annotate("", xy=(vx, vy), xytext=(0, 0),
                     arrowprops=dict(arrowstyle="-|>", color=cor, lw=2.0))
        ax1.annotate(f"{nome}\n{sinal}", xy=(vx, vy), xytext=(6, 4),
                     textcoords="offset points", fontsize=9.5, color=cor,
                     ha="left", va="bottom", path_effects=HALO)

    ax1.text(0, 2.05, "futuro", ha="center", fontsize=9.5, color="0.4",
             path_effects=HALO)
    ax1.set_title("O cone separa os três tipos — e o cone\n"
                  "é o mesmo para todo observador", fontsize=10.5)

    # ---------------- painel direito: a ortogonalidade ----------------
    # a linha de luz e' o ESPELHO: refletir nela troca (t,x) por (x,t)
    ax2.plot([0, L], [0, L], color="#2E7D32", lw=2.4, zorder=3)
    ax2.plot([0, -L], [0, L], color="0.78", lw=1.0, ls=(0, (6, 4)), zorder=2)

    phi = 0.62
    A = np.array([np.sinh(phi), np.cosh(phi)])      # (x, ct) temporal
    B = np.array([np.cosh(phi), np.sinh(phi)])      # o reflexo: espacial
    esc = 1.60
    for vec, cor, rot in [(A, "#4C72B0", r"$\vec{A}$"), (B, "#B0413E", r"$\vec{B}$")]:
        ax2.annotate("", xy=tuple(esc * vec), xytext=(0, 0),
                     arrowprops=dict(arrowstyle="-|>", color=cor, lw=2.2))
        ax2.annotate(rot, xy=tuple(esc * vec), xytext=(8, 4),
                     textcoords="offset points", fontsize=13, color=cor,
                     path_effects=HALO)

    # o vetor nulo, desenhado SOBRE o espelho
    N = np.array([1.0, 1.0]) / np.sqrt(2)
    ax2.annotate("", xy=tuple(1.15 * N), xytext=(0, 0),
                 arrowprops=dict(arrowstyle="-|>", color="#2E7D32", lw=2.2))
    ax2.annotate(r"$\vec{N}$", xy=tuple(1.15 * N), xytext=(10, -12),
                 textcoords="offset points", fontsize=13, color="#2E7D32",
                 path_effects=HALO)

    # os dois angulos ate' a bissetriz, iguais
    a_A = np.arctan2(A[1], A[0])
    a_B = np.arctan2(B[1], B[0])
    for de, ate, cor in [(np.pi / 4, a_A, "#4C72B0"), (a_B, np.pi / 4, "#B0413E")]:
        t = np.linspace(de, ate, 40)
        ax2.plot(1.42 * np.cos(t), 1.42 * np.sin(t), color=cor, lw=1.6, alpha=0.9)
    ax2.text(0.78, 1.68, r"$\theta$", fontsize=13, color="#4C72B0", path_effects=HALO)
    ax2.text(1.68, 0.78, r"$\theta$", fontsize=13, color="#B0413E", path_effects=HALO)

    ax2.text(-2.15, 1.66,
             "reflita na linha de luz\ne um vetor vira o outro:\n"
             r"$\vec{A}\cdot\vec{B}=0$",
             fontsize=9.2, color="0.30", ha="left", va="top", path_effects=HALO)
    ax2.text(-2.15, 0.62,
             r"$\vec{N}$ está sobre o espelho," "\n"
             "logo é o próprio reflexo\ne é ortogonal a si mesmo",
             fontsize=9.2, color="#2E7D32", ha="left", va="top", path_effects=HALO)

    ax2.set_title("Ortogonal aqui significa: um é o reflexo\ndo outro na linha de luz",
                  fontsize=10.5)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_ortogonalidade.pdf", bbox_inches="tight")
    plt.close(fig)

# ---------------------------------------------------------------------
# Figura 6: a hiperbole da aceleracao propria constante
# ---------------------------------------------------------------------
def fig_hiperbole_aceleracao():
    """A linha de mundo de x^2 - t^2 = 1/a0^2, com a leitura geometrica.

    O ponto da figura e' ver a particula PARTINDO DO REPOUSO -- no vertice a
    linha de mundo sobe reta, U^mu = (1,0) -- e inclinando-se aos poucos ate
    quase acompanhar a reta da luz, sem nunca alcanca-la.  Os pontos marcam
    passos IGUAIS de tempo proprio: eles se espalham em t, que e' a dilatacao
    temporal aparecendo na propria curva.
    """
    a0 = 1.0                       # unidades de a0: o vertice fica em x = 1
    fig, ax = plt.subplots(figsize=(4.7, 5.9))

    tau = np.linspace(-1.75, 1.75, 400)
    t_c, x_c = np.sinh(a0 * tau) / a0, np.cosh(a0 * tau) / a0

    # cone de luz: as assintotas x = +-t
    L = 2.85
    ax.plot([0, L], [0, L], color="0.62", lw=1.1, ls=(0, (6, 4)), zorder=1)
    ax.plot([0, L], [0, -L], color="0.62", lw=1.1, ls=(0, (6, 4)), zorder=1)
    ax.text(1.12, 1.12, "cone de luz", fontsize=9, color="0.42",
            rotation=45, rotation_mode="anchor", ha="center", va="center",
            path_effects=HALO, zorder=2)

    ax.axhline(0, color="black", lw=0.6, zorder=1)
    ax.axvline(0, color="black", lw=0.6, zorder=1)

    ax.plot(x_c, t_c, color="#4C72B0", lw=2.2, zorder=3)

    # passos iguais de tempo proprio
    taus = np.array([-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5])
    ax.plot(np.cosh(a0 * taus) / a0, np.sinh(a0 * taus) / a0, "o",
            color="#4C72B0", ms=4.5, zorder=4)

    # quadrivelocidade: tangente unitaria, em tres instantes
    for tv in [0.0, 0.8, 1.5]:
        px, pt = np.cosh(a0 * tv) / a0, np.sinh(a0 * tv) / a0
        dx, dt = np.sinh(a0 * tv), np.cosh(a0 * tv)     # U = (cosh, sinh) em (t,x)
        n = np.hypot(dx, dt)
        ax.annotate("", xy=(px + 0.58 * dx / n, pt + 0.58 * dt / n), xytext=(px, pt),
                    arrowprops=dict(arrowstyle="-|>", color="#B0413E", lw=1.9), zorder=5)
    ax.text(1.78, 1.33, r"$U^\mu$", fontsize=12, color="#B0413E",
            ha="left", va="center", path_effects=HALO)

    # o vertice e a distancia 1/a0 ate' o vertice do cone
    ax.plot([1 / a0], [0], "o", color="#16222B", ms=6, zorder=6)
    ax.annotate("", xy=(1 / a0, -0.32), xytext=(0, -0.32),
                arrowprops=dict(arrowstyle="<|-|>", color="#5A6B75", lw=1.0))
    ax.text(0.80 / a0, -0.58, r"$1/a_0$", fontsize=11, color="#5A6B75",
            ha="center", path_effects=HALO)

    # comeco: o repouso
    ax.annotate(r"$\tau=0$: parte do repouso," "\n" r"e $U^\mu=(1,0)$ sobe reta",
                xy=(1.03, -0.05), xytext=(1.62, -0.42), fontsize=9.2,
                color="0.25", ha="left", va="center",
                arrowprops=dict(arrowstyle="-", color="0.55", lw=0.9),
                path_effects=HALO)
    # fim: a saturacao
    ax.text(0.02, 2.30,
            r"$v=\tanh(a_0\tau)\to1$:" "\n"
            "a linha de mundo tende à\ninclinação da luz, sem\nnunca alcançá-la",
            fontsize=9.2, color="0.25", ha="left", va="top", path_effects=HALO)
    # os passos de tempo proprio
    ax.annotate("pontos: passos iguais\nde tempo próprio",
                xy=(1.60, -1.25), xytext=(3.00, -1.62), fontsize=8.8,
                color="#4C72B0", ha="right", va="center",
                arrowprops=dict(arrowstyle="-", color="#4C72B0", lw=0.8, alpha=.7),
                path_effects=HALO)

    ax.set_xlim(-0.45, 3.05)
    ax.set_ylim(-2.85, 2.85)
    ax.set_aspect("equal")
    ax.set_xlabel(r"$x$")
    ax.set_ylabel(r"$ct$")
    ax.set_title(r"$x^2-t^2=1/a_0^{\,2}$: aceleração própria constante", fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_hiperbole.pdf", bbox_inches="tight")
    plt.close(fig)


# ---------------------------------------------------------------------
# Figura 7: os vetores da base de dois referenciais (interludio do cap. 2)
# ---------------------------------------------------------------------
def fig_vetores_da_base(v=0.5):
    """Os vetores da base de O e de O', ambos desenhados no papel de O.

    Painel esquerdo: e_0' e e_1' apontam ao longo dos eixos t' e x' e tem as
    pontas SOBRE as hiperboles invariantes -- ou seja, sao tao unitarios
    quanto e_0 e e_1, embora parecam mais longos numa folha euclidiana.

    Painel direito: o mesmo vetor A, duas decomposicoes.  A regra do
    paralelogramo nas duas bases devolve o MESMO vetor: e' o conteudo de
    A = A^alpha e_alpha = A^alpha' e_alpha'.
    """
    g = 1.0 / np.sqrt(1.0 - v**2)
    AZUL, VERM, CINZA = "#4C72B0", "#B0413E", "0.45"

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9.6, 4.9))
    L = 2.05
    for ax in (ax1, ax2):
        ax.set_xlim(-0.55, L + 0.22)
        ax.set_ylim(-0.55, L + 0.22)
        ax.set_aspect("equal")
        ax.axhline(0, color="black", lw=0.7, zorder=1)
        ax.axvline(0, color="black", lw=0.7, zorder=1)
        ax.set_xlabel(r"$x$")
        ax.set_ylabel(r"$ct$")
        # a linha de luz
        ax.plot([0, L], [0, L], color="0.70", lw=1.0, ls=(0, (6, 4)), zorder=1)
        # os eixos inclinados de O'
        ax.plot([0, v * L], [0, L], color=VERM, lw=0.9, ls=(0, (5, 3)), zorder=1)
        ax.plot([0, L], [0, v * L], color=VERM, lw=0.9, ls=(0, (5, 3)), zorder=1)
        ax.annotate(r"$ct'$", xy=(v * L, L), xytext=(-16, -2),
                    textcoords="offset points", fontsize=11, color=VERM,
                    path_effects=HALO)
        ax.annotate(r"$x'$", xy=(L, v * L), xytext=(2, -14),
                    textcoords="offset points", fontsize=11, color=VERM,
                    path_effects=HALO)

    # base de O e base de O', em componentes de O: (x, ct)
    e0 = np.array([0.0, 1.0]);      e1 = np.array([1.0, 0.0])
    e0l = np.array([g * v, g]);     e1l = np.array([g, g * v])

    def seta(ax, vec, cor, rot, dx=8, dy=4, tam=13):
        ax.annotate("", xy=tuple(vec), xytext=(0, 0),
                    arrowprops=dict(arrowstyle="-|>", color=cor, lw=2.2),
                    zorder=4)
        ax.annotate(rot, xy=tuple(vec), xytext=(dx, dy),
                    textcoords="offset points", fontsize=tam, color=cor,
                    path_effects=HALO, zorder=5)

    # ---------------- painel esquerdo: as duas bases -------------------
    # hiperboles invariantes: onde vivem as pontas de TODA base ortonormal
    s = np.linspace(-1.15, 1.15, 200)
    ax1.plot(np.sinh(s), np.cosh(s), color="0.78", lw=1.0, zorder=1)
    ax1.plot(np.cosh(s), np.sinh(s), color="0.78", lw=1.0, zorder=1)

    seta(ax1, e0, AZUL, r"$\vec{e}_0$", dx=-26, dy=-2)
    seta(ax1, e1, AZUL, r"$\vec{e}_1$", dx=2, dy=-20)
    seta(ax1, e0l, VERM, r"$\vec{e}_{0'}$", dx=6, dy=2)
    seta(ax1, e1l, VERM, r"$\vec{e}_{1'}$", dx=6, dy=-6)

    ax1.text(-0.50, 2.24,
             "as pontas caem sobre\nas hipérboles invariantes",
             fontsize=9.0, color="0.30", ha="left", va="top",
             path_effects=HALO)
    ax1.set_title("As duas bases, desenhadas em " + r"$\mathcal{O}$",
                  fontsize=10.5)

    # ---------------- painel direito: uma so decomposicao por base -----
    A = np.array([1.35, 1.5])                   # (x, ct) em O
    A0, A1 = A[1], A[0]                         # componentes em O
    A0l = g * (A[1] - v * A[0])                 # componentes em O'
    A1l = g * (A[0] - v * A[1])

    # paralelogramo na base de O
    for de, ate in [(A0 * e0, A), (A1 * e1, A)]:
        ax2.plot([de[0], ate[0]], [de[1], ate[1]], color=AZUL, lw=0.9,
                 ls=(0, (3, 3)), zorder=2)
    # paralelogramo na base de O'
    for de, ate in [(A0l * e0l, A), (A1l * e1l, A)]:
        ax2.plot([de[0], ate[0]], [de[1], ate[1]], color=VERM, lw=0.9,
                 ls=(0, (3, 3)), zorder=2)

    for vec, cor in [(A0 * e0, AZUL), (A1 * e1, AZUL),
                     (A0l * e0l, VERM), (A1l * e1l, VERM)]:
        ax2.annotate("", xy=tuple(vec), xytext=(0, 0),
                     arrowprops=dict(arrowstyle="-|>", color=cor, lw=1.7,
                                     alpha=0.85), zorder=3)

    seta(ax2, A, "#2E7D32", r"$\vec{A}$", dx=6, dy=4, tam=14)
    ax2.annotate(r"$A^{0}\vec{e}_{0}$", xy=tuple(A0 * e0), xytext=(-34, -4),
                 textcoords="offset points", fontsize=10, color=AZUL,
                 path_effects=HALO, zorder=5)
    ax2.annotate(r"$A^{1}\vec{e}_{1}$", xy=tuple(A1 * e1), xytext=(-14, -20),
                 textcoords="offset points", fontsize=10, color=AZUL,
                 path_effects=HALO, zorder=5)
    ax2.annotate(r"$A^{0'}\vec{e}_{0'}$", xy=tuple(A0l * e0l), xytext=(-52, -8),
                 textcoords="offset points", fontsize=10, color=VERM,
                 path_effects=HALO, zorder=5)
    ax2.annotate(r"$A^{1'}\vec{e}_{1'}$", xy=tuple(A1l * e1l), xytext=(4, -20),
                 textcoords="offset points", fontsize=10, color=VERM,
                 path_effects=HALO, zorder=5)

    ax2.set_title(r"$\vec{A}=A^{\alpha}\vec{e}_{\alpha}"
                  r"=A^{\alpha'}\vec{e}_{\alpha'}$", fontsize=11.5)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_base.pdf", bbox_inches="tight",
                transparent=True)
    plt.close(fig)
    return (A0, A1, A0l, A1l)


# ---------------------------------------------------------------------
# Figura 8: antes e depois -- duas colisoes separadas por intervalo
#           tipo-espaco, e as fatias de simultaneidade de dois observadores
# ---------------------------------------------------------------------
def fig_conservacao_fatias(v=0.5):
    """Por que 'antes' e 'depois' nao estragam a conservacao do quadrimomento.

    Duas colisoes, A e B, separadas por intervalo tipo-espaco.  Na fatia de
    simultaneidade de O (horizontal) A ja aconteceu e B ainda nao; na fatia
    de O' (inclinada) as duas ja aconteceram.  Os dois observadores somam
    conjuntos DIFERENTES de particulas -- e obtem o mesmo vetor P, porque
    cada colisao, isoladamente, conserva o quadrimomento.
    """
    g = 1.0 / np.sqrt(1.0 - v**2)
    AZUL, VERM, GRAFITE = "#4C72B0", "#B0413E", "#16222B"

    fig, ax = plt.subplots(figsize=(7.2, 5.0))
    XL, XR, YB, YT = -3.0, 3.0, -2.1, 2.1

    A = np.array([-1.5, -1.0])      # (x, ct)
    B = np.array([1.5, 0.45])

    ax.axhline(0, color="0.85", lw=0.7, zorder=1)
    ax.axvline(0, color="0.85", lw=0.7, zorder=1)

    # as duas fatias de simultaneidade
    ax.plot([XL, XR], [0, 0], color=AZUL, lw=1.9, zorder=3)
    ax.plot([XL, XR], [v * XL, v * XR], color=VERM, lw=1.9, zorder=3)
    ax.text(XL + 0.08, 0.11, r"$t=\,$const  $(\mathcal{O})$", fontsize=10.5,
            color=AZUL, ha="left", va="bottom", path_effects=HALO, zorder=6)
    ax.text(XL + 0.08, v * XL - 0.13, r"$t'=\,$const  $(\mathcal{O}')$",
            fontsize=10.5, color=VERM, ha="left", va="top",
            path_effects=HALO, zorder=6)

    # os vetores temporais das duas bases: cada fatia e' ortogonal ao seu e_0
    for vec, cor, rot, dx, dy in [((0.0, 1.0), AZUL, r"$\vec{e}_0$", -25, -8),
                                  ((g * v, g), VERM, r"$\vec{e}_{0'}$", 6, 1)]:
        ax.annotate("", xy=vec, xytext=(0, 0),
                    arrowprops=dict(arrowstyle="-|>", color=cor, lw=2.0), zorder=5)
        ax.annotate(rot, xy=vec, xytext=(dx, dy), textcoords="offset points",
                    fontsize=11.5, color=cor, path_effects=HALO, zorder=6)

    # as duas colisoes: duas linhas de mundo entrando, duas saindo
    def colisao(E, rotulo, lado, Lin, Lout):
        for dx_ in (0.30, -0.34):
            ax.annotate("", xy=tuple(E), xytext=(E[0] - dx_ * Lin, E[1] - Lin),
                        arrowprops=dict(arrowstyle="-|>", color=GRAFITE, lw=1.3),
                        zorder=4)
        for dx_ in (0.42, -0.40):
            ax.annotate("", xy=(E[0] + dx_ * Lout, E[1] + Lout), xytext=tuple(E),
                        arrowprops=dict(arrowstyle="-|>", color=GRAFITE, lw=1.3),
                        zorder=4)
        ax.plot([E[0]], [E[1]], "o", color=GRAFITE, ms=7, zorder=6)
        ax.annotate(rotulo, xy=tuple(E), xytext=(lado * 16, -4),
                    textcoords="offset points", fontsize=13, color=GRAFITE,
                    ha="center", va="center", path_effects=HALO, zorder=6)

    colisao(A, "A", lado=+1, Lin=0.85, Lout=1.30)
    colisao(B, "B", lado=-1, Lin=1.00, Lout=1.10)

    # o que cada par de linhas de mundo carrega
    rot = dict(fontsize=9.3, color=GRAFITE, path_effects=HALO, zorder=6)
    ax.text(A[0], A[1] + 1.55, r"$\vec{p}_3+\vec{p}_4$",
            ha="center", va="center", **rot)
    ax.text(A[0] + 0.38, A[1] - 0.88, r"$\vec{p}_1+\vec{p}_2$",
            ha="left", va="center", **rot)
    ax.text(B[0] + 0.50, B[1] + 1.20, r"$\vec{p}_7+\vec{p}_8$",
            ha="left", va="center", **rot)
    ax.text(B[0] - 0.52, B[1] - 0.75, r"$\vec{p}_5+\vec{p}_6$",
            ha="right", va="center", **rot)

    # o que cada observador soma na sua fatia
    ax.text(XL + 0.10, YT - 0.08,
            r"$\mathcal{O}$ soma $\ \vec{p}_3+\vec{p}_4\ $ e $\ \vec{p}_5+\vec{p}_6$",
            fontsize=9.6, color=AZUL, ha="left", va="top",
            path_effects=HALO, zorder=6)
    ax.text(XL + 0.10, YT - 0.36,
            r"$\mathcal{O}'$ soma $\ \vec{p}_3+\vec{p}_4\ $ e $\ \vec{p}_7+\vec{p}_8$",
            fontsize=9.6, color=VERM, ha="left", va="top",
            path_effects=HALO, zorder=6)

    ax.set_xlim(XL, XR)
    ax.set_ylim(YB, YT)
    ax.set_aspect("equal")
    ax.set_xlabel(r"$x$")
    ax.set_ylabel(r"$ct$")
    ax.set_title("Duas colisões, duas fatias de simultaneidade", fontsize=11)

    fig.tight_layout()
    fig.savefig(OUTDIR / "cap02_conservacao.pdf", bbox_inches="tight",
                transparent=True)
    plt.close(fig)


if __name__ == "__main__":
    fig_casca_de_massa()
    fig_colisor_vs_alvo_fixo()
    fig_compton()
    fig_ortogonalidade()
    fig_hiperbole_aceleracao()
    comp = fig_vetores_da_base()
    fig_conservacao_fatias()
    tau_total, t_total = fig_foguete()
    print(f"Foguete: tau_total={tau_total:.4f} anos, t_total={t_total:.4f} anos")
    print("Base: A^0=%.4f A^1=%.4f | A^0'=%.4f A^1'=%.4f" % comp)
    print("Figuras salvas em", OUTDIR)
