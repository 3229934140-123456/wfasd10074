import { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Check,
  X,
  Clock,
  Trash2,
  Users,
  UserMinus,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { type Guest, type RsvpStatus, type GuestRelation } from '@/types';
import { cn, generateId } from '@/utils';

const rsvpConfig: Record<RsvpStatus, { label: string; icon: typeof Check; color: string; bg: string }> = {
  confirmed: { label: '已确认', icon: Check, color: 'text-sage-green', bg: 'bg-sage-green/20' },
  pending: { label: '待确认', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  declined: { label: '已婉拒', icon: X, color: 'text-red-500', bg: 'bg-red-100' },
};

const relationColors: Record<GuestRelation, string> = {
  groom: 'bg-blue-100 text-blue-700',
  bride: 'bg-pink-100 text-pink-700',
  both: 'bg-rose-gold/15 text-rose-gold-dark',
};

export default function Guests() {
  const { guests, project, updateGuestRsvp, addGuest, deleteGuest } = useAppStore();
  if (!project) return null;
  const [filter, setFilter] = useState<RsvpStatus | 'all'>('all');
  const [relationFilter, setRelationFilter] = useState<GuestRelation | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuest, setNewGuest] = useState<Omit<Guest, 'id'>>({
    projectId: project.id,
    name: '',
    relation: 'both',
    relationLabel: '共同好友',
    phone: '',
    rsvpStatus: 'pending',
    plusOnes: 0,
    dietaryNote: '',
  });

  const filteredGuests = guests.filter((g) => {
    const matchRsvp = filter === 'all' || g.rsvpStatus === filter;
    const matchRelation = relationFilter === 'all' || g.relation === relationFilter;
    const matchSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery);
    return matchRsvp && matchRelation && matchSearch;
  });

  const confirmed = guests.filter((g) => g.rsvpStatus === 'confirmed');
  const pending = guests.filter((g) => g.rsvpStatus === 'pending');
  const declined = guests.filter((g) => g.rsvpStatus === 'declined');
  const totalAttendees = confirmed.reduce((sum, g) => sum + 1 + g.plusOnes, 0);

  const handleAddGuest = () => {
    if (!newGuest.name.trim()) return;
    addGuest(newGuest);
    setNewGuest({
      projectId: project.id,
      name: '',
      relation: 'both',
      relationLabel: '共同好友',
      phone: '',
      rsvpStatus: 'pending',
      plusOnes: 0,
      dietaryNote: '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">宾客总数</p>
            <Users className="w-5 h-5 text-rose-gold" />
          </div>
          <p className="font-display text-2xl font-semibold text-text-primary">{guests.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">已确认</p>
            <Check className="w-5 h-5 text-sage-green" />
          </div>
          <p className="font-display text-2xl font-semibold text-sage-green">{confirmed.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">待确认</p>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-semibold text-amber-600">{pending.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">已婉拒</p>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="font-display text-2xl font-semibold text-red-500">{declined.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">预计出席人数</p>
            <UserCheck className="w-5 h-5 text-rose-gold-dark" />
          </div>
          <p className="font-display text-2xl font-semibold gold-text">{totalAttendees}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索宾客..."
                className="w-56 pl-9 pr-4 py-2 rounded-md border border-border bg-white text-sm focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-1 ml-4">
              {(['all', 'confirmed', 'pending', 'declined'] as const).map((status) => {
                const label = status === 'all' ? '全部' : rsvpConfig[status].label;
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm transition-all',
                      filter === status
                        ? 'bg-rose-gold text-white'
                        : 'text-text-secondary hover:bg-border hover:text-text-primary',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-text-muted mr-1">关系：</span>
              {(['all', 'groom', 'bride', 'both'] as const).map((rel) => {
                const label = rel === 'all' ? '全部' : rel === 'groom' ? '男方' : rel === 'bride' ? '女方' : '共同';
                return (
                  <button
                    key={rel}
                    onClick={() => setRelationFilter(rel)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm transition-all',
                      relationFilter === rel
                        ? 'bg-rose-gold text-white'
                        : 'text-text-secondary hover:bg-border hover:text-text-primary',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            添加宾客
          </button>
        </div>
      </div>

      {/* Guest Table */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-cream/50 border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                宾客信息
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                关系
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                联系方式
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                随行人数
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                出席状态
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-text-muted">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>暂无匹配的宾客</p>
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-cream/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold flex items-center justify-center text-white text-sm font-medium">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{guest.name}</p>
                        {guest.dietaryNote && (
                          <p className="text-xs text-text-muted">饮食：{guest.dietaryNote}</p>
                        )}
                        {guest.tableId && (
                          <p className="text-xs text-rose-gold-dark">已分配座位</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('chip', relationColors[guest.relation])}>
                      {guest.relationLabel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{guest.phone}</td>
                  <td className="px-5 py-4">
                    {guest.plusOnes > 0 ? (
                      <span className="text-sm text-text-primary">+{guest.plusOnes} 人</span>
                    ) : (
                      <span className="text-sm text-text-muted">无</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-1.5">
                      {(['confirmed', 'pending', 'declined'] as RsvpStatus[]).map((status) => {
                        const Icon = rsvpConfig[status].icon;
                        const isActive = guest.rsvpStatus === status;
                        return (
                          <button
                            key={status}
                            onClick={() => updateGuestRsvp(guest.id, status)}
                            className={cn(
                              'w-7 h-7 rounded-md flex items-center justify-center transition-all',
                              isActive ? rsvpConfig[status].bg : 'bg-border hover:bg-border/70',
                            )}
                            title={rsvpConfig[status].label}
                          >
                            <Icon className={cn('w-3.5 h-3.5', isActive ? rsvpConfig[status].color : 'text-text-muted')} />
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => deleteGuest(guest.id)}
                      className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">添加宾客</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">姓名</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  placeholder="请输入宾客姓名"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">关系</label>
                  <select
                    value={newGuest.relation}
                    onChange={(e) => {
                      const rel = e.target.value as GuestRelation;
                      setNewGuest({
                        ...newGuest,
                        relation: rel,
                        relationLabel:
                          rel === 'groom' ? '男方亲友' : rel === 'bride' ? '女方亲友' : '共同好友',
                      });
                    }}
                    className="input-field"
                  >
                    <option value="groom">男方</option>
                    <option value="bride">女方</option>
                    <option value="both">共同</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">关系描述</label>
                  <input
                    type="text"
                    value={newGuest.relationLabel}
                    onChange={(e) => setNewGuest({ ...newGuest, relationLabel: e.target.value })}
                    placeholder="如：大学同学"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">联系电话</label>
                <input
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">随行人数</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={newGuest.plusOnes}
                    onChange={(e) => setNewGuest({ ...newGuest, plusOnes: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">出席状态</label>
                  <select
                    value={newGuest.rsvpStatus}
                    onChange={(e) => setNewGuest({ ...newGuest, rsvpStatus: e.target.value as RsvpStatus })}
                    className="input-field"
                  >
                    <option value="pending">待确认</option>
                    <option value="confirmed">已确认</option>
                    <option value="declined">已婉拒</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">饮食备注（可选）</label>
                <input
                  type="text"
                  value={newGuest.dietaryNote}
                  onChange={(e) => setNewGuest({ ...newGuest, dietaryNote: e.target.value })}
                  placeholder="如：素食、清真、过敏等"
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">
                取消
              </button>
              <button onClick={handleAddGuest} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                添加宾客
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
