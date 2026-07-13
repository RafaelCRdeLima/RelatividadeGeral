import { jsPDF } from "jspdf";
import { activities } from "../data/activities";
import type { LabSession } from "../types";

export function createSessionPdf(session:LabSession):Blob{
  const pdf=new jsPDF({unit:"mm",format:"a4"}),summary=session.summary;let y=20;
  const line=(text:string,size=9,color:[number,number,number]=[35,55,68])=>{pdf.setFontSize(size);pdf.setTextColor(...color);const parts=pdf.splitTextToSize(text,174);pdf.text(parts,18,y);y+=parts.length*(size*.42)+3;};
  const page=()=>{if(y>270){pdf.addPage();y=18}};
  pdf.setFillColor(6,24,38);pdf.rect(0,0,210,52,"F");pdf.setTextColor(255,255,255);pdf.setFontSize(22);pdf.text("RG Interactive Lab",18,23);pdf.setFontSize(11);pdf.text("Capítulo 4 · Tensores no espaço-tempo plano",18,33);pdf.setFontSize(8);pdf.text(`versão ${session.activitySetVersion} · sessão ${session.sessionId}`,18,42);y=64;
  line(session.student.name,16,[6,48,70]);line([session.student.registration&&`Matrícula: ${session.student.registration}`,session.student.className&&`Turma: ${session.student.className}`,`Início: ${new Date(session.startedAt).toLocaleString("pt-BR")}`].filter(Boolean).join("  ·  "),8);
  if(summary){line(`Resultado geral: ${summary.score}%`,18,[20,111,132]);pdf.setFillColor(226,236,235);pdf.rect(18,y,174,8,"F");pdf.setFillColor(33,126,147);pdf.rect(18,y,174*summary.score/100,8,"F");y+=15;line(`${summary.correct} dominadas · ${summary.errors} erros · ${summary.hints} pistas · ${summary.restarts} refações`,9);}
  line("Percurso por atividade",13,[6,48,70]);session.activities.forEach((record,index)=>{page();const definition=activities[index];pdf.setFillColor(index%2?247:241,index%2?247:244,index%2?245:243);pdf.rect(18,y-5,174,19,"F");pdf.setTextColor(20,46,61);pdf.setFontSize(9);pdf.text(`${String(index+1).padStart(2,"0")}  ${definition.title}`,21,y+1);pdf.setFontSize(7);pdf.text(`status: ${record.status}  |  tentativas: ${record.questions.length}  |  pistas: ${record.hintsUsed}  |  refações: ${record.restarts}`,21,y+7);const last=record.questions.at(-1);if(last)pdf.text(`resposta final: ${last.value.slice(0,70)}  (${last.correct?"correta":"incorreta"})`,21,y+12);y+=23;});
  page();line("Desempenho por competência",13,[6,48,70]);summary?.competencies.forEach(item=>{page();const percent=Math.round(100*item.earned/item.possible);line(`${item.competency}: ${percent}% (${item.earned}/${item.possible})`,8);});
  page();line("Observação",11,[6,48,70]);line("Este relatório resume o percurso pedagógico registrado localmente no navegador. O arquivo .rglab contém os metadados completos e autenticados para análise do professor.",8);
  return pdf.output("blob");
}
