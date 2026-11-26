---
titulo: Como uma IA aprende
resumo: Ninguém escreve as regras para a IA reconhecer um cachorro. Ela aprende com exemplos, como fizemos no Teachable Machine. E é assim também que o feed descobre o que te prende.
icone: 🤖
ordem: 2
origem: aula com o Teachable Machine; 3 série/como_a_ia_aprende.html
revisado: 2026-11-25
---

## Duas formas de o computador resolver um problema

Que regras ensinariam um computador a dizer se uma foto é de um cachorro? “Tem 4 patas” deixa o gato passar. “Tem orelha em pé” exclui o salsicha. Escrever regras para tudo não funciona.

:::cards
### 📜 Programa comum
O programador escreve as **regras**, uma a uma.
**regras + dados → resposta**
Ex.: “se a média for 6 ou mais, aprovado”.
### 🧠 Aprendizado de máquina
O programador dá **muitos exemplos com a resposta certa**, e o computador descobre as regras sozinho.
**exemplos + respostas → regras**
Ex.: milhares de fotos marcadas “cachorro” e “não é cachorro”.
:::

:::destaque Aprendizado de máquina
exemplos ➜ a IA descobre as regras
Ninguém escreve a regra: ela é tirada dos exemplos.
:::

O desbloqueio pelo rosto, os filtros de foto e os chatbots foram feitos dessa segunda forma.

## Treinar um modelo: o que fizemos no Teachable Machine

:::guia
🏷️ | Classes | crie os grupos (ex.: “joinha” e “mão aberta”)
📸 | Exemplos | grave muitas fotos de cada classe
⚙️ | Treinar | a máquina procura o que diferencia as classes
🧪 | Testar | mostre algo novo e veja o palpite
:::

O resultado do treino se chama **modelo**: é o “cérebro” que dá um palpite para coisas que ele nunca viu.

:::destaque
o modelo dá um palpite, com uma porcentagem de certeza
Ele não “sabe”: ele compara com os exemplos que viu.
:::

### O que deixa o modelo bom ou ruim

:::cards
### 👍 Ajuda
**Muitos** exemplos, **variados** (luz, ângulo, fundo e pessoas diferentes) e em **quantidade parecida** em cada classe.
### 👎 Atrapalha
**Poucos** exemplos, todos **iguais**, ou um **detalhe** que aparece só numa classe (o mesmo fundo, a mesma camiseta).
:::

## O caso do lobo e do husky

Pesquisadores treinaram um modelo com fotos de **lobos quase sempre na neve** e de **huskies na grama**. Depois, ele chamou um husky na neve de “lobo”.

Ao investigar, descobriram que o modelo olhava principalmente para a **neve**, e quase nada para o animal. ([Ribeiro, Singh e Guestrin, 2016](https://arxiv.org/abs/1602.04938))

:::destaque
a IA só conhece o que os exemplos mostraram
Exemplos ruins ➜ a IA aprende o padrão errado.
:::

:::lembrar
No Teachable Machine é igual: se você gravou a classe “joinha” sempre de camiseta azul, o modelo pode aprender “camiseta azul”, e não “joinha”.
:::

## O algoritmo das redes sociais

O feed também é um modelo que aprende com exemplos. Os exemplos são **você**: tudo o que você faz no app vira dado.

:::cards
### 👀 O que ele observa
Quanto tempo você **para** num vídeo, o que **curte**, **comenta**, **compartilha**, o que **pula** rápido e a que horas usa.
### 🎯 O que ele faz
Prevê o que vai te **prender por mais tempo** e mostra mais disso.
:::

:::fluxo
Você assiste | e o app registra
O modelo aprende | do que você gosta
Mostra mais | do mesmo assunto
Você assiste mais | e o ciclo recomeça
:::

:::destaque Bolha
o feed mostra mais do que você já vê
Opiniões e assuntos diferentes aparecem cada vez menos.
:::

Para sair da bolha: procure outros assuntos de propósito, use “não tenho interesse” e siga fontes diferentes.

## Resumo

| Palavra | O que é |
|---|---|
| **Inteligência artificial** | Sistemas que fazem tarefas que pareciam exigir inteligência humana, como reconhecer imagens. |
| **Aprendizado de máquina** | A IA aprende as regras a partir de exemplos com respostas. |
| **Classe** | Um grupo que o modelo aprende a reconhecer. |
| **Treinar** | Mostrar os exemplos para a máquina encontrar o padrão. |
| **Modelo** | O resultado do treino, que dá palpites sobre coisas novas. |
| **Algoritmo de recomendação** | O modelo do feed, que escolhe o que te mostrar. |
