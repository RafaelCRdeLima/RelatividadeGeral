import { describe,expect,it } from "vitest";
import { activities } from "../../src/data/activities";
import { createSessionPdf } from "../../src/lib/pdf";
import type { LabSession } from "../../src/types";

describe("relatório PDF",()=>{
  it("gera um PDF A4 não vazio a partir da sessão",()=>{const session={schemaVersion:"1.0",sessionId:"pdf-test",activitySetVersion:"cap4-1.0",student:{name:"Aluno Teste"},startedAt:new Date().toISOString(),finishedAt:new Date().toISOString(),totalDurationMs:60000,browser:{userAgent:"vitest",platform:"node"},activities:activities.map(activity=>({activityId:activity.id,version:"1.0",startedAt:new Date().toISOString(),status:"completed",restarts:0,hintsUsed:0,continuedAfterError:false,interactions:[],questions:[{submittedAt:new Date().toISOString(),value:"teste",correct:true,responseTimeMs:1000}],finalState:{}})),summary:{score:100,correct:12,errors:0,hints:0,restarts:0,completed:12,competencies:[]},locked:true} as LabSession;const blob=createSessionPdf(session);expect(blob.type).toBe("application/pdf");expect(blob.size).toBeGreaterThan(2000)});
});
