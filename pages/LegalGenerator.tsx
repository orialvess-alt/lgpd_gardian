import React, { useState, useRef, useEffect } from 'react';
import { generateLegalDocument } from '../services/geminiService';
import { FileText, Loader2, Download, RefreshCw, Bold, Italic, List, Heading, Type, Save, History, Clock, ChevronRight, Trash2, PenTool } from 'lucide-react';
import { Tenant, LegalDoc, DocType } from '../types';
import jsPDF from 'jspdf';
import { marked } from 'marked';

interface LegalGeneratorProps {
  tenant: Tenant;
  documents: LegalDoc[];
  onSaveDocument: (doc: LegalDoc) => void;
  onUpdateDocument: (doc: LegalDoc) => void;
  onDeleteDocument: (id: string) => void;
}

const DOC_TYPES = [
  "Política de Privacidade",
  "Termos de Uso",
  "Política de Cookies",
  "Aviso de Privacidade para Funcionários",
  "Relatório de Impacto (DPIA/RIPD)",
  "Acordo de Processamento de Dados (DPA)",
  "Política de Retenção e Descarte de Dados",
  "Plano de Resposta a Incidentes",
  "Teste de Legítimo Interesse (LIA)",
  "Política de Segurança da Informação",
  "Termo de Consentimento para Uso de Imagem",
  "Política de BYOD (Traga seu próprio dispositivo)",
  "Cláusulas Contratuais Padrão (LGPD)",
  "Relatório de Conformidade de Fornecedores"
];

export const LegalGenerator: React.FC<LegalGeneratorProps> = ({ 
    tenant, 
    documents, 
    onSaveDocument, 
    onUpdateDocument,
    onDeleteDocument
}) => {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<LegalDoc | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync editor content when currentDoc changes
  useEffect(() => {
    if (editorRef.current) {
        if (currentDoc) {
            editorRef.current.innerHTML = currentDoc.content;
        } else {
            editorRef.current.innerHTML = '';
        }
    }
  }, [currentDoc]);

  const getEffectiveTitle = () => {
      return docType === 'custom' ? customTitle : docType;
  };

  const handleGenerate = async () => {
    const title = getEffectiveTitle();
    if (!title) return;

    setIsGenerating(true);
    // Mock data types for the demo context
    const dataTypes = ['Nome', 'Email', 'CPF', 'Endereço IP', 'Cookies', 'Dados Bancários'];
    
    const markdownContent = await generateLegalDocument(title, tenant.name, "Tecnologia e Serviços", dataTypes);
    
    // Parse markdown to HTML
    const htmlContent = await marked.parse(markdownContent);
    
    const newDoc: LegalDoc = {
        id: Math.random().toString(36).substr(2, 9),
        tenantId: tenant.id,
        title: `${title} - ${new Date().toLocaleDateString()}`,
        content: htmlContent,
        type: DocType.PRIVACY_POLICY, // Generic type
        version: 1,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    onSaveDocument(newDoc);
    setCurrentDoc(newDoc);
    setIsGenerating(false);
    setCustomTitle('');
    if(docType === 'custom') setDocType(DOC_TYPES[0]);
  };

  const handleCreateManual = () => {
    const title = getEffectiveTitle();
    if (!title) return;

    const newDoc: LegalDoc = {
        id: Math.random().toString(36).substr(2, 9),
        tenantId: tenant.id,
        title: `${title} (Manual) - ${new Date().toLocaleDateString()}`,
        content: `<h1>${title}</h1><p>Digite o conteúdo do seu documento aqui...</p>`,
        type: DocType.PRIVACY_POLICY, // Generic type
        version: 1,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    onSaveDocument(newDoc);
    setCurrentDoc(newDoc);
    setCustomTitle('');
    if(docType === 'custom') setDocType(DOC_TYPES[0]);
  };

  const handleManualSave = () => {
      if (!currentDoc || !editorRef.current) return;
      
      const updatedContent = editorRef.current.innerHTML;
      const updatedDoc = {
          ...currentDoc,
          content: updatedContent,
          updatedAt: new Date().toISOString()
      };
      
      onUpdateDocument(updatedDoc);
      setCurrentDoc(updatedDoc);
      // Optional: Show toast notification here
  };

  const handleSelectDocument = (doc: LegalDoc) => {
      setCurrentDoc(doc);
  };

  const handleExportPDF = () => {
    if (!editorRef.current) return;
    const contentText = editorRef.current.innerText; // Get text content without HTML tags for PDF (simple version)

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    const lineHeight = 7;
    let cursorY = margin;

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(currentDoc?.title.toUpperCase() || "DOCUMENTO JURÍDICO", margin, cursorY);
    cursorY += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Empresa: ${tenant.name} | CNPJ: ${tenant.cnpj}`, margin, cursorY);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, margin, cursorY + 5);
    cursorY += 15;

    doc.setDrawColor(200);
    doc.line(margin, cursorY - 5, pageWidth - margin, cursorY - 5);

    // Content Body
    doc.setFontSize(11);
    doc.setTextColor(0);

    // Split text into lines that fit the page width
    const lines = doc.splitTextToSize(contentText, maxLineWidth);

    lines.forEach((line: string) => {
      // Check if we need a new page
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    // Footer page numbers
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
    }

    doc.save(`${(currentDoc?.title || "documento").replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Configuration Panel & History */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4 h-full">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerador Jurídico</h1>
            <p className="text-gray-500 text-sm">Crie e gerencie documentos de conformidade.</p>
        </div>

        {/* Generator Controls */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 shrink-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            >
              {DOC_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="custom">Outro (Personalizado)...</option>
            </select>
          </div>

          {docType === 'custom' && (
             <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Documento</label>
                <input 
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ex: Termo de Uso de Wi-Fi"
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
             </div>
          )}

          <div className="flex flex-col gap-2">
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || (docType === 'custom' && !customTitle)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-70 transition-all shadow-sm text-sm"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Gerar com IA
            </button>
            
            <button 
                onClick={handleCreateManual}
                disabled={isGenerating || (docType === 'custom' && !customTitle)}
                className="w-full py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-70 transition-all shadow-sm text-sm"
            >
                <PenTool className="w-4 h-4" />
                Criar Rascunho Manual
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-0">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700 text-sm">Histórico de Documentos</span>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {documents.map(doc => (
                    <div 
                        key={doc.id}
                        onClick={() => handleSelectDocument(doc)}
                        className={`group p-3 rounded-lg cursor-pointer transition-all border ${
                            currentDoc?.id === doc.id 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className={`text-sm font-medium line-clamp-2 ${currentDoc?.id === doc.id ? 'text-emerald-900' : 'text-gray-700'}`}>
                                {doc.title}
                            </h3>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
                {documents.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        Nenhum documento gerado ainda.
                    </div>
                )}
             </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-full">
        {/* Toolbar */}
        <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50 shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={() => execCommand('bold')} title="Negrito" className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><Bold className="w-4 h-4" /></button>
            <button onClick={() => execCommand('italic')} title="Itálico" className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><Italic className="w-4 h-4" /></button>
            <button onClick={() => execCommand('formatBlock', 'H2')} title="Título" className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><Heading className="w-4 h-4" /></button>
            <button onClick={() => execCommand('insertUnorderedList')} title="Lista" className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><List className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-gray-300 mx-2"></div>
            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                {currentDoc ? currentDoc.title : "Editor de Texto"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={handleManualSave}
                disabled={!currentDoc}
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:bg-gray-400"
            >
                <Save className="w-4 h-4" /> Salvar
            </button>
            <button 
                onClick={handleExportPDF}
                disabled={!currentDoc || isGenerating}
                className="text-sm bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
                <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
        
        {/* WYSIWYG Editor Area */}
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
              <div className="text-center">
                <p className="text-gray-800 font-medium">Redigindo {getEffectiveTitle()}...</p>
                <p className="text-sm text-gray-500">Analisando base legal e conformidade.</p>
              </div>
            </div>
          ) : !currentDoc ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="bg-white p-6 rounded-full border border-gray-100 shadow-sm">
                <FileText className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-500">Nenhum documento selecionado</p>
              <p className="text-sm max-w-xs text-center">Selecione um documento do histórico ou gere um novo para começar a editar.</p>
            </div>
          ) : (
            <div 
                ref={editorRef}
                contentEditable
                className="w-full h-full p-8 outline-none overflow-y-auto prose prose-sm max-w-none text-gray-900 bg-white"
                style={{ minHeight: '100%' }}
                onInput={() => {}} // Could trigger auto-save or dirty state here
            />
          )}
        </div>
      </div>
    </div>
  );
};