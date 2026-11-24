# Revisa Comp

Biblioteca de revisão de Computação para prova: explicações curtas, atividades interativas e simulados sorteados, organizados por série.

- **Assunto:** explicação, atividades e banco de questões. Fica no site para sempre.
- **Prova:** lista de assuntos com data. O simulado sorteia questões dos bancos desses assuntos.
- **Sem cadastro:** o progresso fica salvo no aparelho do aluno. O simulado gera um cartão de resultado para print.

Para editar o conteúdo, veja **[COMO_EDITAR.md](COMO_EDITAR.md)**.

## Rodar localmente

```
npm install
npm run dev      # http://localhost:3000
npm run check    # valida o conteúdo sem gerar o site
```

## Estrutura

```
conteudo/          conteúdo em Markdown e JSON (é aqui que se edita)
public/assets/     CSS e JavaScript dos componentes
scripts/build.js   gera o site estático em dist/
scripts/dev.js     servidor local com URLs limpas
```

A publicação é feita na Vercel (build `npm run build`, saída `dist/`), configurada no `vercel.json`.
