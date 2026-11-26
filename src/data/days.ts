import type { ItineraryDay } from '../types';

export const INITIAL_DAYS: ItineraryDay[] = [
  {
    date: '2026-12-03',
    shortLabel: '03/12',
    weekday: 'Qui',
    title: 'Chegada em São Paulo (GRU)',
    badge: 'Chegada',
    regionFocus: 'Guarulhos → Vila Mariana / Paulista',
    summary: 'Desembarque no Aeroporto Internacional de Guarulhos (GRU) às 23h50 e deslocamento até São Paulo.',
    smartAlert: {
      type: 'warning',
      title: 'Janela logística: Pouso (23h50) vs. Check-in Airbnb (04/12 às 15h)',
      message:
        'Há um intervalo de ~15h entre o pouso em GRU e a entrada no apartamento da Vila Mariana. Caso fiquem perto da Av. Paulista na 1ª noite, Méqui 1000 e Padaria Bella Paulista funcionam 24h.',
    },
  },
  {
    date: '2026-12-04',
    shortLabel: '04/12',
    weekday: 'Sex',
    title: 'Dia Livre / Check-in Airbnb',
    badge: 'Dia Livre',
    regionFocus: 'Vila Mariana (Base Oficial)',
    summary:
      'Dia livre e flexível para o grupo descansar do voo, acomodar as malas ou fazer passeios leves por conta própria.',
    smartAlert: {
      type: 'info',
      title: 'Dia Livre para o Grupo',
      message:
        'Nenhuma atração obrigatória do grupo está travada hoje. Confira sugestões perto de casa (Vila Mariana, Moema e Ibirapuera) na aba Explorar.',
    },
  },
  {
    date: '2026-12-05',
    shortLabel: '05/12',
    weekday: 'Sáb',
    title: 'CCXP26 (Dia 1 — Abertura) + Noite na Paulista',
    badge: 'CCXP26',
    regionFocus: 'São Paulo Expo → Av. Paulista',
    summary:
      'Entrada cedo na abertura da CCXP26 para garantir os brindes mais disputados e agendamentos, seguida de jantar e madrugada na Av. Paulista.',
  },
  {
    date: '2026-12-06',
    shortLabel: '06/12',
    weekday: 'Dom',
    title: 'Feira da Liberdade + Ibira + CCXP26 (Dia 2) + Santo Mar',
    badge: 'CCXP26',
    regionFocus: 'Liberdade + Ibirapuera → CCXP26 → Tatuapé',
    summary:
      'Dupla obrigatória de fim de semana pela manhã, tarde no 2º dia de CCXP26 e rodízio de frutos do mar no Santo Mar à noite.',
  },
  {
    date: '2026-12-07',
    shortLabel: '07/12',
    weekday: 'Seg',
    title: 'Combo Bichos + Cinema 1 (IMAX) + Joakin’s',
    badge: 'Roteiro em Grupo',
    regionFocus: 'Água Funda + Ipiranga → Vila Olímpia / Itaim',
    summary:
      'Zoológico, Jardim Botânico e Aquário aproveitando a tarifa reduzida de segunda-feira, seguidos de shopping, sessão IMAX with Laser e madrugada no Joakin’s.',
    smartAlert: {
      type: 'timeline',
      title: 'Semáforo de Horário — Combo Bichos (Fecham às 17h)',
      message:
        'Metas recomendadas: 09h00 Zoológico (última entrada 16h) → 11h45 Transfer interno para o Jardim Botânico → 13h45 Uber para o Aquário de SP (fecha 17h).',
    },
  },
  {
    date: '2026-12-08',
    shortLabel: '08/12',
    weekday: 'Ter',
    title: 'MASP + Mata Città + Roda Rico (Tardezinha) + Cinema 2 (VIP)',
    badge: 'Roteiro em Grupo',
    regionFocus: 'Av. Paulista → Villa-Lobos → Pinheiros / JK Iguatemi',
    summary:
      'Manhã cultural gratuita no MASP e almoço no Mata Città, pôr do sol na Roda Rico no Villa-Lobos, Quiz&Show e sessão Sala VIP no Cinépolis JK.',
  },
  {
    date: '2026-12-09',
    shortLabel: '09/12',
    weekday: 'Qua',
    title: 'Lojinhas (Liberdade + Bom Retiro) + Churrasco Coreano + Bario Bar',
    badge: 'Roteiro em Grupo',
    regionFocus: 'Liberdade → Bom Retiro → Cho Sun Gal Bi → Bario Bar Santo Amaro',
    summary:
      'Dia de explorar as galerias da Liberdade e o Bom Retiro, jantar cedo no Churrasco Coreano (Cho Sun Gal Bi) e fechar a noite na maior unidade do Bario Bar (Santo Amaro, 1.500 m²).',
    smartAlert: {
      type: 'warning',
      title: 'Horário do Bom Retiro à Tarde',
      message:
        'Os restaurantes coreanos tradicionais do Bom Retiro (Il Mi Jeong / Kyong Mi Jeong) fecham às 14h30 e só reabrem às 17h. Foque nas lojinhas coreanas e no Supermercado Otugui (soju/snacks) para guardar apetite para o rodízio no Cho Sun Gal Bi às 18h30.',
    },
  },
  {
    date: '2026-12-10',
    shortLabel: '10/12',
    weekday: 'Qui',
    title: 'Dia Livre / Retorno (Aeroporto GRU)',
    badge: 'Dia Livre',
    regionFocus: 'Vila Mariana → Aeroporto Guarulhos (GRU)',
    summary:
      'Dia livre para organizar malas, fazer compras finais ou passeios próximos antes do check-out e ida para o Aeroporto de Guarulhos.',
    smartAlert: {
      type: 'info',
      title: 'Dia Livre / Retorno',
      message:
        'Turno livre antes do embarque de volta. Calcule pelo menos 1h de deslocamento até GRU (30,4 km da Vila Mariana) considerando o trânsito de quinta-feira.',
    },
  },
];
