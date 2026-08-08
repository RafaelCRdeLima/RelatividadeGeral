"""Elemento gráfico da capa: a órbita que não fecha.

Integra a equação de órbita de Schwarzschild em termos de u = 1/r,

    d^2u/dphi^2 + u = M/L^2 + 3 M u^2,

cujo termo 3Mu^2 -- ausente do problema de Kepler -- e' exatamente o que
impede a elipse de fechar. Desenhando muitas revolucoes, a precessao do
perielio se acumula e produz a roseta.

Nao ha' licenca artistica aqui: a figura e' a solucao numerica da equacao,
com M = 1 e semilato reto p = 15 M. A escolha e' so' de enquadramento --
quantas voltas mostrar e com que espessura de traco.
"""

import numpy as np
from scipy.integrate import solve_ivp
import matplotlib as mpl
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
from matplotlib.colors import LinearSegmentedColormap
from pathlib import Path

OUTDIR = Path(__file__).resolve().parent.parent / "figuras"
OUTDIR.mkdir(exist_ok=True)

#  Paleta para FUNDO ESCURO: a capa é azul-noite, então o traço precisa ser
#  claro. As cores abaixo espelham rgCeu / rgOuro definidas em estilo-rg.sty.
CEU, CEU_MEDIO, OURO = "#AEE9EC", "#7CC6D6", "#F0C674"
NOITE_FUNDA = "#061726"

M = 1.0
#  p e' escolhido de modo que a precessao por orbita, ~ 6 pi M/p, NAO seja
#  uma fracao racional simples de 2 pi: com p = 15 M ela vale exatamente
#  72 graus e a orbita fecha em cinco voltas, retracando o mesmo desenho.
P = 16.8          # semilato reto, em massas gravitacionais
ECC = 0.60
VOLTAS = 42


def orbita():
    """u(phi) para a orbita ligada, e as coordenadas cartesianas."""
    L2 = M * P

    def rhs(phi, y):
        u, du = y
        return [du, -u + M / L2 + 3.0 * M * u * u]

    # comeca no afelio: u = (1-e)/p, du/dphi = 0
    sol = solve_ivp(rhs, [0.0, VOLTAS * 2 * np.pi], [(1.0 - ECC) / P, 0.0],
                    rtol=1e-11, atol=1e-13, dense_output=True)
    phi = np.linspace(0.0, VOLTAS * 2 * np.pi, 60000)
    u = sol.sol(phi)[0]
    r = 1.0 / u
    return r * np.cos(phi), r * np.sin(phi), r


def figura_capa():
    x, y, r = orbita()
    pontos = np.array([x, y]).T.reshape(-1, 1, 2)
    segs = np.concatenate([pontos[:-1], pontos[1:]], axis=1)

    mapa = LinearSegmentedColormap.from_list(
        "rg", [CEU, CEU_MEDIO, OURO])

    fig, ax = plt.subplots(figsize=(7.2, 7.2))
    fig.patch.set_alpha(0.0)
    ax.set_facecolor("none")

    #  A cor acompanha o RAIO, não a ordem ao longo da curva: com 42 voltas
    #  sobrepostas, colorir por índice faria as cores se cancelarem em um
    #  creme uniforme. Por raio, cada pétala fica quente no periélio e fria
    #  no afélio -- e o desenho passa a dizer alguma coisa.
    quente = (r.max() - 0.5 * (r[:-1] + r[1:])) / (r.max() - r.min())
    lc = LineCollection(segs, cmap=mapa, array=quente,
                        linewidths=0.68, alpha=0.90,
                        capstyle="round")
    ax.add_collection(lc)

    #  O horizonte, em 2M e na escala real (contra r ~ 40M). Sobre fundo
    #  escuro um disco preto desapareceria, então ele é desenhado como um
    #  vazio mais escuro que o fundo, contornado por um anel claro -- que é
    #  a leitura correta de uma sombra de buraco negro.
    ax.add_patch(plt.Circle((0, 0), 2.0 * M, facecolor=NOITE_FUNDA,
                            edgecolor=CEU, lw=1.5, zorder=5))
    ax.add_patch(plt.Circle((0, 0), 6.0 * M, fill=False, color=OURO,
                            lw=0.7, alpha=0.55, ls=(0, (4, 4)), zorder=4))

    lim = 1.06 * max(np.abs(x).max(), np.abs(y).max())
    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.savefig(OUTDIR / "capa_roseta.pdf", bbox_inches="tight",
                transparent=True, pad_inches=0.0)
    plt.close(fig)


if __name__ == "__main__":
    figura_capa()
    print(f"Capa salva em {OUTDIR / 'capa_roseta.pdf'}")
    print(f"  p = {P} M, e = {ECC}, {VOLTAS} revoluções")
    print(f"  precessão por órbita ≈ {6*np.pi*M/P:.4f} rad "
          f"= {np.degrees(6*np.pi*M/P):.2f}°")
