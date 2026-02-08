import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function Sidebar({ items }) {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <nav className="sticky top-20 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
