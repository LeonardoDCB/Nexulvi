'use strict';

// Configuração pública. Nunca coloque credenciais neste arquivo.
module.exports = {
  name: 'Nexulvi',
  siteUrl: 'https://leonardodcb.github.io/Nexulvi/', // Com barra final.
  city: 'Birigui',
  region: 'São Paulo',
  country: 'Brasil',
  areas: ['Birigui', 'Araçatuba', 'região noroeste paulista', 'todo o Brasil'],
  email: 'leonardodacostabonfim@gmail.com', // E-mail confirmado pelo responsável.
  whatsapp: '5518996999595', // +55, DDD 18, número informado pelo responsável.
  social: [], // Somente URLs oficiais verificadas.
  searchConsoleVerification: '', // Token público de verificação, quando disponível.
  services: [
    {
      id: 'sites', slug: 'criacao-de-sites', name: 'Sites profissionais', icon: 'window',
      title: 'Criação de sites em Birigui e Araçatuba | Nexulvi',
      description: 'Criação de sites profissionais em Birigui-SP para empresas de Birigui, Araçatuba e todo o Brasil. Design responsivo, conteúdo claro e contato fácil.',
      short: 'Uma presença à altura do seu negócio. Sites rápidos, responsivos e personalizados para apresentar sua empresa e facilitar novos contatos.',
      headline: 'Seu negócio merece um site que trabalhe a seu favor.',
      intro: 'Quem procura sua empresa precisa entender o que você faz e como entrar em contato. Criamos sites profissionais que organizam essa conversa, do primeiro acesso ao pedido de orçamento.',
      audience: 'Para empresas, comércios e prestadores de serviços que ainda não têm site ou precisam substituir uma presença digital desatualizada.',
      deliverables: [
        ['Conteúdo que orienta', 'Estrutura de páginas para apresentar sua empresa, seus serviços e as informações que o cliente precisa antes de entrar em contato.'],
        ['Boa experiência no celular', 'Layouts adaptados a diferentes telas, navegação clara e botões fáceis de usar.'],
        ['Base para descoberta', 'HTML indexável, títulos, descrições, links e orientações de SEO compatíveis com o escopo. Posicionamento no Google não é garantido.']
      ],
      planning: 'Definimos juntos a quantidade de páginas, os conteúdos disponíveis, quem fornece textos e imagens e quais integrações serão necessárias. Domínio, hospedagem e manutenção entram na proposta com responsabilidades claras.',
      message: 'um site profissional'
    },
    {
      id: 'landing-pages', slug: 'landing-pages', name: 'Landing pages', icon: 'target',
      title: 'Criação de landing pages comerciais | Nexulvi',
      description: 'Landing pages para apresentar serviços, campanhas e ofertas com clareza. A Nexulvi atende Birigui, Araçatuba e todo o Brasil. Converse sobre seu projeto.',
      short: 'Uma oferta, um objetivo. Páginas comerciais para campanhas, serviços e pedidos de orçamento, sem distrações desnecessárias.',
      headline: 'Uma página. Uma oferta. Um próximo passo claro.',
      intro: 'Uma campanha precisa de um destino coerente. Desenvolvemos landing pages para explicar uma oferta específica, responder às dúvidas do público e facilitar o contato.',
      audience: 'Para quem divulga um serviço, inicia uma campanha ou precisa apresentar uma oferta com mais contexto do que uma publicação nas redes sociais permite.',
      deliverables: [
        ['Mensagem com foco', 'Hierarquia de conteúdo que conecta a necessidade do visitante à sua oferta.'],
        ['Caminho para o contato', 'Chamadas para ação e mensagens contextualizadas para WhatsApp ou e-mail. Formulários só entram quando existe infraestrutura adequada.'],
        ['Página leve e adaptável', 'Experiência mobile-first, imagens dimensionadas e estrutura preparada para medição futura, conforme as regras de privacidade aplicáveis.']
      ],
      planning: 'Alinhamos público, origem dos acessos, oferta e ação desejada. Anúncios, verba de mídia, ferramentas externas e acompanhamento contínuo são avaliados separadamente; não há promessa de vendas ou conversões.',
      message: 'uma landing page'
    },
    {
      id: 'sistemas', slug: 'desenvolvimento-de-sistemas', name: 'Sistemas personalizados', icon: 'grid',
      title: 'Desenvolvimento de sistemas em Birigui | Nexulvi',
      description: 'Sistemas web personalizados para organizar processos empresariais. Desenvolvimento em Birigui-SP, com atendimento a Araçatuba, região e todo o Brasil.',
      short: 'Menos improviso, mais organização. Sistemas web construídos para os processos e as necessidades reais da sua empresa.',
      headline: 'O sistema se adapta ao seu negócio. Não o contrário.',
      intro: 'Planilhas desconectadas, retrabalho e informação espalhada dificultam decisões. Investigamos seu fluxo de trabalho para planejar um sistema web com as funções que realmente fazem sentido.',
      audience: 'Para empresas que precisam organizar cadastros, acompanhar operações ou concentrar informações hoje distribuídas em processos manuais.',
      deliverables: [
        ['Mapeamento do processo', 'Entendimento de usuários, etapas, regras do negócio e informações necessárias.'],
        ['Funcionalidades sob medida', 'Priorização de recursos como cadastros, consultas, relatórios e permissões conforme a necessidade validada.'],
        ['Entrega responsável', 'Testes dos fluxos definidos, orientação de uso e planejamento de hospedagem, segurança, backups e evolução de acordo com o projeto.']
      ],
      planning: 'Antes de propor tecnologia, definimos o problema e o escopo. Importação de dados, integrações, acesso por diferentes perfis e custos de operação precisam ser avaliados. Manutenção e suporte têm condições acordadas, não são ilimitados.',
      message: 'um sistema personalizado'
    },
    {
      id: 'aplicativos', slug: 'desenvolvimento-de-aplicativos', name: 'Aplicativos', icon: 'phone',
      title: 'Desenvolvimento de aplicativos em Birigui | Nexulvi',
      description: 'Planeje seu aplicativo Android com a Nexulvi, em Birigui-SP. Avaliamos funcionalidades, viabilidade e outras plataformas. Atendimento remoto em todo o Brasil.',
      short: 'Da ideia à experiência de uso. Aplicativos Android e outras plataformas avaliadas conforme a viabilidade de cada projeto.',
      headline: 'Sua ideia de aplicativo começa com um bom plano.',
      intro: 'Antes de desenvolver, é preciso entender para quem o aplicativo existe e que problema ele resolve. Ajudamos a transformar a ideia em um escopo possível, com prioridades e decisões técnicas claras.',
      audience: 'Para empresas e pessoas que querem oferecer uma experiência mobile, digitalizar uma operação ou validar uma ideia de produto.',
      deliverables: [
        ['Viabilidade e prioridades', 'Análise de funcionalidades, dispositivos, uso offline e necessidade de servidores ou serviços externos.'],
        ['Experiência e desenvolvimento', 'Planejamento de telas e fluxos, implementação e testes nos cenários combinados.'],
        ['Planejamento da distribuição', 'Orientação sobre contas de desenvolvedor, políticas das lojas, privacidade e etapas de submissão, quando fizerem parte do escopo.']
      ],
      planning: 'Desenvolvemos para Android e avaliamos outras plataformas conforme os requisitos. Custos de contas, infraestrutura, manutenção e publicação são definidos na proposta. A aprovação nas lojas depende de seus processos de análise.',
      message: 'um aplicativo'
    },
    {
      id: 'automacoes', slug: 'automacoes-e-integracoes', name: 'Automações e integrações', icon: 'flow',
      title: 'Automações e integrações de software | Nexulvi',
      description: 'Integre ferramentas e reduza tarefas repetitivas com soluções planejadas para seu negócio. Nexulvi em Birigui-SP, atendendo Araçatuba e todo o Brasil.',
      short: 'Suas ferramentas trabalhando juntas. Integrações de software e automações para reduzir tarefas repetitivas no dia a dia.',
      headline: 'Menos copiar e colar. Mais tempo para o que importa.',
      intro: 'Quando uma informação precisa ser repetida em vários lugares, existe uma oportunidade de melhorar o fluxo. Avaliamos como conectar ferramentas e automatizar etapas com responsabilidade.',
      audience: 'Para equipes que gastam tempo transferindo informações, conferindo registros ou executando tarefas digitais recorrentes.',
      deliverables: [
        ['Diagnóstico do fluxo', 'Identificação de entradas, saídas, frequência e pontos que precisam de validação humana.'],
        ['Integrações viáveis', 'Verificação de APIs oficiais, permissões, limites, termos de uso e custos das ferramentas envolvidas.'],
        ['Falhas consideradas', 'Planejamento de registros, alertas, tratamento de erros e formas de acompanhar a execução conforme o escopo.']
      ],
      planning: 'Nem toda tarefa deve ser automatizada. A viabilidade depende das ferramentas, do acesso permitido e da qualidade dos dados. Licenças, limites de uso e serviços de terceiros são apresentados antes da contratação.',
      message: 'automações e integrações'
    }
  ],
  // Descrições, identidades e status do catálogo original permanecem em aplicativos.html.
  apps: [
    { id: 'alongae', name: 'Alongaê', status: 'Em breve' },
    { id: 'arqvello', name: 'ArqVello', status: 'Em breve' },
    { id: 'coflira', name: 'Coflira', status: 'Em preparação' },
    { id: 'miauforia', name: 'Miauforia', status: 'Em desenvolvimento' },
    { id: 'sentinela', name: 'Sentinela', status: 'Em breve' }
  ],
  portfolio: [
    {
      name: 'Amanda Pet Sitter',
      type: 'Site profissional',
      url: 'https://amandapetsitter.com',
      description: 'Site profissional para serviços de pet sitter em Birigui e Araçatuba, com apresentação de visitas em domicílio, hospedagem, passeios e caminhos para solicitar atendimento.',
      client: 'Projeto para cliente',
      caseTitle: 'Um site que ajuda o cliente a entender o serviço e',
      caseEmphasis: 'dar o próximo passo.',
      caseIntro: 'Para a Amanda Pet Sitter, organizamos em um só lugar a apresentação do serviço, as áreas atendidas, as opções de cuidado e os caminhos para pedir informações.',
      caseHighlights: [
        'Serviços e informações organizados para consulta no celular.',
        'Atendimento apresentado para Birigui e Araçatuba.',
        'Contato direto pelo WhatsApp da profissional.'
      ],
      caseDisclosure: 'Projeto para cliente, divulgado com autorização. A imagem mostra o site real; não representa métricas de tráfego ou vendas.',
      authorized: true,
      image: 'assets/amanda-petsitter-preview.webp',
      imageAlt: 'Captura real do site Amanda Pet Sitter, apresentando serviços de cuidado para pets em Birigui e Araçatuba.'
    }
  ]
};
