# Arquitetura

O projeto é uma aplicação React/TypeScript construída com Vite. Não há backend.

```text
src/
├── components/       visualizações, progresso e motor de apresentação
├── data/             definições independentes das 12 atividades
├── lib/              matemática, sessão, PDF, criptografia e download
├── routes/           entrada, resumo e Professor Viewer
├── store.ts          máquina de estado Zustand e persistência
└── types.ts          contratos compartilhados
```

`activities.ts` contém conteúdo, competências, estado inicial, requisito de
interação e questão. `visualizationRegistry`, em `ActivityPage.tsx`, liga o nome
de uma visualização a um componente. Assim, conteúdo e interface não ficam
totalmente acoplados.

O estado segue `welcome → activity → summary`. Cada alteração relevante gera um
`InteractionEvent`. Sliders e arrastos são amostrados em intervalos de 250 ms.
Uma cópia da sessão é salva no `localStorage` após cada transição.

O Professor Viewer é selecionado pelo hash `#/professor`, o que permite servir
os dois modos como uma única aplicação estática no GitHub Pages.

## Decisões

- SVG nativo foi escolhido para diagramas vetoriais acessíveis e escaláveis.
- KaTeX renderiza equações estáticas definidas pela equipe docente.
- jsPDF produz o relatório sem transmitir dados.
- Web Crypto implementa primitivas padronizadas, sem criptografia caseira.
