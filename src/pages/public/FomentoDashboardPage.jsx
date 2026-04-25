import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, DollarSign, Building2, Sparkles, Globe,
  AlertTriangle, ArrowRight, FolderOpen, FileCode, Lock,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
  BarChart, Bar,
} from 'recharts';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getEditaisFomentoDashboard } from '../../services/editalFomentoService';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, daysUntil } from '../../utils/formatters';

// --- Helpers ---
function compactCurrency(value) {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1).replace('.', ',')}B`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return formatCurrency(value);
}

function getVolume(e) {
  return parseFloat(e.volumeTotalProjeto) || parseFloat(e.volumeAporte1) || 0;
}

const COLORS = {
  primary: '#766EFB',
  accent: '#ED4E64',
  secondary: '#76DDC9',
  emerald: '#10b981',
  red: '#ED4E64',
  violet: '#766EFB',
  blue: '#3b82f6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  cyan: '#76DDC9',
  gray: '#97a7b6',
};

const PIE_COLORS = [COLORS.primary, COLORS.accent, COLORS.secondary, COLORS.emerald, COLORS.violet, COLORS.blue, COLORS.amber, COLORS.rose, COLORS.cyan];

// --- Sub-components ---
function KpiCard({ icon: Icon, label, value, sub, color = 'text-primary-500', bg = 'bg-primary-50' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`p-1.5 rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, icon: Icon, iconColor, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-5 ${className}`}>
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} /> {title}
      </h3>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label, isCurrency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.dataKey === 'volume' || isCurrency ? compactCurrency(p.value) : p.value} {p.dataKey === 'count' ? 'editais' : ''}
        </p>
      ))}
    </div>
  );
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// --- Main Page ---
export default function FomentoDashboardPage() {
  useDocumentTitle('Dashboard de Fomento');
  const [todosEditais, setTodosEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('FOMENTO');

  useEffect(() => {
    setLoading(true);
    getEditaisFomentoDashboard()
      .then((data) => setTodosEditais(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    let countFomento = 0, countAceleracao = 0;
    todosEditais.forEach((e) => {
      const cat = e.categoria || 'FOMENTO';
      if (cat === 'FOMENTO') countFomento++;
      else if (cat === 'ACELERACAO') countAceleracao++;
    });
    return { countFomento, countAceleracao };
  }, [todosEditais]);

  const allEditais = useMemo(() => {
    return todosEditais.filter((e) => (e.categoria || 'FOMENTO') === categoria);
  }, [todosEditais, categoria]);

  const abertos = useMemo(() => allEditais.filter((e) => e.status !== 'ENCERRADO'), [allEditais]);

  // KPIs
  const stats = useMemo(() => {
    let volumeAbertos = 0, countComValor = 0;
    abertos.forEach((e) => {
      const v = getVolume(e);
      if (v > 0) { volumeAbertos += v; countComValor++; }
    });
    const closingSoon = abertos.filter((e) => {
      const d = daysUntil(e.prazoSubmissaoFase1);
      return d !== null && d > 0 && d <= 7;
    }).length;
    const estadosAtivos = new Set(abertos.map((e) => e.estado).filter(Boolean)).size;
    return {
      abertos: abertos.length,
      closingSoon,
      volumeAbertos,
      valorMedio: countComValor > 0 ? volumeAbertos / countComValor : 0,
      estadosAtivos,
    };
  }, [abertos]);

  // Pizza: Status
  const statusData = useMemo(() => {
    let ab = 0, cont = 0, enc = 0;
    allEditais.forEach((e) => {
      if (e.status === 'CONTINUO') cont++;
      else if (e.status === 'ENCERRADO') enc++;
      else ab++;
    });
    return [
      { name: 'Com prazo', value: ab, color: COLORS.emerald },
      { name: 'Fluxo contínuo', value: cont, color: COLORS.violet },
      { name: 'Encerrados', value: enc, color: COLORS.gray },
    ].filter((d) => d.value > 0);
  }, [allEditais]);

  // Pizza: Top FAPs
  const fapData = useMemo(() => {
    const map = {};
    allEditais.forEach((e) => { const k = e.fap || 'Outros'; map[k] = (map[k] || 0) + 1; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 6);
    const outros = sorted.slice(6).reduce((sum, [, v]) => sum + v, 0);
    if (outros > 0) top.push(['Outros', outros]);
    return top.map(([name, value]) => ({ name, value }));
  }, [allEditais]);

  // Linha: Tendencia temporal (editais por mes de abertura)
  const tendenciaData = useMemo(() => {
    const map = {};
    allEditais.forEach((e) => {
      const date = e.dataAbertura || e.dataRegistro;
      if (!date) return;
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { abertos: 0, encerrados: 0, total: 0 };
      map[key].total++;
      if (e.status === 'ENCERRADO') map[key].encerrados++;
      else map[key].abertos++;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [y, m] = key.split('-');
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return { mes: `${meses[parseInt(m) - 1]}/${y.slice(2)}`, ...val };
      });
  }, [allEditais]);

  // Barras: Volume por FAP
  const volumePorFap = useMemo(() => {
    const map = {};
    abertos.forEach((e) => {
      const k = e.fap || 'Outros';
      map[k] = (map[k] || 0) + getVolume(e);
    });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, volume]) => ({ name, volume }));
  }, [abertos]);

  // Pizza: Por estado (abertos)
  const estadoData = useMemo(() => {
    const map = {};
    abertos.forEach((e) => { const k = e.estado || 'Nacional'; map[k] = (map[k] || 0) + 1; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 6);
    const outros = sorted.slice(6).reduce((sum, [, v]) => sum + v, 0);
    if (outros > 0) top.push(['Outros', outros]);
    return top.map(([name, value]) => ({ name, value }));
  }, [abertos]);

  // Barras: Areas
  const areaData = useMemo(() => {
    const map = {};
    abertos.forEach((e) => (e.areasAtuacao || []).forEach((a) => { map[a] = (map[a] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
  }, [abertos]);

  // Confianca
  const confiancaStats = useMemo(() => {
    let total = 0, count = 0, alta = 0, media = 0, baixa = 0;
    allEditais.forEach((e) => {
      if (e.confiancaExtracao != null) {
        total += e.confiancaExtracao; count++;
        const pct = e.confiancaExtracao * 100;
        if (pct >= 80) alta++; else if (pct >= 60) media++; else baixa++;
      }
    });
    return { avg: count > 0 ? total / count : 0, count, alta, media, baixa };
  }, [allEditais]);

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-12">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold font-heading text-gray-900">
          Dashboard de {categoria === 'FOMENTO' ? 'Fomento' : 'Aceleração'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Visao geral de {allEditais.length} editais mapeados</p>
      </div>

      {/* Tabs Fomento / Aceleracao */}
      <div role="tablist" aria-label="Selecionar categoria" className="flex items-center gap-1 border-b border-gray-100 mb-6">
        <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider font-semibold text-gray-400 pr-3 pl-1">
          Categoria:
        </span>
        <button
          role="tab"
          aria-selected={categoria === 'FOMENTO'}
          title="Clique para ver dados de Fomento"
          onClick={() => setCategoria('FOMENTO')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 rounded-t-lg cursor-pointer transition-all duration-200 ${
            categoria === 'FOMENTO'
              ? 'border-primary-500 text-primary-600 bg-primary-50/50'
              : 'border-transparent text-gray-600 hover:text-primary-600 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          Fomento
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
            categoria === 'FOMENTO' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
          }`}>{counts.countFomento}</span>
        </button>
        <button
          role="tab"
          aria-selected={categoria === 'ACELERACAO'}
          title="Clique para ver dados de Aceleração"
          onClick={() => setCategoria('ACELERACAO')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 rounded-t-lg cursor-pointer transition-all duration-200 ${
            categoria === 'ACELERACAO'
              ? 'border-primary-500 text-primary-600 bg-primary-50/50'
              : 'border-transparent text-gray-600 hover:text-primary-600 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          Aceleração
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
            categoria === 'ACELERACAO' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
          }`}>{counts.countAceleracao}</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <KpiCard icon={TrendingUp} label="Abertos" value={stats.abertos} sub="editais com inscricao ativa" color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard icon={AlertTriangle} label="Encerra em 7d" value={stats.closingSoon} sub="prazos proximos" color="text-red-600" bg="bg-red-50" />
        <KpiCard icon={DollarSign} label="Volume disponivel" value={compactCurrency(stats.volumeAbertos)} sub="em editais abertos" color="text-accent-600" bg="bg-accent-50" />
        <KpiCard icon={DollarSign} label="Valor medio" value={compactCurrency(stats.valorMedio)} sub="por edital" color="text-primary-600" bg="bg-primary-50" />
        <KpiCard icon={Globe} label="Estados ativos" value={stats.estadosAtivos} sub="com editais abertos" color="text-violet-600" bg="bg-violet-50" />
      </div>

      {/* Row 1: Tendencia + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Tendencia de editais" icon={TrendingUp} iconColor="text-primary-500" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendenciaData}>
                <defs>
                  <linearGradient id="gradAbertos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#999' }} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke={COLORS.primary} fill="url(#gradTotal)" strokeWidth={2} name="Total" />
                <Area type="monotone" dataKey="abertos" stroke={COLORS.emerald} fill="url(#gradAbertos)" strokeWidth={2} name="Abertos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Distribuicao por status" icon={Sparkles} iconColor="text-violet-500">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" labelLine={false} label={PieLabel}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: FAP pizza + Estado pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Editais por FAP / Orgao" icon={Building2} iconColor="text-primary-500">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fapData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={PieLabel}>
                  {fapData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Editais abertos por estado" icon={Globe} iconColor="text-emerald-500">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={estadoData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={PieLabel}>
                  {estadoData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Volume por FAP + Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Volume de fomento por FAP" icon={DollarSign} iconColor="text-accent-600">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumePorFap} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#999' }} tickFormatter={compactCurrency} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#666' }} width={90} />
                <Tooltip content={<CustomTooltip isCurrency />} />
                <Bar dataKey="volume" fill={COLORS.accent} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top areas de atuacao (abertos)" icon={Sparkles} iconColor="text-secondary-500">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#999' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#666' }} width={140} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={COLORS.secondary} radius={[0, 4, 4, 0]} barSize={16} name="Editais" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Confianca IA */}
      {confiancaStats.count > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" /> Confianca da extracao por IA
          </h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(confiancaStats.avg * 100)}%</p>
              <p className="text-xs text-gray-500">media geral</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                {confiancaStats.alta > 0 && <div className="bg-emerald-500 rounded-full" style={{ flex: confiancaStats.alta }} />}
                {confiancaStats.media > 0 && <div className="bg-amber-400 rounded-full" style={{ flex: confiancaStats.media }} />}
                {confiancaStats.baixa > 0 && <div className="bg-red-400 rounded-full" style={{ flex: confiancaStats.baixa }} />}
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Alta ({confiancaStats.alta})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Media ({confiancaStats.media})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Baixa ({confiancaStats.baixa})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Links rapidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to={ROUTES.EDITAIS_FOMENTO} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
          <div className="p-2 rounded-lg bg-emerald-50"><FolderOpen className="h-5 w-5 text-emerald-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Editais Abertos</p>
            <p className="text-xs text-gray-500">{stats.abertos} oportunidades</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </Link>
        <Link to={ROUTES.EDITAIS_FOMENTO_ENCERRADOS} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
          <div className="p-2 rounded-lg bg-gray-50"><Lock className="h-5 w-5 text-gray-500" /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Encerrados</p>
            <p className="text-xs text-gray-500">{allEditais.length - stats.abertos} editais</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </Link>
        <Link to={ROUTES.EDITAIS_FOMENTO_PROJETOS} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
          <div className="p-2 rounded-lg bg-accent-50"><FileCode className="h-5 w-5 text-accent-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">Templates de Projetos</p>
            <p className="text-xs text-gray-500">Modelos para submissao</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
