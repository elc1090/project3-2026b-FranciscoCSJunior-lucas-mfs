// Catálogo SOSTENPYME (conteúdo compartilhado por todas as empresas).
// Perguntas: documento "Preguntas para el Diagnóstico Inicial de Sostenibilidad" (equipe do Chile).
// ODS por pergunta, recomendações e metas da Rota: PROPOSTA nossa, precisa ser validada com a equipe do Chile.
// Quando o backend existir, estes dados virão do banco (seeders) via props do Inertia.

import type { DimensionKey, PathGoal, Question, Recommendation, SdgInfo } from '@/types/sostenpyme';

export const dimensions: DimensionKey[] = ['environmental', 'social', 'economic', 'governance'];

export const questions: Question[] = [
    // Ambiental
    {
        id: 'env-1',
        dimension: 'environmental',
        sdgs: [12],
        text: {
            es: '¿La empresa identifica cuáles de sus procesos o productos generan mayor impacto sobre el medioambiente?',
            pt: 'A empresa identifica quais dos seus processos ou produtos geram maior impacto sobre o meio ambiente?',
        },
    },
    {
        id: 'env-2',
        dimension: 'environmental',
        sdgs: [7],
        text: {
            es: '¿La empresa utiliza o ha evaluado fuentes de energía más limpias, como paneles solares, iluminación LED o equipos eficientes?',
            pt: 'A empresa usa ou já avaliou fontes de energia mais limpas, como painéis solares, iluminação LED ou equipamentos eficientes?',
        },
    },
    {
        id: 'env-3',
        dimension: 'environmental',
        sdgs: [4, 12],
        text: {
            es: '¿La empresa capacita o sensibiliza a su equipo sobre el cuidado del medioambiente?',
            pt: 'A empresa capacita ou conscientiza sua equipe sobre o cuidado com o meio ambiente?',
        },
    },
    {
        id: 'env-4',
        dimension: 'environmental',
        sdgs: [3, 13],
        text: {
            es: '¿La empresa cuenta con un plan de acción ante emergencias o incidentes ambientales, como derrames, incendios o emisiones?',
            pt: 'A empresa tem um plano de ação para emergências ou incidentes ambientais, como vazamentos, incêndios ou emissões?',
        },
    },
    {
        id: 'env-5',
        dimension: 'environmental',
        sdgs: [13],
        text: {
            es: '¿La empresa mide o estima su huella de carbono o las emisiones asociadas a su actividad, incluido el transporte?',
            pt: 'A empresa mede ou estima sua pegada de carbono ou as emissões ligadas à sua atividade, incluindo o transporte?',
        },
    },
    // Social — Trabajadores
    {
        id: 'soc-1',
        dimension: 'social',
        group: 'workers',
        sdgs: [8],
        text: {
            es: '¿La empresa ofrece condiciones laborales justas, como contratos formales, remuneraciones al día y jornadas respetadas?',
            pt: 'A empresa oferece condições de trabalho justas, como contratos formais, salários em dia e jornadas respeitadas?',
        },
    },
    {
        id: 'soc-2',
        dimension: 'social',
        group: 'workers',
        sdgs: [5, 8],
        text: {
            es: '¿La empresa tiene mecanismos para prevenir y atender casos de acoso, maltrato o conflictos laborales?',
            pt: 'A empresa tem mecanismos para prevenir e tratar casos de assédio, maus-tratos ou conflitos no trabalho?',
        },
    },
    {
        id: 'soc-3',
        dimension: 'social',
        group: 'workers',
        sdgs: [3, 8],
        text: {
            es: '¿La empresa mide la satisfacción o el clima laboral de sus trabajadores?',
            pt: 'A empresa mede a satisfação ou o clima organizacional dos seus trabalhadores?',
        },
    },
    // Social — Comunidad
    {
        id: 'soc-4',
        dimension: 'social',
        group: 'community',
        sdgs: [11, 17],
        text: {
            es: '¿La empresa conoce quiénes son sus principales grupos de interés (vecinos, clientes, proveedores, autoridades locales)?',
            pt: 'A empresa sabe quem são suas principais partes interessadas (vizinhos, clientes, fornecedores, autoridades locais)?',
        },
    },
    {
        id: 'soc-5',
        dimension: 'social',
        group: 'community',
        sdgs: [4, 17],
        text: {
            es: '¿La empresa colabora con colegios, centros de formación u organizaciones locales, por ejemplo con prácticas, charlas o donaciones?',
            pt: 'A empresa colabora com escolas, centros de formação ou organizações locais, por exemplo com estágios, palestras ou doações?',
        },
    },
    // Económica
    {
        id: 'eco-1',
        dimension: 'economic',
        sdgs: [8],
        text: {
            es: '¿La empresa analiza periódicamente su situación financiera para tomar decisiones a mediano y largo plazo?',
            pt: 'A empresa analisa periodicamente sua situação financeira para tomar decisões de médio e longo prazo?',
        },
    },
    {
        id: 'eco-2',
        dimension: 'economic',
        sdgs: [8],
        text: {
            es: '¿La empresa diversifica sus clientes, productos o ingresos para no depender de un solo origen?',
            pt: 'A empresa diversifica seus clientes, produtos ou receitas para não depender de uma única fonte?',
        },
    },
    {
        id: 'eco-3',
        dimension: 'economic',
        sdgs: [8, 12],
        text: {
            es: '¿La empresa paga a sus proveedores y cumple sus compromisos comerciales en los plazos acordados?',
            pt: 'A empresa paga seus fornecedores e cumpre seus compromissos comerciais nos prazos combinados?',
        },
    },
    {
        id: 'eco-4',
        dimension: 'economic',
        sdgs: [9],
        text: {
            es: '¿La empresa invierte en innovación, tecnología o mejora de sus procesos para mantenerse competitiva?',
            pt: 'A empresa investe em inovação, tecnologia ou melhoria dos seus processos para se manter competitiva?',
        },
    },
    {
        id: 'eco-5',
        dimension: 'economic',
        sdgs: [9, 17],
        text: {
            es: '¿La empresa conoce y aprovecha subsidios, fondos o programas de apoyo para proyectos sostenibles?',
            pt: 'A empresa conhece e aproveita subsídios, fundos ou programas de apoio para projetos sustentáveis?',
        },
    },
    // Gobernanza
    {
        id: 'gov-1',
        dimension: 'governance',
        sdgs: [16],
        text: {
            es: '¿La empresa tiene definidos su misión, visión y valores, y los da a conocer a su equipo?',
            pt: 'A empresa tem missão, visão e valores definidos e os divulga para sua equipe?',
        },
    },
    {
        id: 'gov-2',
        dimension: 'governance',
        sdgs: [16],
        text: {
            es: '¿La empresa cuenta con un canal para reportar de forma confidencial irregularidades o conductas inapropiadas?',
            pt: 'A empresa tem um canal para denunciar, de forma confidencial, irregularidades ou condutas inadequadas?',
        },
    },
    {
        id: 'gov-3',
        dimension: 'governance',
        sdgs: [8, 16],
        text: {
            es: '¿La empresa identifica y gestiona los riesgos que podrían afectar su continuidad, como financieros, legales u operacionales?',
            pt: 'A empresa identifica e gerencia os riscos que poderiam afetar sua continuidade, como financeiros, legais ou operacionais?',
        },
    },
    {
        id: 'gov-4',
        dimension: 'governance',
        sdgs: [16],
        text: {
            es: '¿La empresa lleva registros ordenados y verificables de su gestión, como contabilidad, documentos y procesos?',
            pt: 'A empresa mantém registros organizados e verificáveis da sua gestão, como contabilidade, documentos e processos?',
        },
    },
    {
        id: 'gov-5',
        dimension: 'governance',
        sdgs: [16],
        text: {
            es: '¿La empresa considera la opinión de sus trabajadores y clientes al tomar decisiones importantes?',
            pt: 'A empresa considera a opinião dos seus trabalhadores e clientes ao tomar decisões importantes?',
        },
    },
    // Preguntas por sector (no suman al puntaje de 0 a 60)
    {
        id: 'food-1',
        dimension: 'environmental',
        sector: 'food',
        sdgs: [12],
        text: {
            es: '¿La empresa controla las mermas o el desperdicio de alimentos?',
            pt: 'A empresa controla as perdas ou o desperdício de alimentos?',
        },
    },
    {
        id: 'food-2',
        dimension: 'governance',
        sector: 'food',
        sdgs: [3],
        text: {
            es: '¿La empresa aplica medidas de higiene e inocuidad en la elaboración?',
            pt: 'A empresa aplica medidas de higiene e segurança alimentar na produção?',
        },
    },
];

/** Perguntas pontuadas (as 20 gerais). */
export const scoredQuestions = questions.filter((q) => !q.sector);

// Uma recomendação por pergunta: quando a resposta é baixa (0 ou 1), a recomendação é sugerida.
// O ODS da recomendação é o ODS da pergunta, para não haver inconsistência.
export const recommendations: Recommendation[] = [
    {
        id: 'r-env-1',
        questionId: 'env-1',
        title: { es: 'Mapear los procesos de mayor impacto', pt: 'Mapear os processos de maior impacto' },
        description: {
            es: 'Haz una lista de tus procesos y marca cuáles usan más energía, agua o generan más residuos.',
            pt: 'Faça uma lista dos seus processos e marque quais usam mais energia, água ou geram mais resíduos.',
        },
    },
    {
        id: 'r-env-2',
        questionId: 'env-2',
        title: { es: 'Medir y reducir el consumo energético', pt: 'Medir e reduzir o consumo de energia' },
        description: {
            es: 'Registra el consumo mensual de la boleta de luz y cambia a iluminación LED donde sea posible.',
            pt: 'Registre o consumo mensal da conta de luz e troque para iluminação LED onde for possível.',
        },
    },
    {
        id: 'r-env-3',
        questionId: 'env-3',
        title: { es: 'Charla ambiental para el equipo', pt: 'Conversa ambiental com a equipe' },
        description: {
            es: 'Una reunión corta al semestre sobre reciclaje, ahorro de energía y buenas prácticas.',
            pt: 'Uma reunião curta por semestre sobre reciclagem, economia de energia e boas práticas.',
        },
    },
    {
        id: 'r-env-4',
        questionId: 'env-4',
        title: { es: 'Plan básico de emergencias', pt: 'Plano básico de emergências' },
        description: {
            es: 'Define qué hacer ante un incendio o derrame, quién avisa y dónde están los extintores.',
            pt: 'Defina o que fazer em caso de incêndio ou vazamento, quem avisa e onde ficam os extintores.',
        },
    },
    {
        id: 'r-env-5',
        questionId: 'env-5',
        title: { es: 'Estimar la huella de carbono', pt: 'Estimar a pegada de carbono' },
        description: {
            es: 'Usa una calculadora gratuita con tus datos de luz, gas y transporte para tener un primer número.',
            pt: 'Use uma calculadora gratuita com seus dados de luz, gás e transporte para ter um primeiro número.',
        },
    },
    {
        id: 'r-soc-1',
        questionId: 'soc-1',
        title: { es: 'Revisar contratos y jornadas', pt: 'Revisar contratos e jornadas' },
        description: {
            es: 'Verifica que todos tengan contrato vigente y que las horas trabajadas se registren.',
            pt: 'Verifique se todos têm contrato vigente e se as horas trabalhadas são registradas.',
        },
    },
    {
        id: 'r-soc-2',
        questionId: 'soc-2',
        title: { es: 'Protocolo contra el acoso', pt: 'Protocolo contra o assédio' },
        description: {
            es: 'Escribe un protocolo simple: cómo denunciar, quién recibe la denuncia y qué pasos siguen.',
            pt: 'Escreva um protocolo simples: como denunciar, quem recebe a denúncia e quais passos seguem.',
        },
    },
    {
        id: 'r-soc-3',
        questionId: 'soc-3',
        title: { es: 'Encuesta anual de clima laboral', pt: 'Pesquisa anual de clima organizacional' },
        description: {
            es: 'Cinco preguntas anónimas una vez al año para saber cómo se siente el equipo.',
            pt: 'Cinco perguntas anônimas uma vez por ano para saber como a equipe se sente.',
        },
    },
    {
        id: 'r-soc-4',
        questionId: 'soc-4',
        title: { es: 'Mapear los grupos de interés', pt: 'Mapear as partes interessadas' },
        description: {
            es: 'Anota quiénes son tus vecinos, clientes, proveedores y autoridades, y qué esperan de ti.',
            pt: 'Anote quem são seus vizinhos, clientes, fornecedores e autoridades, e o que esperam de você.',
        },
    },
    {
        id: 'r-soc-5',
        questionId: 'soc-5',
        title: { es: 'Planificar una actividad con la comunidad', pt: 'Planejar uma atividade com a comunidade' },
        description: {
            es: 'Ofrece una práctica, una charla en un colegio o una donación a una organización del barrio.',
            pt: 'Ofereça um estágio, uma palestra numa escola ou uma doação a uma organização do bairro.',
        },
    },
    {
        id: 'r-eco-1',
        questionId: 'eco-1',
        title: { es: 'Revisión financiera trimestral', pt: 'Revisão financeira trimestral' },
        description: {
            es: 'Cada tres meses, compara ingresos, gastos y deudas, y anota una decisión para el próximo período.',
            pt: 'A cada três meses, compare receitas, despesas e dívidas, e anote uma decisão para o próximo período.',
        },
    },
    {
        id: 'r-eco-2',
        questionId: 'eco-2',
        title: { es: 'Diversificar clientes o productos', pt: 'Diversificar clientes ou produtos' },
        description: {
            es: 'Identifica qué porcentaje de tus ventas viene de tu principal cliente y busca una nueva fuente.',
            pt: 'Identifique qual porcentagem das suas vendas vem do seu principal cliente e busque uma nova fonte.',
        },
    },
    {
        id: 'r-eco-3',
        questionId: 'eco-3',
        title: { es: 'Calendario de pagos a proveedores', pt: 'Calendário de pagamentos a fornecedores' },
        description: {
            es: 'Registra las fechas de pago acordadas y revisa cada semana que se cumplan.',
            pt: 'Registre as datas de pagamento combinadas e confira toda semana se estão sendo cumpridas.',
        },
    },
    {
        id: 'r-eco-4',
        questionId: 'eco-4',
        title: { es: 'Una mejora de proceso por semestre', pt: 'Uma melhoria de processo por semestre' },
        description: {
            es: 'Elige un proceso lento o costoso y prueba una mejora concreta, aunque sea pequeña.',
            pt: 'Escolha um processo lento ou caro e teste uma melhoria concreta, mesmo que pequena.',
        },
    },
    {
        id: 'r-eco-5',
        questionId: 'eco-5',
        title: { es: 'Buscar fondos de apoyo', pt: 'Buscar fundos de apoio' },
        description: {
            es: 'Revisa los programas de Sercotec, Corfo o tu municipio para proyectos sostenibles.',
            pt: 'Consulte os programas da Sercotec, Corfo ou do seu município para projetos sustentáveis.',
        },
    },
    {
        id: 'r-gov-1',
        questionId: 'gov-1',
        title: { es: 'Escribir misión, visión y valores', pt: 'Escrever missão, visão e valores' },
        description: {
            es: 'Una página con el propósito de la empresa y tres valores, compartida con todo el equipo.',
            pt: 'Uma página com o propósito da empresa e três valores, compartilhada com toda a equipe.',
        },
    },
    {
        id: 'r-gov-2',
        questionId: 'gov-2',
        title: { es: 'Crear un código de conducta básico', pt: 'Criar um código de conduta básico' },
        description: {
            es: 'Define reglas de conducta y un canal confidencial para reportar irregularidades.',
            pt: 'Defina regras de conduta e um canal confidencial para denunciar irregularidades.',
        },
    },
    {
        id: 'r-gov-3',
        questionId: 'gov-3',
        title: { es: 'Lista de riesgos principales', pt: 'Lista dos principais riscos' },
        description: {
            es: 'Anota los cinco riesgos que más afectarían a tu negocio y qué harías ante cada uno.',
            pt: 'Anote os cinco riscos que mais afetariam seu negócio e o que você faria diante de cada um.',
        },
    },
    {
        id: 'r-gov-4',
        questionId: 'gov-4',
        title: { es: 'Ordenar los registros de gestión', pt: 'Organizar os registros de gestão' },
        description: {
            es: 'Guarda contabilidad, contratos y procedimientos en un solo lugar, con respaldo digital.',
            pt: 'Guarde contabilidade, contratos e procedimentos num só lugar, com cópia digital.',
        },
    },
    {
        id: 'r-gov-5',
        questionId: 'gov-5',
        title: { es: 'Consultar al equipo y a los clientes', pt: 'Consultar a equipe e os clientes' },
        description: {
            es: 'Antes de una decisión importante, pide la opinión de trabajadores y clientes frecuentes.',
            pt: 'Antes de uma decisão importante, peça a opinião dos trabalhadores e clientes frequentes.',
        },
    },
    {
        id: 'r-food-1',
        questionId: 'food-1',
        title: { es: 'Registrar las mermas diarias', pt: 'Registrar as perdas diárias' },
        description: {
            es: 'Anota lo que se bota cada día y ajusta la producción o dona lo que aún sirve.',
            pt: 'Anote o que é descartado a cada dia e ajuste a produção ou doe o que ainda serve.',
        },
    },
    {
        id: 'r-food-2',
        questionId: 'food-2',
        title: { es: 'Checklist de higiene e inocuidad', pt: 'Checklist de higiene e segurança alimentar' },
        description: {
            es: 'Una lista diaria de limpieza, temperaturas y manipulación de alimentos.',
            pt: 'Uma lista diária de limpeza, temperaturas e manipulação de alimentos.',
        },
    },
];

// Rota sustentável: metas por nível que a empresa marca como cumpridas.
export const pathGoals: PathGoal[] = [
    {
        id: 'g1-env',
        level: 1,
        dimension: 'environmental',
        title: { es: 'Conocer el consumo mensual de luz y agua', pt: 'Conhecer o consumo mensal de luz e água' },
    },
    {
        id: 'g1-soc',
        level: 1,
        dimension: 'social',
        title: { es: 'Todos los trabajadores con contrato al día', pt: 'Todos os trabalhadores com contrato em dia' },
    },
    {
        id: 'g1-eco',
        level: 1,
        dimension: 'economic',
        title: { es: 'Separar las cuentas personales de las de la empresa', pt: 'Separar as contas pessoais das contas da empresa' },
    },
    { id: 'g1-gov', level: 1, dimension: 'governance', title: { es: 'Misión y valores escritos', pt: 'Missão e valores escritos' } },
    {
        id: 'g2-env',
        level: 2,
        dimension: 'environmental',
        title: { es: 'Separar y reciclar los residuos principales', pt: 'Separar e reciclar os principais resíduos' },
    },
    {
        id: 'g2-soc',
        level: 2,
        dimension: 'social',
        title: { es: 'Una actividad al año con la comunidad', pt: 'Uma atividade por ano com a comunidade' },
    },
    { id: 'g2-eco', level: 2, dimension: 'economic', title: { es: 'Revisión financiera cada trimestre', pt: 'Revisão financeira a cada trimestre' } },
    {
        id: 'g2-gov',
        level: 2,
        dimension: 'governance',
        title: { es: 'Código de conducta compartido con el equipo', pt: 'Código de conduta compartilhado com a equipe' },
    },
    {
        id: 'g3-env',
        level: 3,
        dimension: 'environmental',
        title: { es: 'Meta anual de reducción de huella de carbono', pt: 'Meta anual de redução da pegada de carbono' },
    },
    {
        id: 'g3-soc',
        level: 3,
        dimension: 'social',
        title: { es: 'Encuesta de clima laboral con plan de mejora', pt: 'Pesquisa de clima com plano de melhoria' },
    },
    {
        id: 'g3-eco',
        level: 3,
        dimension: 'economic',
        title: { es: 'Postular a un fondo para un proyecto sostenible', pt: 'Concorrer a um fundo para um projeto sustentável' },
    },
    {
        id: 'g3-gov',
        level: 3,
        dimension: 'governance',
        title: { es: 'Gestión de riesgos revisada cada año', pt: 'Gestão de riscos revisada todo ano' },
    },
];

// Os 17 ODS, com explicação em linguagem simples para uma pequena empresa (página Explorar).
export const sdgs: SdgInfo[] = [
    {
        number: 1,
        title: { es: 'Fin de la pobreza', pt: 'Erradicação da pobreza' },
        description: {
            es: 'Ofrecer empleos estables y comprar a proveedores locales ayuda a que más familias salgan de la pobreza.',
            pt: 'Oferecer empregos estáveis e comprar de fornecedores locais ajuda mais famílias a sair da pobreza.',
        },
    },
    {
        number: 2,
        title: { es: 'Hambre cero', pt: 'Fome zero e agricultura sustentável' },
        description: {
            es: 'Evitar el desperdicio de alimentos y apoyar a productores locales y sostenibles.',
            pt: 'Evitar o desperdício de alimentos e apoiar produtores locais e sustentáveis.',
        },
    },
    {
        number: 3,
        title: { es: 'Salud y bienestar', pt: 'Saúde e bem-estar' },
        description: {
            es: 'Cuidar la salud de quienes trabajan en la empresa y de quienes consumen sus productos.',
            pt: 'Cuidar da saúde de quem trabalha na empresa e de quem consome seus produtos.',
        },
    },
    {
        number: 4,
        title: { es: 'Educación de calidad', pt: 'Educação de qualidade' },
        description: {
            es: 'Capacitar al equipo y colaborar con la formación de jóvenes de la zona.',
            pt: 'Capacitar a equipe e colaborar com a formação de jovens da região.',
        },
    },
    {
        number: 5,
        title: { es: 'Igualdad de género', pt: 'Igualdade de gênero' },
        description: {
            es: 'Mismas oportunidades y un trato respetuoso para todas las personas.',
            pt: 'Mesmas oportunidades e tratamento respeitoso para todas as pessoas.',
        },
    },
    {
        number: 6,
        title: { es: 'Agua limpia y saneamiento', pt: 'Água potável e saneamento' },
        description: {
            es: 'Usar el agua con cuidado y no contaminarla con los residuos del negocio.',
            pt: 'Usar a água com cuidado e não contaminá-la com os resíduos do negócio.',
        },
    },
    {
        number: 7,
        title: { es: 'Energía asequible y no contaminante', pt: 'Energia limpa e acessível' },
        description: {
            es: 'Usar menos energía y, cuando se pueda, que sea de fuentes limpias.',
            pt: 'Usar menos energia e, quando possível, de fontes limpas.',
        },
    },
    {
        number: 8,
        title: { es: 'Trabajo decente y crecimiento económico', pt: 'Trabalho decente e crescimento econômico' },
        description: {
            es: 'Empleos formales, pagos al día y un negocio que se sostiene en el tiempo.',
            pt: 'Empregos formais, pagamentos em dia e um negócio que se sustenta ao longo do tempo.',
        },
    },
    {
        number: 9,
        title: { es: 'Industria, innovación e infraestructura', pt: 'Indústria, inovação e infraestrutura' },
        description: {
            es: 'Mejorar procesos y adoptar tecnología para ser más eficiente.',
            pt: 'Melhorar processos e adotar tecnologia para ser mais eficiente.',
        },
    },
    {
        number: 10,
        title: { es: 'Reducción de las desigualdades', pt: 'Redução das desigualdades' },
        description: {
            es: 'Dar las mismas oportunidades de trabajo a todas las personas, sin importar su origen, edad o discapacidad.',
            pt: 'Dar as mesmas oportunidades de trabalho a todas as pessoas, independentemente de origem, idade ou deficiência.',
        },
    },
    {
        number: 11,
        title: { es: 'Ciudades y comunidades sostenibles', pt: 'Cidades e comunidades sustentáveis' },
        description: { es: 'Ser un buen vecino y aportar a la vida del barrio.', pt: 'Ser um bom vizinho e contribuir com a vida do bairro.' },
    },
    {
        number: 12,
        title: { es: 'Producción y consumo responsables', pt: 'Consumo e produção responsáveis' },
        description: {
            es: 'Producir con menos desperdicio y aprovechar mejor los materiales.',
            pt: 'Produzir com menos desperdício e aproveitar melhor os materiais.',
        },
    },
    {
        number: 13,
        title: { es: 'Acción por el clima', pt: 'Ação contra a mudança global do clima' },
        description: { es: 'Conocer y reducir las emisiones que genera el negocio.', pt: 'Conhecer e reduzir as emissões geradas pelo negócio.' },
    },
    {
        number: 14,
        title: { es: 'Vida submarina', pt: 'Vida na água' },
        description: {
            es: 'Reducir los plásticos de un solo uso y evitar que los residuos lleguen a ríos y al mar.',
            pt: 'Reduzir plásticos descartáveis e evitar que os resíduos cheguem aos rios e ao mar.',
        },
    },
    {
        number: 15,
        title: { es: 'Vida de ecosistemas terrestres', pt: 'Vida terrestre' },
        description: {
            es: 'Preferir materiales de origen responsable y cuidar las áreas verdes del entorno.',
            pt: 'Preferir materiais de origem responsável e cuidar das áreas verdes do entorno.',
        },
    },
    {
        number: 16,
        title: { es: 'Paz, justicia e instituciones sólidas', pt: 'Paz, justiça e instituições eficazes' },
        description: {
            es: 'Gestión transparente, reglas claras y canales para reportar problemas.',
            pt: 'Gestão transparente, regras claras e canais para relatar problemas.',
        },
    },
    {
        number: 17,
        title: { es: 'Alianzas para lograr los objetivos', pt: 'Parcerias e meios de implementação' },
        description: {
            es: 'Trabajar junto a otras organizaciones, colegios y programas de apoyo.',
            pt: 'Trabalhar junto com outras organizações, escolas e programas de apoio.',
        },
    },
];
