export const LAB_VERSION = "cap4-1.0";
export const SCHEMA_VERSION = "1.0";
export const STORAGE_KEY = "rg-interactive-lab:cap4:session";

// Chave pública exclusivamente demonstrativa. A chave privada correspondente
// não faz parte do aplicativo. Consulte docs/SECURITY.md antes de uso avaliativo.
export const PROFESSOR_KEY_ID = "demo-2026-not-for-assessment";
export const PROFESSOR_PUBLIC_KEY: JsonWebKey = {
  key_ops: ["encrypt"], ext: true, alg: "RSA-OAEP-256", kty: "RSA", e: "AQAB",
  n: "5ikO-5r1Vq0LHUpAK2nt07F_0JzznyC4wnXySo0RcpzIuWAvKnVRC--xzrTb5yqa_n9leenRm2BC5HXRhBKT8Ow9cmzOdXA89RiAdgz4eeKZkU_44DYbhosbzmQKilNth01mUhxsQuJ8WmEXOHRbcgTTyNGOtXpVbLq8umRLchXiCDRqc-r0uru2SjPj62rbiDuKkWVTZRg6b8xNtm8sqi1YQxgvYN5LRvayBz-2Vuvhp1GQMw6X82G6BRr3DW2U78nG2kHTaE_FRHWkqh3Gg7L4TkPdnACW5ev5f_tFYE2M4MoStP_0rNJiOGO7FEKYv6jvd4bulk-pNHXTCoZfUQ",
};
