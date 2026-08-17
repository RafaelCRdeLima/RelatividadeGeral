import { useEffect, useState } from "react";
import { ActivityPage } from "./components/ActivityPage";
import { ProgressRail } from "./components/ProgressRail";
import { ProfessorViewer } from "./routes/ProfessorViewer";
import { Summary } from "./routes/Summary";
import { Welcome } from "./routes/Welcome";
import { useLabStore } from "./store";

function useHash(){const [hash,setHash]=useState(location.hash);useEffect(()=>{const update=()=>setHash(location.hash);addEventListener("hashchange",update);return()=>removeEventListener("hashchange",update)},[]);return hash;}

export default function App(){
  const hash=useHash(),professor=hash.startsWith("#/professor"); const {session,screen,currentIndex,openActivity,goSummary}=useLabStore(); const [dark,setDark]=useState(()=>localStorage.getItem("rg-lab:theme")!=="light");
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("rg-lab:theme",dark?"dark":"light")},[dark]);
  return <div className="app"><a className="skip-link" href="#main-content">Ir para o conteúdo</a><header className="app-header"><a className="lab-brand" href="#/"><span>R<sup>μ</sup><sub>ν</sub></span><div><strong>RG Interactive Lab</strong><small>Capítulo 3 · Tensores</small></div></a><nav><a href="../capitulo-2/">Capítulo 1</a><a href={professor?"#/":"#/professor"}>{professor?"Modo aluno":"Professor Viewer"}</a><button aria-label={dark?"Ativar modo claro":"Ativar modo escuro"} onClick={()=>setDark(value=>!value)}>{dark?"☼":"◐"}</button>{session&&screen!=="welcome"&&!professor&&<button className="student-chip" onClick={goSummary} disabled={!session.locked}>{session.student.name.split(" ")[0]}<i>{session.locked?"relatório":"sessão local"}</i></button>}</nav></header>
    <div id="main-content">{professor?<ProfessorViewer/>:screen==="welcome"?<Welcome/>:screen==="summary"?<Summary/>:session?<div className="lab-shell"><ProgressRail session={session} currentIndex={currentIndex} onOpen={openActivity}/><ActivityPage key={currentIndex}/></div>:<Welcome/>}</div>
    <footer className="app-footer"><span>UDESC · Relatividade Geral</span><span>Dados processados localmente · versão cap4-1.0</span><a href="../../">Página da disciplina</a></footer></div>;
}
