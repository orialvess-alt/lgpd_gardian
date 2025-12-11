// FIX: Import `Type` for defining response schemas.
import { GoogleGenAI, Type } from "@google/genai";
import { IncidentSeverity, AwarenessCategory, Quiz } from "../types";

const getAiClient = () => {
  // Vite substitui process.env.API_KEY pela string real durante o build.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === 'SUA_CHAVE_AQUI') {
    console.error("LGPD Guardian Error: API Key inválida ou não configurada.");
    
    // FIX: Replaced `import.meta.env.PROD` with `process.env.NODE_ENV` to resolve TypeScript error.
    // This check provides more helpful error messages depending on the environment.
    if (process.env.NODE_ENV === 'production') {
      console.error("--> AMBIENTE DE PRODUÇÃO (VERCEL) DETECTADO. Vá em Settings > Environment Variables no seu projeto Vercel e adicione a chave 'API_KEY'. Faça um 'Redeploy' depois de salvar.");
    } else {
      console.info("--> Dica para Desenvolvimento: Verifique se o arquivo '.env' existe na raiz do projeto e contém a linha 'API_KEY=AIza...'.");
    }
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
  if (!ai) return "Erro de Configuração: Chave de API da IA não encontrada. Verifique as configurações de Environment Variables na Vercel.";

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
    return "Ocorreu um erro técnico ao comunicar com a IA. Verifique se a Chave de API é válida e tem permissões para o modelo 'gemini-2.5-flash'.";
  }
};

export const analyzeIncident = async (description: string): Promise<{ severity: IncidentSeverity; analysis: string }> => {
  const ai = getAiClient();
  if (!ai) return { severity: IncidentSeverity.MEDIUM, analysis: "Erro: Chave de API não configurada no painel da Vercel." };

  const prompt = `
    Analise a seguinte descrição de incidente de segurança sob o contexto da LGPD brasileira.
    Descrição: "${description}"
    
    Determine a provável severidade (low, medium, high, ou critical) e forneça uma breve justificativa e ações imediatas recomendadas.
    A análise deve ser escrita em Português do Brasil.
    
    Retorne a resposta como um objeto JSON válido com as chaves: "severity" (string enum: low, medium, high, critical) e "analysis" (string em português).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      // FIX: Added responseSchema to ensure structured JSON output as per Gemini API guidelines.
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              description: 'The incident severity, one of: low, medium, high, critical'
            },
            analysis: {
              type: Type.STRING,
              description: 'A brief analysis and recommended actions in Brazilian Portuguese.'
            }
          },
          required: ['severity', 'analysis']
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return {
      severity: (json.severity as IncidentSeverity) || IncidentSeverity.MEDIUM,
      analysis: json.analysis || "Não foi possível analisar o incidente automaticamente."
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { severity: IncidentSeverity.MEDIUM, analysis: "Erro de conexão com a IA. Tente novamente mais tarde." };
  }
};

export const generateAwarenessPost = async (topic: string, category: AwarenessCategory): Promise<{ title: string; content: string; quiz: Quiz | null }> => {
  const ai = getAiClient();
  if (!ai) throw new Error("Chave de API não configurada. Configure API_KEY nas variáveis de ambiente.");

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      // FIX: Added responseSchema to ensure structured JSON output as per Gemini API guidelines.
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            quiz: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctAnswerIndex', 'explanation']
            }
          },
          required: ['title', 'content', 'quiz']
        }
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "Erro na Geração",
      content: "Não foi possível gerar o conteúdo devido a um erro na configuração da API.",
      quiz: null
    };
  }
};
