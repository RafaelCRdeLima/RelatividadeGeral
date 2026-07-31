(* ::Package:: *)

(* =====================================================================
   Buracos negros: regularidade do horizonte, invariantes de curvatura,
   gravidade superficial e a primeira lei. Reaproveita as ferramentas de
   cap11_schwarzschild_simbolico.wl.
   ===================================================================== *)

Get["cap11_schwarzschild_simbolico.wl"];
ClearAll[x, g, Gam, Riem];

(* --- 1. Eddington-Finkelstein entrante ------------------------------- *)
(*  v = t + r*,  r* = r + 2M Log[r/(2M) - 1]                             *)
x = {v, r, \[Theta], \[Phi]};
g = {{-(1 - 2 M/r), 1, 0, 0},
     {1, 0, 0, 0},
     {0, 0, r^2, 0},
     {0, 0, 0, r^2 Sin[\[Theta]]^2}};

Print["det g = ", Simplify[Det[g]]];
(* -> -r^4 Sin[theta]^2 : em r = 2M vale -16 M^4 Sin[theta]^2, diferente
      de zero. A metrica e' invertivel no horizonte -- ao contrario da
      forma de Schwarzschild, onde g_rr diverge ali.                     *)
Print["g em r = 2M: ", Simplify[g /. r -> 2 M] // MatrixForm];

Gam  = Christoffel[g, x];
Riem = Riemann[Gam, x];
Print["Ricci = ", Simplify[Ricci[Riem]]];
(* -> matriz nula: EF descreve a mesma solucao de vacuo                   *)

(* --- 2. Kretschmann: o invariante que separa as duas singularidades -- *)
gi = Inverse[g];
RiemDown = Simplify@Table[Sum[g[[a, e]] Riem[[e, b, c, d]], {e, 4}],
                          {a, 4}, {b, 4}, {c, 4}, {d, 4}];
RiemUp = Simplify@Table[
   Sum[gi[[a, e]] gi[[b, f]] gi[[c, hh]] gi[[d, k]] RiemDown[[e, f, hh, k]],
       {e, 4}, {f, 4}, {hh, 4}, {k, 4}], {a, 4}, {b, 4}, {c, 4}, {d, 4}];
K = FullSimplify[Sum[RiemDown[[a, b, c, d]] RiemUp[[a, b, c, d]],
                     {a, 4}, {b, 4}, {c, 4}, {d, 4}]];
Print["Kretschmann = ", K];
(* -> 48 M^2/r^6 : finito em r = 2M, divergente em r = 0. O horizonte e'
      uma singularidade de coordenada; r = 0 nao e'.                     *)
Print["K no horizonte = ", Simplify[K /. r -> 2 M]];
(* -> 3/(4 M^4) : cai como 1/M^4, e por isso a mare no horizonte de um
      buraco negro supermassivo e' desprezivel                           *)

(* --- 3. Gravidade superficial ---------------------------------------- *)
(*  xi = d/dt e' de Killing;  kappa^2 = -(1/2) (nabla^a xi^b)(nabla_a xi_b)
    avaliado no horizonte. Para Schwarzschild o atalho padrao basta:      *)
f = 1 - 2 M/r;
kappa = Simplify[(1/2) D[f, r] /. r -> 2 M];
Print["kappa = ", kappa];
(* -> 1/(4 M)                                                            *)
Print["T_H = kappa/(2 Pi) = ", Simplify[kappa/(2 Pi)]];
(* -> 1/(8 Pi M), que em unidades SI e' hbar c^3/(8 Pi G M k_B)          *)

(* --- 4. Primeira lei da mecanica de buracos negros ------------------- *)
area = 4 Pi (2 M)^2;
entropia = area/4;
Print["A = ", area, ",  S = A/4 = ", entropia];
Print["T dS/dM = ", Simplify[(kappa/(2 Pi)) D[entropia, M]]];
(* -> 1 : isto e', dM = T dS exatamente. A analogia termodinamica nao e'
      aproximada -- para Schwarzschild ela e' uma identidade.            *)
Print["(kappa/(8 Pi)) dA/dM = ", Simplify[(kappa/(8 Pi)) D[area, M]]];
(* -> 1 : a mesma afirmacao na forma dM = (kappa/8Pi) dA                 *)

(* --- 5. Kerr: horizontes, ergosfera e ISCO --------------------------- *)
ClearAll[a];
rPlus  = M + Sqrt[M^2 - a^2];
rMinus = M - Sqrt[M^2 - a^2];
rErgo  = M + Sqrt[M^2 - a^2 Cos[\[Theta]]^2];
Print["r_+ = ", rPlus, ",  r_- = ", rMinus];
Print["ergosfera no equador: ", Simplify[rErgo /. \[Theta] -> Pi/2]];
(* -> 2M, independente de a: a ergosfera toca 2M no equador para qualquer
      spin, enquanto o horizonte encolhe de 2M ate' M                    *)

areaKerr = FullSimplify[4 Pi (rPlus^2 + a^2)];
Print["A(Kerr) = ", areaKerr];
Print["A(Kerr) em a = 0: ", Simplify[areaKerr /. a -> 0],
      " ;  em a = M: ", Simplify[areaKerr /. a -> M]];
(* -> 16 Pi M^2  e  8 Pi M^2 : extrair momento angular de um buraco negro
      extremo pode, no maximo, dobrar sua area -- e a area nunca diminui *)

(* ISCO equatorial prograda (Bardeen-Press-Teukolsky), com M = 1 *)
Z1 = 1 + (1 - a^2)^(1/3) ((1 + a)^(1/3) + (1 - a)^(1/3));
Z2 = Sqrt[3 a^2 + Z1^2];
rIsco = 3 + Z2 - Sqrt[(3 - Z1) (3 + Z1 + 2 Z2)];
Print["r_ISCO(a=0) = ", Simplify[rIsco /. a -> 0],
      " ;  r_ISCO(a->1) = ", Simplify[Limit[rIsco, a -> 1]]];
(* -> 6  e  1 : a ISCO desce de 6M ate' M no limite extremo progrado     *)

EIsco = (rIsco^2 - 2 rIsco + a Sqrt[rIsco])/(rIsco Sqrt[rIsco^2 - 3 rIsco + 2 a Sqrt[rIsco]]);
Print["eficiencia 1 - E_ISCO em a = 0: ", Simplify[1 - (EIsco /. a -> 0)]];
(* -> 1 - Sqrt[8/9] = 0.0572                                            *)
Print["eficiencia no limite a -> 1: ", Simplify[Limit[1 - EIsco, a -> 1]]];
(* -> 1 - 1/Sqrt[3] = 0.4226                                            *)
