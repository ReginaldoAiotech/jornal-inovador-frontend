import { Link } from 'react-router-dom';
import { Cpu, HeartPulse, GraduationCap, Wrench, Lightbulb, Globe } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const categories = [
  { icon: Cpu, label: 'Tecnologia', color: 'bg-blue-50 text-blue-600', search: 'Tecnologia' },
  { icon: HeartPulse, label: 'Saude', color: 'bg-red-50 text-red-600', search: 'Saude' },
  { icon: GraduationCap, label: 'Educacao', color: 'bg-green-50 text-green-600', search: 'Educacao' },
  { icon: Wrench, label: 'Engenharia', color: 'bg-yellow-50 text-yellow-700', search: 'Engenharia' },
  { icon: Lightbulb, label: 'Inovacao', color: 'bg-purple-50 text-purple-600', search: 'Inovacao' },
  { icon: Globe, label: 'Meio Ambiente', color: 'bg-emerald-50 text-emerald-600', search: 'Meio Ambiente' },
];

export default function CategorySection() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold font-heading text-gray-900 text-center mb-8">
          Explore por area
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`${ROUTES.ARTICLES}?search=${encodeURIComponent(cat.search)}`}
              className="group flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-500 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
