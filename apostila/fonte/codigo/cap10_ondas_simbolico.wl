(* ::Package:: *)

(* =====================================================================
   Ondas gravitacionais: da equacao de Einstein linearizada a' formula
   do quadrupolo. Reaproveita Christoffel/Riemann/Ricci definidos em
   cap11_schwarzschild_simbolico.wl.
   ===================================================================== *)

Get["cap11_schwarzschild_simbolico.wl"];
ClearAll[x, g, h, hbar, Gam, Riem];

x = {t, x1, x2, x3};
eta = DiagonalMatrix[{-1, 1, 1, 1}];

(* --- 1. Linearizacao: g = eta + eps h, ate' primeira ordem em eps ---- *)
h = Table[hh[a, b][t, x1, x2, x3], {a, 4}, {b, 4}];
h = (h + Transpose[h])/2;                       (* h_{mu nu} e' simetrica *)
g = eta + eps h;

Ric1 = Normal@Series[Ricci[Riemann[Christoffel[g, x], x]], {eps, 0, 1}];
RicLin = Simplify@Coefficient[Ric1, eps, 1];

(* R_{mu nu}^(1) = (1/2)( -Box h_{mu nu} - d_mu d_nu h + d_mu d^a h_{a nu}
                          + d_nu d^a h_{a mu} )                          *)
traco = Sum[Inverse[eta][[a, b]] h[[a, b]], {a, 4}, {b, 4}];
hbar  = h - (1/2) eta traco;                    (* traco revertido        *)

(* --- 2. Gauge de Lorenz: d^mu hbar_{mu nu} = 0 ---------------------- *)
lorenz = Table[
   Sum[Inverse[eta][[m, n]] D[hbar[[n, b]], x[[m]]], {m, 4}, {n, 4}],
   {b, 4}];

boxOp[f_] := Sum[Inverse[eta][[m, n]] D[f, x[[m]], x[[n]]], {m, 4}, {n, 4}];

(* Impondo Lorenz, R_{mu nu}^(1) colapsa em -(1/2) Box hbar_{mu nu} + traco *)
Print["equacao de onda: ",
  Simplify[RicLin /. Solve[Thread[lorenz == 0], {}] ]];
(* -> Box hbar_{mu nu} = -16 Pi T_{mu nu}, isto e', no vacuo Box hbar = 0 *)

(* --- 3. Onda plana em gauge TT propagando em z = x3 ------------------ *)
hTT = {{0, 0, 0, 0},
       {0,  hp[t - x3],  hc[t - x3], 0},
       {0,  hc[t - x3], -hp[t - x3], 0},
       {0, 0, 0, 0}};

Print["Box h^TT = ", Simplify[Map[boxOp, hTT, {2}]]];
(* -> matriz nula: qualquer perfil de hp e hc que dependa so' de (t - z)
      resolve a equacao de onda                                          *)
Print["traco de h^TT = ",
  Simplify[Sum[Inverse[eta][[a, b]] hTT[[a, b]], {a, 4}, {b, 4}]]];
(* -> 0 : TT e' mesmo sem traco                                          *)
Print["transversalidade d^mu h^TT_{mu 3} = ",
  Simplify[Sum[Inverse[eta][[m, n]] D[hTT[[n, 4]], x[[m]]], {m, 4}, {n, 4}]]];
(* -> 0                                                                  *)

(* --- 4. Curvatura da onda e desvio geodesico ------------------------- *)
gW = eta + eps hTT;
RiemW = Normal@Series[Riemann[Christoffel[gW, x], x], {eps, 0, 1}];
R1010 = Simplify@Coefficient[
   Sum[gW[[1, a]] RiemW[[a, 2, 1, 2]], {a, 4}], eps, 1];
Print["R_{1010} = ", R1010];
(* -> -(1/2) hp''(t - z) : e' a componente que entra na equacao de desvio
      geodesico, xi''_i = -R_{i0j0} xi^j = (1/2) d_t^2 h^TT_ij xi^j      *)

(* --- 5. Formula do quadrupolo para uma binaria circular -------------- *)
ClearAll[t];
Mtot = m1 + m2;  mu = m1 m2/Mtot;  w = Sqrt[GN Mtot/a^3];
pos  = {a Cos[w t], a Sin[w t], 0};
Q    = Table[mu (pos[[i]] pos[[j]] - (1/3) KroneckerDelta[i, j] a^2),
             {i, 3}, {j, 3}];
d3Q  = D[Q, {t, 3}];
Pot  = FullSimplify[(GN/(5 cc^5)) Sum[d3Q[[i, j]]^2, {i, 3}, {j, 3}],
                    Assumptions -> {m1 > 0, m2 > 0, a > 0, GN > 0, cc > 0}];
Print["P = ", Pot];
(* -> 32 GN^4 m1^2 m2^2 (m1 + m2) / (5 cc^5 a^5)                        *)

(* a mesma potencia, escrita com a massa de chirp *)
Mc = (m1 m2)^(3/5)/(m1 + m2)^(1/5);
Print["P em funcao de M_chirp e da frequencia da onda: ",
  FullSimplify[Pot /. a -> (GN Mtot/(Pi f)^2)^(1/3),
               Assumptions -> {f > 0, m1 > 0, m2 > 0, GN > 0, cc > 0}]];
(* -> depende de m1 e m2 apenas pela combinacao Mc^(10/3): e' por isso
      que o inspiral mede a massa de chirp, e nao as massas separadas    *)

(* taxa de variacao da frequencia da onda *)
Print["df/dt = ",
  FullSimplify[(96/5) Pi^(8/3) (GN Mc/cc^3)^(5/3) f^(11/3)]];
