import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { RopaEntry, Incident, IncidentSeverity, IncidentStatus } from '../types';
import { Shield, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardProps {
  ropas: RopaEntry[];
  incidents: Incident[];
}

export const Dashboard: React.FC<DashboardProps> = ({ ropas, incidents }) => {
  
  const openIncidents = incidents.filter(i => i.status !== IncidentStatus.RESOLVED).length;
  const criticalIncidents = incidents.filter(i => i.severity === IncidentSeverity.CRITICAL).length;
  const mappedProcesses = ropas.length;
  
  const severityData = [
    { name: 'Baixo', value: incidents.filter(i => i.severity === IncidentSeverity.LOW).length, color: '#10B981' },
    { name: 'Médio', value: incidents.filter(i => i.severity === IncidentSeverity.MEDIUM).length, color: '#F59E0B' },
    { name: 'Alto', value: incidents.filter(i => i.severity === IncidentSeverity.HIGH).length, color: '#F97316' },
    { name: 'Crítico', value: incidents.filter(i => i.severity === IncidentSeverity.CRITICAL).length, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const deptData = ropas.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.department);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.department, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Visão Geral de Conformidade</h1>
        <div className="text-sm text-gray-500">Última atualização: Hoje</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Processos Mapeados" 
          value={mappedProcesses} 
          icon={FileText} 
          color="bg-blue-500"
          trend="+2 esta semana"
        />
        <KpiCard 
          title="Incidentes Abertos" 
          value={openIncidents} 
          icon={AlertTriangle} 
          color="bg-orange-500"
          trend={`${criticalIncidents} Críticos`}
        />
        <KpiCard 
          title="Nível de Conscientização" 
          value="85%" 
          icon={Shield} 
          color="bg-emerald-500"
          trend="Top 10% do setor"
        />
        <KpiCard 
          title="Status do DPO" 
          value="Ativo" 
          icon={CheckCircle} 
          color="bg-indigo-500"
          trend="Próxima Revisão: 12 dias"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Processos por Departamento</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Incidentes por Severidade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {severityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
      <p className="text-xs text-gray-400 mt-2">{trend}</p>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);