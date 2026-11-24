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
- Aspas dentro do texto precisam de barra antes: `\"`. Ou use as aspas curvas “assim”, que não precisam.
- Entre uma questão e outra vai uma **vírgula**. Depois da última, não vai.

## Criar uma prova nova

1. Copie um arquivo de `conteudo/provas/<série>/` e dê um nome novo, por exemplo `prova-1bim-2027.json`.
2. Mude o título, a data e os assuntos:

```json
{
  "titulo": "Prova do 1º bimestre",
  "data": "2027-04-15",
  "observacao": "Recado opcional que aparece no topo da página da prova.",
  "assuntos": [
    { "id": "6ano/eps", "questoes": 7 },
    { "id": "6ano/pacotes-ip-dns", "questoes": 6 }
  ]
}
```

- `data` vai no formato `"AAAA-MM-DD"`. Se ainda não tiver data, use `null` (sem aspas).
- `questoes` diz quantas questões o simulado sorteia daquele assunto.
- Pode incluir assunto de outra série (ex.: `"7ano/grafos"` numa prova do 9º).
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

## Regras do site

- **Nunca** colocar as questões da prova real, só questões parecidas.
- Links externos só se forem gratuitos, sem login e sem anúncio.
- Casos reais citando empresas ou pessoas: sempre com link para a fonte.
