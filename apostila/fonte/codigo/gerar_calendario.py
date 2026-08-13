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
    #  O capítulo 1 ocupa os quatro primeiros encontros, e a apresentação da
    #  disciplina é feita na aula 1 junto com a Seção 1.1 -- que é justamente
    #  o contraste Newton/Einstein, a melhor abertura possível para o curso.
    #  Os três encontros assim liberados foram para o capítulo 4, que tem 14
    #  seções e vinha espremido em três aulas.
    1:  (RE, ["Newton e Einstein: duas visões de mundo", "Eventos, observadores e intervalo"]),
    2:  (RE, ["Tempo próprio", "Transformações de Lorentz"]),
    3:  (RE, ["Consequências: o que se mede",
              "Diagramas de Minkowski e hipérboles invariantes", "Paradoxo dos gêmeos"]),
    4:  (RE, ["A velocidade invariante é única",
              "As transformações em forma matricial", POR, EXA, NUM, EXE, EXT]),
    5:  (VET, ["Vetores no espaço-tempo", "Produto escalar"]),
    6:  (VET, ["Quadrivelocidade", "Quadrimomento"]),
    7:  (VET, ["Conservação", "Energia como componente temporal"]),
    8:  (VET, ["Centro de momento", "Partículas massivas e partículas sem massa"]),
    9:  (VET, [EXA, POR]),
    10: (VET, [NUM, EXE, EXT]),
    11: (TEN, ["Um-formas: por que elas existem", "Tensores de tipo $(r,s)$"]),
    12: (TEN, ["A métrica como ponte"]),
    13: (TEN, ["Regra prática de índices", "O que significa uma equação tensorial",
               "Componentes em uma base oblíqua"]),
    14: (TEN, ["Derivada de um tensor", "Erros comuns com índices", EXA, POR]),
    15: (TEN, [NUM, EXE, EXT]),
    16: (FLU, ["O que é um fluido", "Poeira: densidade e fluxo", "O vetor fluxo de número"]),
    17: (FLU, ["Densidade é um fluxo temporal",
               "Um-formas, superfícies e o fluxo invariante",
               "Conservação do número de partículas"]),
    18: (FLU, ["O tensor energia-momento", "Tensões e a simetria do tensor"]),
    19: (FLU, ["Fluidos gerais: energia interna e a primeira lei", "O fluido perfeito",
               "Conservação: continuidade e Euler"]),
    20: (FLU, ["Equações de estado", "Lei de Gauss em quatro dimensões",
               "Por que isso importa para a relatividade geral", EXA, POR, EXE, EXT]),
    21: (GRA, ["O princípio da equivalência"]),
    22: (GRA, ["Coordenadas curvilíneas", "Bases coordenadas e bases não coordenadas"]),
    23: (GRA, ["Geodésicas e os símbolos de Christoffel"]),
    24: (GRA, ["Christoffel não é força", "Marés como sinal de curvatura", POR, EXE, EXT]),
    25: (CUR, ["Variedades e métricas", "Derivada covariante"]),
    26: (CUR, ["Compatibilidade métrica", POR]),
    27: (CUR, ["Curvatura", "Simetrias do tensor de Riemann"]),
    28: (CUR, ["Curvatura intrínseca e extrínseca", "Desvio geodésico"]),
    29: (CUR, [EXA, NUM, EXE, EXT]),
    30: (FIS, ["Movimento livre", "Energia medida por um observador"]),
    31: (FIS, ["Simetrias e quantidades conservadas"]),
    32: (FIS, ["Observadores não são coordenadas", "Tetradas locais",
               "Constantes de movimento e energia local"]),
    33: (FIS, [POR, EXE, EXT]),
    34: (EIN, ["A equação de campo", "Por que o tensor de Einstein"]),
    35: (EIN, ["A ação de Einstein--Hilbert"]),
    36: (EIN, ["Traço das equações de campo", "Conservação local", EXA]),
    37: (EIN, ["Limite newtoniano", "O limite fraco com mais detalhe"]),
    38: (EIN, ["Constante cosmológica como fluido", POR, EXE, EXT]),
    39: (OND, ["Campo fraco", "Gauge e graus de liberdade"]),
    40: (OND, ["Polarizações", "Efeito sobre partículas teste"]),
    41: (OND, ["Emissão"]),
    42: (OND, ["Detecção", "Escalas de detecção"]),
    43: (OND, ["Binárias compactas", ERA]),
    44: (OND, [NUM]),
    45: (OND, [NUM, POR, EXE, EXT]),
    46: (SCH, ["Métrica de Schwarzschild", "Coordenada areal"]),
    47: (SCH, ["Redshift gravitacional"]),
    48: (SCH, ["Geodésicas e potencial efetivo"]),
    49: (SCH, ["Órbitas circulares", "Órbita de fótons"]),
    50: (SCH, ["Estrelas relativísticas"]),
    51: (SCH, ["Testes clássicos", "Lentes gravitacionais"]),
    52: (SCH, [NUM, POR, ERA, EXE, EXT]),
    53: (BUR, ["Horizonte", "Horizon versus singularidade"]),
    54: (BUR, ["Coordenadas regulares", "Diagramas causais"]),
    55: (BUR, ["Buracos negros em rotação", "Buracos negros reais"]),
    56: (BUR, ["Termodinâmica", "Leis da mecânica de buracos negros"]),
    57: (BUR, [NUM]),
    58: (BUR, [NUM, POR, ERA, EXE, EXT]),
    59: (COS, ["Princípio cosmológico", "Redshift cosmológico"]),
    60: (COS, ["Equações de Friedmann", "Eras de dominação"]),
    61: (COS, ["Distâncias em cosmologia", "Horizontes cosmológicos"]),
    62: (COS, ["Parâmetros observacionais", "Problemas conceituais"]),
    63: (COS, [NUM]),
    64: (COS, [NUM, POR, ERA, EXE, EXT]),
    65: (APX, ["A filosofia dos índices", "Checklist para não errar"]),
    66: (PRO, ["Projeto 1: geodésicas em Schwarzschild"]),
    67: (PRO, ["Projeto 2: redshift gravitacional"]),
    68: (PRO, ["Projeto 3: ondas gravitacionais"]),
    69: (PRO, ["Projeto 4: cosmologias simples"]),
    70: (COS, ["Síntese conceitual do curso"]),
    #  Duas aulas de reserva: seminários, recuperação de atraso ou avaliação.
    71: None,
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
