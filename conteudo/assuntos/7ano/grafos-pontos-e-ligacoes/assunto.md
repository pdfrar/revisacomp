---
titulo: Grafos: pontos e ligações
resumo: Para explicar o caminho até a sua casa, ninguém diz o tamanho das ruas. Basta dizer quais lugares existem e quais estão ligados. Isso é um grafo.
icone: 🕸️
ordem: 1
bncc: EF07CO04
origem: 7 ano/grafos.html
revisado: 2026-11-25
---

## O que é um grafo

:::destaque Grafo
vértices + arestas
**Vértices** são os pontos. **Arestas** são as linhas que ligam dois pontos.
:::

:::cards
### 🔵 Vértice
Um ponto. Representa uma coisa: um lugar, uma pessoa, um computador.
### ➖ Aresta
Uma linha que liga **dois** vértices. Representa uma relação: uma rua, uma amizade, um cabo.
:::

Este é o grafo de um bairro (inventado). Cada aresta é uma rua que liga dois lugares direto:

:::grafo O bairro: 7 vértices e 9 arestas
Escola 60,50
Padaria 60,210
Praça 220,130
Igreja 390,50
Mercado 390,210
Quadra 550,130
Posto de saúde 550,270
Escola - Praça
Escola - Padaria
Padaria - Praça
Praça - Igreja
Praça - Mercado
Igreja - Mercado
Igreja - Quadra
Mercado - Quadra
Quadra - Posto de saúde
:::

:::lembrar
Num grafo, o que importa são as **ligações**. A posição dos pontos e o tamanho das linhas no desenho não precisam ser reais.
:::

## Grafos estão em toda parte

| Situação | Vértices | Arestas |
|---|---|---|
| 📱 Rede social | pessoas | amizades ou “seguir” |
| 🗺️ App de mapas | cruzamentos e lugares | trechos de rua |
| 🌐 Internet | computadores e roteadores | cabos e conexões sem fio |
| 🚌 Linhas de ônibus | paradas | trecho entre duas paradas |
| 🌳 Árvore genealógica | pessoas da família | pais e filhos |

:::destaque
Coisas + ligações = grafo
Sempre que houver objetos ligados entre si, dá para desenhar um grafo.
:::

## Grau de um vértice

:::destaque Grau
número de arestas do vértice
:::

No bairro, a **Praça** tem grau **4** (Escola, Padaria, Igreja e Mercado): é por onde passam mais caminhos. O **Posto de saúde** tem grau **1**.

| Vértice | Escola | Padaria | Praça | Igreja | Mercado | Quadra | Posto |
|---|---|---|---|---|---|---|---|
| **Grau** | 2 | 2 | 4 | 3 | 3 | 3 | 1 |

:::lembrar Truque para conferir
Cada aresta liga **dois** vértices. Então **a soma dos graus é sempre o dobro do número de arestas**. No bairro: 2 + 2 + 4 + 3 + 3 + 3 + 1 = **18**, o dobro de **9** arestas.
:::

Numa rede social, grau alto quer dizer uma pessoa com **muitas conexões**.

## Caminho

Um **caminho** é uma sequência de vértices em que cada um está ligado ao próximo. O **comprimento** é o número de arestas percorridas.

:::fluxo
Escola | início
Praça | 1 aresta
Igreja | 2 arestas
Quadra | 3 arestas
:::

Da Escola até a Quadra, o menor caminho tem **3 arestas**. Passando pelo Mercado também dá 3: pode existir mais de um menor caminho.

### Quando as arestas têm valor

Se cada rua tem um **tempo**, o caminho mais rápido pode ter **mais** arestas. É isso que o app de mapas calcula.

:::grafo Minutos a pé em cada rua
Escola 60,50
Padaria 60,210
Praça 220,130
Igreja 390,50
Quadra 550,130
Posto de saúde 550,270
Escola - Praça [6 min]
Escola = Padaria [2 min]
Padaria = Praça [2 min]
Praça = Igreja [3 min]
Igreja = Quadra [4 min]
Quadra = Posto de saúde [3 min]
:::

Escola → Praça direto: 6 min. Pela Padaria: 2 + 2 = **4 min**. O caminho em azul tem uma aresta a mais e mesmo assim é o mais rápido.

## Conexo e ponte

:::cards
### 🔗 Grafo conexo
Existe caminho entre **quaisquer** dois vértices. Ninguém está isolado.
### 🌉 Ponte
Uma aresta que, se for retirada, **divide** o grafo em partes separadas.
:::

No bairro, se a rua **Quadra–Posto de saúde** for interditada, o posto fica isolado: é a **única ponte**. Já se fechar Praça–Igreja, dá para passar pelo Mercado.

:::destaque Ponte
1 aresta a menos ➜ grafo partido
Por isso redes de energia, água e internet têm ligações de reserva.
:::

## Resumo

| Palavra | O que é |
|---|---|
| **Grafo** | Conjunto de vértices ligados por arestas. |
| **Vértice** | Um ponto: lugar, pessoa, computador. |
| **Aresta** | Uma ligação entre dois vértices. |
| **Grau** | Quantas arestas chegam num vértice. |
| **Caminho** | Sequência de vértices ligados um ao outro. |
| **Comprimento** | Número de arestas do caminho. |
| **Conexo** | Dá para ir de qualquer vértice a qualquer outro. |
| **Ponte** | Aresta que, se sair, separa o grafo. |
