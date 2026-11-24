# Handoff: Revisa Comp

Última atualização: 24/11/2026

## Onde paramos

- **Etapa 1 pronta** (branch `etapa-1-esqueleto-6ano`, PR #1 aberto): motor do site, páginas, componentes e 6º ano migrado (EPS, Python variáveis/input, Pacotes/IP/DNS e a prova do 4º bimestre, ainda sem data).
- **Vercel criada:** projeto `revisacomp` no escopo pessoal `pedro-f5e9`, ligado ao GitHub `pdfrar/revisacomp`, com a branch de produção `main`.
  - Endereço oficial: https://revisacomp.vercel.app
  - A produção atual veio de um deploy feito direto da pasta local (`vercel deploy`), não da `main`.
  - O conector MCP da Vercel dá erro 403 no escopo `pedro-f5e9`. Use a CLI: `npx vercel ... --scope pedro-f5e9`.
- **Agentes do projeto** em `.claude/agents/`, ainda não testados numa aula real:
  - `migrador`: aula de `../HTMLs_Didaticos` → `conteudo/assuntos/<serie>/<slug>/`
  - `revisor-pedagogico`: revisa conteúdo e questões, só relata
  - `gerador-questoes`: amplia o `banco.json` sem repetir questões

## Próximos passos

1. **Mesclar o PR #1** na `main`. Assim a Vercel passa a publicar pelo GitHub, e o deploy local deixa de ser a produção.
2. **Proteção da Vercel:** a URL do deploy (`revisacomp-2semmvv3e-...`) e o endereço reserva redirecionaram para o login da Vercel (HTTP 302). O `revisacomp.vercel.app` não foi testado. Se ele também pedir login, desligue em Settings → Deployment Protection para os alunos abrirem sem conta.
3. **Escolher a próxima série** para a etapa 2 (ainda não decidida). Fluxo sugerido: `migrador` → `revisor-pedagogico` → `gerador-questoes`, se o banco ficar pequeno.
   - Aulas disponíveis em `../HTMLs_Didaticos`: 4º (1), 5º (3), 7º (3), 8º (4), 9º (5), 1ª série (1), 3ª série (9).
4. Pôr a data na prova do 6º ano (`conteudo/provas/6ano/prova-4bim-2026.json`) quando ela for marcada.

## Comandos

```
npm install
npm run dev      # http://localhost:3000
npm run check    # valida o conteúdo
npx vercel deploy --scope pedro-f5e9   # deploy manual de prévia
```
