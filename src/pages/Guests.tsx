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
  Upload,
  AlertTriangle,
  CheckCircle,
  List,
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
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Omit<Guest, 'id'>[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
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

  const parseBulkImport = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim());
    const newGuests: Omit<Guest, 'id'>[] = [];
    const errors: string[] = [];
    const seenNames = new Set<string>();
    const existingNames = new Set(guests.map((g) => g.name));

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/[,，\t|]/).map((s) => s.trim());
      const [name, phoneOrRelation, relationOrPlus, plusStr] = parts;

      if (!name || name.length === 0) {
        errors.push(`第 ${idx + 1} 行：姓名为空，已跳过`);
        return;
      }

      if (seenNames.has(name)) {
        errors.push(`第 ${idx + 1} 行："${name}" 在导入列表中重复，已跳过`);
        return;
      }

      if (existingNames.has(name)) {
        errors.push(`第 ${idx + 1} 行："${name}" 已存在宾客列表中，已跳过`);
        return;
      }

      let phone = '';
      let relation: GuestRelation = 'both';
      let relationLabel = '共同好友';
      let plusOnes = 0;

      if (phoneOrRelation) {
        if (/^1[3-9]\d{9}$/.test(phoneOrRelation)) {
          phone = phoneOrRelation;
        } else {
          const rel = parseRelation(phoneOrRelation);
          relation = rel.relation;
          relationLabel = rel.label;
        }
      }

      if (relationOrPlus) {
        const plusNum = parseInt(relationOrPlus);
        if (!isNaN(plusNum) && plusNum >= 0) {
          plusOnes = plusNum;
        } else {
          const rel = parseRelation(relationOrPlus);
          relation = rel.relation;
          relationLabel = rel.label;
        }
      }

      if (plusStr) {
        const plusNum = parseInt(plusStr);
        if (!isNaN(plusNum) && plusNum >= 0) {
          plusOnes = plusNum;
        }
      }

      seenNames.add(name);
      newGuests.push({
        projectId: project.id,
        name,
        phone,
        relation,
        relationLabel,
        plusOnes,
        rsvpStatus: 'pending',
        dietaryNote: '',
      });
    });

    return { guests: newGuests, errors };
  };

  const parseRelation = (input: string): { relation: GuestRelation; label: string } => {
    const s = input.trim();
    const groomKeywords = ['男', '新郎', '男方', 'groom', '先生', '伴郎'];
    const brideKeywords = ['女', '新娘', '女方', 'bride', '女士', '伴娘'];

    if (groomKeywords.some((k) => s.includes(k))) {
      return { relation: 'groom', label: s || '男方亲友' };
    }
    if (brideKeywords.some((k) => s.includes(k))) {
      return { relation: 'bride', label: s || '女方亲友' };
    }
    return { relation: 'both', label: s || '共同好友' };
  };

  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    if (!text.trim()) {
      setBulkPreview([]);
      setBulkErrors([]);
      return;
    }
    const result = parseBulkImport(text);
    setBulkPreview(result.guests);
    setBulkErrors(result.errors);
  };

  const handleBulkImport = () => {
    bulkPreview.forEach((g) => addGuest(g));
    setShowBulkModal(false);
    setBulkText('');
    setBulkPreview([]);
    setBulkErrors([]);
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              批量导入
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              添加宾客
            </button>
          </div>
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

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-rose-gold" />
                  批量导入宾客
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  粘贴宾客名单，每行一位，格式：姓名,电话,关系,随行人数
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkText('');
                  setBulkPreview([]);
                  setBulkErrors([]);
                }}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  粘贴宾客名单
                  <span className="text-text-muted ml-2">
                    （支持逗号、Tab、竖线分隔，关系可填"男方"/"女方"/"共同"）
                  </span>
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => handleBulkTextChange(e.target.value)}
                  rows={8}
                  placeholder={
                    '张三,13800138000,男方亲友,1\n李四,13900139000,女方同事,0\n王五,男方\n赵六,13700137000'
                  }
                  className="input-field font-mono text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-sage-green/10 border border-sage-green/20">
                  <div className="flex items-center gap-2 text-sage-green mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">将导入</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-sage-green">
                    {bulkPreview.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">警告</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-amber-600">
                    {bulkErrors.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-rose-gold/10 border border-rose-gold/20">
                  <div className="flex items-center gap-2 text-rose-gold-dark mb-1">
                    <List className="w-4 h-4" />
                    <span className="text-sm font-medium">现有宾客</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-rose-gold-dark">
                    {guests.length}
                  </p>
                </div>
              </div>

              {bulkErrors.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    以下行将被跳过
                  </div>
                  <ul className="text-xs text-amber-600 space-y-1 max-h-24 overflow-y-auto">
                    {bulkErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {bulkPreview.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-sage-green" />
                    预览（前10条）
                  </p>
                  <div className="border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-cream/50 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-text-secondary">姓名</th>
                          <th className="text-left px-3 py-2 font-medium text-text-secondary">电话</th>
                          <th className="text-left px-3 py-2 font-medium text-text-secondary">关系</th>
                          <th className="text-center px-3 py-2 font-medium text-text-secondary">随行</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bulkPreview.slice(0, 10).map((g, i) => (
                          <tr key={i}>
                            <td className="px-3 py-1.5 text-text-primary">{g.name}</td>
                            <td className="px-3 py-1.5 text-text-secondary">{g.phone || '-'}</td>
                            <td className="px-3 py-1.5">
                              <span className={cn('chip text-[10px]', relationColors[g.relation])}>
                                {g.relationLabel}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-center text-text-secondary">
                              {g.plusOnes > 0 ? `+${g.plusOnes}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bulkPreview.length > 10 && (
                      <p className="text-xs text-text-muted text-center py-2 bg-cream/30">
                        ...还有 {bulkPreview.length - 10} 位
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-bg">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkText('');
                    setBulkPreview([]);
                    setBulkErrors([]);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={bulkPreview.length === 0}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  导入 {bulkPreview.length} 位宾客
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
