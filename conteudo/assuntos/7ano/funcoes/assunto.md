---
titulo: Funções com blocos
resumo: Desenhar três quadrados copiando os mesmos blocos três vezes dá trabalho e abre espaço para erro. Com uma função, você ensina o quadrado uma vez e usa quantas vezes quiser.
icone: 🧩
ordem: 3
origem: aulas de Funções no code.org
revisado: 2026-11-25
---

## O problema: blocos repetidos

No code.org, o artista desenha um quadrado assim:

:::blocos Um quadrado: avança e vira 4 vezes
quando executar
repetir 4 vezes
  avançar 100 pixels
  virar à direita 90 graus
:::

Agora imagine **três quadrados** em lugares diferentes. Sem função, você teria que copiar esses blocos três vezes. Se errar um número, tem que consertar em três lugares.

## O que é uma função

:::destaque Função
um nome para um grupo de blocos
Você **ensina** uma vez e **usa** quantas vezes quiser.
:::

Uma função tem duas partes:

:::cards
### 🟣 Definir
Dar um **nome** e colocar os blocos dentro. É como ensinar uma receita nova.
### 💜 Chamar
Usar o bloco com o nome da função. Cada vez que ele aparece, **todos os blocos de dentro** são executados.
:::

:::blocos A definição: a função “desenhar quadrado”
definir função desenhar quadrado
  repetir 4 vezes
    avançar 100 pixels
    virar à direita 90 graus
:::

:::blocos O programa: chama a função 3 vezes
quando executar
desenhar quadrado()
pular para frente 150 pixels
desenhar quadrado()
pular para frente 150 pixels
desenhar quadrado()
:::

:::destaque
definir 1 vez ➜ chamar várias vezes
Definir sozinho não desenha nada. Só a **chamada** faz a função rodar.
:::

## Como o computador lê

Quando o programa encontra uma **chamada**, ele:

:::fluxo
1 · Para | o programa principal naquele ponto.
2 · Executa | todos os blocos de dentro da função.
3 · Volta | e continua no bloco logo depois da chamada.
:::

Então, no programa acima, o artista desenha um quadrado, pula, desenha outro, pula e desenha o terceiro. São **3 quadrados** com **12 avanços** no total (4 em cada).

## Por que usar funções

:::cards
### ✂️ Menos blocos
O programa fica menor e mais fácil de ler.
### 🛠️ Conserta em um lugar
Mudou o tamanho do quadrado? Muda **só na definição**, e todas as chamadas mudam juntas.
### 🏷️ Nome que explica
`desenhar quadrado` diz o que faz. Ninguém precisa decifrar os blocos.
### 🧱 Dividir o problema
Um desenho grande vira partes pequenas: uma função para a casa, outra para a janela, outra para a porta.
:::

## Função ou repetir?

Os dois evitam copiar blocos, mas não são a mesma coisa:

| | **repetir** | **função** |
|---|---|---|
| O que faz | Repete blocos **seguidos**, um certo número de vezes | Dá **nome** a um grupo de blocos para usar em **qualquer lugar** |
| Quando usar | A mesma ação várias vezes, sem nada no meio | O mesmo grupo de ações em pontos diferentes do programa |
| Exemplo | os 4 lados de um quadrado | 3 quadrados com pulos entre eles |

:::lembrar
Uma função pode ter um **repetir** dentro, e um **repetir** pode ter uma **chamada** de função dentro. Eles se combinam.
:::

:::blocos Função dentro de um repetir: 4 quadrados em volta de um ponto
quando executar
repetir 4 vezes
  desenhar quadrado()
  virar à direita 90 graus
:::

## Dicas para não errar

:::atencao Erros comuns
- **Definir e esquecer de chamar:** a função existe, mas nada acontece.
- **Chamar antes de entender o que faz:** leia a definição para saber onde o artista vai parar.
- **Nome ruim:** `função1` não explica nada. Prefira `desenhar janela`.
:::
