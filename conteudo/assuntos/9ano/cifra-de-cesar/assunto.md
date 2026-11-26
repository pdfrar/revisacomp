---
titulo: Cifra de César
resumo: Há mais de 2 mil anos, Júlio César escondia suas cartas trocando cada letra pela que estava 3 posições à frente. Dá para cifrar, decifrar e até quebrar essa cifra à mão.
icone: 🏛️
ordem: 2
bncc: EF09CO05
origem: 9 ano/criptografia.html
revisado: 2026-11-25
---

## A regra

:::destaque Cifra de César
cada letra anda **chave** posições no alfabeto
Com a chave 3: A ➜ D, B ➜ E, C ➜ F…
:::

| Claro | A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Cifrado (chave 3)** | D | E | F | G | H | I | J | K | L | M | N | O | P |

| Claro | N | O | P | Q | R | S | T | U | V | W | X | Y | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Cifrado (chave 3)** | Q | R | S | T | U | V | W | X | Y | Z | A | B | C |

:::atencao Depois do Z, volta para o A
Com a chave 3: **X ➜ A**, **Y ➜ B**, **Z ➜ C**. O alfabeto é como um círculo.
:::

Acentos e Ç ficam de fora: escreva sem acento. O nome vem de **Júlio César**, que, segundo o historiador Suetônio, usava a chave 3 nas cartas.

## Cifrar e decifrar

:::cards
### 🔒 Cifrar
Cada letra **anda para a frente** o número da chave.
`SOL` com chave 3 ➜ `VRO`
### 🔓 Decifrar
Cada letra **volta** o mesmo número de posições.
`VRO` com chave 3 ➜ `SOL`
:::

:::destaque
decifrar = mesma chave, sentido contrário
:::

### Exemplo completo (chave 3)

:::fluxo
Texto claro | NOS VEMOS NA FEIRA
Cada letra +3 | N➜Q, O➜R, S➜V…
Texto cifrado | QRV YHPRV QD IHLUD
:::

## E se ninguém contar a chave?

### Força bruta

A cifra de César tem só **25 chaves** possíveis (a chave 26 volta ao começo). Basta **testar todas** até o texto fazer sentido.

:::destaque Força bruta
25 chaves ➜ teste todas
Uma pessoa leva minutos. Um computador, menos de um milésimo de segundo.
:::

### Análise de frequência

Em textos longos, cada língua tem letras que aparecem mais. Em português:

| Letra | A | E | O | S | R | I |
|---|---|---|---|---|---|---|
| **Frequência** | 14,6% | 12,6% | 10,7% | 7,8% | 6,5% | 6,2% |

Se a letra mais comum no texto cifrado é **H**, um bom palpite é que H era **A**. De A até H são **7** posições: a chave provavelmente é **7**. Esse método foi descrito no século IX pelo estudioso árabe **Al-Kindi**.

:::lembrar
Por isso a cifra de César **não protege** nada hoje: tem poucas chaves e não esconde a frequência das letras.
:::
