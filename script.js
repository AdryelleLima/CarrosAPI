//const API_BASE = "https://brasilapi.com.br/api/fipe";
const API_BASE = "https://parallelum.com.br/fipe/api/v1";

// Elementos da DOM
const selectTipo = document.getElementById("select-tipo");
const selectMarca = document.getElementById("select-marca");
const selectModelo = document.getElementById("select-modelo");
const selectAno = document.getElementById("select-ano");

const inputFipe = document.getElementById("input-fipe");
const btnBuscarFipe = document.getElementById("btn-buscar-fipe");

const loadingIndicator = document.getElementById("loading-indicator");
const statusError = document.getElementById("status-error");

const resultContainer = document.getElementById("result-container");
const resModelo = document.getElementById("res-modelo");
const resMarca = document.getElementById("res-marca");
const resAno = document.getElementById("res-ano");
const resCombustivel = document.getElementById("res-combustivel");
const resCodigo = document.getElementById("res-codigo");
const resReferencia = document.getElementById("res-referencia");
const resValor = document.getElementById("res-valor");

const historicoList = document.getElementById("historico-list");
const btnLimparHistorico = document.getElementById("btn-limpar-historico");

document.addEventListener("DOMContentLoaded", () => {
  carregarMarcas();
  carregarHistorico();
});

function mostrarLoading(exibir) {
  loadingIndicator.style.display = exibir ? "block" : "none";
}

function mostrarErro(mensagem) {
  if (mensagem) {
    statusError.textContent = "Erro: " + mensagem;
    statusError.style.display = "block";
  } else {
    statusError.style.display = "none";
  }
}

function resetarSelect(select, textoPadrao) {
  select.innerHTML = `<option value="">${textoPadrao}</option>`;
  select.disabled = true;
}

async function fetchAPI(endpoint) {
  mostrarLoading(true);
  mostrarErro(null);
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Falha na requisição (Status ${response.status}).`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    mostrarErro(err.message || "Não foi possível conectar à API.");
    return null;
  } finally {
    mostrarLoading(false);
  }
}

// 1. Carregar Marcas
async function carregarMarcas() {
  resetarSelect(selectMarca, "-- Carregando Marcas... --");
  resetarSelect(selectModelo, "-- Selecione a Marca Primeiro --");
  resetarSelect(selectAno, "-- Selecione o Modelo Primeiro --");

  const tipo = selectTipo.value; // carros, motos, caminhoes
  const marcas = await fetchAPI(`/${tipo}/marcas`);

  if (marcas && Array.isArray(marcas) && marcas.length > 0) {
    selectMarca.innerHTML = '<option value="">-- Selecione uma Marca --</option>';
    marcas.forEach(marca => {
      const opt = document.createElement("option");
      opt.value = marca.codigo;
      opt.textContent = marca.nome;
      selectMarca.appendChild(opt);
    });
    selectMarca.disabled = false;
  } else {
    resetarSelect(selectMarca, "-- Erro ao carregar marcas --");
  }
}

selectTipo.addEventListener("change", carregarMarcas);

// 2. Carregar Modelos da Marca
selectMarca.addEventListener("change", async () => {
  const tipo = selectTipo.value;
  const marcaId = selectMarca.value;

  resetarSelect(selectModelo, "-- Selecione a Marca Primeiro --");
  resetarSelect(selectAno, "-- Selecione o Modelo Primeiro --");

  if (!marcaId) return;

  resetarSelect(selectModelo, "-- Carregando Modelos... --");

  const dados = await fetchAPI(`/${tipo}/marcas/${marcaId}/modelos`);
  const modelos = dados ? dados.modelos : null;

  if (modelos && Array.isArray(modelos) && modelos.length > 0) {
    selectModelo.innerHTML = '<option value="">-- Selecione um Modelo --</option>';
    modelos.forEach(modelo => {
      const opt = document.createElement("option");
      opt.value = modelo.codigo;
      opt.textContent = modelo.nome;
      selectModelo.appendChild(opt);
    });
    selectModelo.disabled = false;
  } else {
    resetarSelect(selectModelo, "-- Nenhum modelo encontrado --");
  }
});

// 3. Carregar Anos / Combustível do Modelo
selectModelo.addEventListener("change", async () => {
  const tipo = selectTipo.value;
  const marcaId = selectMarca.value;
  const modeloId = selectModelo.value;

  resetarSelect(selectAno, "-- Selecione o Modelo Primeiro --");

  if (!modeloId) return;

  resetarSelect(selectAno, "-- Carregando Anos... --");

  const anos = await fetchAPI(`/${tipo}/marcas/${marcaId}/modelos/${modeloId}/anos`);

  if (anos && Array.isArray(anos) && anos.length > 0) {
    selectAno.innerHTML = '<option value="">-- Selecione o Ano/Combustível --</option>';
    anos.forEach(anoItem => {
      const opt = document.createElement("option");
      opt.value = anoItem.codigo;
      opt.textContent = anoItem.nome;
      selectAno.appendChild(opt);
    });
    selectAno.disabled = false;
  } else {
    resetarSelect(selectAno, "-- Nenhum ano encontrado --");
  }
});

// 4. Consultar Preço pela Seleção Sequencial
selectAno.addEventListener("change", async () => {
  const tipo = selectTipo.value;
  const marcaId = selectMarca.value;
  const modeloId = selectModelo.value;
  const anoId = selectAno.value;

  if (!anoId) return;

  const resultado = await fetchAPI(`/${tipo}/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}`);

  if (resultado) {
    exibirResultado(resultado);
  }
});

// 5. Consultar Preço por Código FIPE (Iterando nas marcas e modelos da API para encontrar o código correspondente)
btnBuscarFipe.addEventListener("click", async () => {
  const codigoFipeBusca = inputFipe.value.trim();

  if (!codigoFipeBusca) {
    mostrarErro("Por favor, digite um código FIPE válido.");
    return;
  }

  const tipo = selectTipo.value;
  mostrarLoading(true);
  mostrarErro(null);

  try {
    // Passo A: Pega todas as marcas
    const marcas = await fetchAPI(`/${tipo}/marcas`);
    if (!marcas) return;

    let veiculoEncontrado = null;

    // Percorre as marcas para localizar o veículo pelo código FIPE
    for (const marca of marcas) {
      const dadosModelos = await fetchAPI(`/${tipo}/marcas/${marca.codigo}/modelos`);
      if (!dadosModelos || !dadosModelos.modelos) continue;

      for (const modelo of dadosModelos.modelos) {
        const anos = await fetchAPI(`/${tipo}/marcas/${marca.codigo}/modelos/${modelo.codigo}/anos`);
        if (!anos) continue;

        for (const ano of anos) {
          const detalhes = await fetchAPI(`/${tipo}/marcas/${marca.codigo}/modelos/${modelo.codigo}/anos/${ano.codigo}`);
          if (detalhes && detalhes.CodigoFipe && detalhes.CodigoFipe.replace("-", "") === codigoFipeBusca.replace("-", "")) {
            veiculoEncontrado = detalhes;
            break;
          }
        }
        if (veiculoEncontrado) break;
      }
      if (veiculoEncontrado) break;
    }

    if (veiculoEncontrado) {
      exibirResultado(veiculoEncontrado);
    } else {
      mostrarErro("Nenhum veículo encontrado para este código FIPE na categoria selecionada.");
    }
  } catch (err) {
    mostrarErro("Erro ao buscar por código FIPE.");
  } finally {
    mostrarLoading(false);
  }
});

function exibirResultado(dados) {
  resModelo.textContent = dados.Modelo || "-";
  resMarca.textContent = dados.Marca || "-";
  resAno.textContent = dados.AnoModelo || "-";
  resCombustivel.textContent = dados.Combustivel || "-";
  resCodigo.textContent = dados.CodigoFipe || "-";
  resReferencia.textContent = dados.MesReferencia || "-";
  resValor.textContent = dados.Valor || "R$ 0,00";

  resultContainer.style.display = "block";
  resultContainer.scrollIntoView({ behavior: "smooth" });

  salvarHistorico(dados);
}

function salvarHistorico(dados) {
  let historico = JSON.parse(localStorage.getItem("fipe_historico") || "[]");

  const item = {
    modelo: dados.Modelo || "Veículo",
    valor: dados.Valor || "R$ 0,00",
    data: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })
  };

  historico.unshift(item);
  if (historico.length > 5) historico.pop();

  localStorage.setItem("fipe_historico", JSON.stringify(historico));
  carregarHistorico();
}

function carregarHistorico() {
  const historico = JSON.parse(localStorage.getItem("fipe_historico") || "[]");
  historicoList.innerHTML = "";

  if (historico.length === 0) {
    historicoList.innerHTML = "<li>Nenhuma consulta realizada ainda.</li>";
    return;
  }

  historico.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `[${item.data}] ${item.modelo} - ${item.valor}`;
    historicoList.appendChild(li);
  });
}

btnLimparHistorico.addEventListener("click", () => {
  localStorage.removeItem("fipe_historico");
  carregarHistorico();
});
