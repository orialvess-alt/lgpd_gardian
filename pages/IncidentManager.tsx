import React, { useState } from 'react';
import { Incident, IncidentSeverity, IncidentStatus, User } from '../types';
import { analyzeIncident } from '../services/geminiService';
import { AlertCircle, BrainCircuit, Check, Loader2, Download, Eye, X, History, FileText, ArrowRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IncidentManagerProps {
  incidents: Incident[];
  currentUser: User;
  onReport: (incident: Omit<Incident, 'id' | 'tenantId' | 'dateReported'>) => void;
  onUpdate: (incident: Incident) => void;
}

export const IncidentManager: React.FC<IncidentManagerProps> = ({ incidents, currentUser, onReport, onUpdate }) => {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ severity: IncidentSeverity; analysis: string } | null>(null);
  
  // Modal State
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [actionDescription, setActionDescription] = useState('');
  const [pendingStatus, setPendingStatus] = useState<IncidentStatus | null>(null);

  const handleAnalyze = async () => {
    if (!description) return;
    setIsAnalyzing(true);
    const result = await analyzeIncident(description);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (analysisResult) {
      onReport({
        title,
        description,
        severity: analysisResult.severity,
        status: IncidentStatus.OPEN,
        history: [{
            date: new Date().toISOString(),
            action: 'Incidente Reportado',
            description: 'Registro inicial do incidente.',
            user: currentUser.name
        }]
      });
      setTitle('');
      setDescription('');
      setAnalysisResult(null);
    }
  };

  const handleStatusUpdate = () => {
    if (!selectedIncident || !pendingStatus) return;

    const updatedHistory = [
        ...selectedIncident.history,
        {
            date: new Date().toISOString(),
            action: `Status alterado para ${getStatusLabel(pendingStatus)}`,
            description: actionDescription || 'Alteração de status.',
            user: currentUser.name
        }
    ];

    const updatedIncident: Incident = {
        ...selectedIncident,
        status: pendingStatus,
        history: updatedHistory
    };

    onUpdate(updatedIncident);
    setSelectedIncident(updatedIncident); // Update modal view
    setActionDescription('');
    setPendingStatus(null);
  };

  const handleGlobalExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório Geral de Incidentes", 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableColumn = ["Data", "Título", "Severidade", "Status"];
    const tableRows = incidents.map(inc => [
      new Date(inc.dateReported).toLocaleDateString(),
      inc.title,
      inc.severity.toUpperCase(),
      getStatusLabel(inc.status)
    ]);

    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [220, 38, 38] }, // Red header
    });

    doc.save("relatorio_incidentes_geral.pdf");
  };

  const handleAuditExport = (incident: Incident) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Auditoria de Incidente: ${incident.title}`, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`ID: ${incident.id}`, 14, 30);
    doc.text(`Reportado em: ${new Date(incident.dateReported).toLocaleString()}`, 14, 35);
    doc.text(`Status Atual: ${getStatusLabel(incident.status)}`, 14, 40);

    const tableColumn = ["Data/Hora", "Usuário", "Ação", "Detalhes"];
    const tableRows = incident.history.map(h => [
      new Date(h.date).toLocaleString(),
      h.user,
      h.action,
      h.description
    ]);

    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [75, 85, 99] }, // Gray header
    });

    doc.save(`auditoria_incidente_${incident.id}.pdf`);
  };

  const getSeverityColor = (s: IncidentSeverity) => {
    switch (s) {
      case IncidentSeverity.CRITICAL: return 'bg-red-100 text-red-700 border-red-200';
      case IncidentSeverity.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      case IncidentSeverity.MEDIUM: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case IncidentSeverity.LOW: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusLabel = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN: return 'Aberto';
      case IncidentStatus.INVESTIGATING: return 'Investigando';
      case IncidentStatus.MITIGATED: return 'Mitigado';
      case IncidentStatus.RESOLVED: return 'Resolvido';
      case IncidentStatus.FALSE_POSITIVE: return 'Falso Positivo';
      default: return status;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Incidentes</h1>
            <button 
                onClick={handleGlobalExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
            >
                <FileText className="w-4 h-4" /> Relatório Geral
            </button>
        </div>
        
        {/* Incident List */}
        <div className="space-y-4">
          {incidents.map(incident => (
            <div key={incident.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1 cursor-pointer" onClick={() => setSelectedIncident(incident)}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`text-xs text-gray-500 font-mono`}>{new Date(incident.dateReported).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2 group">
                    {incident.title}
                    <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                </h3>
                <p className="text-gray-600 mt-1 text-sm line-clamp-2">{incident.description}</p>
              </div>
              
              <div className="flex flex-col items-end justify-between min-w-[140px]">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  incident.status === IncidentStatus.OPEN ? 'bg-blue-100 text-blue-700' :
                  incident.status === IncidentStatus.INVESTIGATING ? 'bg-purple-100 text-purple-700' :
                  incident.status === IncidentStatus.RESOLVED ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getStatusLabel(incident.status).toUpperCase()}
                </span>
                
                <button 
                    onClick={() => setSelectedIncident(incident)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-2"
                >
                    Ver Histórico
                </button>
              </div>
            </div>
          ))}
          {incidents.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-400">Nenhum incidente reportado. Bom trabalho!</div>
          )}
        </div>
      </div>

      {/* Report Form */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-lg text-gray-800">Reportar Novo Incidente</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do Incidente</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none placeholder-gray-400"
                placeholder="ex: Notebook Perdido"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none placeholder-gray-400"
                placeholder="Descreva o que aconteceu..."
                required
              />
            </div>

            {!analysisResult && (
              <button 
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !description}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                Analisar com Gemini
              </button>
            )}

            {analysisResult && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Avaliação IA</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(analysisResult.severity)}`}>
                    {analysisResult.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic mb-4">{analysisResult.analysis}</p>
                <button 
                  type="submit"
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Confirmar e Registrar
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-gray-900">{selectedIncident.title}</h2>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ${getSeverityColor(selectedIncident.severity)}`}>
                                {selectedIncident.severity}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">ID: {selectedIncident.id} | Reportado em {new Date(selectedIncident.dateReported).toLocaleString()}</p>
                    </div>
                    <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-gray-600 p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Descrição do Incidente</h3>
                        <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm leading-relaxed">
                            {selectedIncident.description}
                        </p>
                    </div>

                    {/* Status Update Area */}
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Atualizar Status
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-medium text-blue-800 mb-1">Novo Status</label>
                                <select 
                                    value={pendingStatus || selectedIncident.status}
                                    onChange={(e) => setPendingStatus(e.target.value as IncidentStatus)}
                                    className="w-full bg-white text-gray-900 border border-blue-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                >
                                    <option value={IncidentStatus.OPEN}>Aberto</option>
                                    <option value={IncidentStatus.INVESTIGATING}>Investigando</option>
                                    <option value={IncidentStatus.MITIGATED}>Mitigado</option>
                                    <option value={IncidentStatus.RESOLVED}>Resolvido</option>
                                    <option value={IncidentStatus.FALSE_POSITIVE}>Falso Positivo</option>
                                </select>
                            </div>
                            <div className="w-full md:w-2/3">
                                <label className="block text-xs font-medium text-blue-800 mb-1">Ação Tomada / Justificativa (Obrigatório)</label>
                                <div className="flex gap-2">
                                    <input 
                                        value={actionDescription}
                                        onChange={(e) => setActionDescription(e.target.value)}
                                        placeholder="Descreva a ação realizada..."
                                        className="flex-1 bg-white text-gray-900 border border-blue-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                    />
                                    <button 
                                        onClick={handleStatusUpdate}
                                        disabled={!pendingStatus || !actionDescription || pendingStatus === selectedIncident.status}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        Atualizar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline History */}
                    <div>
                         <div className="flex justify-between items-end mb-4">
                             <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                <History className="w-4 h-4" /> Histórico de Auditoria
                            </h3>
                            <button 
                                onClick={() => handleAuditExport(selectedIncident)}
                                className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <Download className="w-3 h-3" /> Exportar Auditoria
                            </button>
                         </div>
                        
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pb-2">
                            {selectedIncident.history?.slice().reverse().map((item, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                        <span className="text-sm font-bold text-gray-900">{item.action}</span>
                                        <span className="text-xs text-gray-500 font-mono">{new Date(item.date).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">Por: <span className="font-medium text-gray-700">{item.user}</span></p>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">{item.description}</p>
                                </div>
                            ))}
                            {(!selectedIncident.history || selectedIncident.history.length === 0) && (
                                <div className="pl-6 text-sm text-gray-400 italic">Nenhum histórico registrado.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};