  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Elementos DOM
      const form = document.getElementById('ai-form');
      const apiKeyInput = document.getElementById('apiKey');
      const modelSelect = document.getElementById('model');
      const questionInput = document.getElementById('question');
      const askButton = document.getElementById('ask-button');
      const responseContainer = document.getElementById('response-container');
      const responseContent = document.getElementById('response-content');
      const loadingStatus = document.getElementById('loading-status');
      const errorStatus = document.getElementById('error-status');
      const errorMessage = document.getElementById('error-message');
      const copyButton = document.getElementById('copy-btn');
      const clearButton = document.getElementById('clear-btn');
      
      // Carregar chave API salva
      const savedApiKey = localStorage.getItem('tapiobot_api_key');
      if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
      }
      
      // Evento de envio do formulário
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await askQuestion();
      });
      
      // Atalho Ctrl+Enter
      questionInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
          askQuestion();
        }
      });
      
      // Copiar resposta
      copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(responseContent.textContent)
          .then(() => {
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copiado!';
            setTimeout(() => {
              copyButton.innerHTML = originalText;
            }, 2000);
          });
      });
      
      // Limpar resposta
      clearButton.addEventListener('click', function() {
        responseContent.textContent = '';
        responseContainer.style.display = 'none';
      });
      
      // Função principal para fazer a pergunta à IA
      async function askQuestion() {
        // Resetar estados
        hideError();
        hideLoading();
        
        // Validações
        const apiKey = apiKeyInput.value.trim();
        const model = modelSelect.value;
        const question = questionInput.value.trim();
        
        if (!apiKey) {
          showError('Por favor, insira sua chave da API');
          apiKeyInput.focus();
          return;
        }
        
        if (!question) {
          showError('Por favor, digite sua pergunta');
          questionInput.focus();
          return;
        }
        
        // Salvar chave no localStorage
        localStorage.setItem('tapiobot_api_key', apiKey);
        
        // Mostrar estado de carregamento
        showLoading();
        askButton.disabled = true;
        
        try {
          // Fazer requisição para a API
          const response = await fetchAI(apiKey, model, question);
          
          // Exibir resposta
          responseContent.textContent = response;
          responseContainer.style.display = 'block';
          
          // Rolar para a resposta
          responseContainer.scrollIntoView({ behavior: 'smooth' });
          
        } catch (error) {
          showError(error.message);
        } finally {
          hideLoading();
          askButton.disabled = false;
        }
