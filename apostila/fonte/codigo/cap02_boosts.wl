(* Relatividade especial: verificacoes simbolicas em Mathematica/Wolfram Language.
   Unidades geometrizadas (c = 1). Testado quanto a consistencia algebrica
   com sympy antes de ser transcrito para esta apostila. *)

(* Matriz de Lorentz 2x2 (t,x)->(t',x') *)
gamma[v_] := 1/Sqrt[1 - v^2];
Lambda[v_] := {{gamma[v], -gamma[v] v}, {-gamma[v] v, gamma[v]}};
eta = {{-1, 0}, {0, 1}};

(* 1) Invariancia do intervalo: Lambda^T . eta . Lambda == eta *)
invariancia = FullSimplify[
   Transpose[Lambda[v]].eta.Lambda[v] - eta,
   Assumptions -> -1 < v < 1];
Print["Residuo da invariancia do intervalo: ", MatrixForm[invariancia]];

(* 2) Composicao de dois boosts colineares = boost com velocidade
      relativistica combinada *)
vrel[v1_, v2_] := (v1 + v2)/(1 + v1 v2);
composicao = FullSimplify[
   Lambda[v1].Lambda[v2] - Lambda[vrel[v1, v2]],
   Assumptions -> {-1 < v1 < 1, -1 < v2 < 1, -1 < vrel[v1, v2] < 1}];
Print["Residuo da composicao de boosts: ", MatrixForm[composicao]];

(* 3) Forma em rapidez: aditividade fica trivial com identidades hiperbolicas *)
LambdaRapidez[phi_] := {{Cosh[phi], -Sinh[phi]}, {-Sinh[phi], Cosh[phi]}};
somaRapidez = Simplify[
   TrigExpand[LambdaRapidez[phi1].LambdaRapidez[phi2]] -
    TrigExpand[LambdaRapidez[phi1 + phi2]]];
Print["Residuo da aditividade de rapidez: ", MatrixForm[somaRapidez]];

(* 4) Formula de adicao de velocidades a partir da composicao de boosts,
      obtida por eliminacao direta (sem assumir o resultado) *)
solucao = Solve[
   (Lambda[v1].Lambda[v2])[[1, 2]]/(Lambda[v1].Lambda[v2])[[1, 1]] == -w,
   w];
Print["Velocidade efetiva da composicao (deve reduzir a (v1+v2)/(1+v1 v2)): ",
  FullSimplify[w /. solucao[[1]], Assumptions -> {-1 < v1 < 1, -1 < v2 < 1}]];
