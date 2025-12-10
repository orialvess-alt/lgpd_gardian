import React, { useState } from 'react';
import { RopaEntry } from '../types';
import { Plus, Edit2, Trash2, Save, X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RopaManagerProps {
  entries: RopaEntry[];
  onAdd: (entry: Omit<RopaEntry, 'id' | 'tenantId' | 'updatedAt'>) => void;
  onUpdate: (id: string, entry: Partial<RopaEntry>) => void;
  onDelete: (id: string) => void;
}

export const RopaManager: React.FC<RopaManagerProps> = ({ entries, onAdd, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    processName: '',
    department: '',
    dataTypes: '',
    dataSubjects: '',
    legalBasis: '',
    retentionPeriod: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      dataTypes: formData.dataTypes.split(',').map(s => s.trim())
    };

    if (isAdding) {
      onAdd(payload);
      setIsAdding(false);
    } else if (isEditing) {
      onUpdate(isEditing, payload);
      setIsEditing(null);
    }
    setFormData({ processName: '', department: '', dataTypes: '', dataSubjects: '', legalBasis: '', retentionPeriod: '' });
  };

  const startEdit = (entry: RopaEntry) => {
    setFormData({
      processName: entry.processName,
      department: entry.department,
      dataTypes: entry.dataTypes.join(', '),
      dataSubjects: entry.dataSubjects,
      legalBasis: entry.legalBasis,
      retentionPeriod: entry.retentionPeriod
    });
    setIsEditing(entry.id);
    setIsAdding(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("ROPA - Registro de Operações", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 14, 28);
    doc.text("Relatório de conformidade LGPD (Art. 37)", 14, 33);

    const tableColumn = ["Processo", "Depto", "Tipos de Dados", "Titulares", "Base Legal", "Retenção"];
    const tableRows = entries.map(entry => [
      entry.processName,
      entry.department,
      entry.dataTypes.join(", "),
      entry.dataSubjects,
      entry.legalBasis,
      entry.retentionPeriod
    ]);

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [16, 185, 129] }, // Emerald-600 equivalent
      alternateRowStyles: { fillColor: [249, 250, 251] } // Gray-50
    });

    doc.save("ropa_relatorio_lgpd.pdf");
  };

  const inputClass = "w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none placeholder-gray-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ROPA - Mapeamento de Dados</h1>
          <p className="text-gray-500">Registro de Operações de Tratamento (Art. 37 LGPD)</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button 
            onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ processName: '', department: '', dataTypes: '', dataSubjects: '', legalBasis: '', retentionPeriod: '' }); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Processo
          </button>
        </div>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg animate-fade-in">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">{isAdding ? 'Novo Mapeamento de Processo' : 'Editar Processo'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Processo</label>
              <input name="processName" required value={formData.processName} onChange={handleInputChange} className={inputClass} placeholder="ex: Folha de Pagamento" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <input name="department" required value={formData.department} onChange={handleInputChange} className={inputClass} placeholder="ex: RH" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipos de Dados (separados por vírgula)</label>
              <input name="dataTypes" required value={formData.dataTypes} onChange={handleInputChange} className={inputClass} placeholder="ex: Nome, CPF, Salário" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulares dos Dados</label>
              <input name="dataSubjects" required value={formData.dataSubjects} onChange={handleInputChange} className={inputClass} placeholder="ex: Funcionários" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Legal</label>
              <select name="legalBasis" value={formData.legalBasis} onChange={handleInputChange} className={inputClass}>
                <option value="">Selecione...</option>
                <option value="Consentimento">Consentimento</option>
                <option value="Obrigação Legal">Obrigação Legal</option>
                <option value="Execução de Contrato">Execução de Contrato</option>
                <option value="Legítimo Interesse">Legítimo Interesse</option>
                <option value="Exercício Regular de Direitos">Exercício Regular de Direitos</option>
                <option value="Proteção da Vida">Proteção da Vida</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período de Retenção</label>
              <input name="retentionPeriod" required value={formData.retentionPeriod} onChange={handleInputChange} className={inputClass} placeholder="ex: 5 anos" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
              <tr>
                <th className="p-4">Processo</th>
                <th className="p-4">Depto</th>
                <th className="p-4">Tipos de Dados</th>
                <th className="p-4">Base Legal</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{entry.processName}</td>
                  <td className="p-4 text-gray-600">{entry.department}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {entry.dataTypes.map((dt, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">{dt}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-100">{entry.legalBasis}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(entry)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(entry.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Nenhum processo mapeado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};