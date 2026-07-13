import { describe, expect, it } from "vitest";
import { decryptSession, encryptSession, generateProtectedKeyPair, readHeader, unlockPrivateKey } from "../../src/lib/crypto";
import type { LabSession } from "../../src/types";

const session:LabSession={schemaVersion:"1.0",sessionId:"test-session",activitySetVersion:"cap4-1.0",student:{name:"Teste"},startedAt:new Date(0).toISOString(),browser:{userAgent:"vitest",platform:"node"},activities:[],locked:false};

async function keys(){return crypto.subtle.generateKey({name:"RSA-OAEP",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["encrypt","decrypt"])}

describe("formato RGLAB",()=>{
  it("serializa, criptografa e descriptografa uma sessão",async()=>{const pair=await keys(),publicJwk=await crypto.subtle.exportKey("jwk",pair.publicKey);const blob=await encryptSession(session,publicJwk,"test-key");const buffer=await blob.arrayBuffer();expect(readHeader(buffer).header.keyId).toBe("test-key");await expect(decryptSession(buffer,pair.privateKey)).resolves.toMatchObject({sessionId:"test-session",student:{name:"Teste"}})});
  it("detecta alteração no ciphertext",async()=>{const pair=await keys(),publicJwk=await crypto.subtle.exportKey("jwk",pair.publicKey),blob=await encryptSession(session,publicJwk,"test-key"),bytes=new Uint8Array(await blob.arrayBuffer());bytes[bytes.length-1]^=1;await expect(decryptSession(bytes.buffer,pair.privateKey)).rejects.toThrow(/adulterado/)});
  it("rejeita chave privada incompatível",async()=>{const pair=await keys(),other=await keys(),publicJwk=await crypto.subtle.exportKey("jwk",pair.publicKey),blob=await encryptSession(session,publicJwk,"test-key");await expect(decryptSession(await blob.arrayBuffer(),other.privateKey)).rejects.toThrow(/incompatível/)});
  it("protege a chave privada e rejeita senha errada",async()=>{const generated=await generateProtectedKeyPair("senha-forte-de-teste");const buffer=await generated.protectedPrivateKey.arrayBuffer();await expect(unlockPrivateKey(buffer,"senha-forte-de-teste")).resolves.toMatchObject({keyId:generated.keyId});await expect(unlockPrivateKey(buffer,"senha-incorreta")).rejects.toThrow(/Senha incorreta/)});
});
