import { describe, expect, it } from "vitest";
import { applyOneForm, contract, dualBasis, inverse2, isNumericallyCorrect, lowerIndex, matMul, normSquared, raiseIndex, transformComponents } from "../../src/lib/math";

describe("utilitários matemáticos",()=>{
  it("transforma componentes em uma base rotacionada",()=>{const result=transformComponents([2,1],90);expect(result[0]).toBeCloseTo(1);expect(result[1]).toBeCloseTo(-2)});
  it("constrói a base dual",()=>{const basis:[[number,number],[number,number]]=[[1,.5],[0,1]];const dual=dualBasis(basis);expect(matMul(dual,basis)).toEqual([[1,0],[0,1]])});
  it("aplica one-form e contrai",()=>{expect(applyOneForm([2,1],[3,4])).toBe(10);expect(contract([3,4],[2,1])).toBe(10)});
  it("baixa e sobe índices",()=>{const metric:[[number,number],[number,number]]=[[2,.5],[.5,1.5]],vector:[number,number]=[2,1];const lower=lowerIndex(metric,vector);expect(lower).toEqual([4.5,2.5]);expect(raiseIndex(metric,lower)[0]).toBeCloseTo(2);expect(raiseIndex(metric,lower)[1]).toBeCloseTo(1);expect(inverse2(metric)).toBeDefined()});
  it("calcula norma em métrica geral",()=>expect(normSquared([[2,0],[0,1]],[2,1])).toBe(9));
  it("aceita tolerâncias absoluta e relativa",()=>{expect(isNumericallyCorrect({submitted:1.414,expected:Math.sqrt(2),absoluteTolerance:.01})).toBe(true);expect(isNumericallyCorrect({submitted:1.3,expected:Math.sqrt(2),absoluteTolerance:.01,relativeTolerance:.01})).toBe(false)});
});
