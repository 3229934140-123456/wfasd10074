import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Wallet,
  Store,
  FileCheck,
  CalendarClock,
  Users,
  UserCheck,
  Armchair,
  PartyPopper,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { WEDDING_STYLE_LABELS, TODO_CATEGORY_LABELS } from '@/types';
import { dayjs, formatMoney, getDaysUntil } from '@/utils/date';

const quickActions = [
  { path: '/vendors', label: '供应商市场', icon: Store, color: 'bg-rose-gold/10 text-rose-gold-dark' },
  { path: '/timeline', label: '待办事项', icon: CalendarClock, color: 'bg-soft-pink/50 text-rose-gold-dark' },
  { path: '/guests', label: '宾客管理', icon: UserCheck, color: 'bg-sage-green/15 text-sage-green' },
  { path: '/wedding-day', label: '婚礼流程', icon: PartyPopper, color: 'bg-rose-gold/10 text-rose-gold-dark' },
  { path: '/collaboration', label: '协作中心', icon: Users, color: 'bg-soft-pink/50 text-rose-gold-dark' },
  { path: '/seating', label: '座位安排', icon: Armchair, color: 'bg-sage-green/15 text-sage-green' },
];

const categoryColors: Record<string, string> = {
  摄影: '#D4A574',
  场地: '#F5D5D4',
  花艺: '#7BA17C',
  主持: '#E8C9A0',
  其他: '#B8A88A',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { project, todos, contracts, guests, collaborators } = useAppStore();

  if (!project) return null;

  const daysUntil = getDaysUntil(project.weddingDate);

  const pendingTodos = todos.filter((t) => !t.completed && dayjs(t.dueDate).isAfter(dayjs())).slice(0, 5);
  const urgentTodos = todos.filter(
    (t) => !t.completed && dayjs(t.dueDate).diff(dayjs(), 'day') <= 14 && dayjs(t.dueDate).isAfter(dayjs()),
  );
  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'confirmed');
  const totalAttendees = confirmedGuests.reduce((sum, g) => sum + 1 + g.plusOnes, 0);

  const budgetData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    contracts.forEach((c) => {
      if (c.category) {
        const label = (TODO_CATEGORY_LABELS as unknown as Record<string, string>)[c.category] || '其他';
        const catMap: Record<string, string> = {
          vendor: '供应商',
        };
        const display = c.category === 'photography' ? '摄影' :
          c.category === 'venue' ? '场地' :
          c.category === 'florist' ? '花艺' :
          c.category === 'host' ? '主持' : '其他';
        byCategory[display] = (byCategory[display] || 0) + c.totalPrice;
      }
    });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [contracts]);

  return (
    <div className="space-y-6">
      {/* Hero Countdown Section */}
      <div className="card relative overflow-hidden bg-gradient-to-br from-cream via-white to-soft-pink/30 border-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-gold/10 to-soft-pink/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-rose-gold" fill="currentColor" />
                <span className="text-sm text-text-secondary">我们的婚礼</span>
              </div>
              <h1 className="font-display text-4xl font-semibold text-text-primary mb-2">
                {project.coupleName}
              </h1>
              <div className="flex items-center gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-gold" />
                  <span>{dayjs(project.weddingDate).format('YYYY年MM月DD日 dddd')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-gold" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip">{WEDDING_STYLE_LABELS[project.style]}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted mb-1">距离婚礼还有</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold gold-text">{daysUntil}</span>
                <span className="text-2xl text-text-secondary">天</span>
              </div>
            </div>
          </div>

          <div className="decorative-line my-6"></div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-text-muted mb-1">整体筹备进度</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-gold-light to-rose-gold rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="font-display text-xl font-semibold text-rose-gold-dark">{progress}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">已完成任务</p>
              <p className="font-display text-2xl font-semibold text-text-primary">
                {completedCount} <span className="text-base text-text-muted font-normal">/ {todos.length}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">确认出席</p>
              <p className="font-display text-2xl font-semibold text-text-primary">
                {totalAttendees} <span className="text-base text-text-muted font-normal">人</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">协作成员</p>
              <p className="font-display text-2xl font-semibold text-text-primary">
                {collaborators.length} <span className="text-base text-text-muted font-normal">人</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-6 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="card flex flex-col items-center gap-2 py-5 hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color} transition-all group-hover:scale-110`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-text-primary">{action.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Budget Section */}
        <div className="card col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-rose-gold" />
              预算概览
            </h3>
            <button onClick={() => navigate('/contracts')} className="text-xs text-rose-gold hover:underline flex items-center gap-1">
              详情 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="text-center mb-4">
            <p className="text-xs text-text-muted mb-1">已使用 / 总预算</p>
            <p className="font-display text-2xl font-semibold">
              <span className="gold-text">{formatMoney(project.budget.used)}</span>
              <span className="text-text-muted mx-2">/</span>
              <span className="text-text-secondary">{formatMoney(project.budget.total)}</span>
            </p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData.length > 0 ? budgetData : [{ name: '待分配', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {budgetData.length > 0
                    ? budgetData.map((entry, index) => (
                        <Cell key={index} fill={categoryColors[entry.name] || '#B8A88A'} />
                      ))
                    : <Cell fill="#F0E6D8" />}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatMoney(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #F0E6D8', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {budgetData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[item.name] }}></div>
                  <span className="text-text-secondary">{item.name}</span>
                </div>
                <span className="text-text-primary font-medium">{formatMoney(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          {/* Upcoming Todos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-rose-gold" />
                近期待办
              </h3>
              <div className="flex items-center gap-2">
                {urgentTodos.length > 0 && (
                  <span className="chip !bg-red-100 !text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {urgentTodos.length} 项紧急
                  </span>
                )}
                <button onClick={() => navigate('/timeline')} className="text-xs text-rose-gold hover:underline flex items-center gap-1">
                  全部 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {pendingTodos.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-sage-green" />
                  <p>太棒了！所有任务都已完成 🎉</p>
                </div>
              ) : (
                pendingTodos.map((todo) => {
                  const daysLeft = dayjs(todo.dueDate).diff(dayjs(), 'day');
                  const isUrgent = daysLeft <= 14;
                  return (
                    <div
                      key={todo.id}
                      className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-cream/50 transition-colors group"
                    >
                      <button className="mt-0.5 w-5 h-5 rounded-full border-2 border-rose-gold-light flex items-center justify-center flex-shrink-0 group-hover:border-rose-gold transition-colors">
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-text-primary">{todo.title}</p>
                          <span className="chip !text-xs">{TODO_CATEGORY_LABELS[todo.category]}</span>
                        </div>
                        {todo.description && (
                          <p className="text-xs text-text-muted truncate">{todo.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            isUrgent ? 'text-red-500' : daysLeft <= 30 ? 'text-rose-gold-dark' : 'text-text-muted'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {daysLeft > 0 ? `${daysLeft}天后` : daysLeft === 0 ? '今天' : `已过期${-daysLeft}天`}
                        </span>
                        {todo.priority === 'high' && (
                          <span className="w-2 h-2 rounded-full bg-red-400" title="高优先级"></span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                即将到期付款
              </h3>
              <button onClick={() => navigate('/contracts?view=calendar')} className="text-xs text-rose-gold hover:underline flex items-center gap-1">
                日历视图 <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {(() => {
              const upcomingPayments: Array<{
                id: string;
                contractId: string;
                vendorName: string;
                vendorAvatar?: string;
                type: string;
                amount: number;
                dueDate: string;
                isOverdue: boolean;
              }> = [];

              contracts.forEach((c) => {
                c.payments
                  .filter((p) => p.status === 'pending' && dayjs(p.dueDate).diff(dayjs(), 'day') <= 14)
                  .forEach((p) => {
                    upcomingPayments.push({
                      id: p.id,
                      contractId: c.id,
                      vendorName: c.vendorName,
                      vendorAvatar: c.vendorAvatar,
                      type: p.type,
                      amount: p.amount,
                      dueDate: p.dueDate,
                      isOverdue: dayjs(p.dueDate).isBefore(dayjs(), 'day'),
                    });
                  });
              });

              upcomingPayments.sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());

              const paymentTypeLabels: Record<string, string> = {
                deposit: '定金',
                midterm: '中期款',
                final: '尾款',
              };

              if (upcomingPayments.length === 0) {
                return (
                  <div className="text-center py-6 text-text-muted">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-sage-green" />
                    <p className="text-sm">近期没有待付款项 🎉</p>
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {upcomingPayments.slice(0, 4).map((p) => {
                    const daysLeft = dayjs(p.dueDate).diff(dayjs(), 'day');
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-cream/30 border border-border hover:bg-cream/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.vendorAvatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-text-primary">
                                {p.vendorName}
                              </p>
                              <span className="chip !text-[10px]">
                                {paymentTypeLabels[p.type]}
                              </span>
                              {p.isOverdue && (
                                <span className="chip !bg-red-100 !text-red-600 !text-[10px]">
                                  已逾期
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-text-muted">
                              到期日：{dayjs(p.dueDate).format('MM月DD日')}
                              {!p.isOverdue && daysLeft >= 0 && `（还有${daysLeft}天）`}
                            </p>
                          </div>
                        </div>
                        <span className="font-display text-lg font-semibold text-rose-gold-dark">
                          {formatMoney(p.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Contracts Preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-rose-gold" />
            供应商签约状态
          </h3>
          <button onClick={() => navigate('/contracts')} className="text-xs text-rose-gold hover:underline flex items-center gap-1">
            管理全部 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {contracts.slice(0, 4).map((contract) => (
            <div key={contract.id} className="p-4 rounded-lg border border-border bg-cream/30">
              <div className="flex items-center gap-3 mb-3">
                <img src={contract.vendorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{contract.vendorName}</p>
                  <p className="text-xs text-text-muted">{contract.packageName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-rose-gold-dark">{formatMoney(contract.totalPrice)}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    contract.status === 'signed'
                      ? 'bg-sage-green/20 text-sage-green'
                      : contract.status === 'pending'
                      ? 'bg-rose-gold/15 text-rose-gold-dark'
                      : 'bg-border text-text-secondary'
                  }`}
                >
                  {contract.status === 'signed' ? '已签约' : contract.status === 'pending' ? '待确认' : '草稿'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
