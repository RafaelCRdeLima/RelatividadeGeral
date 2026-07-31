(* ::Package:: *)

(* =====================================================================
   Schwarzschild: Christoffel, Ricci, Kretschmann, ISCO e precessao.
   Convencao de indices identica a do Capitulo 7 da apostila:
      R^a_{bcd} = d_c Gamma^a_{bd} - d_d Gamma^a_{bc}
                  + Gamma^a_{cs} Gamma^s_{bd} - Gamma^a_{ds} Gamma^s_{bc}
   ===================================================================== *)

ClearAll["Global`*"];

(* --- ferramentas geometricas reutilizaveis --------------------------- *)
Christoffel[g_, x_] := Module[{gi = Inverse[g], n = Length[x]},
  Simplify@Table[
    (1/2) Sum[gi[[a, s]] (D[g[[s, b]], x[[c]]] + D[g[[s, c]], x[[b]]]
                          - D[g[[b, c]], x[[s]]]), {s, n}],
    {a, n}, {b, n}, {c, n}]];

Riemann[Gam_, x_] := Module[{n = Length[x]},
  Simplify@Table[
    D[Gam[[a, b, d]], x[[c]]] - D[Gam[[a, b, c]], x[[d]]]
      + Sum[Gam[[a, c, s]] Gam[[s, b, d]] - Gam[[a, d, s]] Gam[[s, b, c]], {s, n}],
    {a, n}, {b, n}, {c, n}, {d, n}]];

Ricci[Riem_] := Simplify@Table[Sum[Riem[[s, a, s, b]], {s, Length[Riem]}],
                               {a, Length[Riem]}, {b, Length[Riem]}];

(* --- metrica de Schwarzschild --------------------------------------- *)
x = {t, r, \[Theta], \[Phi]};
f = 1 - 2 M/r;
g = DiagonalMatrix[{-f, 1/f, r^2, r^2 Sin[\[Theta]]^2}];

Gam = Christoffel[g, x];
Riem = Riemann[Gam, x];

Print["Ricci = ", MatrixForm[Ricci[Riem]]];
(* matriz nula: Schwarzschild e' solucao de vacuo, R_ab = 0            *)

(* --- escalar de Kretschmann ----------------------------------------- *)
gi = Inverse[g];
RiemDown = Table[Sum[g[[a, s]] Riem[[s, b, c, d]], {s, 4}], {a, 4}, {b, 4}, {c, 4}, {d, 4}];
RiemUp = Table[Sum[gi[[b, i]] gi[[c, j]] gi[[d, k]] Riem[[a, i, j, k]],
                   {i, 4}, {j, 4}, {k, 4}], {a, 4}, {b, 4}, {c, 4}, {d, 4}];
K = FullSimplify[Sum[RiemDown[[a, b, c, d]] RiemUp[[a, b, c, d]], {a, 4}, {b, 4}, {c, 4}, {d, 4}]];
Print["Kretschmann = ", K];
(* -> 48 M^2/r^6 : finito no horizonte, divergente em r = 0            *)

(* --- potencial efetivo, orbitas circulares e ISCO -------------------- *)
(* q = L^2. A normalizacao u.u = -1 no plano equatorial da'
   rdot^2 = E^2 - V, com V abaixo.                                      *)
V[r_, q_] := (1 - 2 M/r) (1 + q/r^2);

qCirc = q /. First@Solve[D[V[rr, q], rr] == 0 /. rr -> r, q];
Print["L^2 da orbita circular = ", Simplify[qCirc]];
(* -> M r^2/(r - 3M) : nao ha' orbita circular para r <= 3M            *)

isco = Solve[{D[V[rr, q], rr] == 0, D[V[rr, q], {rr, 2}] == 0}, {rr, q}];
Print["ISCO = ", Simplify[isco]];
(* -> rr = 6M, q = 12 M^2, isto e' L = 2 Sqrt[3] M                     *)

Print["E_ISCO = ", Sqrt[V[6 M, 12 M^2]] // Simplify];
(* -> 2 Sqrt[2]/3 = 0.942809..., logo 5.72% da massa de repouso pode
      ser irradiada por acrecao lenta ate' a ISCO                       *)

(* --- precessao do perielio: resultado exato para orbitas quase circulares *)
omegaR2 = Simplify[(1/2) D[V[rr, q], {rr, 2}] /. {rr -> r, q -> qCirc}];
omegaPhi = Simplify[Sqrt[qCirc]/r^2];
deltaPhi = FullSimplify[2 Pi (omegaPhi/Sqrt[omegaR2] - 1),
                        Assumptions -> {r > 6 M, M > 0}];
Print["Delta phi por orbita = ", deltaPhi];
(* -> 2 Pi (1/Sqrt[1 - 6M/r] - 1) : diverge na ISCO, onde a orbita
      deixa de oscilar radialmente                                      *)

Print["expansao em M/r: ", Normal@Series[deltaPhi, {r, Infinity, 3}]];
(* -> 6 Pi M/r + 27 Pi M^2/r^2 + ... : o primeiro termo e' a formula
      classica 6 pi G M/(c^2 a (1 - e^2)) usada para Mercurio          *)
