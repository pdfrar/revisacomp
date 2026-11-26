# Como editar o Revisa Comp

Todo o conteúdo fica na pasta `conteudo/`. Você **não precisa mexer** em `scripts/` nem em `public/`.

Quando um arquivo é salvo na branch `main` do GitHub, a Vercel reconstrói o site sozinha em 1 ou 2 minutos.

## Onde fica cada coisa

```
conteudo/
├── series.json                       ← lista de séries (nome e cor)
├── assuntos/
│   └── 6ano/
│       └── eps/                      ← um assunto = uma pasta
│           ├── assunto.md            ← a explicação (texto)
│           ├── atividades.json       ← as atividades interativas
│           └── banco.json            ← as questões do quiz e do simulado
└── provas/
    └── 6ano/
        └── prova-4bim-2026.json      ← uma prova = um arquivo
```

O endereço no site segue o nome das pastas. Por exemplo, `conteudo/assuntos/6ano/eps/` vira `/6ano/eps`.

## Trocar ou corrigir uma questão

Abra o `banco.json` do assunto. Cada questão tem este formato:

```json
{
  "pergunta": "Qual destes é um dispositivo de **saída**?",
  "opcoes": ["Caixa de som", "Teclado", "Microfone", "Mouse"],
  "explicacao": "A caixa de som devolve o resultado em forma de som."
}
```

- **A primeira opção é sempre a certa.** O site embaralha as opções na hora de mostrar.
- Para mostrar código na questão, acrescente `"codigo": "print(7 * 3)"`. Use `\n` para quebrar linha.
- Para pôr negrito, use `**assim**`. Para código no meio do texto, use `` `assim` ``.
- Para mostrar blocos do code.org, acrescente `"blocos": "quando executar\ndesenhar quadrado()"` (mesma escrita do `:::blocos`, ver abaixo).
- Aspas dentro do texto precisam de barra antes: `\"`. Ou use as aspas curvas “assim”, que não precisam.
- Entre uma questão e outra vai uma **vírgula**. Depois da última, não vai.

### Questão aberta

No mesmo `banco.json`, uma questão aberta tem `"tipo": "aberta"`, a resposta esperada em `gabarito` e, se quiser, os pontos que a resposta precisa ter em `criterios`:

```json
{
  "tipo": "aberta",
  "pergunta": "Explique o que é o **DNS**.",
  "gabarito": "É a lista telefônica da internet: traduz o nome do site para o endereço IP.",
  "criterios": ["traduz nome em IP", "exemplo ou comparação"]
}
```

O aluno escreve, vê o gabarito e se corrige (✔ Acertei · ◐ Em parte · ✘ Errei). Os `criterios` vão servir também para a IA corrigir no futuro.

## Criar uma prova nova

1. Copie um arquivo de `conteudo/provas/<série>/` e dê um nome novo, por exemplo `prova-1bim-2027.json`.
2. Mude o título, a data e os assuntos:

```json
{
  "titulo": "Prova do 1º bimestre",
  "data": "2027-04-15",
  "observacao": "Recado opcional que aparece no topo da página da prova.",
  "assuntos": ["6ano/eps", "6ano/pacotes-ip-dns"]
}
```

- `data` vai no formato `"AAAA-MM-DD"`. Se ainda não tiver data, use `null` (sem aspas).
- O simulado segue o formato da prova: **7 fechadas + 3 abertas**, sorteadas revezando entre os assuntos. Para mudar numa prova, acrescente `"fechadas": 8, "abertas": 2`.
- Pode incluir assunto de outra série (ex.: `"7ano/grafos-pontos-e-ligacoes"` na prova do 9º). Ele aparece também na página da série.
- Depois da data, a prova sai do destaque e vai sozinha para "Provas anteriores".

## Editar a explicação (`assunto.md`)

O arquivo começa com um cabeçalho entre `---`:

```
---
titulo: Pacotes, IP e DNS
resumo: Frase curta que aparece no cartão do assunto.
icone: 📦
ordem: 3
bncc: EF06CO07
origem: 6 ano/pacotes_na_internet.html
revisado: 2026-11-24
---
```

- `ordem` define a posição na lista da série.
- `origem` e `revisado` são só para controle e não aparecem para o aluno.
- Para esconder um assunto ainda em construção, acrescente `rascunho: sim`.

Depois do cabeçalho vem o texto em Markdown:

- `## Título` começa uma nova seção, que entra sozinha no índice "Nesta página".
- `### Título` cria um subtítulo.
- `**negrito**`, `*itálico*`, listas com `-` e tabelas com `|` funcionam normalmente.

### Caixas especiais

Abra com `:::nome` e feche com `:::` sozinho na linha:

| Caixa | Para quê |
|---|---|
| `:::lembrar` | Caixa colorida "Para lembrar". Pode ter título: `:::lembrar Regras do IP` |
| `:::atencao Título` | Caixa vermelha tracejada para erros comuns |
| `:::pensar` | Pergunta aberta, sem correção (aulas de debate) |
| `:::extra` | "Treino extra" com links externos |
| `:::cards` | Cartões lado a lado. Cada cartão começa com `### Título` |
| `:::fluxo` | Passos com seta. Uma linha por passo: `Título \| texto` |
| `:::console` | Tela preta mostrando a saída de um programa |
| `:::destaque Rótulo` | **Conceito em letra grande.** 1ª linha = o que tem que ficar na cabeça; as outras = legenda. Use para o mais importante de cada seção |
| `:::guia` | Passos com ícone e seta. Uma linha por passo: `📖 \| Título \| texto curto` |
| `:::blocos Legenda` | Blocos do code.org. Uma linha por bloco; 2 espaços de recuo = dentro do bloco de cima. A cor vem da primeira palavra: “quando” (evento), “repetir” (laço), “se” (lógica), “definir função” (função), terminando em `()` (chamada); o resto é ação |
| `:::grafo Legenda` | Grafo desenhado. `Nome x,y` cria um vértice (`Nome x,y #2` pinta com a cor 2); `A - B` cria uma aresta, `A - B [5 min]` põe rótulo e `A = B` destaca |

Para código Python colorido, use três crases com `python`:

````
```python
nome = input("Qual é o seu nome? ")
print("Olá,", nome)
```
````

## Tipos de atividade (`atividades.json`)

| `tipo` | O que faz |
|---|---|
| `classificar` | Cada item ganha botões de categoria (E/P/S, certo/errado, str/int…) |
| `ordenar` | Toque nas frases na ordem certa. Aceita vários cenários |
| `terminal` | Terminal Python que roda o código de verdade. O aluno pode editar |
| `pacotes` | Correio de pacotes com perda e reenvio |
| `dns` | Simulador de DNS |
| `quiz` | Quiz extra com o mesmo formato do banco |
| `tarefa` | Enunciado + resposta escondida, sem correção automática |
| `colorir` | Grafo para pintar tocando nos vértices; avisa conflitos e o mínimo de cores |
| `cesar` | Máquina da cifra de César, com desafios para decifrar |

No `ordenar`, os cartões são **arrastados** (no celular, pela alça ⠿, ou pelas setas ▲▼). Com `"blocos": true`, os cartões aparecem como blocos do code.org.

O jeito mais fácil de criar uma atividade é copiar uma parecida de outro assunto e trocar os textos.

## Editar pelo celular (GitHub)

1. Abra o repositório no navegador do celular e entre em `conteudo/`.
2. Abra o arquivo e toque no lápis ✏️ (Edit).
3. Faça a mudança e toque em **Commit changes**.
4. Espere 1 ou 2 minutos e recarregue o site.

Se o site não atualizar, provavelmente o arquivo ficou com algum erro (uma vírgula faltando, uma aspa sem fechar). A Vercel mostra a mensagem de erro no painel do projeto, em português e com o nome do arquivo.

## Ver no computador antes de publicar

```
npm install        (só na primeira vez)
npm run dev        → abre em http://localhost:3000
npm run check      → só confere se o conteúdo está sem erros
```

## Correção das abertas por IA (futuro)

O site já tem o ponto de encaixe: basta definir `window.RevisaComp.corretor` como uma função que recebe a questão e o texto do aluno e devolve `{ nota: 1 | 0.5 | 0, comentario }`. A chave da OpenAI **não pode** ficar no navegador: a chamada ao ChatGPT tem que passar por uma função da Vercel (pasta `api/`). Enquanto isso não existir, vale a autocorreção.

## Regras do site

- **Nunca** colocar as questões da prova real, só questões parecidas.
- Links externos só se forem gratuitos, sem login e sem anúncio.
- Casos reais citando empresas ou pessoas: sempre com link para a fonte.
