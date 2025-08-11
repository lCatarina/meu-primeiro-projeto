    // 1. Variáveis e Seletores do DOM
    const selectors = {
        apiKeyInput: document.getElementById('apiKey'),
        questionTextarea: document.getElementById('question'),
        submitBtn: document.getElementById('submitBtn'),
        responseDiv: document.getElementById('response'),
        loadingDiv: document.getElementById('loading'),
        errorDiv: document.getElementById('error'),
        modeloSelect: document.getElementById('modelo'),
    };

    // 2. Funções de Feedback Visual
    const ui = {
        showLoading: () => {
            selectors.responseDiv.textContent = '';
            selectors.errorDiv.classList.add('hidden');
            selectors.loadingDiv.classList.remove('hidden');
            selectors.submitBtn.disabled = true;
        },
        hideLoading: () => {
            selectors.loadingDiv.classList.add('hidden');
            selectors.submitBtn.disabled = false;
        },
        showError: (message) => {
            selectors.errorDiv.textContent = `Erro: ${message}`;
            selectors.errorDiv.classList.remove('hidden');
        },
        displayResponse: (text) => {
            selectors.responseDiv.textContent = text;
        },
    };

    // 3. Função Central da API
    async function getApiResponse(apiKey, question, model) {
        ui.showLoading();

        let url;
        let bodyData;
        let geminiModel;

        if (model === 'openai') {
            url = 'https://api.openai.com/v1/chat/completions';
            bodyData = {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'system',
                    content: 'Você é um assistente de IA que responde a perguntas usando gírias e expressões populares do Brasil, como "e aí", "beleza?", "demorô", "tá ligado?", "massa", "bacana", "mano", "parça", etc. Mantenha um tom informal e descontraído nas respostas.',
                }, {
                    role: 'user',
                    content: question
                }],
                temperature: 0.7,
            };
        } else if (model.startsWith('gemini')) {
            if (model === 'gemini-pro') {
                geminiModel = 'gemini-pro';
            } else if (model === 'gemini-flash') {
                geminiModel = 'gemini-1.5-flash';
            }
            url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
            bodyData = {
                contents: [{
                    role: 'user',
                    parts: [{
                        text: `Responda a esta pergunta usando gírias e expressões populares do Brasil de forma informal e descontraída: ${question}`
                    }]
                }]
            };
        } else {
            ui.showError('Modelo de IA não selecionado ou inválido.');
            ui.hideLoading();
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ... (model === 'openai' && { 'Authorization': `Bearer ${apiKey}` })
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || `Erro na requisição: ${response.status}`);
            }

            const data = await response.json();
            
            let textResponse;
            if (model === 'openai') {
                textResponse = data.choices?.[0]?.message?.content;
            } else if (model.startsWith('gemini')) {
                textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            
            if (textResponse) {
                ui.displayResponse(textResponse);
            } else {
                ui.showError('A resposta da API não pôde ser processada corretamente.');
                console.error('Resposta da API sem conteúdo:', data);
            }

        } catch (error) {
            ui.showError(error.message);
            console.error('Erro:', error);
        } finally {
            ui.hideLoading();
        }
    }

    // 4. Manipulador de Evento do Botão
    function handleButtonClick() {
        const apiKey = selectors.apiKeyInput.value.trim();
        const question = selectors.questionTextarea.value.trim();
        const selectedModel = selectors.modeloSelect.value;

        if (!apiKey) {
            ui.showError('E aí, mano! Faltou preencher a sua API Key.');
            return;
        }

        if (!selectedModel) {
            ui.showError('Parça, você esqueceu de selecionar um modelo de IA.');
            return;
        }

        if (!question) {
            ui.showError('Beleza? Faltou digitar a sua pergunta, demorô?');
            return;
        }
        
        getApiResponse(apiKey, question, selectedModel);
    }

    // 5. Listener de Evento Principal
    selectors.submitBtn.addEventListener('click', handleButtonClick);

