import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";
// Certifique-se de que seus tipos estão definidos corretamente neste caminho
import { IncidentSeverity, AwarenessCategory, Quiz } from "../types";

// --- Utilitários ---

/**
 * Remove formatação Markdown (ex: ```json ... ```) que o modelo possa incluir.
 */
const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  // Remove o bloco de código markdown inicial e final
  let clean = text.replace(/```json\s*/g, "").replace(/```/g, "");
  return clean.trim();
};

/**
 * Inicializa o cliente do Google Generative AI.
 * Retorna null se a chave não estiver configurada.
 */
const getAiModel = (modelName: string = "gemini-1.5-flash", jsonMode: boolean = false) => {
  const apiKey = import.meta.env.VITE_API_KEY;

  // Verificações de segurança para a chave
  if (!apiKey || apiKey === 'undefined' || apiKey === 'SUA_CHAVE_AQUI') {
    console.warn("LGPD Guardian: API Key do Gemini não configurada.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const config: GenerationConfig = {
    temperature: 0.7, // Criatividade balanceada
  };

  // Ativa o 'JSON Mode' nativo do Gemini 1.5 para garantir estrutura
  if (jsonMode) {
    config.responseMimeType = "application/json";
  }

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: config,
  });
};

// --- Funções Exportadas ---

export const generateLegalDocument = async (
  docType: string,
  companyName: string,
  industry: string,
  dataTypes: string[]
): Promise<string> => {
  const model = getAiModel("gemini-1.5-flash", false); // Modo texto
  if (!model) return "Erro: Chave de API não configurada. Verifique o arquivo .env.";

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
    5. NÃO inclua saudações ou explicações fora do documento. Retorne APENAS o texto do documento.
    6. Escreva em Português do Brasil.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error (Doc Gen):", error);
    return "Ocorreu um erro ao gerar o documento. Por favor, verifique sua conexão ou a validade da chave de API.";
  }
};

export const analyzeIncident = async (description: string): Promise<{ severity: IncidentSeverity; analysis: string }> => {
  const model = getAiModel("gemini-1.5-flash", true); // Modo JSON
  
  // Fallback seguro se não houver modelo
  if (!model) {
    return { severity: IncidentSeverity.MEDIUM, analysis: "Chave de API ausente. Configure o .env." };
  }

  const prompt = `
    Analise a seguinte descrição de incidente de segurança sob o contexto da LGPD brasileira.
    Descrição: "${description}"
    
    Determine a provável severidade (low, medium, high, ou critical) e forneça uma breve justificativa e ações imediatas recomendadas.
    
    Retorne APENAS um objeto JSON com as chaves:
    - "severity": (string enum: low, medium, high, critical)
    - "analysis": (string em português do Brasil)
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = cleanJsonString(response.text());
    
    const json = JSON.parse(text);

    return {
      severity: (json.severity as IncidentSeverity) || IncidentSeverity.MEDIUM,
      analysis: json.analysis || "Não foi possível analisar o incidente."
    };
  } catch (error) {
    console.error("Gemini API Error (Incident):", error);
    return { severity: IncidentSeverity.MEDIUM, analysis: "Erro técnico durante a análise do incidente." };
  }
};

export const generateAwarenessPost = async (topic: string, category: AwarenessCategory): Promise<{ title: string; content: string; quiz: Quiz | null }> => {
  const model = getAiModel("gemini-1.5-flash", true); // Modo JSON
  if (!model) throw new Error("Chave de API ausente. Verifique o .env");

  const prompt = `
    Atue como um Especialista em Cultura de Privacidade e LGPD.
    
    Tarefa: Crie um módulo de treinamento curto para newsletter interna corporativa.
    Categoria: "${category}"
    Tópico Específico: "${topic}"
    
    Objetivo: Educar colaboradores e criar uma cultura de proteção de dados.
    
    Requisitos:
    1. Conteúdo educativo e prático (foco no dia a dia).
    2. Linguagem acessível mas profissional.
    3. Markdown rico no conteúdo (negrito, listas).
    
    Retorne APENAS um JSON válido com esta estrutura exata:
    {
      "title": "Título criativo e curto com emoji",
      "content": "Texto do artigo em Markdown...",
      "quiz": {
        "question": "A pergunta do teste",
        "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
        "correctAnswerIndex": 0,
        "explanation": "Breve explicação do porquê esta é a correta."
      }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = cleanJsonString(response.text());
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error (Awareness):", error);
    return {
      title: "Erro na Geração",
      content: "Não foi possível gerar o conteúdo neste momento. Verifique a chave de API.",
      quiz: null
    };
  }
};
