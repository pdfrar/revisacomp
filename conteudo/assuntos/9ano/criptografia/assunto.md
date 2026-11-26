---
titulo: Criptografia na internet
resumo: Sua mensagem de WhatsApp passa por vários lugares até chegar ao amigo. Mesmo que alguém a pegue no caminho, não consegue ler. Isso é criptografia.
icone: 🔐
ordem: 1
bncc: EF09CO05
origem: 9 ano/criptografia.html
revisado: 2026-11-25
---

## O que é criptografia

:::destaque Criptografia
transformar a informação em algo ilegível para quem não tem a chave
Quem tem a chave consegue voltar à mensagem original.
:::

A palavra vem do grego: *kryptós* (escondido) + *graphein* (escrever).

## As peças de toda cifra

:::fluxo
Texto claro | NOS VEMOS NA FEIRA
Cifrar com a chave | aplicar a regra
Texto cifrado | QRV YHPRV QD IHLUD
Decifrar com a chave | volta ao texto claro
:::

:::cards
### 📄 Texto claro
A mensagem original, que qualquer pessoa lê.
### ⚙️ Cifra
A **regra** usada para embaralhar.
### 🔑 Chave
A informação **secreta** que ajusta a regra.
### 🔣 Texto cifrado
O resultado ilegível, que pode circular sem revelar nada.
:::

:::destaque
a regra pode ser pública; a chave tem que ser secreta
Esse é um princípio da criptografia moderna.
:::

## Cifras antigas e por que caíram

A **cifra de César** troca cada letra pela que está algumas posições à frente (veja o assunto [Cifra de César](/9ano/cifra-de-cesar)). Ela tem só **25 chaves**: testar todas leva minutos para uma pessoa e menos de um milésimo de segundo para um computador.

:::cards
### 🔨 Força bruta
Testar **todas** as chaves possíveis, uma a uma.
### 📊 Análise de frequência
Em português, **A**, **E** e **O** são as letras mais comuns. A letra que mais aparece no texto cifrado provavelmente é uma delas.
:::

A **cifra de Vigenère** usa uma **palavra** como chave, e a mesma letra pode virar letras diferentes. Isso esconde as frequências. Ela foi chamada de “indecifrável” por uns 300 anos.

Na Segunda Guerra, a máquina alemã **Enigma** mudava a regra a cada tecla, com trilhões de configurações. Para quebrá-la, matemáticos poloneses e a equipe de **Alan Turing** construíram máquinas que testavam configurações muito rápido: precursoras dos computadores.

:::destaque A ideia da criptografia moderna
chaves demais para testar
Testar todas levaria mais tempo do que a idade do universo.
:::

## Protegendo o que é enviado

No site do banco, seu navegador e o servidor **nunca se encontraram**. Como combinar uma chave secreta sem que ninguém no caminho descubra? A resposta é o **cadeado aberto**:

:::fluxo
1 · Cadeado aberto | O servidor distribui a **chave pública**. Qualquer um pode usá-la para **trancar**.
2 · Tranca | Seu celular tranca a mensagem com esse cadeado e envia.
3 · Só ele abre | Só o servidor tem a **chave privada**, que abre o cadeado.
:::

:::cards
### 🔓 Chave pública
Todo mundo pode ter. Serve para **trancar**.
### 🔑 Chave privada
Só o dono tem. Serve para **abrir**.
:::

Quem interceptar a mensagem no caminho só vê o cadeado fechado.

:::destaque Onde você vê isso
cadeado 🔒 + https:// no navegador
E na criptografia **de ponta a ponta** do WhatsApp: só os celulares de quem conversa têm as chaves. Nem a empresa lê.
:::

## Protegendo o que é guardado

Os sites **não guardam a sua senha** como você digitou. Eles guardam um **resumo** dela, chamado **hash**.

:::fluxo
Você cria a senha | patos2026
O site calcula o hash | e guarda só ele
No login | calcula o hash do que você digitou e compara
:::

:::cards
### ↩️ Não tem volta
Do hash não se chega à senha. Se o banco de dados vazar, as senhas não aparecem.
### 🌪️ Efeito avalanche
Mudar **uma letra** da senha gera um hash **completamente diferente**.
:::

:::lembrar
Por isso, quando você esquece a senha, o site manda **criar outra**: nem ele sabe qual era a antiga. E o celular com bloqueio de tela guarda fotos e conversas **cifradas**.
:::

## Resumo

:::cards
### 📨 Dado enviado
Protegido por **https**, cadeado e **ponta a ponta**: WhatsApp, Pix, app do banco, sites.
### 💾 Dado guardado
Protegido por **hash** de senhas e **celular cifrado** com bloqueio de tela.
:::

:::destaque
a segurança depende de uma chave secreta e de chaves demais para testar
:::
