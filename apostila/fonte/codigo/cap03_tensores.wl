(* Tensores no espaco-tempo plano: verificacoes simbolicas.
   Identidades de algebra tensorial, validas independentemente da metrica.
   Testado quanto a consistencia algebrica com sympy antes de ser transcrito
   para esta apostila. *)

(* 1) Base dual (reciproca) de uma base obliqua 2D generica *)
e1 = {a, b};
e2 = {c, d};
E = {e1, e2};
g = Simplify[E.Transpose[E]];
ginv = Simplify[Inverse[g]];
edual = Simplify[ginv.E];
biortogonal = Simplify[edual.Transpose[E]];
Print["e^i . e_j (deve ser a identidade 2x2): ", MatrixForm[biortogonal]];

(* 2) F_{mu nu} S^{mu nu} = 0 para F antissimetrico e S simetrico genericos,
      em qualquer dimensao (aqui, 3x3, com entradas simbolicas) *)
F = {{0, f12, f13}, {-f12, 0, f23}, {-f13, -f23, 0}};
S = {{s11, s12, s13}, {s12, s22, s23}, {s13, s23, s33}};
contracao = Simplify[Sum[F[[i, j]] S[[i, j]], {i, 3}, {j, 3}]];
Print["F_ij S^ij = ", contracao, "  (deve ser 0, para QUAISQUER f's e s's)"];

(* 3) Invariancia do traco de um tensor misto sob mudanca de base generica,
      T'^mu_nu = Lambda^mu_alpha T^alpha_beta (Lambda^{-1})^beta_nu *)
T = Table[Subscript[T, i, j], {i, 3}, {j, 3}];
L = Table[Subscript[\[CapitalLambda], i, j], {i, 3}, {j, 3}];
Tlinha = L.T.Inverse[L];
diferenca = Simplify[Tr[Tlinha] - Tr[T]];
Print["tr(T') - tr(T) = ", diferenca, "  (deve ser 0 para qualquer L invertivel)"];
