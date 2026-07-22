# Especificação do MVP — Plataforma de Vestidos da Iraides

## 1. O PROBLEMA

Os vestidos da Iraides não têm exposição para o público final. Hoje quem compra são apenas os mesmos fornecedores revendedores de Aparecida de Goiânia — clientes novos não aparecem há muito tempo. As peças existem, a fotografia no Instagram existe, mas não há um caminho do Instagram até a compra.

## 2. QUEM USA

**Iraides** — entra no sistema para cadastrar um vestido novo. Ela sobe a foto da peça, informa se o vestido está disponível e cola o link do post do Instagram. O sistema remove o fundo da imagem e gera a descrição automaticamente. O vestido aparece no site. Ela sai do sistema com o vestido publicado.

**Cliente final** — vê um vestido no Instagram da Iraides, clica no link da bio e entra no site. Na página vê o vestido que a interessou, o post original do Instagram incorporado (prova social), um selo "Disponível" e um link "Ver outros modelos" que leva à lista com todos os vestidos à venda. Ela digita o CEP para saber o frete e clica em Comprar. Cai no WhatsApp da Iraides com uma mensagem pronta contendo o nome do produto, o valor total e a chave PIX. Ela paga, envia o comprovante e recebe o vestido em casa.

## 3. O QUE A PESSOA FAZ HOJE, SEM O MEU SISTEMA

Iraides mostra os vestidos um a um pelo WhatsApp para os fornecedores conhecidos. Quando aparece um fornecedor novo ela vende, mas isso não acontece há meses. Clientes finais que veem os vestidos no Instagram não têm como comprar e simplesmente deixam de comprar.

## 4. O QUE É SUCESSO

Vender 10 peças para compradores finais (não revendedores) no primeiro mês de operação.

## 5. A FEATURE DE IA

Dada a foto de um vestido tirada no cabide, a inteligência artificial remove o fundo da imagem e escreve automaticamente o nome, a cor, o comprimento e a ocasião de uso do vestido. Tudo 100% automático, sem revisão humana.
*Observação: esta funcionalidade será construída depois da versão inicial. No MVP, Iraides cadastra o nome e a descrição manualmente, e o sistema apenas remove o fundo da foto.*

## 6. FORA DE ESCOPO

- Login / cadastro de cliente
- Controle de estoque
- Avaliações e opiniões de clientes
- Cálculo de frete por API do Uber (frete fixo resolve por enquanto)
- Modelo virtual com IA
- Painel de relatórios e gráficos
- Entregas para outras cidades

## 7. CASOS DE BORDA

- **Salvar um vestido sem foto:** o sistema bloqueia o cadastro e avisa que a foto é obrigatória.
- **Preço zero ou negativo:** o sistema exige um valor maior que zero e não publica o produto enquanto não for corrigido.
- **Descrição em branco (após a IA ser implementada):** o sistema não publica o produto sem descrição e pede para o usuário digitar manualmente.
- **Dois toques rápidos no botão de Comprar:** o sistema desabilita o botão após o primeiro clique e só redireciona ao WhatsApp uma vez.
- **Cliente digita um CEP inválido:** o sistema avisa "CEP não encontrado" e pede para digitar novamente, sem quebrar a página.
- **Nenhum vestido cadastrado ainda:** a página "Ver outros modelos" exibe a mensagem "Nenhum vestido disponível no momento".
- **Cliente acessa um vestido marcado como indisponível:** o botão de comprar é substituído pelo texto "Indisponível no momento".

---

**Regra permanente:** todas as páginas e todos os fluxos precisam funcionar primeiro no celular, antes do desktop.
