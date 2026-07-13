import { describe,expect,it } from "vitest";
import { activities } from "../../src/data/activities";
import { summarize } from "../../src/lib/session";
import type { LabSession } from "../../src/types";

describe("sessão",()=>{
  it("mantém 12 definições extensíveis",()=>{expect(activities).toHaveLength(12);expect(new Set(activities.map(item=>item.visualizationType)).size).toBeGreaterThan(5)});
  it("resume e resume pontuação por competência",()=>{const session={schemaVersion:"1.0",sessionId:"x",activitySetVersion:"cap4-1.0",student:{name:"Aluno"},startedAt:new Date().toISOString(),browser:{userAgent:"",platform:""},activities:activities.map((activity,index)=>({activityId:activity.id,version:"1.0",startedAt:new Date().toISOString(),status:index<6?"completed":"not_started",restarts:0,hintsUsed:0,continuedAfterError:false,interactions:[],questions:[],finalState:{}})),locked:false} as LabSession;const summary=summarize(session);expect(summary.score).toBe(50);expect(summary.correct).toBe(6);expect(summary.competencies.length).toBeGreaterThan(5)});
});
