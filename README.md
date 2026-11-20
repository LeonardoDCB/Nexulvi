# Nexulvi — site institucional e comercial

Site estático em HTML, CSS e JavaScript, sem framework de interface e sem backend. A hospedagem continua sendo o GitHub Pages em **https://leonardodcb.github.io/Nexulvi/**.

## Executar

Use Node.js 22.19+ e npm (validado localmente e configurado no CI com Node 24.19). Na raiz:

```powershell
npm ci
npm run build
npm test
npm run preview
```

Abra **http://127.0.0.1:4173/Nexulvi/**.

`index.html` é o template comercial: o build preenche seus marcadores com HTML, metadados, cards e contatos. **Não abra o template diretamente nem publique a raiz do repositório. Publique `dist/`.** As páginas de serviços, sobre, contato e privacidade são geradas pelo build. Nenhuma renderização de servidor é necessária em produção.

A home prioriza a oferta de sites profissionais para negócios locais, com CTA contextual de orçamento e um projeto autorizado visível na primeira dobra. O caso Amanda é descrito sem resultados inventados; suas informações, imagem e texto editorial ficam em `site.config.js`. A página de criação de sites explica formatos de uma página e institucional, o que ajuda a dimensionar a proposta e os custos recorrentes — sem publicar preço ou prazo não definidos.

`abrir-site.bat` também executa o build e abre o preview. O comando antigo `node servidor-local.js` continua disponível, agora servindo `dist/`; faça o build antes. Para encerrar o servidor, pressione Ctrl+C no terminal.

## Onde editar

| Arquivo | Responsabilidade |
|---|---|
| `site.config.js` | URL, contatos, cidade, atendimento, redes, catálogo de serviços, metadados e informações autorizadas do portfólio |
| `index.html` | Seções, copy e composição visual da home; marcadores do caso e da prova são gerados no build |
| `scripts/commercial.js` | Templates compartilhados, formatos de site, páginas comerciais, FAQ, CTAs, SEO e JSON-LD |
| `commercial.css` / `commercial.js` | Layout comercial e interações leves |
| `aplicativos.html` | Catálogo original preservado, inclusive mockups e descrições |
| `alongae.html`, `arqvello.html`, `coflira.html`, `miauforia.html`, `sentinela.html`, `apps.js`, `apps.css` | Páginas e apresentação dos aplicativos |
| `localized/` | 15 idiomas adicionais já existentes do catálogo, produtos e políticas |
| `scripts/build.js` | Build, pré-renderização dos apps, sitemap e normalização de URLs |
| `tests/`, `scripts/browser-test.js` | Regressões estáticas e testes reais de navegador |

### Contatos

Em `site.config.js`, `whatsapp` contém **país + DDD + número, somente dígitos**. Já foi configurado com o contato informado pelo responsável. O build rejeita formatos inválidos.

Todos os CTAs comerciais usam o WhatsApp configurado, com mensagens específicas por serviço. O e-mail de alternativa é `leonardodacostabonfim@gmail.com`, confirmado pelo responsável.

Não há botão quebrado de WhatsApp nem telefone fictício. Cada serviço tem sua própria mensagem; o número informado é incluído nos links de WhatsApp gerados no artefato público. A captura de portfólio da cliente é independente desse contato. Sem aplicativo de e-mail configurado, a página de contato também permite copiar o endereço. Redes sociais só aparecem se forem informadas em `social`.

### Serviços e preços futuros

Edite os objetos de `services` em `site.config.js`. Título, descrição, card, conteúdo detalhado, mensagem de contato, links e sitemap são derivados da configuração. Para um novo serviço, use um `id` e `slug` únicos e um dos ícones definidos em `scripts/commercial.js`; acrescente seu link contextual na home quando relevante.

Não existem preços públicos nem ofertas marcadas em dados estruturados. Uma futura política de preços pode ser acrescentada ao mesmo catálogo e ao renderer após validação comercial; nenhuma tabela de valores está espalhada pelo projeto.

### Portfólio e Amanda Pet Sitter

O responsável autorizou a divulgação do projeto para cliente. O card identifica o trabalho dessa forma e usa uma captura verdadeira do site, sem métricas inventadas. Não foram reutilizados telefones do site da cliente como contatos da Nexulvi.

Para atualizar a captura, execute `node scripts/capture-portfolio-preview.js` (requer Chrome/Playwright instalado). O script converte a imagem para WebP de 1000 × 625. Revise a imagem resultante antes de publicá-la.

### Aplicativos e idiomas

Os cinco aplicativos são obrigatórios no inventário atual. O build e os testes interrompem a geração se um deles, seu nome, link ou status desaparecer do catálogo.

Para atualizar um aplicativo, ajuste seu card em `aplicativos.html`, os dados de apresentação e sua página individual. Se mudar o status, ajuste também `apps` em `site.config.js`. Mudanças no conteúdo traduzível exigem regeneração e revisão das traduções conforme `LOCALIZATION.md`. Para adicionar outro produto, inclua os mesmos pontos e revise os testes e páginas localizadas; não basta adicionar um objeto vazio.

A nova área comercial é em **português brasileiro**. Os 16 idiomas do catálogo original continuam disponíveis, sem apresentar texto comercial em português como se fosse uma tradução. O seletor “Aplicativos em outros idiomas” leva ao catálogo correspondente. A volta ao português retorna a `aplicativos.html`; há um link do catálogo para a home comercial.

## Testes de navegador

Com o preview em execução, em outro terminal:

```powershell
npx playwright install chromium
npm run test:browser
```

Ou use um Chrome instalado, sem baixar outro navegador:

```powershell
$env:BROWSER_CHANNEL = 'chrome'
npm run test:browser
```

O teste usa as cinco larguras solicitadas, temas claro/escuro, axe, erros de execução e recursos da home, além de rotas de serviços e produtos, idioma, menu, foco, FAQ, persistência do tema, sitemap e 404. As capturas e o relatório ficam em `test-results/`, ignorado pelo Git. Acessibilidade automatizada não substitui avaliação humana com tecnologias assistivas.

A arte de compartilhamento é própria, com fonte de sistema, em `assets/social-card.svg`. O PNG de 1200×630 está versionado; não é preciso abrir navegador no build. Para reexportá-lo:

```powershell
$env:BROWSER_CHANNEL = 'chrome'
node scripts/social-card.js
npm run build
```

## Publicação — somente após autorização

O workflow existente `.github/workflows/static.yml` continua publicando o artefato `dist/`, agora com testes estáticos antes do upload. Ele roda em push para `main` ou por execução manual.

1. Revise as pendências e confirme a branch de destino.
2. Confira em Settings → Pages que a origem é **GitHub Actions**.
3. Depois do commit/push autorizado, execute ou acompanhe “Deploy static content to Pages”.
4. Inspecione a URL pública, as páginas de serviços, os cinco aplicativos, imagens, sitemap e compartilhamento.

O deploy é disparado automaticamente por push em `main`, após os testes do workflow. Não são necessárias alterações de DNS ou configuração de domínio remoto para essa publicação.

## SEO e limitações da hospedagem

- Conteúdo comercial e metadados saem no HTML inicial. O build também preenche os blocos antes dinâmicos dos aplicativos, mantendo suas interações.
- Canonicals absolutos e sitemap são gerados com `siteUrl`; links normais preservam o subdiretório.
- `/` e `/index.html` podem ser servidos pelo Pages; a home usa canonical para `/`. Não há redirecionamento HTTP arbitrário configurável por arquivo neste projeto.
- `Organization`, `WebSite`, `Service` e `BreadcrumbList` usam somente fatos disponíveis. Não foi adotado `LocalBusiness` com endereço físico incompleto ou inventado, nem foram marcadas avaliações, preços ou promessas de rich results.
- O sitemap de produção é **`dist/sitemap.xml`**. Os arquivos históricos de sitemap/robots na raiz não são a fonte da configuração de produção.
- **`/Nexulvi/robots.txt` não controla crawlers.** Robôs consultam `https://leonardodcb.github.io/robots.txt`, fora do escopo deste repositório. Se você controla o site raiz da conta, pode publicar ali a indicação do sitemap. Caso contrário, envie `https://leonardodcb.github.io/Nexulvi/sitemap.xml` diretamente ao Search Console.
- O Pages controla compressão, cache e cabeçalhos HTTP; `.htaccess` e regras de servidor não são soluções aplicáveis. O preview usa `no-store` deliberadamente, não simula cache/compressão da hospedagem.

## Domínio próprio, futuramente

**Nenhuma mudança de DNS deve ser feita agora.**

Quando o domínio real estiver adquirido e a migração for autorizada:

1. Verifique sua propriedade nas configurações de Pages da conta para reduzir risco de apropriação indevida.
2. Troque somente `siteUrl` em `site.config.js` pela URL HTTPS definitiva, com barra final e o caminho real. Normalmente o domínio próprio servirá na raiz, sem `/Nexulvi/`.
3. Execute build e testes. Canonicals, OG, JSON-LD, hreflang, sitemap e caminhos da 404 serão atualizados também nos arquivos antigos.
4. Configure o domínio real em Settings → Pages → Custom domain, **antes** de apontar o DNS. Consulte a documentação oficial vigente para os registros A/AAAA/ALIAS ou CNAME. CNAME de subdomínio aponta para `leonardodcb.github.io`, sem `/Nexulvi/`. Não use wildcard DNS.
5. Com publicação por Actions, o arquivo `CNAME` não configura o domínio: a configuração em Settings é necessária. Este build não cria um domínio fictício.
6. Aguarde validação do DNS/certificado e habilite **Enforce HTTPS** quando disponível. Confira apex/www e conteúdo misto.
7. Teste as respostas HTTP do endereço antigo para cada página importante. O Pages oferece redirecionamentos em configurações de domínio suportadas, mas não um mapa arbitrário de 301 definido pelo projeto. Se um caminho antigo não for redirecionado corretamente, resolva pela infraestrutura disponível; não trate canonical ou JavaScript como equivalente a um 301. Não redirecione indiscriminadamente todas as páginas para a home.
8. Preserve os caminhos dos apps e políticas, atualize links que você controla e mantenha redirecionamentos corretos por pelo menos um ano, quando possível.
9. Verifique as propriedades antiga e nova no Search Console e envie o novo sitemap. A ferramenta “Mudança de endereço” tem restrições para propriedades com subcaminho; confirme a elegibilidade do caso real, sem assumir que `/Nexulvi/` é aceito.
10. Acompanhe indexação, canonicals escolhidos, erros 404, consultas, impressões e cliques nas semanas seguintes. Flutuações são possíveis; não há garantia de posição.

O build também permite uma simulação **apenas local**, sem mudar o domínio de produção:

```powershell
$env:SITE_URL = 'https://nexulvi.test/' # Fixture reservada; não publicar.
$env:BUILD_OUTPUT = 'test-results/domain-fixture'
npm run build
npm test
Remove-Item Env:SITE_URL
Remove-Item Env:BUILD_OUTPUT
```

## Métricas e privacidade

`searchConsoleVerification` aceita o token público de verificação HTML; não é uma senha. Atualmente não há analytics externo, cookies publicitários ou formulário com backend.

Links comerciais disparam `nexulvi:interaction` no `window`, com evento, serviço, posição e canal. Os eventos `quote_click`, `service_click` e `project_click` não armazenam histórico, não transmitem informações e não contêm o texto das mensagens. Há um ponto opcional para `nexulvi:project-view` em futuras páginas comerciais identificadas com `data-project`; os apps legados não ganharam rastreamento.

Antes de conectar qualquer coletor: definir finalidade e base legal, revisar fornecedor, minimização e retenção, atualizar a política e implementar consentimento quando exigido. Não basta inserir um ID de analytics sem essa avaliação.

## Depois da publicação

- Verificar a propriedade de prefixo de URL no Google Search Console.
- Enviar sitemap e inspecionar home e serviços com a ferramenta de inspeção de URLs.
- Validar JSON-LD no Schema Markup Validator e, quando aplicável, Rich Results Test. Nem todo tipo Schema.org é elegível a resultados avançados.
- Repetir Lighthouse/PageSpeed na URL pública e acompanhar dados de campo quando existirem.
- Atualizar os links oficiais do Instagram e demais canais para as páginas adequadas.
- Publicar trabalhos autorizados e conteúdo útil baseado em dúvidas reais dos clientes.
- Avaliar um Perfil da Empresa no Google **somente se a operação real atender aos critérios de elegibilidade**. Não criar escritório/endereço fictício; uma operação exclusivamente online pode não ser elegível.

Veja também `AUDITORIA.md`, `VALIDACAO.md` e `LOCALIZATION.md`.
