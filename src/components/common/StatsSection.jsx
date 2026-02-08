import { useEffect, useState, useRef } from 'react';
import { FileText, Users, Briefcase, TrendingUp } from 'lucide-react';

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = 0;
          const startTime = performance.now();

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

function StatItem({ icon: Icon, value, label, suffix = '' }) {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref} className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-100 text-accent-600 mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl md:text-4xl font-bold font-heading text-primary-500">
        {count}{suffix}
      </div>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function StatsSection({ stats }) {
  if (!stats) return null;

  const items = [
    { icon: FileText, value: stats.articles || 0, label: 'Noticias publicadas', suffix: '+' },
    { icon: TrendingUp, value: stats.editais || 0, label: 'Editais abertos', suffix: '+' },
    { icon: Briefcase, value: stats.classifieds || 0, label: 'Classificados ativos', suffix: '+' },
    { icon: Users, value: stats.users || 0, label: 'Leitores cadastrados', suffix: '+' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item) => (
            <StatItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
