import { GoogleGenerativeAI } from "@google/generative-ai";

// ...

const getAiClient = () => {
  const apiKey = process.env.API_KEY; // ou como você pega a chave
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};
import { IncidentSeverity, AwarenessCategory } from "../types";

const getAiClient = () => {
  // Vite replaces process.env.API_KEY with the actual string during build.
  // We check for specific undefined string, null, or the default placeholder to avoid runtime crashes.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === 'SUA_CHAVE_AQUI') {
    console.warn("LGPD Guardian: API Key do Gemini não configurada. Verifique o arquivo .env ou as variáveis de ambiente da Vercel.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLegalDocument = async (
  docType: string,
  companyName: string,
  industry: string,
  dataTypes: string[]
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Erro: Chave de API não configurada. Configure a variável API_KEY no arquivo .env ou no painel da Vercel.";

  const prompt = `
    Atue como um advogado especialista em Proteção de Dados e LGPD (Lei Geral de Proteção de Dados - Brasil).
    
    Tarefa: Redija uma minuta completa e profissional de "${docType}".
    
    Dados da Empresa (Controlador):
    - Nome: "${companyName}"
    - Setor de Atuação: "${industry}"
    - Tipos de Dados Pessoais Tratados: ${dataTypes.join(', ')}.

    Requisitos:
    1. O documento deve estar estritamente em conformidade com a Lei 13.709/2018 (LGPD).
    2. Use linguagem jurídica clara, porém formal.
    3. Inclua seções essenciais como: Definições, Finalidade do Tratamento, Direitos dos Titulares, Segurança, Retenção e Contato do Encarregado (DPO).
    4. Formate a saída usando Markdown limpo (Use ## para títulos de seções, ** para ênfase, - para listas).
    5. NÃO inclua saudações ou explicações fora do documento. Retorne apenas o texto do documento.
    6. Escreva em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Falha ao gerar o documento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao gerar o documento. Por favor, verifique sua conexão ou a validade da chave de API.";
  }
};

export const analyzeIncident = async (description: string): Promise<{ severity: IncidentSeverity; analysis: string }> => {
  const ai = getAiClient();
  if (!ai) return { severity: IncidentSeverity.MEDIUM, analysis: "Chave de API ausente. Configure o .env." };

  const prompt = `
    Analise a seguinte descrição de incidente de segurança sob o contexto da LGPD brasileira.
    Descrição: "${description}"
    
    Determine a provável severidade (low, medium, high, ou critical) e forneça uma breve justificativa e ações imediatas recomendadas.
    A análise deve ser escrita em Português do Brasil.
    
    Retorne a resposta como um objeto JSON válido com as chaves: "severity" (string enum: low, medium, high, critical) e "analysis" (string em português).
export const generateLegalDocument = async (
  prompt: string // Assumindo que o argumento 'prompt' vem daqui, ajuste se necessário
) => {
  const ai = getAiClient(); // Certifique-se que getAiClient retorna 'new GoogleGenerativeAI(API_KEY)'
  
  try {
    // CORREÇÃO: Sintaxe da nova biblioteca @google/generative-ai
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text(); // Agora é uma função

    const json = JSON.parse(responseText || "{}");
    return {
      severity: json.severity || "MEDIUM", // Ajuste conforme seu enum
      analysis: json.analysis || "Não foi possível analisar o incidente."
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { severity: "MEDIUM", analysis: "Erro durante a análise. Verifique logs." };
  }
};

export const generateAwarenessPost = async (topic: string, category: string): Promise<{ title: string; content: string; quiz: any }> => {
  const ai = getAiClient();
  if (!ai) throw new Error("Chave de API ausente. Verifique o .env");

  const prompt = `
    Atue como um Especialista em Cultura de Privacidade e LGPD.
    
    Tarefa: Crie um módulo de treinamento curto para newsletter interna corporativa.
    Categoria: "${category}"
    Tópico Específico: "${topic}"
    
    Objetivo: Educar colaboradores e criar uma cultura de proteção de dados.
    
    Requisitos do Conteúdo:
    1. Educativo e prático (foco no dia a dia).
    2. Linguagem acessível mas profissional.
    3. Markdown rico no conteúdo (negrito, listas).
    
    Requisitos do Quiz:
    Inclua uma pergunta de múltipla escolha para testar o conhecimento adquirido no texto.
    
    Formato de Resposta (JSON Obrigatório):
    {
      "title": "Título criativo e curto com emoji",
      "content": "Texto do artigo em Markdown...",
      "quiz": {
        "question": "A pergunta do teste",
        "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
        "correctAnswerIndex": 0, // índice da resposta correta (0-3)
        "explanation": "Breve explicação do porquê esta é a correta."
      }
    }
  `;

  try {
    // CORREÇÃO: Sintaxe da nova biblioteca
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "Erro na Geração",
      content: "Não foi possível gerar o conteúdo neste momento. Verifique a chave de API.",
      quiz: null
    };
  }
};
