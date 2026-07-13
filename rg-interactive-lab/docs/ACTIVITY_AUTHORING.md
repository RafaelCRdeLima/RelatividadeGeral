# Criação de atividades

1. Adicione uma `ActivityDefinition` em `src/data/activities.ts`.
2. Escolha competências curtas e reutilizáveis.
3. Escreva uma introdução de 80–150 palavras e uma expansão formal.
4. Defina `initialState`, `minimumInteractions` e a questão.
5. Reutilize uma visualização ou crie um componente que aceite
   `VisualizationProps`.
6. Registre o componente em `visualizationRegistry`.
7. Acrescente testes matemáticos e um percurso E2E.

Uma visualização nunca deve escrever diretamente na sessão. Ela chama
`onChange(nome, valor, tipo)`, e o motor registra a ação e o estado final.

Questões numéricas aceitam ponto ou vírgula e usam tolerância absoluta ou
relativa. Uma atividade deve exigir manipulação suficiente antes de liberar a
pergunta. Feedback de erro deve orientar sem revelar imediatamente a solução.

Para novos tópicos — Christoffel, transporte paralelo, geodésicas ou Riemann —
crie novos tipos de visualização sem alterar o formato da sessão.
