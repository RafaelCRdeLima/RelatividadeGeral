(* Vetores e momento relativistico: verificacoes simbolicas.
   Unidades geometrizadas (c = 1). Testado quanto a consistencia algebrica
   com sympy antes de ser transcrito para esta apostila. *)

eta = DiagonalMatrix[{-1, 1, 1, 1}];
produto4[a_, b_] := a.eta.b;

(* 1) Normalizacao da quadrivelocidade para uma 3-velocidade generica *)
gamma = 1/Sqrt[1 - (vx^2 + vy^2 + vz^2)];
U = {gamma, gamma vx, gamma vy, gamma vz};
normU = FullSimplify[produto4[U, U], Assumptions -> vx^2 + vy^2 + vz^2 < 1];
Print["U.U = ", normU, "  (deve ser -1)"];

(* 2) Massa invariante de um par de fotons com angulo theta entre eles *)
p1 = {E1, E1, 0, 0};
p2 = {E2, E2 Cos[theta], E2 Sin[theta], 0};
s = FullSimplify[-produto4[p1 + p2, p1 + p2]];
Print["M^2 do par de fotons = ", s, "  (deve ser 2 E1 E2 (1-Cos[theta]))"];

(* 3) Energia de limiar em alvo fixo: p (feixe, massa m, energia E) +
      p (alvo, massa m, em repouso) -> estado final de massa total 2m+M *)
pFeixe = {E, Sqrt[E^2 - m^2], 0, 0};
pAlvo = {m, 0, 0, 0};
sTotal = FullSimplify[-produto4[pFeixe + pAlvo, pFeixe + pAlvo]];
Print["s = ", sTotal, "  (energia de CM ao quadrado)"];

limiar = Solve[sTotal == (2 m + M)^2, E];
Ethr = FullSimplify[E /. limiar[[1]], Assumptions -> {m > 0, M > 0}];
Print["E_thr = ", Ethr, "  (deve ser m + 2M + M^2/(2m))"];

(* checagem numerica: producao de pi0 em colisao p+p (alvo fixo) *)
Ethr /. {m -> 938.272, M -> 134.9768}

(* 4) Espalhamento Compton: elimina o quadrimomento do eletron espalhado
      usando apenas sua casca de massa, sem jamais escreve-lo explicitamente *)
pGamma = {E, E, 0, 0};
pE = {me, 0, 0, 0};
pGammaLinha = {Ep, Ep Cos[theta], Ep Sin[theta], 0};

equacaoCompton = FullSimplify[
   produto4[pGamma, pE] - produto4[pGamma, pGammaLinha] -
    produto4[pE, pGammaLinha]];
Print["Equacao de Compton (deve ser 0 quando E' satisfaz a formula): ",
  equacaoCompton];

solucaoCompton = Solve[equacaoCompton == 0, Ep];
EpFechada = FullSimplify[Ep /. solucaoCompton[[1]]];
Print["E' = ", EpFechada,
  "  (equivalente a 1/E' - 1/E = (1-Cos[theta])/me)"];
