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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { VendorCategory } from '@/types';
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

export default function ShareTimeline() {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendor');

  const { project, timeline, vendors, hasCompletedSetup } = useAppStore();

  const vendor = vendors.find((v) => v.id === vendorId);
  const filteredTimeline = vendorId
    ? timeline.filter((item) => item.vendorIds?.includes(vendorId))
    : timeline;

  if (!hasCompletedSetup || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center marble-bg">
        <div className="card max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h2 className="font-display text-2xl font-semibold text-text-primary mb-2">
            流程单不存在
          </h2>
          <p className="text-text-secondary text-sm">
            该婚礼流程单尚未创建或已被删除，请联系新人获取最新链接。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-gold/90 via-rose-gold to-rose-gold-dark/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-6 h-6" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold">{project.coupleName}</h1>
              <p className="text-white/80 text-sm">的婚礼流程单</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {project.weddingDate}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {project.location}
            </div>
          </div>

          {vendor && (
            <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <div className="flex items-center gap-3">
                <img
                  src={vendor.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
                />
                <div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = vendorCategoryIcons[vendor.category];
                      return <Icon className="w-4 h-4" />;
                    })()}
                    <span className="font-medium">{vendor.name}</span>
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">
                    {CATEGORY_LABELS[vendor.category]} · 专属视角
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/80 mt-3">
                以下是您在婚礼当天需要参与的环节安排，请准时到场
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            <PartyPopper className="w-5 h-5" />
            <span>
              共 <span className="font-semibold">{filteredTimeline.length}</span> 个环节
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {filteredTimeline.length === 0 ? (
          <div className="card text-center py-16">
            <PartyPopper className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
            <p className="text-text-secondary">
              {vendor ? '暂无您需要参与的环节' : '暂无流程安排'}
            </p>
          </div>
        ) : (
          <div className="relative pl-10">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-rose-gold via-rose-gold/50 to-rose-gold/20"></div>
            <div className="space-y-6">
              {filteredTimeline.map((item, index) => (
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
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-text-primary text-lg">
                            {item.title}
                          </h3>
                          {index === 0 && (
                            <span className="chip">开场</span>
                          )}
                          {index === filteredTimeline.length - 1 && (
                            <span className="chip-green">结束</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-text-secondary mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-gold" />
                            {item.location}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-sm text-text-muted bg-cream/50 rounded-lg p-3">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="decorative-line mx-auto w-32 mb-4"></div>
          <p className="text-sm text-text-muted">
            <Heart className="w-3.5 h-3.5 inline mr-1 text-rose-gold" fill="currentColor" />
            {project.coupleName} 敬邀
          </p>
          <p className="text-xs text-text-muted mt-1">
            本流程单实时更新，如有变动请以最新版本为准
          </p>
        </div>
      </div>
    </div>
  );
}
