# Segurança

## Garantias

- AES-256-GCM protege confidencialidade e integridade dos metadados;
- RSA-OAEP/SHA-256 encapsula uma chave AES aleatória por arquivo;
- aleatoriedade vem de `crypto.getRandomValues` e `subtle.generateKey`;
- a aplicação do aluno contém somente a chave pública;
- senha e chave privada não são registradas nem transmitidas;
- o Viewer valida tipo, extensão e limite de 10 MB;
- conteúdo do aluno é exibido como texto React, sem injeção de HTML.

## Operação segura

Gere as chaves no Professor Viewer em um computador confiável. Faça duas cópias
offline da `.rglabkey`, guarde a senha separadamente e teste a restauração antes
da atividade. Perder a chave ou a senha torna os arquivos irrecuperáveis.

Ao trocar a chave, mantenha as antigas identificadas por `keyId` para abrir
entregas anteriores. Nunca publique a chave privada ou sua senha no repositório.
A chave pública demonstrativa de `src/config.ts` deve ser substituída.

## Limitação do modelo local

A criptografia prova que o arquivo não foi alterado depois de cifrado e impede
que terceiros sem a chave leiam seu conteúdo. Uma aplicação totalmente local,
porém, não consegue garantir que um aluno tecnicamente avançado não modificou o
código antes de gerar a sessão. Para avaliações de alto impacto, seria preciso
um serviço autenticado, assinatura de eventos e política institucional de
identidade — recursos deliberadamente fora desta primeira versão.
