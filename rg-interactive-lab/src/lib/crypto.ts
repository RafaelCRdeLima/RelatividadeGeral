import { PROFESSOR_KEY_ID, PROFESSOR_PUBLIC_KEY } from "../config";
import type { EncryptedLabFileHeader, LabSession, ProtectedPrivateKeyFile } from "../types";

const encoder=new TextEncoder(), decoder=new TextDecoder();
const toBase64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const fromBase64=(value:string)=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));
const concat=(...parts:Uint8Array[])=>{const output=new Uint8Array(parts.reduce((total,part)=>total+part.length,0));let offset=0;parts.forEach(part=>{output.set(part,offset);offset+=part.length});return output};

export async function encryptSession(session: LabSession, publicJwk: JsonWebKey=PROFESSOR_PUBLIC_KEY, keyId=PROFESSOR_KEY_ID): Promise<Blob> {
  const publicKey=await crypto.subtle.importKey("jwk",publicJwk,{name:"RSA-OAEP",hash:"SHA-256"},false,["encrypt"]);
  const aesKey=await crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt"]); const rawKey=new Uint8Array(await crypto.subtle.exportKey("raw",aesKey));
  const encryptedKey=new Uint8Array(await crypto.subtle.encrypt({name:"RSA-OAEP"},publicKey,rawKey)); const iv=crypto.getRandomValues(new Uint8Array(12));
  const plaintext=encoder.encode(JSON.stringify(session));
  const header:EncryptedLabFileHeader={magic:"RGLAB",fileFormatVersion:1,schemaVersion:session.schemaVersion,algorithm:"RSA-OAEP-256+A256GCM",createdAt:new Date().toISOString(),keyId,ivLength:iv.length,encryptedKeyLength:encryptedKey.length,ciphertextLength:plaintext.length+16};
  const headerBytes=encoder.encode(JSON.stringify(header)); const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:headerBytes},aesKey,plaintext));
  const length=new Uint8Array(4); new DataView(length.buffer).setUint32(0,headerBytes.length,false);
  rawKey.fill(0); return new Blob([concat(length,headerBytes,encryptedKey,iv,ciphertext)],{type:"application/octet-stream"});
}

export function readHeader(buffer:ArrayBuffer):{header:EncryptedLabFileHeader;headerBytes:Uint8Array;encryptedKey:Uint8Array;iv:Uint8Array;ciphertext:Uint8Array}{
  if(buffer.byteLength<8)throw new Error("Arquivo muito pequeno ou corrompido."); const bytes=new Uint8Array(buffer); const headerLength=new DataView(buffer).getUint32(0,false);
  if(headerLength<30||headerLength>8192||4+headerLength>bytes.length)throw new Error("Cabeçalho inválido."); const headerBytes=bytes.slice(4,4+headerLength);
  let header:EncryptedLabFileHeader; try{header=JSON.parse(decoder.decode(headerBytes)) as EncryptedLabFileHeader}catch{throw new Error("Cabeçalho ilegível.")}
  if(header.magic!=="RGLAB"||header.fileFormatVersion!==1)throw new Error("Versão de arquivo desconhecida."); if(header.algorithm!=="RSA-OAEP-256+A256GCM")throw new Error("Algoritmo não suportado.");
  const expected=4+headerLength+header.encryptedKeyLength+header.ivLength+header.ciphertextLength; if(expected!==bytes.length)throw new Error("Tamanho inconsistente: arquivo corrompido ou alterado.");
  let offset=4+headerLength; const encryptedKey=bytes.slice(offset,offset+header.encryptedKeyLength);offset+=header.encryptedKeyLength;const iv=bytes.slice(offset,offset+header.ivLength);offset+=header.ivLength;const ciphertext=bytes.slice(offset);
  return{header,headerBytes,encryptedKey,iv,ciphertext};
}

export async function decryptSession(buffer:ArrayBuffer,privateKey:CryptoKey):Promise<LabSession>{
  const parsed=readHeader(buffer); try{const rawKey=await crypto.subtle.decrypt({name:"RSA-OAEP"},privateKey,parsed.encryptedKey as BufferSource);const aesKey=await crypto.subtle.importKey("raw",rawKey,{name:"AES-GCM"},false,["decrypt"]);const plaintext=await crypto.subtle.decrypt({name:"AES-GCM",iv:parsed.iv as BufferSource,additionalData:parsed.headerBytes as BufferSource},aesKey,parsed.ciphertext as BufferSource);const session=JSON.parse(decoder.decode(plaintext)) as LabSession;if(session.schemaVersion!==parsed.header.schemaVersion)throw new Error("Versão interna inconsistente.");return session}catch(error){if(error instanceof Error&&error.message.includes("Versão interna"))throw error;throw new Error("Não foi possível descriptografar: senha, chave incompatível ou arquivo adulterado.",{cause:error})}}

async function passwordKey(password:string,salt:Uint8Array,iterations:number,usage:KeyUsage[]):Promise<CryptoKey>{const material=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt as BufferSource,iterations,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,usage)}

export async function generateProtectedKeyPair(password:string):Promise<{publicKey:JsonWebKey;protectedPrivateKey:Blob;keyId:string}>{
  if(password.length<10)throw new Error("Use uma senha com pelo menos 10 caracteres."); const pair=await crypto.subtle.generateKey({name:"RSA-OAEP",modulusLength:3072,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["encrypt","decrypt"]);
  const publicKey=await crypto.subtle.exportKey("jwk",pair.publicKey),privateKey=await crypto.subtle.exportKey("jwk",pair.privateKey); const digest=new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(JSON.stringify(publicKey))));const keyId=`rg-${toBase64(digest.slice(0,9)).replace(/[+/=]/g,"_")}`;
  const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),iterations=310000,key=await passwordKey(password,salt,iterations,["encrypt"]),ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},key,encoder.encode(JSON.stringify(privateKey))));
  const file:ProtectedPrivateKeyFile={magic:"RGLABKEY",version:1,keyId,salt:toBase64(salt),iv:toBase64(iv),iterations,ciphertext:toBase64(ciphertext)};
  return{publicKey,protectedPrivateKey:new Blob([JSON.stringify(file)],{type:"application/octet-stream"}),keyId};
}

export async function unlockPrivateKey(buffer:ArrayBuffer,password:string):Promise<{key:CryptoKey;keyId:string}>{
  let file:ProtectedPrivateKeyFile;try{file=JSON.parse(decoder.decode(buffer)) as ProtectedPrivateKeyFile}catch{throw new Error("Arquivo de chave ilegível.")}if(file.magic!=="RGLABKEY"||file.version!==1)throw new Error("Formato de chave desconhecido.");
  try{const salt=fromBase64(file.salt),iv=fromBase64(file.iv),ciphertext=fromBase64(file.ciphertext),key=await passwordKey(password,salt,file.iterations,["decrypt"]),plaintext=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,ciphertext),jwk=JSON.parse(decoder.decode(plaintext)) as JsonWebKey;const privateKey=await crypto.subtle.importKey("jwk",jwk,{name:"RSA-OAEP",hash:"SHA-256"},false,["decrypt"]);return{key:privateKey,keyId:file.keyId}}catch{throw new Error("Senha incorreta ou arquivo de chave danificado.")}
}
