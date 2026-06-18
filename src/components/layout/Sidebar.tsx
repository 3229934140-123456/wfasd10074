import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  FileCheck,
  CalendarClock,
  Users,
  UserCheck,
  Armchair,
  PartyPopper,
  Heart,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/utils';
import { dayjs } from '@/utils/date';

const menuItems = [
  { path: '/', label: '项目总览', icon: LayoutDashboard },
  { path: '/vendors', label: '供应商市场', icon: Store },
  { path: '/contracts', label: '协议与付款', icon: FileCheck },
  { path: '/timeline', label: '时间轴', icon: CalendarClock },
  { path: '/collaboration', label: '协作中心', icon: Users },
  { path: '/guests', label: '宾客管理', icon: UserCheck },
  { path: '/seating', label: '座位安排', icon: Armchair },
  { path: '/wedding-day', label: '婚礼流程', icon: PartyPopper },
];

export default function Sidebar() {
  const { project, currentUser, resetAll, contracts } = useAppStore();

  if (!project || !currentUser) {
    return null;
  }

  const pendingPaymentsSoon = contracts.reduce(
    (sum, c) =>
      sum +
      c.payments.filter(
        (p) => p.status === 'pending' && dayjs(p.dueDate).diff(dayjs(), 'day') <= 14,
      ).length,
    0,
  );

  const handleLogout = () => {
    if (confirm('确定要清除所有数据并返回初始状态吗？')) {
      resetAll();
      window.location.href = '/login';
    }
  };

  const menuItemsWithBadge = menuItems.map((item) => {
    if (item.path === '/contracts' && pendingPaymentsSoon > 0) {
      return { ...item, badge: pendingPaymentsSoon };
    }
    return { ...item, badge: 0 };
  });

  return (
    <aside className="w-64 h-screen flex-shrink-0 bg-white border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold flex items-center justify-center shadow-soft">
            <Heart className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold gold-text">WeddingPlan</h1>
            <p className="text-xs text-text-muted">婚礼筹备管家</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-border">
        <p className="text-xs text-text-muted mb-1">我们的婚礼</p>
        <p className="font-display text-lg text-text-primary leading-tight">{project.coupleName}</p>
        <p className="text-sm text-text-secondary mt-1">{project.weddingDate}</p>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItemsWithBadge.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-rose-gold/10 text-rose-gold-dark shadow-soft'
                        : 'text-text-secondary hover:bg-border/50 hover:text-text-primary',
                    )
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-rose-gold-light"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{currentUser.name}</p>
            <p className="text-xs text-text-muted">新人</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-text-muted hover:text-rose-gold hover:bg-rose-gold/10 transition-colors"
            title="重置数据"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
