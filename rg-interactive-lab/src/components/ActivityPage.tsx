import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { activities } from "../data/activities";
import { isNumericallyCorrect, parseNumber } from "../lib/math";
import { useLabStore } from "../store";
import type { InteractionEvent } from "../types";
import { BasisTransformationLab, VectorBuilderLab, VectorComponentsLab } from "./VectorLabs";
import { DualBasisLab, OneFormLab, VectorVsOneFormLab } from "./OneFormLabs";
import { EinsteinNotationLab, ExpressionValidatorLab, TensorProductLab } from "./IndexLabs";
import { IntegratedChallengeLab, MetricLoweringLab, MetricRaisingLab } from "./MetricLabs";
import { Formula } from "./Formula";
import type { LabValue, LabVisualState, VisualizationProps } from "./visualization-types";

const visualizationRegistry: Record<string, React.ComponentType<VisualizationProps>> = {
  vectorComponents: VectorComponentsLab, vectorBuilder: VectorBuilderLab, basisTransformation: BasisTransformationLab,
  oneForm: OneFormLab, vectorVsOneForm: VectorVsOneFormLab, dualBasis: DualBasisLab,
  einsteinNotation: EinsteinNotationLab, expressionValidator: ExpressionValidatorLab, tensorProduct: TensorProductLab,
  metricLowering: MetricLoweringLab, metricRaising: MetricRaisingLab, integratedChallenge: IntegratedChallengeLab,
};

function answerIsCorrect(value: string, expected: string | number | boolean, definition: typeof activities[number]["question"]): boolean {
  if (typeof expected === "number") {
    const submitted=parseNumber(value); return submitted !== null && isNumericallyCorrect({ submitted, expected, absoluteTolerance: definition.absoluteTolerance, relativeTolerance: definition.relativeTolerance });
  }
  if (typeof expected === "boolean") return (value === "true") === expected;
  return value === expected;
}

export function ActivityPage() {
  const { session,currentIndex,recordInteraction,submitAnswer,requestHint,restartActivity,continueAfterError,next }=useLabStore();
  const definition=activities[currentIndex], record=session?.activities[currentIndex];
  const [visualState,setVisualState]=useState<LabVisualState>({...definition.initialState,...record?.finalState});
  const [answer,setAnswer]=useState(""); const [feedback,setFeedback]=useState<"idle"|"correct"|"incorrect">(()=>record?.status==="completed"?"correct":"idle"); const [showHint,setShowHint]=useState(false);
  const questionStarted=useRef(0);
  const interactionCount=useMemo(()=>record?.interactions.filter(event=>["slider","number","toggle","drag"].includes(event.type)).length??0,[record?.interactions]);
  if(!session||!record)return null;
  const Visualization=visualizationRegistry[definition.visualizationType];
  const change=(key:string,value:LabValue,kind:InteractionEvent["type"]="slider")=>{if(!questionStarted.current)questionStarted.current=Date.now();const nextState={...visualState,[key]:value};setVisualState(nextState);recordInteraction({type:kind,at:new Date().toISOString(),payload:{control:key,value}},nextState);};
  const submit=()=>{const correct=answerIsCorrect(answer,definition.question.expected,definition.question);submitAnswer(answer,correct,questionStarted.current?Date.now()-questionStarted.current:0);setFeedback(correct?"correct":"incorrect");};
  const restart=()=>{restartActivity();setVisualState({...definition.initialState});setAnswer("");setFeedback("idle");setShowHint(false);questionStarted.current=0;};
  return <motion.main className="activity-main" key={definition.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <header className="activity-heading"><div><p className="eyebrow">Atividade {String(currentIndex+1).padStart(2,"0")} · {definition.concept}</p><h1>{definition.title}</h1></div><div className="activity-stats"><span>{record.questions.length}<small>tentativas</small></span><span>{record.hintsUsed}<small>pistas</small></span><span>{record.restarts}<small>refações</small></span></div></header>
    <section className="concept-card"><p>{definition.shortIntroduction}</p><details><summary>Ver explicação detalhada</summary><p>{definition.detailedIntroduction}</p></details><Formula>{definition.formula}</Formula></section>
    <section className="exploration-card"><div className="card-bar"><span>Exploração interativa</span><small>{interactionCount < definition.minimumInteractions ? `Faça mais ${definition.minimumInteractions-interactionCount} interação(ões)` : "Pergunta liberada ✓"}</small></div><Visualization state={visualState} onChange={change}/></section>
    <section className={`question-card ${interactionCount>=definition.minimumInteractions?"unlocked":"locked"}`} aria-live="polite"><div className="question-number">Compreensão</div><h2>{definition.question.prompt}</h2>{interactionCount<definition.minimumInteractions?<p className="locked-message">Explore os controles acima para liberar esta pergunta.</p>:<>
      {definition.question.kind==="numeric"?<label className="answer-number"><span>Sua resposta</span><input value={answer} onChange={event=>setAnswer(event.target.value)} inputMode="decimal" placeholder="Use ponto ou vírgula"/></label>:<div className="answer-options">{definition.question.options?.map(option=>{const value=definition.question.kind==="boolean"?String(option==="Sim"):option;return <label key={option} className={answer===value?"selected":""}><input type="radio" name="answer" value={value} checked={answer===value} onChange={()=>setAnswer(value)}/><span>{option}</span></label>})}</div>}
      {feedback==="idle"&&<button className="primary-button" disabled={!answer} onClick={submit}>Verificar resposta</button>}
      {feedback==="correct"&&<div className="feedback success"><strong>Correto.</strong><p>{definition.question.explanation}</p><button className="primary-button" onClick={next}>{currentIndex===activities.length-1?"Concluir laboratório":"Continuar para a próxima"} →</button></div>}
      {feedback==="incorrect"&&<div className="feedback error"><strong>Ainda não.</strong><p>{showHint?definition.question.hint:"Revise a visualização e escolha como deseja prosseguir."}</p><div className="feedback-actions"><button onClick={restart}>Refazer a atividade</button><button onClick={()=>{requestHint();setShowHint(true)}}>Ver uma pista</button><button className="quiet" onClick={()=>{continueAfterError();next()}}>Continuar mesmo assim</button></div></div>}
    </>}</section>
  </motion.main>;
}
