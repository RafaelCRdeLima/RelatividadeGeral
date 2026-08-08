"""Reescreve o calendário aula a aula com a coluna de números de seção.

O mapeamento aula -> seções é declarado aqui em AULAS, por *título* de seção.
Os números são resolvidos no arquivo .toc da última compilação, de modo que
qualquer mudança na estrutura do texto se propaga sozinha para o calendário:
basta recompilar, rodar este script e recompilar de novo.

    xelatex rg_72_aulas.tex        # atualiza o .toc
    python3 codigo/gerar_calendario.py
    xelatex rg_72_aulas.tex        # recompila com a coluna nova

Se algum título declarado aqui não existir mais no sumário, o script aborta
apontando qual --- em vez de gerar silenciosamente uma referência errada.
"""

import re
import sys
import unicodedata
from pathlib import Path

FONTE = Path(__file__).resolve().parent.parent
TEX = FONTE / "rg_72_aulas.tex"
TOC = FONTE / "rg_72_aulas.toc"

#  Chaves de capítulo: o título como aparece no sumário. Capítulos com
#  \chapter[curto]{longo} entram pelo título CURTO.
RE, VET, TEN = "Relatividade especial", "Vetores e momento relativístico", "Tensores no espaço-tempo plano"
FLU, GRA, CUR = "Fluidos relativísticos", "Da gravidade à curvatura", "Derivada covariante e curvatura"
FIS, EIN, OND = "Física em espaço-tempo curvo", "Equações de Einstein", "Ondas gravitacionais"
SCH, BUR, COS = "Soluções esféricas e Schwarzschild", "Buracos negros", "Cosmologia relativística"
PRO, APX, RES = "Projetos finais", "Truques com índices e tensores", "Resumo de fórmulas"

NUM, EXE, EXT = "Resolução numérica", "Exercícios", "Conteúdo extra"
POR, ERA, EXA = "Problemas orientados", "Erros comuns e interpretação", "Exemplos resolvidos adicionais"

#  aula: (capítulo, [títulos de seção])   ---   None = sem seção numerada
AULAS = {
    1:  None,
    2:  (RE, ["Newton e Einstein: duas visões de mundo", "Eventos, observadores e intervalo"]),
    3:  (RE, ["Tempo próprio", "Transformações de Lorentz"]),
    4:  (RE, ["Consequências: o que se mede"]),
    5:  (RE, ["Diagramas de Minkowski e hipérboles invariantes", "Paradoxo dos gêmeos"]),
    6:  (RE, ["A velocidade invariante é única", POR, EXA]),
    7:  (RE, [NUM, EXE, EXT]),
    8:  (VET, ["Vetores no espaço-tempo", "Produto escalar"]),
    9:  (VET, ["Quadrivelocidade", "Quadrimomento"]),
    10: (VET, ["Conservação", "Energia como componente temporal"]),
    11: (VET, ["Centro de momento", "Partículas massivas e partículas sem massa"]),
    12: (VET, [EXA, POR]),
    13: (VET, [NUM, EXE, EXT]),
    14: (TEN, ["Um-formas: por que elas existem", "Tensores de tipo $(r,s)$"]),
    15: (TEN, ["A métrica como ponte"]),
    16: (TEN, ["Regra prática de índices", "O que significa uma equação tensorial",
               "Componentes em uma base oblíqua"]),
    17: (TEN, ["Derivada de um tensor", "Erros comuns com índices", EXA, POR]),
    18: (TEN, [NUM, EXE, EXT]),
    #  O capítulo 4 foi ampliado e hoje tem 14 seções de conteúdo para três
    #  encontros. A distribuição abaixo é coerente, mas apertada: a alocação
    #  de aulas precisa ser refeita quando a expansão dos demais capítulos
    #  terminar (ver nota no README).
    19: (FLU, ["O que é um fluido", "Poeira: densidade e fluxo",
               "O vetor fluxo de número", "Densidade é um fluxo temporal",
               "Um-formas, superfícies e o fluxo invariante"]),
    20: (FLU, ["Conservação do número de partículas",
               "O tensor energia-momento", "Tensões e a simetria do tensor",
               "Fluidos gerais: energia interna e a primeira lei",
               "O fluido perfeito"]),
    21: (FLU, ["Conservação: continuidade e Euler", "Equações de estado",
               "Lei de Gauss em quatro dimensões",
               "Por que isso importa para a relatividade geral",
               EXA, POR, EXE, EXT]),
    22: (GRA, ["O princípio da equivalência", "Marés como sinal de curvatura"]),
    23: (GRA, ["Coordenadas curvilíneas", "Christoffel não é força"]),
    24: (GRA, ["Bases coordenadas e bases não coordenadas"]),
    25: (GRA, ["Equação geodésica", "Derivação por princípio variacional", POR, EXE, EXT]),
    26: (CUR, ["Variedades e métricas", "Derivada covariante"]),
    27: (CUR, ["Compatibilidade métrica", POR]),
    28: (CUR, ["Curvatura", "Simetrias do tensor de Riemann"]),
    29: (CUR, ["Curvatura intrínseca e extrínseca", "Desvio geodésico"]),
    30: (CUR, [EXA, NUM, EXE, EXT]),
    31: (FIS, ["Movimento livre", "Energia medida por um observador"]),
    32: (FIS, ["Simetrias e quantidades conservadas"]),
    33: (FIS, ["Observadores não são coordenadas", "Tetradas locais",
               "Constantes de movimento e energia local"]),
    34: (FIS, [POR, EXE, EXT]),
    35: (EIN, ["A equação de campo", "Por que o tensor de Einstein"]),
    36: (EIN, ["A ação de Einstein--Hilbert"]),
    37: (EIN, ["Traço das equações de campo", "Conservação local", EXA]),
    38: (EIN, ["Limite newtoniano", "O limite fraco com mais detalhe"]),
    39: (EIN, ["Constante cosmológica como fluido", POR, EXE, EXT]),
    40: (OND, ["Campo fraco", "Gauge e graus de liberdade"]),
    41: (OND, ["Polarizações", "Efeito sobre partículas teste"]),
    42: (OND, ["Emissão"]),
    43: (OND, ["Detecção", "Escalas de detecção"]),
    44: (OND, ["Binárias compactas", ERA]),
    45: (OND, [NUM]),
    46: (OND, [NUM, POR, EXE, EXT]),
    47: (SCH, ["Métrica de Schwarzschild", "Coordenada areal"]),
    48: (SCH, ["Redshift gravitacional"]),
    49: (SCH, ["Geodésicas e potencial efetivo"]),
    50: (SCH, ["Órbitas circulares", "Órbita de fótons"]),
    51: (SCH, ["Estrelas relativísticas"]),
    52: (SCH, ["Testes clássicos", "Lentes gravitacionais"]),
    53: (SCH, [NUM, POR, ERA, EXE, EXT]),
    54: (BUR, ["Horizonte", "Horizon versus singularidade"]),
    55: (BUR, ["Coordenadas regulares", "Diagramas causais"]),
    56: (BUR, ["Buracos negros em rotação", "Buracos negros reais"]),
    57: (BUR, ["Termodinâmica", "Leis da mecânica de buracos negros"]),
    58: (BUR, [NUM]),
    59: (BUR, [NUM, POR, ERA, EXE, EXT]),
    60: (COS, ["Princípio cosmológico", "Redshift cosmológico"]),
    61: (COS, ["Equações de Friedmann", "Eras de dominação"]),
    62: (COS, ["Distâncias em cosmologia", "Horizontes cosmológicos"]),
    63: (COS, ["Parâmetros observacionais", "Problemas conceituais"]),
    64: (COS, [NUM]),
    65: (COS, [NUM, POR, ERA, EXE, EXT]),
    66: (APX, ["A filosofia dos índices", "Checklist para não errar"]),
    67: (PRO, ["Projeto 1: geodésicas em Schwarzschild"]),
    68: (PRO, ["Projeto 2: redshift gravitacional"]),
    69: (PRO, ["Projeto 3: ondas gravitacionais"]),
    70: (PRO, ["Projeto 4: cosmologias simples"]),
    71: (COS, ["Síntese conceitual do curso"]),
    72: None,
}


def normaliza(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", s.lower())).strip()


def le_toc():
    """{(capítulo normalizado, seção normalizada): número}."""
    if not TOC.exists():
        sys.exit("rg_72_aulas.toc não existe: compile a apostila uma vez antes.")
    indice, cap = {}, None
    padrao = (r"\\contentsline \{(chapter|section)\}"
              r"\{(?:\\numberline \{([^}]*)\})?([^}]*)\}")
    for tipo, num, tit in re.findall(padrao, TOC.read_text()):
        tit = " ".join(re.sub(r"\\[a-zA-Z]+\s*", "", tit).split())
        if tipo == "chapter":
            cap = normaliza(tit)
        elif num:
            indice[(cap, normaliza(tit))] = num
    return indice


def ordem(num):
    partes = num.split(".")
    resto = [int(p) for p in partes[1:] if p.isdigit()]
    return (0, int(partes[0]), "", resto) if partes[0].isdigit() \
        else (1, 0, partes[0], resto)


def main():
    indice = le_toc()
    erros, resolvido = [], {}
    for aula, dados in AULAS.items():
        if dados is None:
            resolvido[aula] = "---"
            continue
        cap, secoes = dados
        nums = []
        for s in secoes:
            chave = (normaliza(cap), normaliza(s))
            if chave not in indice:
                erros.append(f"  aula {aula}: '{s}' não existe em '{cap}'")
            else:
                nums.append(indice[chave])
        resolvido[aula] = ", ".join(sorted(set(nums), key=ordem)) or "---"

    if erros:
        print("Títulos declarados em AULAS que não existem mais no sumário:")
        print("\n".join(erros))
        sys.exit("nada foi escrito; corrija AULAS e rode de novo.")

    texto = TEX.read_text()
    ini = texto.index("\\section*{Calendário aula a aula}")
    fim = texto.index("\\end{longtable}", ini) + len("\\end{longtable}")

    #  Idempotência: a tabela pode já ter sido gerada antes e ter quatro
    #  colunas. Neste caso a coluna de seções é descartada e reconstruída,
    #  em vez de uma nova ser empilhada sobre a anterior.
    ja_gerada = "Aula & Foco & Seções & Conteúdo" in texto[ini:fim]
    linhas = re.findall(r"(?m)^(\d+) & ([^&]*) & (.*?) \\\\$",
                        texto[ini:fim], re.S)
    if len(linhas) != 72:
        sys.exit(f"esperava 72 aulas, encontrei {len(linhas)}")

    limpas = []
    for n, foco, cont in linhas:
        if ja_gerada:
            cont = cont.split(" & ", 1)[1] if " & " in cont else cont
        limpas.append((n, foco, cont))

    corpo = "\n".join(
        f"{n} & {foco.strip()} & {resolvido[int(n)]} & "
        f"{' '.join(cont.split())} \\\\" for n, foco, cont in limpas)

    tabela = (
        "\\section*{Calendário aula a aula}\n"
        "\\phantomsection\n"
        "\\addcontentsline{toc}{section}{Calendário aula a aula}\n"
        "\\label{sec:calendario}\n\n"
        "A coluna \\emph{Seções} traz a numeração exata a cobrir em cada "
        "encontro. Ela não é escrita à mão: o script "
        "\\arq{codigo/gerar\\_calendario.py} declara o plano por título de "
        "seção e resolve os números no sumário da última compilação, de modo "
        "que a tabela acompanha qualquer mudança na estrutura do texto.\n\n"
        "\\scriptsize\n"
        "\\begin{longtable}{cp{3.3cm}p{2.3cm}p{6.1cm}}\n"
        "\\toprule\nAula & Foco & Seções & Conteúdo \\\\\n\\midrule\n"
        "\\endfirsthead\n"
        "\\toprule\nAula & Foco & Seções & Conteúdo \\\\\n\\midrule\n"
        "\\endhead\n" + corpo + "\n\\bottomrule\n\\end{longtable}")

    TEX.write_text(texto[:ini] + tabela + texto[fim:])
    n = sum(1 for a in resolvido.values() if a != "---")
    print(f"calendário regenerado: 72 aulas, {n} com seções numeradas")
    print("  sem seção numerada (esperado):",
          ", ".join(str(a) for a, v in resolvido.items() if v == "---"))


if __name__ == "__main__":
    main()
