(* ::Package:: *)

(* =====================================================================
   Curvatura: simetrias do Riemann, contagem de componentes, Bianchi e a
   identidade que sustenta as equacoes de campo. O arquivo e' autocontido e
   define as mesmas rotinas Christoffel/Riemann/Ricci usadas pelos scripts
   dos Capitulos 11, 12 e 13.
   ===================================================================== *)

Christoffel[g_, x_] := Module[{gi = Inverse[g], n = Length[x]},
  Simplify@Table[
    (1/2) Sum[gi[[a, s]] (D[g[[s, b]], x[[c]]] + D[g[[s, c]], x[[b]]]
                          - D[g[[b, c]], x[[s]]]), {s, n}],
    {a, n}, {b, n}, {c, n}]];

Riemann[Gam_, x_] := Module[{n = Length[x]},
  Simplify@Table[
    D[Gam[[a, d, b]], x[[c]]] - D[Gam[[a, c, b]], x[[d]]]
      + Sum[Gam[[a, c, e]] Gam[[e, d, b]] - Gam[[a, d, e]] Gam[[e, c, b]],
            {e, n}],
    {a, n}, {b, n}, {c, n}, {d, n}]];

Ricci[Riem_] := Module[{n = Length[Riem]},
  Simplify@Table[Sum[Riem[[a, b, a, c]], {a, n}], {b, n}, {c, n}]];

Baixa[Riem_, g_] := Module[{n = Length[g]},
  Simplify@Table[Sum[g[[a, e]] Riem[[e, b, c, d]], {e, n}],
                 {a, n}, {b, n}, {c, n}, {d, n}]];

(* --- 1. Esfera de raio a: curvatura constante positiva -------------- *)
x = {\[Theta], \[Phi]};
g = DiagonalMatrix[{a^2, a^2 Sin[\[Theta]]^2}];
Gam = Christoffel[g, x];
Riem = Riemann[Gam, x];
Ric = Ricci[Riem];
Rs = Simplify[Sum[Inverse[g][[i, j]] Ric[[i, j]], {i, 2}, {j, 2}]];
Print["esfera: Ricci = ", Simplify[Ric], ",  R = ", Rs];
(* -> Ric = g/a^2  e  R = 2/a^2 : curvatura de Gauss K = R/2 = 1/a^2    *)

(* --- 2. Plano hiperbolico: curvatura constante negativa ------------- *)
xh = {xx, yy};
gh = (1/yy^2) IdentityMatrix[2];
Rh = Simplify[Sum[Inverse[gh][[i, j]] Ricci[Riemann[Christoffel[gh, xh], xh]][[i, j]],
                  {i, 2}, {j, 2}]];
Print["plano hiperbolico: R = ", Rh];
(* -> -2 : mesma estrutura, sinal oposto                                 *)

(* --- 3. Plano euclidiano em polares: Christoffel != 0, Riemann = 0 --- *)
xp = {r, \[Phi]};
gp = DiagonalMatrix[{1, r^2}];
Print["polares: Christoffel = ", Simplify[Christoffel[gp, xp]]];
Print["polares: Riemann = ", Simplify[Riemann[Christoffel[gp, xp], xp]]];
(* -> Christoffel nao nulo, Riemann identicamente nulo. A conexao depende
      da carta; a curvatura, nao.                                        *)

(* --- 4. As simetrias do tensor de Riemann --------------------------- *)
ClearAll[x, g, Gam, Riem];
x = {t, r, \[Theta], \[Phi]};
f = 1 - 2 M/r;
g = DiagonalMatrix[{-f, 1/f, r^2, r^2 Sin[\[Theta]]^2}];
Riem = Riemann[Christoffel[g, x], x];
Rd = Baixa[Riem, g];

Print["antissimetria nos dois primeiros: ",
  Simplify[Table[Rd[[a, b, c, d]] + Rd[[b, a, c, d]],
                 {a, 4}, {b, 4}, {c, 4}, {d, 4}]] === 0 Rd];
Print["antissimetria nos dois ultimos:   ",
  Simplify[Table[Rd[[a, b, c, d]] + Rd[[a, b, d, c]],
                 {a, 4}, {b, 4}, {c, 4}, {d, 4}]] === 0 Rd];
Print["simetria por troca de pares:      ",
  Simplify[Table[Rd[[a, b, c, d]] - Rd[[c, d, a, b]],
                 {a, 4}, {b, 4}, {c, 4}, {d, 4}]] === 0 Rd];
Print["primeira identidade de Bianchi:   ",
  Simplify[Table[Rd[[a, b, c, d]] + Rd[[a, c, d, b]] + Rd[[a, d, b, c]],
                 {a, 4}, {b, 4}, {c, 4}, {d, 4}]] === 0 Rd];
(* -> True nas quatro. Sao essas simetrias que reduzem 256 componentes a
      20 em quatro dimensoes.                                            *)

(* --- 5. Contagem de componentes independentes ----------------------- *)
independentes[n_] := n^2 (n^2 - 1)/12;
Print["componentes independentes de Riemann: ",
  Table[{n, independentes[n]}, {n, 2, 5}]];
(* -> {2,1}, {3,6}, {4,20}, {5,50}. Em n=2 ha' uma unica componente, que
      e' a curvatura de Gauss; em n=3, Riemann tem 6 e Ricci tambem 6,
      logo Ricci determina Riemann e nao ha' ondas gravitacionais; em
      n=4, Ricci tem 10 e sobram 10 para o tensor de Weyl.               *)
Print["Ricci tem n(n+1)/2 = ", Table[{n, n (n + 1)/2}, {n, 2, 5}]];
(* -> {2,3}, {3,6}, {4,10}, {5,15}. Atencao ao caso n=2: la' o Ricci ainda
      obedece R_munu = (R/2) g_munu, de modo que sobra uma unica componente
      independente, e nao tres. Para n >= 3 a contagem acima vale como esta',
      e Weyl = Riemann - Ricci: 0, 10 e 35 para n = 3, 4 e 5.             *)

(* --- 6. Segunda identidade de Bianchi e a divergencia de Einstein ---- *)
CovDivEinstein[g_, x_] := Module[
  {gi = Inverse[g], Gam, Riem, Ric, Rs, Ein, n = Length[x]},
  Gam = Christoffel[g, x]; Riem = Riemann[Gam, x]; Ric = Ricci[Riem];
  Rs = Simplify[Sum[gi[[i, j]] Ric[[i, j]], {i, n}, {j, n}]];
  Ein = Simplify[Ric - (1/2) Rs g];
  Simplify@Table[
    Sum[gi[[m, s]] (D[Ein[[s, b]], x[[m]]]
      - Sum[Gam[[u, m, s]] Ein[[u, b]] + Gam[[u, m, b]] Ein[[s, u]], {u, n}]),
        {m, n}, {s, n}], {b, n}]];

Print["div G para Schwarzschild = ", CovDivEinstein[g, x]];
(* -> {0,0,0,0}                                                          *)

(* uma metrica generica esfericamente simetrica, sem impor equacao alguma *)
ggen = DiagonalMatrix[{-A[r], B[r], r^2, r^2 Sin[\[Theta]]^2}];
Print["div G para metrica generica A(r), B(r) = ",
  Simplify[CovDivEinstein[ggen, x]]];
(* -> {0,0,0,0} tambem. A identidade de Bianchi contraida nao depende de
      a metrica resolver as equacoes de campo: e' um teorema de geometria,
      valido para QUALQUER metrica. E' por isso que ela pode servir de
      base para exigir conservacao local do lado da materia.             *)
