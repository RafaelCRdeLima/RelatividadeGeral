(* ::Package:: *)

(* =====================================================================
   FLRW: das equacoes de Einstein as equacoes de Friedmann.
   Usa as mesmas funcoes Christoffel, Riemann e Ricci definidas em
   cap11_schwarzschild_simbolico.wl.
   ===================================================================== *)

Get["cap11_schwarzschild_simbolico.wl"];  (* reaproveita as ferramentas *)
ClearAll[x, g, Gam, Riem];

(* --- metrica de Robertson-Walker ------------------------------------ *)
x = {t, r, \[Theta], \[Phi]};
a = a[t];
g = DiagonalMatrix[{-1, a^2/(1 - k r^2), a^2 r^2, a^2 r^2 Sin[\[Theta]]^2}];

Gam = Christoffel[g, x];
Riem = Riemann[Gam, x];
Ric = Ricci[Riem];
Rscalar = Simplify[Sum[Inverse[g][[i, j]] Ric[[i, j]], {i, 4}, {j, 4}]];
Einstein = Simplify[Ric - (1/2) Rscalar g];

Print["R = ", Rscalar];
(* -> 6 (a a'' + a'^2 + k)/a^2                                          *)

(* --- fluido perfeito comovel ---------------------------------------- *)
u = {1, 0, 0, 0};                                   (* u^mu, com u.u = -1 *)
uDown = Simplify[g . u];
T = Simplify[(\[Rho][t] + p[t]) TensorProduct[uDown, uDown] + p[t] g];

eqs = Simplify[Thread[Flatten[Einstein] == 8 Pi Flatten[T]]];

(* componente tt: primeira equacao de Friedmann *)
eqFried = Simplify[Einstein[[1, 1]] == 8 Pi T[[1, 1]]];
Print["Friedmann I: ", eqFried];
(* -> 3 (a'^2 + k)/a^2 = 8 Pi rho                                       *)

(* componente rr, combinada com a anterior: equacao da aceleracao *)
eqAcc = FullSimplify[
  (Einstein[[2, 2]] - 8 Pi T[[2, 2]]) == 0 /.
     Solve[eqFried, Derivative[1][a][t]^2][[1]]];
Print["Friedmann II: ", eqAcc];
(* -> a''/a = -(4 Pi/3)(rho + 3 p)                                      *)

(* --- conservacao: divergencia covariante de T ------------------------ *)
DivT = Simplify@Table[
   Sum[Inverse[g][[m, n]] (D[T[[n, b]], x[[m]]]
        - Sum[Gam[[s, m, n]] T[[s, b]] + Gam[[s, m, b]] T[[n, s]], {s, 4}]),
       {m, 4}, {n, 4}], {b, 4}];
Print["div T (componente t) = ", Simplify[DivT[[1]]]];
(* -> rho' + 3 (a'/a) (rho + p) = 0 : a equacao de continuidade nao e'
      independente, ela segue da identidade de Bianchi                  *)

(* --- solucoes fechadas ---------------------------------------------- *)
(* Einstein-de Sitter: k = 0, p = 0 *)
Print["EdS: ", DSolve[{a'[t]^2 == C1/a[t], a[t0] == 1}, a[t], t] // Simplify];
(* -> a ~ t^(2/3)                                                       *)

(* materia + Lambda, plano: a(t) = (Om_m/Om_L)^(1/3) sinh^(2/3)(...)    *)
aSol = (\[CapitalOmega]m/\[CapitalOmega]\[CapitalLambda])^(1/3) *
       Sinh[(3/2) Sqrt[\[CapitalOmega]\[CapitalLambda]] H0 t]^(2/3);
check = FullSimplify[
  D[aSol, t]^2 - H0^2 (\[CapitalOmega]m/aSol + \[CapitalOmega]\[CapitalLambda] aSol^2),
  Assumptions -> {t > 0, H0 > 0, \[CapitalOmega]m > 0, \[CapitalOmega]\[CapitalLambda] > 0}];
Print["residuo da solucao materia+Lambda = ", check];
(* -> 0 : a solucao satisfaz exatamente a equacao de Friedmann          *)

(* idade do universo nessa solucao *)
idade = Solve[aSol == 1, t] // Simplify;
Print["t_0 = ", idade];
(* -> t_0 = (2/(3 H0 Sqrt[Om_L])) ArcSinh[Sqrt[Om_L/Om_m]]              *)
