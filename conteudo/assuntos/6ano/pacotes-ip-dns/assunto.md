---
titulo: Pacotes, IP e DNS
resumo: Uma foto enviada de Patos para São Paulo não viaja inteira. Ela é dividida em pedacinhos que atravessam a internet e são montados de novo no destino.
icone: 📦
ordem: 3
bncc: EF06CO07
origem: 6 ano/pacotes_na_internet.html, 6 ano/endereco_ip_dns.html
revisado: 2026-11-24
---

## O que é um pacote

Na internet, toda informação (mensagem, foto, vídeo, áudio) é dividida em pequenos pedaços chamados **pacotes**. Cada pacote tem duas partes:

:::cards
### ✉️ Cabeçalho
Funciona como o envelope de uma carta: **origem** (de onde saiu), **destino** (para onde vai) e **número** (qual é a posição dele, por exemplo “2 de 6”).
### 🧩 Conteúdo
O **pedaço da mensagem** que aquele pacote está levando.
:::

:::lembrar
O **número** do pacote é o que permite montar a mensagem na ordem certa, mesmo que os pacotes cheguem embaralhados.
:::

## A viagem dos pacotes

1. A mensagem é **dividida** em pacotes numerados.
2. Os pacotes passam por vários **roteadores**, equipamentos que leem o destino e decidem por qual caminho cada pacote segue. Pacotes da mesma mensagem podem ir por **caminhos diferentes**.
3. Por isso, eles podem **chegar fora de ordem**. O destino organiza pelos números.
4. Se um pacote **se perde**, o destino percebe qual número falta e pede o **reenvio só daquele pacote**.

### Por que dividir em pacotes?

:::cards
### 🔁 Perdeu? Reenvia só um
Não é preciso mandar a mensagem inteira de novo. Como numa mudança: se uma caixa some, não se refaz a mudança toda.
### 🛣️ Desvia do problema
Se um caminho está congestionado ou com defeito, os pacotes seguem por outro.
### 🚗 Todo mundo junto
Muitas pessoas usam os mesmos cabos ao mesmo tempo: os pacotes se revezam, como carros numa estrada.
:::

Para tudo isso funcionar, todos os aparelhos seguem as mesmas regras combinadas, chamadas **protocolo**. Os principais protocolos da internet se chamam **TCP** e **IP**. São como as regras de trânsito para os carros.

## Endereço IP: o “CEP” de cada aparelho

“Para: São Paulo” não basta: lá existem milhões de aparelhos. Cada aparelho conectado tem um endereço próprio, o **endereço IP**. Ele vai no cabeçalho do pacote como origem e destino, e os roteadores o leem para encaminhar o pacote, como os Correios fazem com o CEP.

<div class="card" style="text-align:center;font-family:var(--mono);font-size:clamp(26px,7vw,40px);font-weight:700;letter-spacing:.04em">200<span style="color:var(--accent)">.</span>17<span style="color:var(--accent)">.</span>45<span style="color:var(--accent)">.</span>8</div>

:::lembrar Regras do endereço IP
**4 números**, separados por **pontos**, e cada número vai de **0 a 255**. Então `256.1.1.1` não existe (256 passou do limite), e `10.0.5` também não (só tem 3 números).
:::

## A rede da sua casa

Dentro de casa, o **roteador** funciona como o porteiro de um prédio:

- Ele dá um endereço para cada aparelho da casa: celular `192.168.0.10`, TV `192.168.0.11`, videogame `192.168.0.12`.
- Para o resto da internet, a casa inteira aparece com **um único endereço**: o do roteador.
- Quando a resposta chega, o roteador entrega para o aparelho certo, como o porteiro entrega a encomenda no apartamento certo.

Endereços que começam com `192.168` só valem dentro de cada casa, por isso existem em milhões de casas ao mesmo tempo sem confusão. É como o apartamento 101: existe em vários prédios, e o que diferencia é o endereço do prédio. Mas **dentro da mesma rede, dois aparelhos não podem ter o mesmo IP**, senão o pacote não sabe para quem ir.

## Domínio e DNS: a lista telefônica da internet

Ninguém decora números como `200.17.45.8`. Por isso os sites têm um nome fácil, o **domínio**, como `escola.edu.br`. Antigamente, para ligar para alguém, as pessoas procuravam o nome numa lista telefônica e achavam o número. O **DNS** faz isso na internet: você digita o nome do site e ele responde o endereço IP.

:::fluxo
Domínio | escola.edu.br
DNS | procura na lista
Endereço IP | 200.17.45.8
:::

Se você digitar o nome errado (`escolla.edu.br`), o DNS não encontra o nome, o pacote fica sem destino e o site **não abre**.

## Resumo das palavras

| Palavra | O que é |
|---|---|
| **Pacote** | Pedaço de uma informação que viaja pela internet, com cabeçalho e conteúdo. |
| **Cabeçalho** | A parte “envelope” do pacote: origem, destino e número. |
| **Roteador** | Lê o endereço de destino e encaminha o pacote. Em casa, também distribui endereços para os aparelhos. |
| **Endereço IP** | Número que identifica cada aparelho na rede: 4 números de 0 a 255. |
| **Protocolo** | Conjunto de regras que todos seguem para dividir, numerar, enviar, conferir e montar os pacotes (TCP/IP). |
| **Domínio** | O nome de um site, fácil de lembrar, como escola.edu.br. |
| **DNS** | Sistema que traduz o nome do site para o endereço IP, como uma lista telefônica. |

:::lembrar
Nenhuma mensagem viaja inteira: ela é **dividida, numerada, enviada em pacotes e montada no destino**. O DNS traduz o nome do site para o IP, e os roteadores usam esse número para achar o caminho.
:::
