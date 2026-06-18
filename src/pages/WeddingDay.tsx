import { useState } from 'react';
import {
  PartyPopper,
  Clock,
  MapPin,
  Plus,
  X,
  Edit2,
  Trash2,
  Users,
  Share2,
  Camera,
  Building2,
  Flower2,
  Mic2,
  Music,
  Sparkles,
  Shirt,
  Gift,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Link,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { WeddingTimelineItem, VendorCategory } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { cn } from '@/utils';

const vendorCategoryIcons: Record<VendorCategory, typeof Camera> = {
  photography: Camera,
  venue: Building2,
  florist: Flower2,
  host: Mic2,
  band: Music,
  makeup: Sparkles,
  dress: Shirt,
  candy: Gift,
};

export default function WeddingDay() {
  const { timeline, vendors, addTimelineItem, updateTimelineItem, deleteTimelineItem, project } =
    useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WeddingTimelineItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterVendor, setFilterVendor] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareVendorId, setShareVendorId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [formData, setFormData] = useState({
    time: '10:00',
    title: '',
    location: '',
    description: '',
    responsibleIds: [] as string[],
    responsibleType: 'both' as 'collaborator' | 'vendor' | 'both',
    vendorIds: [] as string[],
  });

  if (!project) return null;

  const filteredTimeline = filterVendor
    ? timeline.filter((item) => item.vendorIds?.includes(filterVendor))
    : timeline;

  const getVendorById = (id: string) => vendors.find((v) => v.id === id);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      time: '10:00',
      title: '',
      location: '',
      description: '',
      responsibleIds: [],
      responsibleType: 'both',
      vendorIds: [],
    });
    setShowAddModal(true);
  };

  const openEditModal = (item: WeddingTimelineItem) => {
    setEditingItem(item);
    setFormData({
      time: item.time,
      title: item.title,
      location: item.location,
      description: item.description || '',
      responsibleIds: item.responsibleIds,
      responsibleType: item.responsibleType,
      vendorIds: item.vendorIds || [],
    });
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.time || !project) return;
    if (editingItem) {
      updateTimelineItem(editingItem.id, formData);
    } else {
      addTimelineItem({
        projectId: project.id,
        ...formData,
      });
    }
    setShowAddModal(false);
  };

  const toggleVendor = (vendorId: string) => {
    setFormData((prev) => ({
      ...prev,
      vendorIds: prev.vendorIds.includes(vendorId)
        ? prev.vendorIds.filter((id) => id !== vendorId)
        : [...prev.vendorIds, vendorId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-cream via-white to-soft-pink/30 border-none">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PartyPopper className="w-5 h-5 text-rose-gold" />
              <span className="text-sm text-text-secondary">婚礼当天流程</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-text-primary">
              {project.weddingDate} · {project.location}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              共 {timeline.length} 个环节安排
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              分享流程单
            </button>
            <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加环节
            </button>
          </div>
        </div>
      </div>

      {/* Vendor Filter */}
      <div className="card py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-text-secondary mr-2">按供应商筛选：</span>
          <button
            onClick={() => setFilterVendor(null)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5',
              filterVendor === null
                ? 'bg-rose-gold text-white'
                : 'text-text-secondary hover:bg-border hover:text-text-primary',
            )}
          >
            <Users className="w-3.5 h-3.5" />
            全部视角
          </button>
          {vendors.slice(0, 8).map((vendor) => {
            const Icon = vendorCategoryIcons[vendor.category];
            return (
              <button
                key={vendor.id}
                onClick={() => setFilterVendor(filterVendor === vendor.id ? null : vendor.id)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5',
                  filterVendor === vendor.id
                    ? 'bg-rose-gold text-white'
                    : 'text-text-secondary hover:bg-border hover:text-text-primary',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {vendor.name.length > 6 ? vendor.name.slice(0, 6) + '...' : vendor.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-10">
        <div className="timeline-line !left-[19px]"></div>
        <div className="space-y-4">
          {filteredTimeline.length === 0 ? (
            <div className="card text-center py-12">
              <PartyPopper className="w-12 h-12 mx-auto mb-3 text-text-muted" />
              <p className="text-text-secondary">
                {filterVendor ? '该供应商暂无相关环节' : '暂无流程安排，点击上方按钮添加'}
              </p>
            </div>
          ) : (
            filteredTimeline.map((item, index) => {
              const itemVendors = (item.vendorIds || [])
                .map((id) => getVendorById(id))
                .filter(Boolean);
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[34px] top-6 w-10 h-10 rounded-full bg-white border-4 border-border flex items-center justify-center shadow-soft z-10">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold"></div>
                  </div>
                  <div className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-center min-w-[70px]">
                          <p className="font-display text-2xl font-bold gold-text">{item.time.split(':')[0]}</p>
                          <p className="text-sm text-text-muted">:{item.time.split(':')[1]}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-text-primary text-lg">{item.title}</h3>
                            {index === 0 && (
                              <span className="chip">开场</span>
                            )}
                            {index === filteredTimeline.length - 1 && (
                              <span className="chip-green">结束</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-gold" />
                              {item.location}
                            </span>
                            {itemVendors.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-rose-gold" />
                                {itemVendors.length} 个供应商参与
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-1.5 rounded-md text-text-muted hover:text-rose-gold hover:bg-rose-gold/10 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-md text-text-muted hover:text-rose-gold hover:bg-rose-gold/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTimelineItem(item.id)}
                          className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border animate-fade-in space-y-4">
                        {item.description && (
                          <div>
                            <p className="text-xs text-text-muted mb-1">环节说明</p>
                            <p className="text-sm text-text-secondary">{item.description}</p>
                          </div>
                        )}
                        {itemVendors.length > 0 && (
                          <div>
                            <p className="text-xs text-text-muted mb-2">参与供应商</p>
                            <div className="flex flex-wrap gap-2">
                              {itemVendors.map((v) => {
                                const Icon = vendorCategoryIcons[v!.category];
                                return (
                                  <div
                                    key={v!.id}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream/50 border border-border"
                                  >
                                    <img src={v!.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                                    <Icon className="w-3.5 h-3.5 text-rose-gold" />
                                    <span className="text-sm text-text-primary">{v!.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Vendor quick tags */}
                    {itemVendors.length > 0 && !isExpanded && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {itemVendors.map((v) => {
                          const Icon = vendorCategoryIcons[v!.category];
                          return (
                            <span
                              key={v!.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-gold/10 text-xs text-rose-gold-dark"
                            >
                              <Icon className="w-3 h-3" />
                              {v!.name.length > 8 ? v!.name.slice(0, 8) + '...' : v!.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">
                {editingItem ? '编辑环节' : '添加婚礼环节'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">时间</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">地点</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="如：宴会厅主舞台"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">环节名称</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="如：新人入场"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">详细说明（可选）</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="描述环节的具体内容、注意事项等"
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">参与供应商</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {vendors.map((vendor) => {
                    const Icon = vendorCategoryIcons[vendor.category];
                    const isSelected = formData.vendorIds.includes(vendor.id);
                    return (
                      <button
                        key={vendor.id}
                        onClick={() => toggleVendor(vendor.id)}
                        className={cn(
                          'flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-all',
                          isSelected
                            ? 'border-rose-gold bg-rose-gold/5'
                            : 'border-border hover:border-rose-gold-light',
                        )}
                      >
                        <img src={vendor.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <Icon className="w-3 h-3 text-rose-gold" />
                            <p className="text-sm font-medium text-text-primary truncate">{vendor.name}</p>
                          </div>
                          <p className="text-xs text-text-muted">{CATEGORY_LABELS[vendor.category]}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-rose-gold flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} className="flex-1 btn-primary">
                {editingItem ? '保存修改' : '添加环节'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-rose-gold" />
                  分享婚礼流程单
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  选择供应商视角，生成专属流程单链接
                </p>
              </div>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareVendorId(null);
                }}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-b border-border bg-cream/30">
              <p className="text-sm text-text-secondary mb-3">选择供应商视角：</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShareVendorId(null)}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm transition-all flex items-center gap-1.5 border-2',
                    shareVendorId === null
                      ? 'border-rose-gold bg-white text-rose-gold-dark font-medium'
                      : 'border-border bg-white/60 text-text-secondary hover:border-rose-gold-light',
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  全部（新人视角）
                </button>
                {vendors.map((vendor) => {
                  const Icon = vendorCategoryIcons[vendor.category];
                  const isSelected = shareVendorId === vendor.id;
                  return (
                    <button
                      key={vendor.id}
                      onClick={() => setShareVendorId(isSelected ? null : vendor.id)}
                      className={cn(
                        'px-4 py-2 rounded-md text-sm transition-all flex items-center gap-1.5 border-2',
                        isSelected
                          ? 'border-rose-gold bg-white text-rose-gold-dark font-medium'
                          : 'border-border bg-white/60 text-text-secondary hover:border-rose-gold-light',
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {vendor.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-bg">
              {shareVendorId ? (
                <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-rose-gold/10 to-soft-pink/20 border border-rose-gold/20">
                  {(() => {
                    const v = vendors.find((x) => x.id === shareVendorId);
                    if (!v) return null;
                    const VI = vendorCategoryIcons[v.category];
                    return (
                      <div className="flex items-center gap-3">
                        <img src={v.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-soft" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <VI className="w-4 h-4 text-rose-gold" />
                            <p className="font-medium text-text-primary">{v.name}</p>
                            <span className="chip">{CATEGORY_LABELS[v.category]}</span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">仅显示与该供应商相关的环节</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="mb-4 p-4 rounded-lg bg-cream/50 border border-border">
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Users className="w-4 h-4 text-rose-gold" />
                    <span>新人和亲友视角：显示所有环节</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(shareVendorId
                  ? timeline.filter((item) => item.vendorIds?.includes(shareVendorId))
                  : timeline
                ).length === 0 ? (
                  <div className="text-center py-12 text-text-muted">
                    <PartyPopper className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>该供应商暂无相关环节安排</p>
                  </div>
                ) : (
                  (shareVendorId
                    ? timeline.filter((item) => item.vendorIds?.includes(shareVendorId))
                    : timeline
                  ).map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 shadow-soft flex gap-4"
                    >
                      <div className="text-center min-w-[60px] border-r border-border pr-4">
                        <p className="font-display text-2xl font-bold gold-text">
                          {item.time.split(':')[0]}
                        </p>
                        <p className="text-sm text-text-muted">:{item.time.split(':')[1]}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-text-primary">{item.title}</h4>
                          {idx === 0 && <span className="chip">开场</span>}
                        </div>
                        <p className="text-xs text-text-secondary flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-gold" />
                          {item.location}
                        </p>
                        {item.description && (
                          <p className="text-xs text-text-muted mt-2">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-border bg-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-border/40 border border-border">
                  <Link className="w-4 h-4 text-text-muted flex-shrink-0" />
                  <code className="text-xs text-text-secondary flex-1 truncate font-mono">
                    {shareVendorId
                      ? `${window.location.origin}/wedding-day?vendor=${shareVendorId}`
                      : `${window.location.origin}/wedding-day`}
                  </code>
                </div>
                <button
                  onClick={() => {
                    const link = shareVendorId
                      ? `${window.location.origin}/wedding-day?vendor=${shareVendorId}`
                      : `${window.location.origin}/wedding-day`;
                    navigator.clipboard?.writeText(link);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className={cn(
                    'btn-primary flex items-center gap-2',
                    copiedLink && '!bg-sage-green',
                  )}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制链接
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-text-muted text-center">
                打开链接即可查看对应视角的婚礼流程单（支持新增/编辑环节后实时更新）
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
