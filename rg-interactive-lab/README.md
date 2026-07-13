# RG Interactive Lab — Capítulo 4

Aplicação inteiramente local para ensinar e avaliar os conceitos do capítulo
**Tensores no espaço-tempo plano** da apostila de Relatividade Geral.

Ela contém dois modos na mesma aplicação:

- **Aluno:** doze atividades progressivas, telemetria local, retomada de sessão,
  relatório PDF e exportação criptografada `.rglab`;
- **Professor Viewer:** geração de chaves, abertura e validação de arquivos,
  visão individual e da turma, CSV, JSON e relatório PDF.

## Desenvolvimento

Requer Node.js 22 ou posterior.

```bash
npm install
npm run dev
```

Validação completa:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

O build é criado em `dist/` com base pública
`/RelatividadeGeral/dashboards/capitulo-4/`.

## Chaves do professor

1. Abra `#/professor`.
2. Informe uma senha nova com pelo menos 10 caracteres.
3. Clique em **Gerar chaves RSA-3072**.
4. Guarde o arquivo privado `.rglabkey` e a senha separadamente.
5. Copie `keyId` e `publicKey` do JSON público para `src/config.ts`.
6. Refaça o build e distribua somente a aplicação do aluno.

A chave incluída em `src/config.ts` é apenas demonstrativa e não deve ser usada
em avaliação. Nenhuma chave privada real está no repositório.

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Criação de atividades](docs/ACTIVITY_AUTHORING.md)
- [Formato criptográfico](docs/CRYPTO_FORMAT.md)
- [Segurança](docs/SECURITY.md)
- [Desenho pedagógico](docs/PEDAGOGICAL_DESIGN.md)

## Limitações atuais

- a persistência usa `localStorage`, portanto pertence ao navegador e perfil;
- o PDF contém representações resumidas, não capturas raster completas;
- não há autenticação remota nem mecanismo antifraude absoluto;
- a chave pública de produção precisa ser configurada antes do uso avaliativo.
