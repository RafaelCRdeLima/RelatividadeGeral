# Formato `.rglab`

Versão 1, ordem de bytes:

```text
uint32_be headerLength
UTF-8 JSON header
RSA-OAEP encrypted AES key
12-byte IV
AES-GCM ciphertext || 16-byte authentication tag
```

O cabeçalho contém `magic=RGLAB`, versão, versão do esquema, algoritmo, data,
`keyId` e comprimentos. Ele é usado como *additional authenticated data* do
AES-GCM: alterar o cabeçalho faz a autenticação falhar.

O corpo da sessão é serializado em UTF-8 e cifrado com uma chave aleatória
AES-256-GCM. Essa chave é encapsulada com RSA-OAEP/SHA-256. O payload nunca é
armazenado como JSON em texto puro.

O leitor rejeita magic ou versão desconhecida, comprimentos inconsistentes,
chave incompatível, falha da tag de autenticação e esquema interno divergente.

## Chave privada protegida

`.rglabkey` é um contêiner local com magic `RGLABKEY`. A chave RSA privada JWK é
cifrada por AES-256-GCM; a chave de proteção é derivada da senha usando
PBKDF2-HMAC-SHA-256, salt aleatório de 16 bytes e 310.000 iterações.

`keyId` permite manter várias gerações de chave. Arquivos antigos exigem a chave
privada cujo identificador aparece no cabeçalho.
