import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
  MessageSquare, Layers, Activity, Search, 
  Target, BarChart3, Video, Briefcase, Loader2, AlertCircle, ChevronDown
} from "lucide-react";

interface Feedback {
  id: number;
  video_marca: string;
  video_tema: string;
  video_formato: string;
  video_versao: string;
  comment_text: string;
  ai_summary: string;
  ai_category_topic: string;
  created_at: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b', '#10b981'];

export default function RefinedDashboard() {
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [selectedVersion, setSelectedVersion] = useState("Todas");
  const [selectedFormat, setSelectedFormat] = useState("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch('/api/feedbacks')
      .then(res => {
        if (!res.ok) throw new Error("Erro ao conectar com D1.");
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

  // Filtros em Cascata
  const brands = useMemo(() => ["Todas", ...new Set(data.map(d => d.video_marca))].sort(), [data]);

  const availableVersions = useMemo(() => {
    const brandData = selectedBrand === "Todas" ? data : data.filter(d => d.video_marca === selectedBrand);
    return ["Todas", ...new Set(brandData.map(d => d.video_versao))].sort();
  }, [selectedBrand, data]);

  const filteredData = useMemo(() => {
    return data.filter(d => 
      (selectedBrand === "Todas" || d.video_marca === selectedBrand) &&
      (selectedVersion === "Todas" || d.video_versao === selectedVersion) &&
      (selectedFormat === "Todos" || d.video_formato === selectedFormat) &&
      d.video_tema.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, selectedBrand, selectedVersion, selectedFormat, search]);

  const topicData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      try {
        const topics = JSON.parse(item.ai_category_topic || "[]");
        topics.forEach((t: string) => { counts[t] = (counts[t] || 0) + 1; });
      } catch { counts["Outros"] = (counts["Outros"] || 0) + 1; }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredData]);

  const roundsByBrand = useMemo(() => {
    return brands.filter(b => b !== "Todas").map(b => {
      const brandData = data.filter(d => d.video_marca === b);
      const maxV = Math.max(...brandData.map(d => parseInt(d.video_versao.replace(/\D/g, '')) || 0));
      return { name: b, rodadas: maxV + 1 };
    }).sort((a, b) => b.rodadas - a.rodadas);
  }, [data, brands]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 py-8 font-sans text-slate-900">
      
      {/* HEADER COMPACTO */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-[1000] tracking-tighter uppercase text-[#0F172A]">Feedback Intelligence</h1>
        
        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Projeto..." 
              className="pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border-none text-xs font-bold w-44 outline-none focus:ring-1 focus:ring-indigo-500" 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <CustomSelect label="Marca" options={brands} value={selectedBrand} onChange={(v: React.SetStateAction<string>) => { setSelectedBrand(v); setSelectedVersion("Todas"); }} />
          <CustomSelect label="Versão" options={availableVersions} value={selectedVersion} onChange={setSelectedVersion} />
          <CustomSelect label="Formato" options={["Todos", "BC", "BCR"]} value={selectedFormat} onChange={setSelectedFormat} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* KPI CARDS (MENORES) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard title="Feedbacks" value={filteredData.length} icon={<MessageSquare />} sub="Total Processado" color="#6366f1" />
          <KPICard title="Campanhas" value={[...new Set(filteredData.map(d=>d.video_tema))].length} icon={<Briefcase />} sub="Em Aberto" color="#10b981" />
          <KPICard title="Rodadas" value={(roundsByBrand.reduce((a,b)=>a+b.rodadas,0)/roundsByBrand.length || 0).toFixed(1)} icon={<Layers />} sub="Média Geral" color="#f59e0b" />
        </section>

        {/* ANALYTICS (EQUILIBRADO) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tags Card com Scroll */}
          <Card className="lg:col-span-4 rounded-[32px] border-none shadow-xl bg-white p-6 flex flex-col">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-tighter">
              <Activity className="h-4 w-4" /> Temas Recorrentes
            </h3>
            <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 space-y-2 custom-scrollbar">
              {topicData.map((t, i) => (
                <div key={t.name} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl hover:bg-indigo-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black text-slate-600 uppercase">{t.name}</span>
                  </div>
                  <span className="font-black text-indigo-600 text-xs">{t.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-8 rounded-[32px] border-none shadow-xl bg-white p-6">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-tighter">
              <BarChart3 className="h-4 w-4" /> Esforço por Marca
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roundsByBrand}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} />
                  <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', fontSize: '12px'}} />
                  <Bar dataKey="rodadas" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* TIMELINE CONDICIONAL */}
        {selectedBrand !== "Todas" ? (
          <section className="space-y-4 pb-12">
            <h2 className="text-lg font-black text-slate-800 px-2 uppercase tracking-tighter">Histórico: {selectedBrand}</h2>
            {filteredData.map((item) => (
              <Card key={item.id} className="rounded-[28px] border-none shadow-md bg-white overflow-hidden transition-all hover:shadow-indigo-100">
                <div className="flex items-stretch">
                  <div className="w-2 bg-indigo-500" />
                  <CardContent className="p-5 flex-1 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 flex-1">
                      <div className="flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-2xl bg-slate-50 border border-slate-100 font-black">
                        <span className="text-[8px] text-slate-400 uppercase">VER.</span>
                        <span className="text-lg text-indigo-600">{item.video_versao.toUpperCase()}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-800 text-sm tracking-tight">{item.video_tema}</h4>
                          <Badge variant="outline" className="text-[8px] h-4 border-slate-200 text-slate-400 px-1">{item.video_formato}</Badge>
                        </div>
                        <p className="text-slate-500 text-xs italic leading-snug">"{item.ai_summary}"</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end max-w-[200px]">
                      {JSON.parse(item.ai_category_topic || "[]").map((t: string) => (
                        <Badge key={t} className="bg-indigo-600 text-white border-none text-[8px] font-black px-2 py-1 rounded-md uppercase">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </section>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-[32px]">
            <p className="text-slate-400 font-bold text-sm">Selecione uma marca para carregar o histórico detalhado.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// COMPONENTES ATÔMICOS AJUSTADOS
function CustomSelect({ label, options, value, onChange }: any) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors relative group">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-bold outline-none cursor-pointer appearance-none pr-4 text-slate-700"
      >
        {options.map((o: any) => <option key={o} value={o}>{o === "Todas" || o === "Todos" ? `Ver Todos` : o}</option>)}
      </select>
      <ChevronDown className="h-3 w-3 absolute right-2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function KPICard({ title, value, icon, sub, color }: any) {
  return (
    <Card className="rounded-[32px] border-none shadow-xl bg-white p-5 flex items-center justify-between group hover:bg-indigo-600 transition-all duration-500">
      <div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-200">{title}</p>
        <div className="text-2xl font-black text-slate-900 group-hover:text-white">{value}</div>
        <p className="text-[8px] font-bold text-slate-300 group-hover:text-indigo-100/50 mt-1 uppercase tracking-tighter">{sub}</p>
      </div>
      <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-white/10" style={{ color: color }}>
        {React.cloneElement(icon, { size: 20, strokeWidth: 3, className: "group-hover:text-white" })}
      </div>
    </Card>
  );
}