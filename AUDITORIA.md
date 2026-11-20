# Auditoria e decisões

## Estado encontrado antes de editar

- Repositório Git limpo, sem `AGENTS.md` local adicional.
- HTML/CSS/JavaScript puros; sem React, roteador ou servidor de aplicação.
- Única dependência original: esbuild 0.28.2 para minificação.
- `scripts/build.js` copiava arquivos públicos e 15 diretórios de traduções para `dist/`, verificava seu digest e gerava sitemap/hreflang.
- `.github/workflows/static.yml`: npm ci, checagem de sintaxe, build, upload do artefato e deploy no Pages; ações fixadas por commit.
- Página inicial direcionada exclusivamente a produtos próprios, sem oferta comercial/local, serviços, FAQ de contratação ou jornada de orçamento.
- Cinco produtos: **Alongaê, ArqVello, Coflira, Miauforia e Sentinela**.
- Alongaê, ArqVello e Sentinela: “Em breve”; Coflira: “Em preparação”; Miauforia: “Em desenvolvimento”. Não havia download publicado a preservar.
- Páginas individuais, mockups em HTML/CSS, arte SVG do Miauforia, políticas de três produtos e links entre aplicativos.
- Fontes locais Inter, Space Grotesk e DM Mono, com licenças OFL; marca tipográfica e paleta verde.
- Tema claro/escuro na home e catálogos traduzidos; seletor de 16 idiomas. Páginas de produto com identidades próprias.
- E-mail recorrente: `leonardodacostabonfim@gmail.com`. Nenhum WhatsApp da Nexulvi foi confirmado.
- Three.js e `stereo-scene.js` estavam no repositório, mas não eram necessários na home atual; o build já excluía `assets/vendor`. Preservados na fonte, sem introduzi-los na página comercial.
- Servidor/batch local originalmente servia a raiz do repositório.

## Problemas identificados

### Comercial e UX

Não havia comunicação imediata de sites/sistemas para empresas; Birigui, Araçatuba e atendimento nacional não eram trabalhados. Os contatos não distinguiam serviços. Não havia escopo de contratação, objeções comerciais nem portfólio separado de produtos próprios.

### SEO

Metadados existentes descreviam somente aplicativos. Quatro páginas de produto preenchiam títulos descritivos, introduções, recursos e FAQ via JavaScript; existia um resumo `noscript`, mas não conteúdo principal completo no HTML inicial. Havia links para `index.html#solutions`, uma âncora inexistente.

O robots do projeto fica em subdiretório, sem autoridade sobre a raiz do host. A URL-base estava repetida em geradores e páginas. A 404 usava caminhos relativos que falhavam em URLs inválidas aninhadas.

### Acessibilidade e desempenho

Ausência de foco global consistente na home original. Durante a validação renderizada foram encontrados contrastes insuficientes nos rótulos de três mockups antigos; foram escurecidos sem trocar identidades.

Havia recursos úteis de responsividade e menu existentes, mas nenhum teste automatizado versionado e nenhuma evidência de Lighthouse no projeto. Não foram presumidas pontuações do site antigo.

## Estratégia adotada

Sem migração de framework. O mesmo build agora gera uma área comercial em HTML estático, reaproveita estilos e arte dos aplicativos e pré-renderiza os blocos dinâmicos de produtos. Dependências adicionais são exclusivamente ferramentas de desenvolvimento/teste; nenhuma biblioteca de interface ou script de terceiros é enviado aos visitantes.

A home antiga foi preservada integralmente como fonte em `aplicativos.html`. As traduções existentes continuam correspondendo a esse catálogo. O identificador histórico `index.html` no cálculo do digest lê agora `aplicativos.html`: o conteúdo protegido pelo checksum é o mesmo, não houve aceitação cega de traduções desatualizadas.

As URLs localizadas antigas permanecem válidas. O hreflang brasileiro dessas páginas aponta ao catálogo, não à nova home de conteúdo diferente. Conteúdo comercial novo permanece explicitamente em pt-BR.

## Inventário preservado

| Produto | Fonte/página | Status original | Artes e apresentação |
|---|---|---|---|
| Alongaê | `alongae.html`, `apps.js` | Em breve | Mockups HTML/CSS e página mantidos |
| ArqVello | `arqvello.html`, `apps.js` | Em breve | Mockups HTML/CSS e página mantidos |
| Coflira | `coflira.html`, `apps.js` | Em preparação | Painel ilustrativo e página mantidos |
| Miauforia | `miauforia.html` | Em desenvolvimento | `assets/miauforia-preview.svg` e página mantidos |
| Sentinela | `sentinela.html`, `apps.js` | Em breve | Radar ilustrativo e página mantidos |

As três políticas de produto, links e variantes traduzidas permanecem. O build testa o inventário antes de produzir a home. Valores e dados demonstrativos já existentes nos mockups não representam métricas comerciais da Nexulvi.

## Portfólio de terceiros

`https://amandapetsitter.com` foi consultado: o conteúdo público descreve serviços de pet sitter em Birigui e Araçatuba. O responsável confirmou a autoria da Nexulvi e autorizou a divulgação do projeto para cliente. A captura publicada é do site real. Nenhum telefone do site da cliente foi usado como contato da Nexulvi.

## Referências consultadas

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Organization: https://developers.google.com/search/docs/appearance/structured-data/organization
- Robots: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Migração de URLs: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Domínio do Pages: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- Context7: APIs de esbuild e Playwright, execução do Lighthouse.
