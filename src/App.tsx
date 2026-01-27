import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  MessageSquare, Layers, Activity, Search, 
  Target, BarChart3, Video, Briefcase, Loader2, AlertCircle
} from "lucide-react";

// Interface baseada no Banco de Dados D1
interface Feedback {
  id: number;
  video_marca: string;
  video_tema: string;
  video_formato: string;
  video_versao: string;
  comment_text: string;
  ai_summary: string;
  ai_category_topic: string; // JSON array string
  created_at: string;
}

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];

export default function UltimateDashboard() {
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Filtros
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [selectedVersion, setSelectedVersion] = useState("Todas");
  const [selectedFormat, setSelectedFormat] = useState("Todos");
  const [search, setSearch] = useState("");

  // 1. Busca de Dados Real (Cloudflare API)
  useEffect(() => {
    setLoading(true);
    fetch('/api/feedbacks')
      .then(res => {
        if (!res.ok) throw new Error("Falha ao conectar com o Banco D1.");
        return res.json();
      })
      .then(json => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. Lógica de Filtros em Cascata (Usabilidade)
  const brands = useMemo(() => ["Todas", ...new Set(data.map(d => d.video_marca))], [data]);

  const availableVersions = useMemo(() => {
    const brandFiltered = selectedBrand === "Todas" ? data : data.filter(d => d.video_marca === selectedBrand);
    return ["Todas", ...new Set(brandFiltered.map(d => d.video_versao))].sort();
  }, [selectedBrand, data]);

  const filteredData = useMemo(() => {
    return data.filter(d => 
      (selectedBrand === "Todas" || d.video_marca === selectedBrand) &&
      (selectedVersion === "Todas" || d.video_versao === selectedVersion) &&
      (selectedFormat === "Todos" || d.video_formato === selectedFormat) &&
      d.video_tema.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, selectedBrand, selectedVersion, selectedFormat, search]);

  // 3. KPI 3: Média de Rodadas por Marca
  const roundsByBrand = useMemo(() => {
    const bList = [...new Set(data.map(d => d.video_marca))];
    return bList.map(b => {
      const brandData = data.filter(d => d.video_marca === b);
      const maxV = Math.max(...brandData.map(d => parseInt(d.video_versao.replace(/\D/g, '')) || 0));
      return { name: b, rodadas: maxV + 1 }; // v0 conta como 1 rodada
    }).sort((a, b) => b.rodadas - a.rodadas);
  }, [data]);

  // 4. KPI 2: Distribuição de Tópicos (IA)
  const topicData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      try {
        const topics = JSON.parse(item.ai_category_topic || "[]");
        const list = Array.isArray(topics) ? topics : ["Outros"];
        list.forEach((t: string) => { counts[t] = (counts[t] || 0) + 1; });
      } catch {
        counts["Outros"] = (counts["Outros"] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F9] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Sincronizando D1...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-black text-red-900 uppercase">Erro de Conexão</h2>
      <p className="text-red-700 mt-2 font-medium">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-12 font-sans text-[#1E293B]">
      
      {/* HEADER & FILTROS GLOBAIS */}
      <header className="max-w-7xl mx-auto mb-10 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-[1000] tracking-tighter text-[#0F172A] uppercase">Feedback Intelligence</h1>
          <Badge className="bg-[#1E293B] text-white px-5 py-2 rounded-full font-black tracking-widest border-none text-[10px]">PAGES PRO V1.5</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-white">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar projeto..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-[24px] bg-white border-none focus:ring-2 focus:ring-indigo-600 font-bold text-sm outline-none" 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <FilterSelect label="Marca" options={brands} value={selectedBrand} onChange={(v: string) => { setSelectedBrand(v); setSelectedVersion("Todas"); }} />
          <FilterSelect label="Versão" options={availableVersions} value={selectedVersion} onChange={setSelectedVersion} />
          <FilterSelect label="Formato" options={["Todos", "BC", "BCR"]} value={selectedFormat} onChange={setSelectedFormat} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-10">
        
        {/* KPI CARDS (PULSO DO PROJETO) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <KPICard title="Feedbacks" value={filteredData.length} icon={<MessageSquare />} color="#4F46E5" sub="Volume de pedidos" />
          <KPICard title="Projetos" value={[...new Set(filteredData.map(d=>d.video_tema))].length} icon={<Briefcase />} color="#10B981" sub="Campanhas ativas" />
          <KPICard title="Rodadas" value={(roundsByBrand.reduce((a,b)=>a+b.rodadas,0)/roundsByBrand.length || 0).toFixed(1)} icon={<Layers />} color="#F59E0B" sub="Média por marca" />
        </section>

        {/* ANALYTICS SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gráfico de Tópicos - KPI 2 */}
          <Card className="lg:col-span-4 rounded-[40px] border-none shadow-xl bg-white p-8">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tighter"><Activity className="h-5 w-5 text-indigo-600" /> Temas Recorrentes</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topicData} innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value">
                    {topicData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '20px', border: 'none', fontWeight: '900' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {topicData.map((t, i) => (
                <div key={t.name} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-[900] text-slate-500 uppercase">{t.name}</span>
                  </div>
                  <span className="font-black text-indigo-600 text-sm">{t.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Gráfico de Esforço - KPI 3 */}
          <Card className="lg:col-span-8 rounded-[40px] border-none shadow-xl bg-white p-8">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tighter"><BarChart3 className="h-5 w-5 text-indigo-600" /> Esforço (Rodadas)</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roundsByBrand}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '15px', border: 'none', fontWeight: 'bold' }} />
                  <Bar dataKey="rodadas" fill="#4F46E5" radius={[12, 12, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* TIMELINE DE AJUSTES */}
        <section className="space-y-6 pb-20">
          <h2 className="text-2xl font-[1000] text-[#0F172A] px-4 uppercase tracking-tighter">Histórico de Feedbacks</h2>
          {filteredData.map((item) => (
            <Card key={item.id} className="rounded-[35px] border-none shadow-xl bg-white hover:scale-[1.01] transition-all duration-300 group overflow-hidden">
              <CardContent className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8 border-l-[14px] border-indigo-600">
                <div className="flex items-center gap-8 flex-1 w-full">
                  <div className="flex flex-col items-center justify-center min-w-[85px] h-[85px] rounded-[30px] bg-slate-50 border-2 border-slate-100 group-hover:border-indigo-100 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VER.</span>
                    <span className="text-3xl font-[1000] text-indigo-700">{item.video_versao.toUpperCase()}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-black bg-[#0F172A] text-white px-4 py-1.5 rounded-xl tracking-widest uppercase">{item.video_marca}</span>
                      <h4 className="font-black text-[#1E293B] text-2xl tracking-tight">{item.video_tema}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Video size={14} /> {item.video_formato}
                      </div>
                    </div>
                    <p className="text-slate-500 text-base italic font-bold leading-relaxed max-w-2xl">"{item.ai_summary}"</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-end min-w-[220px]">
                  {(() => {
                    try {
                      const topics = JSON.parse(item.ai_category_topic || "[]");
                      return Array.isArray(topics) ? topics.map((t: string) => (
                        <Badge key={t} className="bg-indigo-600 text-white border-none text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-lg shadow-indigo-100">
                          {t}
                        </Badge>
                      )) : null;
                    } catch { return null; }
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}

// Componentes Atômicos para UI
function FilterSelect({ label, options, onChange, value }: any) {
  return (
    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-[24px] border border-slate-100 shadow-sm transition-all hover:border-indigo-200">
      <span className="text-[9px] font-[1000] text-slate-300 uppercase tracking-widest">{label}</span>
      <select 
        value={value} 
        className="bg-transparent font-black text-sm outline-none cursor-pointer text-[#1E293B] flex-1 appearance-none" 
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o: any) => <option key={o} value={o}>{o === "Todas" || o === "Todos" ? `Todos` : o.toUpperCase()}</option>)}
      </select>
    </div>
  );
}

function KPICard({ title, value, icon, color, sub }: any) {
  return (
    <Card className="rounded-[40px] border-none shadow-2xl bg-white p-8 flex items-center justify-between group hover:bg-indigo-700 transition-all duration-500 cursor-default overflow-hidden relative">
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-2 group-hover:text-indigo-200 transition-colors">{title}</p>
        <div className="text-5xl font-[1000] text-[#0F172A] group-hover:text-white transition-colors tracking-tighter">{value}</div>
        <p className="text-[9px] font-[900] text-indigo-500 mt-3 uppercase tracking-widest group-hover:text-indigo-100/60 transition-colors">{sub}</p>
      </div>
      <div className="p-6 rounded-[30px] bg-slate-50 group-hover:bg-white/10 transition-all relative z-10" style={{ color }}>
        {React.cloneElement(icon, { size: 36, strokeWidth: 3, className: "group-hover:text-white transition-colors" })}
      </div>
    </Card>
  );
}