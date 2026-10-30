/**
 * ==========================================================================
 * Aplicação de Consulta de Preço da Tabela FIPE utilizando BrasilAPI
 * Arquivo: FipeApi.js
 * 
 * Permite buscar tanto pelo NOME DO VEÍCULO (ex: Civic, Gol, Corolla, Onix)
 * quanto pelo CÓDIGO FIPE (ex: 005275-2), consultando a BrasilAPI em tempo real.
 * ==========================================================================
 */

// Constantes de Configuração
const BRASIL_API_BASE_URL = 'https://brasilapi.com.br/api/fipe'; // https://brasilapi.com.br/fipe/marcas/v1
const TIMEOUT_MS = 15000;
const STORAGE_KEY = 'fipe_recent_searches_v2';

/**
 * Catálogo completo de veículos populares e suas respectivas versões
 * mapeados para seus códigos oficiais da Tabela FIPE.
 * Permite busca instantânea por nome, modelo, marca ou palavras-chave.
 */
const VEHICLES_DATABASE = [
  // Volkswagen
  { marca: 'VW - VolksWagen', nome: 'Gol 1.0 Total Flex', fipe: '005275-2', keywords: ['gol', 'volkswagen', 'vw', 'totalflex', '1.0'] },
  { marca: 'VW - VolksWagen', nome: 'Gol 1.6 Total Flex', fipe: '005276-0', keywords: ['gol', 'volkswagen', 'vw', '1.6'] },
  { marca: 'VW - VolksWagen', nome: 'Polo 1.0 Flex', fipe: '005489-5', keywords: ['polo', 'volkswagen', 'vw', 'hatch'] },
  { marca: 'VW - VolksWagen', nome: 'Polo Track 1.0 Flex', fipe: '005537-9', keywords: ['polo', 'track', 'volkswagen', 'vw', '1.0'] },
  { marca: 'VW - VolksWagen', nome: 'T-Cross 200 TSI 1.0 Turbo', fipe: '005504-2', keywords: ['tcross', 't-cross', 'suv', 'volkswagen', 'tsi'] },
  { marca: 'VW - VolksWagen', nome: 'Nivus Comfortline 200 TSI', fipe: '005517-4', keywords: ['nivus', 'suv', 'volkswagen', 'vw', 'tsi'] },
  { marca: 'VW - VolksWagen', nome: 'Fox 1.0 Total Flex', fipe: '005202-7', keywords: ['fox', 'volkswagen', 'vw', '1.0'] },
  { marca: 'VW - VolksWagen', nome: 'Voyage 1.0 Total Flex', fipe: '005282-5', keywords: ['voyage', 'sedan', 'volkswagen', 'vw'] },
  { marca: 'VW - VolksWagen', nome: 'Saveiro 1.6 Total Flex', fipe: '005284-1', keywords: ['saveiro', 'picape', 'pickup', 'volkswagen'] },
  { marca: 'VW - VolksWagen', nome: 'Golf 1.4 TSI', fipe: '005374-0', keywords: ['golf', 'tsi', 'volkswagen', 'hatch'] },
  { marca: 'VW - VolksWagen', nome: 'Amarok Highline 2.0 TDI', fipe: '005340-6', keywords: ['amarok', 'picape', 'diesel', 'volkswagen'] },

  // Honda
  { marca: 'Honda', nome: 'Civic Sedan EXR 2.0 Flex', fipe: '014079-0', keywords: ['civic', 'honda', 'sedan', 'exr', '2.0'] },
  { marca: 'Honda', nome: 'Civic Sedan LXR 2.0 Flex', fipe: '014088-0', keywords: ['civic', 'honda', 'sedan', 'lxr'] },
  { marca: 'Honda', nome: 'Civic Touring 1.5 Turbo', fipe: '014109-4', keywords: ['civic', 'touring', 'turbo', 'honda', '1.5'] },
  { marca: 'Honda', nome: 'Fit LXL 1.4 Flex', fipe: '014041-4', keywords: ['fit', 'honda', '1.4', 'lxl'] },
  { marca: 'Honda', nome: 'Fit Twist 1.5 Flex', fipe: '014073-2', keywords: ['fit', 'twist', 'honda', '1.5'] },
  { marca: 'Honda', nome: 'City Sedan LX 1.5 Flex', fipe: '014064-3', keywords: ['city', 'sedan', 'honda', '1.5'] },
  { marca: 'Honda', nome: 'HR-V EXL 1.8 Flex', fipe: '014085-6', keywords: ['hrv', 'hr-v', 'suv', 'honda', 'exl'] },

  // Toyota
  { marca: 'Toyota', nome: 'Corolla XEi 2.0 Flex Aut.', fipe: '002111-3', keywords: ['corolla', 'toyota', 'xei', 'sedan', '2.0'] },
  { marca: 'Toyota', nome: 'Corolla GLi 1.8 Flex Aut.', fipe: '002109-1', keywords: ['corolla', 'gli', 'toyota', '1.8'] },
  { marca: 'Toyota', nome: 'Corolla Altis 1.8 Híbrido', fipe: '002190-3', keywords: ['corolla', 'altis', 'hibrido', 'hybrid', 'toyota'] },
  { marca: 'Toyota', nome: 'Corolla Cross XRE 2.0 Flex', fipe: '002198-9', keywords: ['corolla cross', 'suv', 'toyota', 'xre'] },
  { marca: 'Toyota', nome: 'Hilux CD SRV 2.8 4x4 Diesel', fipe: '002162-8', keywords: ['hilux', 'picape', 'pickup', 'diesel', 'toyota', 'srv'] },
  { marca: 'Toyota', nome: 'Yaris Hatch XL 1.3 Flex', fipe: '002174-1', keywords: ['yaris', 'toyota', 'hatch', '1.3'] },
  { marca: 'Toyota', nome: 'Etios Hatch 1.3 X Flex', fipe: '002127-0', keywords: ['etios', 'toyota', 'hatch', '1.3'] },

  // Chevrolet (GM)
  { marca: 'GM - Chevrolet', nome: 'Onix Hatch LTZ 1.4 Flex', fipe: '004439-3', keywords: ['onix', 'chevrolet', 'gm', 'ltz', '1.4'] },
  { marca: 'GM - Chevrolet', nome: 'Onix Hatch LT 1.0 Flex', fipe: '004517-9', keywords: ['onix', 'lt', 'chevrolet', 'gm', '1.0'] },
  { marca: 'GM - Chevrolet', nome: 'Onix Plus Sedan 1.0 Turbo', fipe: '004502-0', keywords: ['onix plus', 'sedan', 'turbo', 'chevrolet', 'gm'] },
  { marca: 'GM - Chevrolet', nome: 'Celta 1.0 Life Flex', fipe: '004338-9', keywords: ['celta', 'chevrolet', 'gm', '1.0'] },
  { marca: 'GM - Chevrolet', nome: 'Prisma 1.4 LT Flex', fipe: '004343-5', keywords: ['prisma', 'sedan', 'chevrolet', 'gm', '1.4'] },
  { marca: 'GM - Chevrolet', nome: 'Tracker 1.0 Turbo Aut.', fipe: '004508-0', keywords: ['tracker', 'suv', 'turbo', 'chevrolet', 'gm'] },
  { marca: 'GM - Chevrolet', nome: 'Spin 1.8 LTZ Flex', fipe: '004416-4', keywords: ['spin', 'minivan', 'chevrolet', 'gm', '1.8'] },
  { marca: 'GM - Chevrolet', nome: 'Cruze LT 1.4 Turbo', fipe: '004467-9', keywords: ['cruze', 'sedan', 'turbo', 'chevrolet', 'gm'] },
  { marca: 'GM - Chevrolet', nome: 'S10 Pick-Up 2.8 Diesel 4x4', fipe: '004245-5', keywords: ['s10', 'picape', 'pickup', 'diesel', 'chevrolet'] },
  { marca: 'GM - Chevrolet', nome: 'Astra Advantage 2.0 Flex', fipe: '004312-5', keywords: ['astra', 'advantage', 'chevrolet', 'gm', '2.0'] },

  // Fiat
  { marca: 'Fiat', nome: 'Palio EX 1.0 mpi 2p/4p', fipe: '001004-9', keywords: ['palio', 'fiat', '1.0', 'ex', 'fire'] },
  { marca: 'Fiat', nome: 'Uno Mille 1.0 Fire', fipe: '001005-7', keywords: ['uno', 'mille', 'fiat', 'fire', '1.0'] },
  { marca: 'Fiat', nome: 'Mobi Like 1.0 Fire Flex', fipe: '001461-3', keywords: ['mobi', 'like', 'fiat', '1.0'] },
  { marca: 'Fiat', nome: 'Argo Drive 1.0 6V Flex', fipe: '001494-0', keywords: ['argo', 'drive', 'fiat', '1.0'] },
  { marca: 'Fiat', nome: 'Strada Endurance 1.4 Flex', fipe: '001526-1', keywords: ['strada', 'picape', 'pickup', 'fiat', '1.4'] },
  { marca: 'Fiat', nome: 'Toro Endurance 1.3 Turbo Flex', fipe: '001537-7', keywords: ['toro', 'picape', 'pickup', 'turbo', 'fiat'] },
  { marca: 'Fiat', nome: 'Pulse Drive 1.3 Flex', fipe: '001540-7', keywords: ['pulse', 'suv', 'fiat', '1.3'] },
  { marca: 'Fiat', nome: 'Fastback Audace 1.0 Turbo', fipe: '001550-4', keywords: ['fastback', 'suv', 'turbo', 'fiat'] },
  { marca: 'Fiat', nome: 'Cronos Drive 1.3 Flex', fipe: '001503-2', keywords: ['cronos', 'sedan', 'fiat', '1.3'] },
  { marca: 'Fiat', nome: 'Siena EL 1.0 Flex', fipe: '001198-3', keywords: ['siena', 'sedan', 'fiat', '1.0'] },

  // Hyundai
  { marca: 'Hyundai', nome: 'HB20 Comfort 1.0 Flex', fipe: '015094-0', keywords: ['hb20', 'hyundai', 'comfort', '1.0', 'hatch'] },
  { marca: 'Hyundai', nome: 'HB20S Sedan 1.0 Flex', fipe: '015098-3', keywords: ['hb20s', 'hb20', 'sedan', 'hyundai', '1.0'] },
  { marca: 'Hyundai', nome: 'Creta Comfort 1.0 Turbo', fipe: '015183-1', keywords: ['creta', 'suv', 'turbo', 'hyundai', '1.0'] },
  { marca: 'Hyundai', nome: 'Tucson GLS 2.0 Flex Aut.', fipe: '015093-2', keywords: ['tucson', 'suv', 'hyundai', '2.0'] },

  // Jeep
  { marca: 'Jeep', nome: 'Renegade Sport 1.8 Flex Aut.', fipe: '017032-1', keywords: ['renegade', 'suv', 'jeep', 'sport', '1.8'] },
  { marca: 'Jeep', nome: 'Renegade Longitude 1.3 Turbo', fipe: '017073-8', keywords: ['renegade', 'longitude', 'turbo', 'jeep', 't270'] },
  { marca: 'Jeep', nome: 'Compass Longitude 1.3 Turbo', fipe: '017071-2', keywords: ['compass', 'suv', 'longitude', 'jeep', 't270'] },
  { marca: 'Jeep', nome: 'Commander Limited 1.3 Turbo', fipe: '017074-6', keywords: ['commander', 'suv', '7 lugares', 'jeep'] },

  // Renault
  { marca: 'Renault', nome: 'Kwid Zen 1.0 Flex', fipe: '025266-2', keywords: ['kwid', 'zen', 'renault', '1.0'] },
  { marca: 'Renault', nome: 'Sandero Expression 1.0 Flex', fipe: '025143-7', keywords: ['sandero', 'renault', '1.0', 'hatch'] },
  { marca: 'Renault', nome: 'Duster Dynamique 1.6 Flex', fipe: '025184-4', keywords: ['duster', 'suv', 'renault', '1.6'] },
  { marca: 'Renault', nome: 'Logan Authentique 1.0 Flex', fipe: '025145-3', keywords: ['logan', 'sedan', 'renault', '1.0'] },

  // Ford
  { marca: 'Ford', nome: 'Ka SE 1.0 Flex', fipe: '003411-8', keywords: ['ka', 'ford', '1.0', 'se', 'hatch'] },
  { marca: 'Ford', nome: 'Fiesta Hatch 1.6 Flex', fipe: '003204-2', keywords: ['fiesta', 'ford', '1.6', 'hatch'] },
  { marca: 'Ford', nome: 'EcoSport Freestyle 1.6 Flex', fipe: '003289-1', keywords: ['ecosport', 'suv', 'ford', 'freestyle', '1.6'] },
  { marca: 'Ford', nome: 'Ranger XLS 2.2 Diesel 4x4', fipe: '003399-5', keywords: ['ranger', 'picape', 'pickup', 'diesel', 'ford'] },

  // Nissan
  { marca: 'Nissan', nome: 'Kicks SV 1.6 Flex Aut.', fipe: '023147-9', keywords: ['kicks', 'suv', 'nissan', 'sv', '1.6'] },
  { marca: 'Nissan', nome: 'Versa 1.6 Flex', fipe: '023114-2', keywords: ['versa', 'sedan', 'nissan', '1.6'] },

  // Peugeot & Citroën
  { marca: 'Peugeot', nome: '208 Active 1.2 Flex', fipe: '024208-0', keywords: ['208', 'peugeot', 'active', '1.2'] },
  { marca: 'Citroën', nome: 'C3 Tendance 1.5 Flex', fipe: '011138-4', keywords: ['c3', 'citroen', 'citroën', '1.5'] },
  { marca: 'Citroën', nome: 'C4 Cactus Feel 1.6 Flex', fipe: '011195-3', keywords: ['c4', 'cactus', 'suv', 'citroen', 'citroën', '1.6'] }
];

// Estado da Aplicação
const state = {
  currentData: [],
  selectedVehicle: null,
  recentSearches: [],
  activeSuggestionIndex: -1,
  matchingVehicles: []
};

// Elementos da Interface (DOM)
const elements = {
  form: document.getElementById('fipeForm'),
  input: document.getElementById('fipeInput'),
  clearBtn: document.getElementById('clearBtn'),
  autocompleteDropdown: document.getElementById('autocompleteDropdown'),
  searchBtn: document.getElementById('searchBtn'),
  searchBtnText: document.querySelector('#searchBtn .btn-text'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  errorCard: document.getElementById('errorCard'),
  errorTitle: document.getElementById('errorTitle'),
  errorMessage: document.getElementById('errorMessage'),
  dismissErrorBtn: document.getElementById('dismissErrorBtn'),
  resultsSection: document.getElementById('resultsSection'),
  quickChips: document.getElementById('quickChips'),

  // Campos de Resultado
  resMarca: document.getElementById('resMarca'),
  resModelo: document.getElementById('resModelo'),
  resCodigoFipe: document.getElementById('resCodigoFipe'),
  resMesRef: document.getElementById('resMesRef'),
  resValor: document.getElementById('resValor'),
  resAnoModelo: document.getElementById('resAnoModelo'),
  resCombustivel: document.getElementById('resCombustivel'),
  resDataConsulta: document.getElementById('resDataConsulta'),
  resSiglaCombustivel: document.getElementById('resSiglaCombustivel'),
  yearSelect: document.getElementById('yearSelect'),
  availableYearsCount: document.getElementById('availableYearsCount'),
  tableBody: document.getElementById('tableBody'),
  copyPriceBtn: document.getElementById('copyPriceBtn'),

  // Histórico
  recentSection: document.getElementById('recentSearchesSection'),
  recentList: document.getElementById('recentList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn')
};

// ==========================================================================
// FUNÇÕES AUXILIARES DE BUSCA E NORMALIZAÇÃO
// ==========================================================================

/**
 * Normaliza o texto removendo acentos e pontuações para comparação suave
 * @param {string} text 
 * @returns {string}
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica se a string parece um código FIPE (6 dígitos seguidos opcionalmente de hífen e 1 dígito)
 * @param {string} str 
 * @returns {boolean}
 */
function isFipeCodePattern(str) {
  const digitsOnly = str.replace(/\D/g, '');
  return digitsOnly.length === 7 || /^\d{6}-\d$/.test(str.trim());
}

/**
 * Busca veículos no catálogo por termo digitado pelo usuário
 * @param {string} term 
 * @returns {Array} Veículos correspondentes ordenados por relevância
 */
function searchVehiclesInCatalog(term) {
  const query = normalizeText(term);
  if (!query) return [];

  // Primeiro busca veículos onde o nome ou marca começa com o termo
  const startsWith = [];
  // Depois veículos onde alguma palavra-chave ou parte contém o termo
  const contains = [];

  for (const car of VEHICLES_DATABASE) {
    const nomeNorm = normalizeText(car.nome);
    const marcaNorm = normalizeText(car.marca);
    const fipeNorm = normalizeText(car.fipe);

    if (fipeNorm.includes(query)) {
      startsWith.push(car);
      continue;
    }

    if (nomeNorm.startsWith(query) || marcaNorm.startsWith(query)) {
      startsWith.push(car);
      continue;
    }

    const keywordMatch = car.keywords.some(kw => normalizeText(kw).startsWith(query) || normalizeText(kw).includes(query));
    if (keywordMatch || nomeNorm.includes(query) || marcaNorm.includes(query)) {
      contains.push(car);
    }
  }

  return [...startsWith, ...contains].slice(0, 8);
}

// ==========================================================================
// AUTOCOMPLETE & DROPDOWN DE SUGESTÕES EM TEMPO REAL
// ==========================================================================

/**
 * Renderiza o dropdown de sugestões abaixo do campo de entrada
 * @param {Array} matches 
 * @param {string} rawQuery 
 */
function renderAutocomplete(matches, rawQuery) {
  state.matchingVehicles = matches;
  state.activeSuggestionIndex = -1;

  if (!matches || matches.length === 0) {
    elements.autocompleteDropdown.classList.add('hidden');
    elements.autocompleteDropdown.innerHTML = '';
    return;
  }

  const queryNorm = normalizeText(rawQuery);
  let html = `
    <div class="autocomplete-header">
      <span>Veículos sugeridos</span>
      <span>Pressione Enter para selecionar</span>
    </div>
  `;

  matches.forEach((car, index) => {
    // Destaca as letras coincidentes
    const carName = car.nome;
    html += `
      <div class="autocomplete-item" data-index="${index}" role="option" aria-selected="false">
        <div class="autocomplete-main">
          <span class="autocomplete-brand">${car.marca.replace('VW - ', '').replace('GM - ', '')}</span>
          <span class="autocomplete-name">${highlightMatch(carName, queryNorm)}</span>
        </div>
        <span class="autocomplete-code">FIPE: ${car.fipe}</span>
      </div>
    `;
  });

  elements.autocompleteDropdown.innerHTML = html;
  elements.autocompleteDropdown.classList.remove('hidden');
}

/**
 * Destaca o trecho pesquisado dentro do texto
 * @param {string} text 
 * @param {string} query 
 * @returns {string}
 */
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = normalizeText(text).indexOf(query);
  if (idx === -1) return text;
  const originalMatch = text.slice(idx, idx + query.length);
  return `${text.slice(0, idx)}<mark>${originalMatch}</mark>${text.slice(idx + query.length)}`;
}

/**
 * Oculta o dropdown de autocomplete
 */
function hideAutocomplete() {
  elements.autocompleteDropdown.classList.add('hidden');
  state.matchingVehicles = [];
  state.activeSuggestionIndex = -1;
}

// ==========================================================================
// CONTROLE DO INDICADOR DE CARREGAMENTO (LOADING) ⏳
// Requisito obrigatório: "Deve ter algum elemento no html que indique que
// está processando a requisição."
// ==========================================================================

/**
 * Altera a visibilidade do elemento de processamento e o estado dos controles
 * @param {boolean} isLoading 
 * @param {string} [customTitle]
 * @param {string} [customDesc]
 */
function setLoading(isLoading, customTitle, customDesc) {
  if (isLoading) {
    // Exibe o elemento de carregamento na tela
    elements.loadingIndicator.classList.remove('hidden');
    elements.loadingIndicator.setAttribute('aria-busy', 'true');

    const titleEl = elements.loadingIndicator.querySelector('.loading-title');
    const descEl = elements.loadingIndicator.querySelector('.loading-desc');

    if (titleEl) titleEl.textContent = customTitle || 'Consultando Tabela FIPE...';
    if (descEl) descEl.innerHTML = customDesc || 'Conectando aos servidores da <strong>BrasilAPI</strong> para buscar os preços';

    // Oculta dropdown, resultados e erros anteriores
    hideAutocomplete();
    elements.errorCard.classList.add('hidden');
    elements.resultsSection.classList.add('hidden');

    // Desativa controles de formulário para evitar requisições concorrentes
    elements.searchBtn.disabled = true;
    elements.input.disabled = true;
    if (elements.searchBtnText) elements.searchBtnText.textContent = 'Processando...';

    // Rola suavemente até o elemento indicador de carregamento
    elements.loadingIndicator.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    // Oculta o elemento indicador de carregamento
    elements.loadingIndicator.classList.add('hidden');
    elements.loadingIndicator.setAttribute('aria-busy', 'false');

    // Reativa os controles do formulário
    elements.searchBtn.disabled = false;
    elements.input.disabled = false;
    if (elements.searchBtnText) elements.searchBtnText.textContent = 'Consultar Preço';
  }
}

// ==========================================================================
// COMUNICAÇÃO COM A BRASILAPI 🔍
// ==========================================================================

/**
 * Consulta a Tabela FIPE na BrasilAPI pelo código FIPE do veículo
 * @param {string} fipeCode 
 * @returns {Promise<Array>} Lista de cotações para o código FIPE
 */
async function fetchFipePrice(fipeCode) {
  const sanitizedCode = fipeCode.trim().replace(/[^\d-]/g, '');

  if (!sanitizedCode || sanitizedCode.length < 7) {
    throw new Error('Por favor, informe um código FIPE válido de 7 dígitos (ex: 005275-2) ou o nome de um veículo (ex: Civic, Gol, Corolla).');
  }

  // Prepara controller de timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${BRASIL_API_BASE_URL}/preco/v1/${encodeURIComponent(sanitizedCode)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Código FIPE "${sanitizedCode}" não foi localizado na base da BrasilAPI.`);
      }
      if (response.status === 400) {
        throw new Error('Código FIPE inválido na requisição.');
      }
      throw new Error(`Erro na BrasilAPI (Status ${response.status}). Tente novamente em instantes.`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Nenhuma cotação encontrada para este veículo na Tabela FIPE.');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('A requisição à BrasilAPI demorou muito para responder. Verifique sua conexão e tente novamente.');
    }
    throw err;
  }
}

// ==========================================================================
// RENDERIZAÇÃO DE DADOS NA INTERFACE
// ==========================================================================

/**
 * Exibe mensagem de erro na interface
 * @param {string} title 
 * @param {string} message 
 */
function showError(title, message) {
  elements.errorTitle.textContent = title;
  elements.errorMessage.textContent = message;
  elements.errorCard.classList.remove('hidden');
  elements.resultsSection.classList.add('hidden');
  elements.errorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Oculta mensagem de erro
 */
function hideError() {
  elements.errorCard.classList.add('hidden');
}

/**
 * Atualiza o destaque do preço e especificações para a versão/ano selecionada
 * @param {Object} item 
 */
function updateSelectedYear(item) {
  if (!item) return;
  state.selectedVehicle = item;

  elements.resValor.textContent = item.valor || 'R$ 0,00';
  elements.resAnoModelo.textContent = item.anoModelo === 32000 ? 'Zero KM' : (item.anoModelo || '---');
  elements.resCombustivel.textContent = item.combustivel || '---';
  elements.resSiglaCombustivel.textContent = item.siglaCombustivel || item.combustivel?.charAt(0) || '---';
  elements.resDataConsulta.textContent = item.dataConsulta || new Date().toLocaleDateString('pt-BR');

  // Destaca a linha correspondente na tabela
  const rows = elements.tableBody.querySelectorAll('tr');
  rows.forEach(row => {
    if (row.dataset.year == item.anoModelo && row.dataset.fuel == item.combustivel) {
      row.classList.add('active-row');
    } else {
      row.classList.remove('active-row');
    }
  });
}

/**
 * Renderiza o resultado completo da cotação FIPE
 * @param {Array} list 
 * @param {string} [displayName]
 */
function renderResults(list, displayName) {
  // Ordena por ano do modelo decrescente
  list.sort((a, b) => (b.anoModelo || 0) - (a.anoModelo || 0));
  state.currentData = list;

  const first = list[0];

  // Informações principais do veículo
  elements.resMarca.textContent = first.marca || 'Marca';
  elements.resModelo.textContent = displayName || first.modelo || 'Modelo do Veículo';
  elements.resCodigoFipe.textContent = first.codigoFipe || elements.input.value;
  elements.resMesRef.textContent = first.mesReferencia || 'Atual';

  // Popula o seletor de Anos
  elements.yearSelect.innerHTML = '';
  elements.availableYearsCount.textContent = `${list.length} ${list.length === 1 ? 'ano' : 'anos'} disponível${list.length === 1 ? '' : 'is'}`;

  list.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    const ano = item.anoModelo === 32000 ? 'Zero KM' : item.anoModelo;
    option.textContent = `Ano ${ano} • ${item.combustivel} — ${item.valor}`;
    elements.yearSelect.appendChild(option);
  });

  // Popula a tabela com todas as versões
  elements.tableBody.innerHTML = '';
  list.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.dataset.year = item.anoModelo;
    tr.dataset.fuel = item.combustivel;
    if (index === 0) tr.classList.add('active-row');

    const ano = item.anoModelo === 32000 ? 'Zero KM' : item.anoModelo;

    tr.innerHTML = `
      <td><strong>${ano}</strong></td>
      <td>${item.combustivel}</td>
      <td><span class="meta-tag">${item.mesReferencia || '-'}</span></td>
      <td class="text-right table-price">${item.valor}</td>
      <td class="text-center">
        <button type="button" class="table-action-btn" data-index="${index}">
          Ver cotação
        </button>
      </td>
    `;
    elements.tableBody.appendChild(tr);
  });

  // Atualiza destaque com o primeiro ano (mais recente)
  updateSelectedYear(first);

  // Exibe a seção de resultados
  elements.resultsSection.classList.remove('hidden');
  elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Salva no histórico de buscas recentes
  saveRecentSearch({
    codigoFipe: first.codigoFipe,
    marca: first.marca,
    modelo: first.modelo
  });
}

// ==========================================================================
// HISTÓRICO DE CONSULTAS RECENTES (LOCALSTORAGE)
// ==========================================================================

function loadRecentSearches() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    state.recentSearches = saved ? JSON.parse(saved) : [];
  } catch {
    state.recentSearches = [];
  }
  renderRecentSearches();
}

function saveRecentSearch(item) {
  if (!item.codigoFipe) return;

  // Remove duplicados pelo código FIPE
  state.recentSearches = state.recentSearches.filter(
    s => s.codigoFipe.replace(/\D/g, '') !== item.codigoFipe.replace(/\D/g, '')
  );

  // Adiciona ao topo
  state.recentSearches.unshift(item);

  // Mantém no máximo 6 itens
  if (state.recentSearches.length > 6) {
    state.recentSearches.pop();
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.recentSearches));
  } catch (e) {
    console.warn('Não foi possível salvar no localStorage:', e);
  }

  renderRecentSearches();
}

function renderRecentSearches() {
  if (!state.recentSearches || state.recentSearches.length === 0) {
    elements.recentSection.classList.add('hidden');
    return;
  }

  elements.recentList.innerHTML = '';
  state.recentSearches.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'recent-item';
    btn.innerHTML = `
      <span class="recent-code">${item.codigoFipe}</span>
      <span class="recent-name">${item.marca ? `${item.marca} - ` : ''}${item.modelo || ''}</span>
    `;
    btn.addEventListener('click', () => {
      elements.input.value = `${item.marca ? `${item.marca} ` : ''}${item.modelo || item.codigoFipe}`;
      queryAndDisplayPrice(item.codigoFipe, item.modelo);
    });
    elements.recentList.appendChild(btn);
  });

  elements.recentSection.classList.remove('hidden');
}

function clearRecentSearches() {
  state.recentSearches = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { }
  renderRecentSearches();
}

// ==========================================================================
// FLUXO PRINCIPAL DE CONSULTA
// ==========================================================================

/**
 * Consulta a BrasilAPI com o código FIPE e exibe os resultados na tela
 * @param {string} fipeCode 
 * @param {string} [displayName] 
 */
async function queryAndDisplayPrice(fipeCode, displayName) {
  // Ativa o elemento indicador de carregamento
  const carNameLabel = displayName || fipeCode;
  setLoading(
    true,
    `Consultando preço de "${carNameLabel}"...`,
    `Buscando dados oficiais do veículo na <strong>BrasilAPI</strong> 🚗`
  );

  try {
    const data = await fetchFipePrice(fipeCode);
    renderResults(data, displayName);
  } catch (error) {
    showError('Atenção na Consulta', error.message || 'Ocorreu um erro ao consultar a BrasilAPI.');
  } finally {
    // Desativa o indicador de carregamento ao término da requisição
    setLoading(false);
  }
}

/**
 * Processa o termo inserido pelo usuário (seja nome de carro ou código FIPE)
 * @param {string} inputQuery 
 */
function handleSearch(inputQuery) {
  const query = (inputQuery || elements.input.value).trim();

  if (!query) {
    showError('Campo Obrigatório', 'Por favor, digite o nome de um carro (ex: Civic, Gol, Corolla) ou o código FIPE.');
    elements.input.focus();
    return;
  }

  hideAutocomplete();

  // Caso 1: O usuário digitou diretamente um código FIPE (ex: 005275-2 ou 0052752)
  if (isFipeCodePattern(query)) {
    const clean = query.replace(/[^\d-]/g, '');
    let formatted = clean;
    if (clean.replace(/\D/g, '').length === 7 && !clean.includes('-')) {
      formatted = `${clean.slice(0, 6)}-${clean.slice(6)}`;
    }
    queryAndDisplayPrice(formatted);
    return;
  }

  // Caso 2: O usuário digitou o nome de um carro (ex: "Civic", "Gol", "Onix", "Corolla", etc.)
  const matches = searchVehiclesInCatalog(query);

  if (matches.length > 0) {
    // Pega o melhor resultado correspondente
    const selected = matches[0];
    elements.input.value = `${selected.marca.replace('VW - ', '').replace('GM - ', '')} ${selected.nome}`;
    queryAndDisplayPrice(selected.fipe, `${selected.marca} - ${selected.nome}`);
  } else {
    showError(
      'Veículo Não Localizado',
      `Não encontramos nenhum modelo correspondente a "${query}". Experimente pesquisar por modelos como: Gol, Civic, Corolla, Onix, HB20, Palio, Uno, Renegade ou informe o código FIPE diretamente.`
    );
  }
}

// ==========================================================================
// INICIALIZAÇÃO E EVENTOS
// ==========================================================================

function initEvents() {
  // Submissão do formulário
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSearch(elements.input.value);
  });

  // Digitação em tempo real no campo de busca (Autocomplete)
  let debounceTimeout = null;
  elements.input.addEventListener('input', (e) => {
    const rawVal = e.target.value;

    // Controla botão de limpar campo
    if (rawVal.trim().length > 0) {
      elements.clearBtn.classList.remove('hidden');
    } else {
      elements.clearBtn.classList.add('hidden');
      hideAutocomplete();
      return;
    }

    // Se o usuário estiver digitando apenas números/hífen (código FIPE), não precisa de autocomplete de texto
    if (/^[\d-]+$/.test(rawVal.trim())) {
      hideAutocomplete();
      return;
    }

    // Debounce para autocomplete suave
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const matches = searchVehiclesInCatalog(rawVal);
      renderAutocomplete(matches, rawVal);
    }, 120);
  });

  // Navegação por teclado no Dropdown de sugestões (ArrowDown, ArrowUp, Enter, Escape)
  elements.input.addEventListener('keydown', (e) => {
    const items = elements.autocompleteDropdown.querySelectorAll('.autocomplete-item');
    if (!items || items.length === 0 || elements.autocompleteDropdown.classList.contains('hidden')) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.activeSuggestionIndex = (state.activeSuggestionIndex + 1) % items.length;
      updateSuggestionHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.activeSuggestionIndex = (state.activeSuggestionIndex - 1 + items.length) % items.length;
      updateSuggestionHighlight(items);
    } else if (e.key === 'Enter' && state.activeSuggestionIndex >= 0) {
      e.preventDefault();
      const selected = state.matchingVehicles[state.activeSuggestionIndex];
      if (selected) {
        selectVehicleFromSuggestion(selected);
      }
    } else if (e.key === 'Escape') {
      hideAutocomplete();
    }
  });

  // Atualiza classe visual do item selecionado via teclado
  function updateSuggestionHighlight(items) {
    items.forEach((item, idx) => {
      if (idx === state.activeSuggestionIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // Clique em uma sugestão do dropdown
  elements.autocompleteDropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.autocomplete-item');
    if (item && item.dataset.index !== undefined) {
      const idx = parseInt(item.dataset.index, 10);
      const selected = state.matchingVehicles[idx];
      if (selected) {
        selectVehicleFromSuggestion(selected);
      }
    }
  });

  function selectVehicleFromSuggestion(selected) {
    elements.input.value = `${selected.marca.replace('VW - ', '').replace('GM - ', '')} ${selected.nome}`;
    hideAutocomplete();
    queryAndDisplayPrice(selected.fipe, `${selected.marca} - ${selected.nome}`);
  }

  // Fechar dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    if (!elements.form.contains(e.target)) {
      hideAutocomplete();
    }
  });

  // Botão de limpar entrada
  elements.clearBtn.addEventListener('click', () => {
    elements.input.value = '';
    elements.clearBtn.classList.add('hidden');
    hideAutocomplete();
    elements.input.focus();
  });

  // Chips de modelos populares (ao clicar, consulta imediatamente pelo nome)
  elements.quickChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip && chip.dataset.query) {
      const query = chip.dataset.query;
      elements.input.value = query;
      elements.clearBtn.classList.remove('hidden');
      handleSearch(query);
    }
  });

  // Mudança no seletor de Anos
  elements.yearSelect.addEventListener('change', (e) => {
    const index = parseInt(e.target.value, 10);
    if (!isNaN(index) && state.currentData[index]) {
      updateSelectedYear(state.currentData[index]);
    }
  });

  // Clique nos botões "Ver Cotação" da tabela
  elements.tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.table-action-btn');
    if (btn && btn.dataset.index !== undefined) {
      const idx = parseInt(btn.dataset.index, 10);
      if (!isNaN(idx) && state.currentData[idx]) {
        elements.yearSelect.value = idx;
        updateSelectedYear(state.currentData[idx]);
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  // Botão Copiar Preço
  elements.copyPriceBtn.addEventListener('click', async () => {
    const priceText = elements.resValor.textContent;
    if (!priceText || priceText === 'R$ 0,00') return;

    try {
      await navigator.clipboard.writeText(priceText);
      elements.copyPriceBtn.classList.add('copied');
      setTimeout(() => {
        elements.copyPriceBtn.classList.remove('copied');
      }, 2000);
    } catch {
      // Fallback
      const tempInput = document.createElement('input');
      tempInput.value = priceText;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      elements.copyPriceBtn.classList.add('copied');
      setTimeout(() => {
        elements.copyPriceBtn.classList.remove('copied');
      }, 2000);
    }
  });

  // Fechar mensagem de erro
  elements.dismissErrorBtn.addEventListener('click', hideError);

  // Limpar histórico
  elements.clearHistoryBtn.addEventListener('click', clearRecentSearches);
}

// Inicialização ao carregar o script
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  loadRecentSearches();
});
