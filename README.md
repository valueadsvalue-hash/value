# Landing Page — Dra. Bhárbara Bassini | Recuperação de Crédito Empresarial

Página única e estática (`index.html`, sem build, sem dependências externas) voltada à
conversão de empresas com dinheiro a receber em leads de WhatsApp.

## Antes de publicar

1. **Foto** — troque o `.photo-frame` (aparece 2x: hero e seção "Autoridade") pela foto real:
   ```html
   <div class="photo-frame"><img src="foto-barbara-bassini.jpg" alt="Dra. Bhárbara Bassini"></div>
   ```
2. **WhatsApp** — edite as duas variáveis no final do `index.html`:
   ```js
   var WHATSAPP_NUMBER = "55DDXXXXXXXXX"; // número real, só dígitos, com DDI+DDD
   var WHATSAPP_MESSAGE = "...";          // mensagem pré-preenchida
   ```
3. **Dados do escritório** — preencha os campos marcados `[Inserir ...]`: OAB, tempo de
   atuação, cidade/regiões atendidas, especializações, nome completo do escritório (rodapé).
4. **Depoimentos** (opcional) — só incluir se autorizados pelo cliente e compatíveis com as
   normas de publicidade da OAB vigentes; nunca citar valores recuperados por nome de cliente.

## Decisões de copy (resumo)

- **Posicionamento:** recuperação de crédito empresarial (B2B), não "advogado de cobrança" genérico.
- **Headline escolhida:** "Sua empresa vendeu, entregou e não recebeu?" — fala com a dor
  específica de quem pesquisa por isso, em vez de institucional.
- **Alternativas para teste A/B:** "Sua empresa tem dinheiro para receber de outra empresa?"
  (pergunta direta) / "Recuperação de crédito para empresas que venderam e não receberam."
  (benefício/serviço).
- **CTA único:** WhatsApp, repetido em 7 pontos da página + botão flutuante mobile/desktop.
- **Tom:** direto, empresarial, sem juridiquês, sem promessa de resultado, prazo ou bloqueio.

## Eventos recomendados para GA4/GTM

Todos os CTAs têm `data-cta="<local>"` (`header`, `hero`, `como-funciona`, `documentacao`,
`objecoes`, `final`, `floating`). Sugestão de trigger no GTM: clique em `.whatsapp-cta`,
enviando `data-cta` como parâmetro do evento `whatsapp_click`. Também recomendável: evento
`faq_open` no `toggle` dos elementos `<details>`, e scroll depth nas seções principais.

## Ética / publicidade

Copy revisada para não conter promessa de resultado, garantia de recuperação, comparação com
outros advogados ou captação irregular. Revisar novamente as normas vigentes da OAB sobre
publicidade antes da publicação final.
