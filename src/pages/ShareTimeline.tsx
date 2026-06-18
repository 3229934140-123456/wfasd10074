import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PartyPopper,
  MapPin,
  Clock,
  Camera,
  Building2,
  Flower2,
  Mic2,
  Music,
  Sparkles,
  Shirt,
  Gift,
  Heart,
  AlertCircle,
  Check,
  MessageSquare,
  User,
  Phone,
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  Edit3,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { VendorCategory, VendorConfirmationStatus } from '@/types';
import { CATEGORY_LABELS, VENDOR_CONFIRMATION_LABELS } from '@/types';
import { cn } from '@/utils';
import type { TimelineShareData } from '@/utils/share';
import { decodeSharePayload } from '@/utils/share';
import { useShareBridge } from '@/hooks/useShareBridge';

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

interface VCProps {
  itemId: string;
  vendorId: string;
  vendorName: string;
  onConfirm: (
    itemId: string,
    status: VendorConfirmationStatus,
    data: { contactPerson?: string; contactPhone?: string; note?: string },
  ) => void;
  confirmation?: {
    status: string;
    confirmedAt?: string;
    contactPerson?: string;
    contactPhone?: string;
    note?: string;
  };
}

function VendorConfirmPanel({ itemId, vendorId, vendorName, onConfirm, confirmation }: VCProps) {
  const [status, setStatus] = useState<VendorConfirmationStatus>(
    (confirmation?.status as VendorConfirmationStatus) || 'pending',
  );
  const [contactPerson, setContactPerson] = useState(confirmation?.contactPerson || '');
  const [contactPhone, setContactPhone] = useState(confirmation?.contactPhone || '');
  const [note, setNote] = useState(confirmation?.note || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStatus((confirmation?.status as VendorConfirmationStatus) || 'pending');
    setContactPerson(confirmation?.contactPerson || '');
    setContactPhone(confirmation?.contactPhone || '');
    setNote(confirmation?.note || '');
  }, [confirmation]);

  const handleSave = () => {
    onConfirm(itemId, status, { contactPerson, contactPhone, note });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const statusColors: Record<VendorConfirmationStatus, string> = {
    pending: 'bg-slate-100 text-slate-600 border-slate-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    needs_changes: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/70">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Check className="w-3.5 h-3.5 text-rose-gold" />
          供应商确认 · {vendorName}
        </div>
        {confirmation && confirmation.status !== 'pending' && (
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border font-medium',
              statusColors[confirmation.status as VendorConfirmationStatus] || statusColors.pending,
            )}>
            {VENDOR_CONFIRMATION_LABELS[confirmation.status as VendorConfirmationStatus] || '待确认'}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <label className="block text-[11px] text-text-secondary font-medium">状态</label>
        <div className="grid grid-cols-3 gap-2">
          {(['pending', 'confirmed', 'needs_changes'] as VendorConfirmationStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'text-xs py-1.5 rounded-lg border transition-colors',
                status === s
                  ? s === 'confirmed'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : s === 'needs_changes'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-500 text-white border-slate-500'
                  : 'bg-white text-text-secondary border-border hover:border-rose-gold/50',
              )}>
              {VENDOR_CONFIRMATION_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="block text-[11px] text-text-secondary font-medium mb-1">到场联系人</label>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="姓名"
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-border focus:border-rose-gold focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-text-secondary font-medium mb-1">联系电话</label>
          <div className="relative">
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="手机号"
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-border focus:border-rose-gold focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-[11px] text-text-secondary font-medium mb-1">备注说明</label>
        <div className="relative">
          <MessageSquare className="absolute left-2.5 top-2 w-3.5 h-3.5 text-text-muted" />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="如有特殊要求或需说明的事项..."
            rows={2}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-border focus:border-rose-gold focus:outline-none resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-gradient-to-r from-rose-gold to-rose-gold-dark text-white font-medium hover:shadow-soft transition-all active:scale-[0.98]">
        {saved ? (
          <>
            <Check className="w-3.5 h-3.5" />
            已保存确认
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            提交确认
          </>
        )}
      </button>

      {saved && (
        <p className="text-[11px] text-emerald-600 mt-2 text-center">
          确认信息已提交，新人可以在流程单中查看
        </p>
      )}
    </div>
  );
}

export default function ShareTimeline() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendor');
  const dataParam = searchParams.get('data');

  const { project, timeline, vendors, hasCompletedSetup, setVendorConfirmation, generateTimelineShareLink } =
    useAppStore();
  const shareBridge = useShareBridge();
  const [, setTick] = useState(0);
  const [lastSyncText, setLastSyncText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsub = shareBridge.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, [shareBridge]);

  const decoded = useMemo(() => {
    if (!dataParam) return null;
    return decodeSharePayload<TimelineShareData>(dataParam);
  }, [dataParam]);

  const effectiveData = useMemo(() => {
    void setTick;
    if (hasCompletedSetup && project) {
      const signedVendorIds = new Set(
        useAppStore
          .getState()
          .contracts.filter((c) => c.status === 'signed')
          .map((c) => c.vendorId),
      );
      return {
        project: {
          groomName: project.groomName,
          brideName: project.brideName,
          coupleName: project.coupleName,
          weddingDate: project.weddingDate,
          location: project.location,
        },
        timeline: timeline
          .filter((item) => {
            if (!vendorId) return true;
            return item.vendorIds?.includes(vendorId) || item.responsibleType === 'both';
          })
          .map((item) => {
            const bridgeConfirmations: Array<{
              vendorId: string;
              status: string;
              confirmedAt?: string;
              contactPerson?: string;
              contactPhone?: string;
              note?: string;
            }> = [];
            (item.vendorIds || []).forEach((vid) => {
              const stored = shareBridge.getConfirmation(vid, item.id);
              if (stored) bridgeConfirmations.push({ vendorId: vid, ...stored });
            });
            const existing = item.vendorConfirmations || [];
            const merged = existing.map((c) => {
              const bridge = bridgeConfirmations.find((b) => b.vendorId === c.vendorId);
              return bridge || { vendorId: c.vendorId, status: c.status, confirmedAt: c.confirmedAt, contactPerson: c.contactPerson, contactPhone: c.contactPhone, note: c.note };
            });
            bridgeConfirmations.forEach((bc) => {
              if (!merged.find((m) => m.vendorId === bc.vendorId)) merged.push(bc);
            });
            return {
              id: item.id,
              time: item.time,
              title: item.title,
              location: item.location,
              description: item.description,
              vendorIds: item.vendorIds,
              responsibleType: item.responsibleType,
              vendorConfirmations: merged,
            };
          }),
        vendors: Array.from(vendors)
          .filter((v) => (vendorId ? v.id === vendorId : signedVendorIds.has(v.id)))
          .map((v) => ({ id: v.id, name: v.name, category: v.category, avatar: v.avatar })),
        createdAt: new Date().toISOString(),
      } as TimelineShareData;
    }
    if (decoded) {
      const timelineWithBridge = decoded.timeline.map((item) => {
        const bridgeConfirmations: Array<{
          vendorId: string;
          status: string;
          confirmedAt?: string;
          contactPerson?: string;
          contactPhone?: string;
          note?: string;
        }> = [];
        (item.vendorIds || []).forEach((vid) => {
          const stored = shareBridge.getConfirmation(vid, item.id);
          if (stored) bridgeConfirmations.push({ vendorId: vid, ...stored });
        });
        const existing = item.vendorConfirmations || [];
        const merged = existing.map((c) => {
          const bridge = bridgeConfirmations.find((b) => b.vendorId === c.vendorId);
          return bridge || { vendorId: c.vendorId, status: c.status, confirmedAt: c.confirmedAt, contactPerson: c.contactPerson, contactPhone: c.contactPhone, note: c.note };
        });
        bridgeConfirmations.forEach((bc) => {
          if (!merged.find((m) => m.vendorId === bc.vendorId)) merged.push(bc);
        });
        return { ...item, vendorConfirmations: merged };
      });
      return { ...decoded, timeline: timelineWithBridge };
    }
    return null;
  }, [hasCompletedSetup, project, timeline, vendors, decoded, vendorId, shareBridge, setTick]);

  const vendor = effectiveData?.vendors.find((v) => v.id === vendorId);
  const filteredTimeline = vendorId
    ? effectiveData?.timeline.filter((item) => item.vendorIds?.includes(vendorId) || item.responsibleType === 'both')
    : effectiveData?.timeline;

  const handleVendorConfirm = (
    itemId: string,
    status: VendorConfirmationStatus,
    opts: { contactPerson?: string; contactPhone?: string; note?: string },
  ) => {
    if (vendorId) {
      shareBridge.setConfirmation(vendorId, itemId, {
        status,
        contactPerson: opts.contactPerson,
        contactPhone: opts.contactPhone,
        note: opts.note,
      });
      if (hasCompletedSetup) {
        setVendorConfirmation(itemId, vendorId, {
          status,
          contactPerson: opts.contactPerson,
          contactPhone: opts.contactPhone,
          note: opts.note,
        });
      }
    }
    setLastSyncText(`已同步 · ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`);
    setTimeout(() => setLastSyncText(''), 3000);
  };

  const syncToStore = () => {
    if (!hasCompletedSetup || !decoded) return;
    decoded.timeline.forEach((item) => {
      (item.vendorConfirmations || []).forEach((c) => {
        if (c.status !== 'pending') {
          setVendorConfirmation(item.id, c.vendorId, {
            status: c.status as VendorConfirmationStatus,
            contactPerson: c.contactPerson,
            contactPhone: c.contactPhone,
            note: c.note,
            confirmedAt: c.confirmedAt,
          });
        }
      });
    });
    setLastSyncText('已将链接中的确认同步到项目');
    setTimeout(() => setLastSyncText(''), 3000);
  };

  if (!effectiveData || !effectiveData.project) {
    return (
      <div className="min-h-screen flex items-center justify-center marble-bg">
        <div className="card max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">流程单不存在</h2>
          <p className="text-text-secondary text-sm mb-6">
            该婚礼流程单尚未创建或已被删除，请联系新人获取最新链接。
          </p>
          <p className="text-xs text-text-muted">提示：请确认链接完整，并使用同一浏览器或同设备访问。</p>
        </div>
      </div>
    );
  }

  const proj = effectiveData.project;

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-gradient-to-br from-rose-gold/90 via-rose-gold to-rose-gold-dark/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-6 h-6" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold">{proj.coupleName}</h1>
              <p className="text-white/80 text-sm">的婚礼流程单</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {proj.weddingDate}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {proj.location}
            </div>
          </div>

          {vendor && (
            <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="flex items-center gap-3">
                <img src={vendor.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/50" />
                <div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = vendorCategoryIcons[vendor.category as VendorCategory];
                      return <Icon className="w-4 h-4" />;
                    })()}
                    <span className="font-medium">{vendor.name}</span>
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">
                    {CATEGORY_LABELS[vendor.category as VendorCategory]} · 专属视角
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/80 mt-3">以下是您在婚礼当天需要参与的环节安排，请准时到场</p>
              <div className="mt-3 p-3 rounded-lg bg-white/10 border border-white/20 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <p className="text-[11px]">请在每个环节下方勾选确认状态，填写到场联系人信息，新人可以实时同步查看。</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5" />
              <span>
                共 <span className="font-semibold">{filteredTimeline?.length || 0}</span> 个环节
              </span>
            </div>
            {lastSyncText && (
              <span className="text-xs px-2 py-1 bg-white/15 rounded-full">
                <RefreshCw className="w-3 h-3 inline mr-1" />
                {lastSyncText}
              </span>
            )}
            {hasCompletedSetup && decoded && (
              <button
                onClick={syncToStore}
                className="ml-auto text-xs px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                一键同步确认到项目
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {!filteredTimeline || filteredTimeline.length === 0 ? (
          <div className="card text-center py-16">
            <PartyPopper className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
            <p className="text-text-secondary">{vendor ? '暂无您需要参与的环节' : '暂无流程安排'}</p>
          </div>
        ) : (
          <div className="relative pl-10">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-rose-gold via-rose-gold/50 to-rose-gold/20"></div>
            <div className="space-y-6">
              {filteredTimeline.map((item, index) => {
                const itemVendorConfirmations = item.vendorConfirmations || [];
                const relevantConfirmation = vendorId
                  ? itemVendorConfirmations.find((c) => c.vendorId === vendorId)
                  : undefined;
                const otherConfirmations = vendorId ? [] : itemVendorConfirmations.filter((c) => c.status !== 'pending');

                return (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[34px] top-6 w-10 h-10 rounded-full bg-white border-4 border-rose-gold/30 flex items-center justify-center shadow-soft z-10">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold"></div>
                    </div>

                    <div className="card hover:shadow-medium transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="text-center min-w-[70px]">
                          <p className="font-display text-3xl font-bold gold-text leading-none">
                            {item.time.split(':')[0]}
                          </p>
                          <p className="text-sm text-text-muted">:{item.time.split(':')[1]}</p>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-medium text-text-primary text-lg">{item.title}</h3>
                            {index === 0 && <span className="chip">开场</span>}
                            {index === filteredTimeline.length - 1 && <span className="chip-green">结束</span>}
                          </div>

                          <div className="flex items-center gap-3 text-sm text-text-secondary mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-gold" />
                              {item.location}
                            </span>
                          </div>

                          {item.description && (
                            <p className="text-sm text-text-muted bg-cream/50 rounded-lg p-3 mb-2">{item.description}</p>
                          )}

                          {otherConfirmations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {otherConfirmations.map((c) => {
                                const v = effectiveData.vendors.find((vv) => vv.id === c.vendorId);
                                const isConfirmed = c.status === 'confirmed';
                                const needsChanges = c.status === 'needs_changes';
                                return (
                                  <div
                                    key={c.vendorId}
                                    className={cn(
                                      'inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border',
                                      isConfirmed
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : needsChanges
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-slate-50 text-slate-600 border-slate-200',
                                    )}
                                    title={c.note}>
                                    {isConfirmed ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : needsChanges ? (
                                      <XCircle className="w-3 h-3" />
                                    ) : (
                                      <Edit3 className="w-3 h-3" />
                                    )}
                                    {v?.name || c.vendorId}：
                                    {VENDOR_CONFIRMATION_LABELS[c.status as VendorConfirmationStatus]}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {vendorId && (
                            <VendorConfirmPanel
                              itemId={item.id}
                              vendorId={vendorId}
                              vendorName={vendor?.name || '供应商'}
                              onConfirm={handleVendorConfirm}
                              confirmation={relevantConfirmation}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <div className="decorative-line mx-auto w-32 mb-4"></div>
          <p className="text-sm text-text-muted">
            <Heart className="w-3.5 h-3.5 inline mr-1 text-rose-gold" fill="currentColor" />
            {proj.coupleName} 敬邀
          </p>
          <p className="text-xs text-text-muted mt-1">本流程单实时更新，如有变动请以最新版本为准</p>
          {hasCompletedSetup && (
            <button
              onClick={() => {
                const link = generateTimelineShareLink(vendorId || undefined);
                navigator.clipboard?.writeText(link);
                alert('最新链接已复制');
              }}
              className="mt-3 text-[11px] text-rose-gold hover:underline">
              复制最新链接
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
