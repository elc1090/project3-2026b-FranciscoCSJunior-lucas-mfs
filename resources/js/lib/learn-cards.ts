// Conteúdo informativo do Início, pedido pela equipe do Chile. Só leitura: não entra na nota.
import type { DimensionKey, Localized } from '@/types/sostenpyme';

export interface LearnPoint {
    title: Localized;
    text: Localized;
    dimension?: DimensionKey;
}

export interface LearnCard {
    id: string;
    dimension: DimensionKey;
    topic: Localized;
    title: Localized;
    intro: Localized;
    points: LearnPoint[];
    /** Caixa de destaque no fim do card (exemplo, lei, dica). */
    highlight?: { label: Localized; text: Localized };
}

export const learnCards: LearnCard[] = [
    {
        id: 'ethics',
        dimension: 'social',
        topic: { es: 'Ética', pt: 'Ética' },
        title: { es: 'Ética, competitividad y colaboración', pt: 'Ética, competitividade e colaboração' },
        intro: {
            es: 'Una empresa ética cuida a su gente, y eso se nota en los resultados. La ética no es solo cumplir la ley: es cómo se trata al equipo todos los días.',
            pt: 'Uma empresa ética cuida das pessoas, e isso aparece nos resultados. Ética não é só cumprir a lei: é como a equipe é tratada todos os dias.',
        },
        points: [
            {
                title: { es: 'Satisfacción laboral', pt: 'Satisfação no trabalho' },
                text: {
                    es: 'Quien se siente respetado y escuchado trabaja mejor y se queda más tiempo en la empresa.',
                    pt: 'Quem se sente respeitado e ouvido trabalha melhor e fica mais tempo na empresa.',
                },
            },
            {
                title: { es: 'Desempeño', pt: 'Desempenho' },
                text: {
                    es: 'Reglas claras y un trato justo ayudan a que cada persona rinda lo mejor de sí.',
                    pt: 'Regras claras e tratamento justo ajudam cada pessoa a render o seu melhor.',
                },
            },
            {
                title: { es: 'Colaboración', pt: 'Colaboração' },
                text: {
                    es: 'Compartir información y apoyarse entre áreas resuelve los problemas más rápido.',
                    pt: 'Compartilhar informação e se apoiar entre áreas resolve os problemas mais rápido.',
                },
            },
            {
                title: { es: 'Compromiso organizacional', pt: 'Comprometimento organizacional' },
                text: {
                    es: 'Cuando el equipo cree en los valores de la empresa, los defiende frente a clientes y proveedores.',
                    pt: 'Quando a equipe acredita nos valores da empresa, defende esses valores diante de clientes e fornecedores.',
                },
            },
        ],
        highlight: {
            label: { es: 'Ejemplo ilustrativo (caso ficticio)', pt: 'Exemplo ilustrativo (caso fictício)' },
            text: {
                es: 'Imagina una pyme premiada como una de las empresas más sostenibles de América Latina. Además de medir su huella, escucha a su equipo cada semestre y comparte lo que cambió. Ese reconocimiento le abre puertas con clientes que buscan proveedores responsables.',
                pt: 'Imagine uma pequena empresa premiada como uma das mais sustentáveis da América Latina. Além de medir sua pegada, ela ouve a equipe a cada semestre e mostra o que mudou. Esse reconhecimento abre portas com clientes que procuram fornecedores responsáveis.',
            },
        },
    },
    {
        id: 'strategy',
        dimension: 'economic',
        topic: { es: 'Estrategia', pt: 'Estratégia' },
        title: {
            es: '¿Cómo integrar la sostenibilidad en la estrategia del negocio?',
            pt: 'Como integrar a sustentabilidade na estratégia do negócio?',
        },
        intro: {
            es: 'Los pilares de la sostenibilidad se traducen en tres resultados concretos para la empresa: personas, planeta y ganancias.',
            pt: 'Os pilares da sustentabilidade viram três resultados concretos para a empresa: pessoas, planeta e lucro.',
        },
        points: [
            {
                dimension: 'social',
                title: { es: 'Personas', pt: 'Pessoas' },
                text: {
                    es: 'El resultado social: un equipo, clientes y una comunidad que confían en la empresa.',
                    pt: 'O resultado social: equipe, clientes e comunidade que confiam na empresa.',
                },
            },
            {
                dimension: 'environmental',
                title: { es: 'Planeta', pt: 'Planeta' },
                text: {
                    es: 'El resultado ambiental: menos residuos, menos emisiones y menos consumo de recursos.',
                    pt: 'O resultado ambiental: menos resíduos, menos emissões e menos consumo de recursos.',
                },
            },
            {
                dimension: 'economic',
                title: { es: 'Ganancias', pt: 'Lucro' },
                text: {
                    es: 'El resultado económico: más ingresos o menores costos. Las dos cosas mejoran la ganancia.',
                    pt: 'O resultado econômico: mais receita ou menos custos. As duas coisas aumentam o lucro.',
                },
            },
        ],
        highlight: {
            label: { es: '¿Por qué ahora?', pt: 'Por que agora?' },
            text: {
                es: 'Una empresa que se queda atrás puede enfrentar cuestionamientos de clientes, de la comunidad o de las autoridades por sus prácticas productivas. Incluir la sostenibilidad en la estrategia permite anticiparse y responder con hechos.',
                pt: 'Uma empresa que fica para trás pode ser questionada por clientes, pela comunidade ou pelas autoridades por suas práticas de produção. Incluir a sustentabilidade na estratégia permite se antecipar e responder com fatos.',
            },
        },
    },
    {
        id: 'social',
        dimension: 'social',
        topic: { es: 'Beneficios sociales', pt: 'Benefícios sociais' },
        title: { es: 'Una empresa más justa e inclusiva', pt: 'Uma empresa mais justa e inclusiva' },
        intro: {
            es: 'La sostenibilidad también se mide en cómo la empresa trata a las personas, dentro y fuera de ella.',
            pt: 'A sustentabilidade também se mede pela forma como a empresa trata as pessoas, dentro e fora dela.',
        },
        points: [
            {
                title: { es: 'Empleo e inclusión', pt: 'Emprego e inclusão' },
                text: {
                    es: 'Generar empleo, también para personal especializado, y abrir espacio a personas que suelen quedar fuera.',
                    pt: 'Gerar emprego, inclusive para pessoal especializado, e abrir espaço para pessoas que costumam ficar de fora.',
                },
            },
            {
                title: { es: 'Igualdad', pt: 'Igualdade' },
                text: {
                    es: 'Promover la igualdad de género y la diversidad: hombres y mujeres pueden cumplir las mismas funciones.',
                    pt: 'Promover a igualdade de gênero e a diversidade: homens e mulheres podem exercer as mesmas funções.',
                },
            },
        ],
        highlight: {
            label: { es: 'Ley Karin (Ley 21.643, Chile)', pt: 'Lei Karin (Lei 21.643, Chile)' },
            text: {
                es: 'Vigente desde agosto de 2024, obliga a las empresas a prevenir, investigar y sancionar el acoso laboral, el acoso sexual y la violencia en el trabajo. Basta una sola conducta: ya no se exige que el acoso se repita. En Brasil, la Ley 14.457/2022 obliga a las empresas con CIPA a adoptar medidas contra el acoso, pero el acoso moral no tiene una ley general y, en los tribunales, suele exigir conductas repetidas.',
                pt: 'Em vigor desde agosto de 2024, obriga as empresas a prevenir, investigar e punir o assédio moral, o assédio sexual e a violência no trabalho. Basta uma única conduta: não é mais preciso que o assédio se repita. No Brasil, a Lei 14.457/2022 obriga empresas com CIPA a adotar medidas contra o assédio, mas o assédio moral não tem uma lei geral e, nos tribunais, costuma exigir condutas repetidas.',
            },
        },
    },
    {
        id: 'environmental',
        dimension: 'environmental',
        topic: { es: 'Beneficios ambientales', pt: 'Benefícios ambientais' },
        title: { es: 'Preservar el medio ambiente', pt: 'Preservar o meio ambiente' },
        intro: {
            es: 'Conservar los recursos naturales protege los lugares de los que dependen las comunidades, el turismo y la economía local.',
            pt: 'Conservar os recursos naturais protege os lugares dos quais dependem as comunidades, o turismo e a economia local.',
        },
        points: [
            {
                title: { es: 'Parque Nacional Bosque Fray Jorge (Chile)', pt: 'Parque Nacional Bosque Fray Jorge (Chile)' },
                text: {
                    es: 'Un bosque que sobrevive en plena zona semiárida gracias a la neblina costera. Es Reserva de la Biosfera de la UNESCO.',
                    pt: 'Uma floresta que sobrevive em plena região semiárida graças à neblina costeira. É Reserva da Biosfera da UNESCO.',
                },
            },
            {
                title: { es: 'Cielos de Tololo (Chile)', pt: 'Céu de Tololo (Chile)' },
                text: {
                    es: 'Los observatorios de la región necesitan cielos oscuros. Reducir la contaminación lumínica protege ese cielo y también ahorra energía.',
                    pt: 'Os observatórios da região precisam de céu escuro. Reduzir a poluição luminosa protege esse céu e ainda economiza energia.',
                },
            },
            {
                title: { es: 'Amazonía (Brasil)', pt: 'Amazônia (Brasil)' },
                text: {
                    es: 'El bosque tropical más grande del mundo ayuda a regular el clima y las lluvias de gran parte de América del Sur.',
                    pt: 'A maior floresta tropical do mundo ajuda a regular o clima e as chuvas de boa parte da América do Sul.',
                },
            },
        ],
    },
    {
        id: 'economic',
        dimension: 'economic',
        topic: { es: 'Beneficios económicos', pt: 'Benefícios econômicos' },
        title: { es: 'Gastar menos, desperdiciar menos', pt: 'Gastar menos, desperdiçar menos' },
        intro: {
            es: 'Cuidar los recursos es también cuidar el bolsillo de la empresa.',
            pt: 'Cuidar dos recursos também é cuidar do caixa da empresa.',
        },
        points: [
            {
                title: { es: 'Uso eficiente de recursos', pt: 'Uso eficiente de recursos' },
                text: {
                    es: 'Usar mejor la energía, el agua y los materiales baja las cuentas todos los meses.',
                    pt: 'Usar melhor a energia, a água e os materiais reduz as contas todos os meses.',
                },
            },
            {
                title: { es: 'Menos desperdicio', pt: 'Menos desperdício' },
                text: {
                    es: 'Medir lo que se pierde (mermas, sobras, embalajes) muestra dónde ahorrar primero.',
                    pt: 'Medir o que se perde (sobras, quebras, embalagens) mostra onde economizar primeiro.',
                },
            },
        ],
        highlight: {
            label: { es: 'Idea práctica: reutilizar el agua', pt: 'Ideia prática: reaproveitar a água' },
            text: {
                es: 'El agua de la lavadora, del lavaplatos y de la ducha (aguas grises) puede reutilizarse para regar plantas. Conviene usar detergentes biodegradables.',
                pt: 'A água da máquina de lavar, da pia e do chuveiro (águas cinzas) pode ser reaproveitada para regar plantas. Vale usar detergentes biodegradáveis.',
            },
        },
    },
    {
        id: 'governance',
        dimension: 'governance',
        topic: { es: 'Gobernanza', pt: 'Governança' },
        title: { es: 'La sostenibilidad como valor agregado', pt: 'A sustentabilidade como valor agregado' },
        intro: {
            es: 'Las empresas que reportan sus prácticas ambientales, sociales y de gobernanza (ESG) suelen operar de forma más sustentable, ganar rentabilidad y aumentar su valor de mercado con el tiempo.',
            pt: 'As empresas que relatam suas práticas ambientais, sociais e de governança (ESG) costumam operar de forma mais sustentável, ganhar rentabilidade e aumentar seu valor de mercado com o tempo.',
        },
        points: [
            {
                title: { es: 'Transparencia', pt: 'Transparência' },
                text: {
                    es: 'Medir y contar lo que se hace genera confianza en clientes, bancos e inversionistas.',
                    pt: 'Medir e mostrar o que é feito gera confiança em clientes, bancos e investidores.',
                },
            },
            {
                title: { es: 'Reglas claras', pt: 'Regras claras' },
                text: {
                    es: 'Responsables definidos, metas y rendición de cuentas hacen que las decisiones se cumplan.',
                    pt: 'Responsáveis definidos, metas e prestação de contas fazem as decisões saírem do papel.',
                },
            },
            {
                title: { es: 'Valor de largo plazo', pt: 'Valor de longo prazo' },
                text: {
                    es: 'La rentabilidad basada en los tres pilares también contribuye al bienestar de las comunidades y de las generaciones futuras.',
                    pt: 'A rentabilidade baseada nos três pilares também contribui para o bem-estar das comunidades e das gerações futuras.',
                },
            },
        ],
    },
];
