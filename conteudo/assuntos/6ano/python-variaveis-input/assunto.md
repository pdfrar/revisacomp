---
titulo: Python: variáveis, print e input
resumo: O ciclo EPS escrito em código. O input() é a entrada, as variáveis e as contas são o processamento e o print() é a saída.
icone: 🐍
ordem: 2
bncc: EF06CO05
origem: 6 ano/variaveis_python.html, 6 ano/input_python.html
revisado: 2026-11-24
---

## Variáveis: caixas de memória

Quando você digita o nome do seu personagem, o computador precisa guardar esse dado em algum lugar enquanto trabalha. Ele guarda numa **caixa de memória** com um nome: a **variável**.

```python
heroi = "Shadow"   # a caixa heroi guarda o texto "Shadow"
nivel = 1          # a caixa nivel guarda o número 1
ouro = 500         # a caixa ouro guarda 500
```

:::lembrar
Em programação, o `=` **não** é o igual da matemática. Ele se chama **atribuição** e se lê “recebe”: pega o valor da direita e guarda na caixa da esquerda. `nivel = 1` → “nivel recebe 1”.
:::

### Como dar nome às variáveis

- **Sem espaço:** use o sublinhado. `proximo_ano`, e não `proximo ano`.
- **Sem acento:** escreva `preco` em vez de `preço`, como combinamos em aula.
- **Não comece com número** e escolha nomes que digam o que a caixa guarda: `vidas` é melhor que `x`.

## Os 4 tipos de dados

| Tipo | Guarda | Exemplos | Regra de ouro |
|---|---|---|---|
| **str** (texto) | Nomes, mensagens, senhas | `"Lucas"` · `'Espada Laser'` | Sempre **entre aspas** (duplas ou simples). |
| **int** (inteiro) | Vidas, moedas, ano | `3` · `2500` · `-5` | **Sem aspas.** Com aspas, `"3"` vira texto e não dá para fazer conta. |
| **float** (decimal) | Preço, altura | `19.90` · `1.75` | Use **ponto**, nunca vírgula. |
| **bool** (booleano) | Só dois valores, como um interruptor | `True` · `False` | **Primeira letra maiúscula.** `true` dá erro. |

:::atencao Cuidado com a vírgula!
No Brasil escrevemos R$ 19,90, mas o Python segue o padrão internacional. Em `preco = 19,90` ele não entende “dezenove e noventa”: entende **dois números separados**, 19 e 90. O certo é `preco = 19.90`. Teste isso no terminal lá embaixo!
:::

## Mostrando na tela com print()

O `print()` é a **saída**: mostra na tela o que estiver dentro dos parênteses. Para juntar um texto fixo com uma variável, há duas formas:

```python
nome = "Ana"
print("Bem-vindo,", nome)        # vírgula
print("Bem-vindo," + nome)       # sinal de mais
print("Bem-vindo, " + nome + "!")
```

:::console
Bem-vindo, Ana
Bem-vindo,Ana
Bem-vindo, Ana!
:::

:::cards
### Vírgula `,`
O Python coloca **um espaço sozinho** entre as partes. Funciona com texto e número misturados.
### Sinal de mais `+`
**Cola** os textos exatamente como estão (isso se chama **concatenação**). O espaço tem que estar dentro das aspas. Só junta texto com texto.
:::

## Recebendo dados com input()

Sem entrada, o programa mostra sempre a mesma coisa. O `input()` faz o programa **parar e esperar** o usuário digitar. Quando ele aperta Enter, a resposta é guardada na variável.

```python
nome = input("Qual é o seu nome? ")
print("Olá,", nome)
```

O texto entre aspas é a pergunta que aparece na tela. Deixe um espaço no final dela para a resposta não ficar grudada. O Python lê o código **de cima para baixo**: só vai para a linha 2 depois que o usuário aperta Enter.

:::atencao A regra mais importante do input()
Ele **sempre devolve texto (str)**, mesmo quando a pessoa digita um número. Se o usuário digitar 10 e depois 5, `a + b` dá **105**, porque o Python colou os dois textos.
:::

### A solução: converter com int()

O `int()` transforma um texto com algarismos em um número inteiro de verdade. Colocamos o `input()` dentro do `int()`:

```python
idade = int(input("Quantos anos você tem? "))
proximo_ano = idade + 1
print("No ano que vem, você terá", proximo_ano, "anos.")
```

Repare nos **dois parênteses no final**: um fecha o `input` e o outro fecha o `int`. E veja o ciclo EPS completo: a idade digitada é a **entrada**, a conta `idade + 1` é o **processamento** e o `print` é a **saída**.

## Fazendo contas

:::cards
### `+` adição
`7 + 3` → 10
### `-` subtração
`7 - 3` → 4
### `*` multiplicação
`7 * 3` → 21
### `/` divisão
`6 / 3` → 2.0
:::

No Python, a multiplicação é o asterisco `*` (não o “x”) e a divisão é a barra `/`. A divisão sempre dá um resultado **float**, por isso `6 / 3` mostra `2.0`.

```python
preco = int(input("Preço de uma poção: "))
quantidade = int(input("Quantas poções? "))
total = preco * quantidade
print("Total a pagar:", total, "moedas")
```

## Erros que o Python mostra

Mensagem de erro não é bronca: é uma pista de onde está o problema.

| Código | Erro | O que aconteceu |
|---|---|---|
| `idade = input("Idade? ")` e depois `print(idade + 1)` | **TypeError** | Tentou somar texto com número. Faltou o `int()`. |
| `int(input(...))` e o usuário digita `doze` | **ValueError** | O `int()` só converte texto formado por algarismos. |
| `jogador = PixelHero` ou `escudo = true` | **NameError** | Sem aspas (ou com letra minúscula), o Python acha que é o nome de uma variável que não existe. |
| `print("Olá"` | **SyntaxError** | Erro de escrita: faltou fechar o parêntese. |
