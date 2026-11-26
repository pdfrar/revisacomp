---
titulo: Grafos: colorir sem conflito
resumo: Seis oficinas, alunos inscritos em duas cada. Quantos horários, no mínimo, para ninguém ter duas oficinas ao mesmo tempo? Um grafo pintado responde.
icone: 🎨
ordem: 2
bncc: EF07CO04
origem: 7 ano/grafos_coloracao.html
revisado: 2026-11-25
---

## O problema das oficinas

A Semana Cultural tem seis oficinas. Cada aluno se inscreveu em duas:

| Aluno | Oficinas |
|---|---|
| Luana | Robótica e Xadrez |
| Mateus | Robótica e Dança |
| Nina | Teatro e Dança |
| Otávio | Xadrez e Futsal |
| Rafa | Robótica e Futsal |
| Sofia | Teatro e Desenho |
| Téo | Dança e Desenho |
| Yasmin | Xadrez e Desenho |

Robótica e Dança **não** podem ser no mesmo horário: o Mateus faz as duas. Robótica e Teatro **podem**: ninguém faz as duas. Só com a tabela é difícil achar o menor número de horários. Por isso desenhamos um grafo.

## Da tabela ao grafo

:::cards
### 🔵 Vértices
As **oficinas**.
### ➖ Arestas
Ligam duas oficinas que têm **um aluno em comum**.
:::

:::destaque Aqui, aresta quer dizer
conflito
As duas oficinas **não podem** acontecer no mesmo horário.
:::

:::grafo Cada aresta é um aluno: 6 vértices e 8 arestas
Robótica 80,60
Xadrez 300,60
Futsal 190,190
Dança 80,320
Desenho 300,320
Teatro 190,440
Robótica - Xadrez [Luana]
Robótica - Dança [Mateus]
Teatro - Dança [Nina]
Xadrez - Futsal [Otávio]
Robótica - Futsal [Rafa]
Teatro - Desenho [Sofia]
Dança - Desenho [Téo]
Xadrez - Desenho [Yasmin]
:::

## Colorir um grafo

:::destaque Regra da coloração
vértices ligados ➜ cores diferentes
O desafio é usar o **menor número de cores**.
:::

Aqui, **cada cor é um horário**. Uma solução com 3 cores:

:::grafo 1º horário: Robótica e Desenho · 2º: Xadrez e Dança · 3º: Futsal e Teatro
Robótica 80,60 #1
Xadrez 300,60 #2
Futsal 190,190 #3
Dança 80,320 #2
Desenho 300,320 #1
Teatro 190,440 #3
Robótica - Xadrez
Robótica - Dança
Teatro - Dança
Xadrez - Futsal
Robótica - Futsal
Teatro - Desenho
Dança - Desenho
Xadrez - Desenho
:::

Dá para usar só 2? **Não**: Robótica, Xadrez e Futsal estão todas ligadas entre si (um **triângulo**). Cada uma precisa de uma cor diferente.

## Quantas cores, no mínimo?

:::cards
### 🔺 Triângulo
**3 cores.** Os três estão ligados entre si.
### 🟦 Quadrado
**2 cores.** Alterne nos cantos.
### ⬟ Pentágono
**3 cores.** Ao alternar duas cores numa volta ímpar, o primeiro e o último ficam iguais.
### ✳️ 4 todos ligados
**4 cores.** Cada um é vizinho de todos.
:::

:::destaque
triângulo no grafo ➜ pelo menos 3 cores
Vários vértices todos ligados entre si precisam, cada um, de uma cor diferente.
:::

## Uma receita para o computador colorir

Este método se chama **algoritmo guloso**: a cada passo faz a melhor escolha do momento, sem voltar atrás.

:::fluxo
1 · Ordene | os vértices do **maior grau** para o menor.
2 · Pinte | o próximo vértice com a **primeira cor** que nenhum vizinho tem.
3 · Repita | até acabar a lista.
:::

Ele é rápido, mas **nem sempre** acha o menor número de cores. Achar sempre o mínimo é difícil até para computadores quando o grafo é muito grande.

## Mapas e o teorema das quatro cores

Num mapa, cada **estado** é um vértice, e dois estados com **fronteira** são ligados. Estados vizinhos precisam de cores diferentes. O mapa do Nordeste precisa de só 3 cores.

:::destaque Teorema das quatro cores
qualquer mapa ➜ no máximo 4 cores
Perguntado em 1852 e provado em 1976, com a ajuda de um computador para verificar milhares de casos.
:::

## Onde a coloração aparece

| Situação | Vértices | Aresta quer dizer | Cor quer dizer |
|---|---|---|---|
| 📝 Provas da escola | disciplinas | um aluno faz as duas | dia da prova |
| 📶 Redes Wi-Fi | roteadores | estão perto um do outro | canal |
| 🗓️ Horário de aulas | aulas | mesmo professor | horário |
| 🔢 Sudoku | casas | mesma linha, coluna ou bloco | número de 1 a 9 |

:::lembrar
Na coloração, **arestas = conflito** e **cores = grupos sem conflito** (horários, dias, canais). Menos cores = menos tempo e recursos.
:::
