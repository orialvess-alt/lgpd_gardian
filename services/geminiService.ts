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
  const apiKey = process.env.API_KEY;

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
    3. Inclua seções essenciais como: Definições, Finalidade do Tratamento, Direitos dos Titulares, Segurança, Retenção e Contato do Encarreg
