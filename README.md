# Consulta Tabela FIPE 🚗

Aplicação web simples, limpa e funcional desenvolvida em **HTML, CSS e JavaScript puro** para consulta de preços de veículos atualizados utilizando dados da Tabela FIPE.

## 📋 Funcionalidades
* **Seleção Sequencial**: Permite ao usuário navegar de forma encadeada escolhendo o **Tipo de Veículo** (Carros, Motos ou Caminhões) ➔ **Marca** ➔ **Modelo** ➔ **Ano/Combustível** para obter o preço médio atualizado.
* **Busca Direta por Código FIPE**: Opção para pesquisar o veículo informando diretamente o código FIPE correspondente.
* **Indicador de Processamento**: Feedback visual dinâmico ("⏳ Processando requisição...") ativo durante todas as chamadas assíncronas à API.
* **Histórico Local**: Salva as últimas consultas realizadas utilizando o `localStorage` do navegador para acesso rápido.

## 🛠️ Tecnologias Utilizadas
* **HTML5** (Estruturação semântica)
* **CSS3** (Estilização minimalista e direta, focada em usabilidade)
* **JavaScript (Vanilla)** (Manipulação de DOM, requisições `fetch` assíncronas e gerenciamento de estado)

---

## ⚠️ Justificativa Técnica: Alteração da API FIPE

Inicialmente, o projeto previa o consumo exclusivo da **BrasilAPI** para as consultas da Tabela FIPE. No entanto, durante os testes e validações em ambiente real, constatou-se que os endpoints de listagem de modelos e marcas da BrasilAPI apresentavam instabilidade recorrente e erros persistentes de rota (`HTTP 404 / 400`), resultando em falhas no encadeamento dos seletores e travamento da interface.

Para garantir que o código funcionasse perfeitamente, com alta disponibilidade, estabilidade nas rotas e resposta em tempo real, a URL base (`API_BASE`) foi migrada para a **API FIPE do Deivid Fortuna (Parallelum)**:

```javascript
const API_BASE = "[https://parallelum.com.br/fipe/api/v1](https://parallelum.com.br/fipe/api/v1)";
