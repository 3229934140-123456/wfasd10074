import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Check,
  MapPin,
  Clock,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_LABELS } from '@/types';
import { formatMoney, formatDate } from '@/utils/date';

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vendors } = useAppStore();
  const vendor = vendors.find((v) => v.id === id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(
    vendor?.packages[0]?.id || null,
  );
  const [showSignModal, setShowSignModal] = useState(false);

  if (!vendor) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">供应商不存在</p>
        <button onClick={() => navigate('/vendors')} className="btn-secondary mt-4">
          返回列表
        </button>
      </div>
    );
  }

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % vendor.coverImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + vendor.coverImages.length) % vendor.coverImages.length);
  };

  const averageRating = vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(1, vendor.reviews.length);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/vendors')}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-rose-gold transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        返回供应商列表
      </button>

      {/* Hero Gallery */}
      <div className="card !p-0 overflow-hidden">
        <div className="relative h-96 bg-dark-brown">
          <img
            src={vendor.coverImages[activeImageIndex]}
            alt=""
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
          {vendor.coverImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-text-primary hover:bg-white transition-colors shadow-medium"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-text-primary hover:bg-white transition-colors shadow-medium"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {vendor.coverImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeImageIndex ? 'w-8 bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <img
                src={vendor.avatar}
                alt=""
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lift"
              />
              <div className="text-white">
                <p className="text-sm opacity-90 mb-1">{CATEGORY_LABELS[vendor.category]}</p>
                <h1 className="font-display text-3xl font-semibold mb-2">{vendor.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="opacity-80">({vendor.reviewCount}条评价)</span>
                  </div>
                  <span className="opacity-80">|</span>
                  <span>{formatMoney(vendor.priceRange.min)} 起</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2.5 rounded-md bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2">
                <Phone className="w-4 h-4" />
                联系电话
              </button>
              <button className="px-4 py-2.5 rounded-md bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-colors flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                微信咨询
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h3 className="font-display text-lg font-semibold mb-3">关于我们</h3>
            <p className="text-text-secondary leading-relaxed">{vendor.description}</p>
          </div>

          {/* Portfolio */}
          {vendor.portfolio.length > 0 && (
            <div className="card">
              <h3 className="font-display text-lg font-semibold mb-4">作品集</h3>
              <div className="space-y-6">
                {vendor.portfolio.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-text-primary">{item.title}</h4>
                        <p className="text-xs text-text-muted mt-0.5">{formatDate(item.date)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mb-3">{item.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {item.images.map((img, i) => (
                        <div key={i} className="aspect-video rounded-lg overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">真实评价</h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
                <span className="font-display text-xl font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-text-muted">/ {vendor.reviewCount} 条</span>
              </div>
            </div>
            <div className="space-y-4">
              {vendor.reviews.length === 0 ? (
                <p className="text-center text-text-muted py-4">暂无评价</p>
              ) : (
                vendor.reviews.map((review) => (
                  <div key={review.id} className="flex gap-4 py-4 border-b border-border last:border-b-0 last:pb-0">
                    <img src={review.avatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-primary">{review.userName}</span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? 'text-amber-400' : 'text-border'}`}
                              fill={i < review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">{review.content}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-2">
                          {review.images.map((img, i) => (
                            <img key={i} src={img} alt="" className="w-20 h-20 rounded-md object-cover" />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-text-muted">{formatDate(review.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Packages */}
        <div className="col-span-1 space-y-6">
          <div className="card sticky top-6">
            <h3 className="font-display text-lg font-semibold mb-4">服务套餐</h3>
            <div className="space-y-3">
              {vendor.packages.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-gold bg-rose-gold/5'
                        : 'border-border hover:border-rose-gold-light'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-text-primary">{pkg.name}</h4>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-rose-gold flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                    <p className="font-display text-xl font-semibold text-rose-gold-dark mb-3">
                      {formatMoney(pkg.price)}
                    </p>
                    <ul className="space-y-1.5">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                          <Check className="w-3 h-3 text-sage-green flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowSignModal(true)}
              disabled={!selectedPackage}
              className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              立即签约
            </button>
            <p className="text-xs text-text-muted text-center mt-2">
              签约后将进入协议确认流程
            </p>
          </div>

          <div className="card">
            <h3 className="font-display text-base font-semibold mb-3">联系方式</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-text-secondary">
                <Phone className="w-4 h-4 text-rose-gold" />
                {vendor.contact.phone}
              </div>
              {vendor.contact.wechat && (
                <div className="flex items-center gap-3 text-text-secondary">
                  <MessageCircle className="w-4 h-4 text-rose-gold" />
                  微信：{vendor.contact.wechat}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-lg p-6 animate-slide-up">
            <h3 className="font-display text-xl font-semibold mb-2">确认服务协议</h3>
            <p className="text-sm text-text-secondary mb-4">
              您即将与 <span className="text-rose-gold-dark font-medium">{vendor.name}</span> 签订服务协议
            </p>
            <div className="bg-cream/50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">服务套餐</span>
                <span className="text-text-primary font-medium">
                  {vendor.packages.find((p) => p.id === selectedPackage)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">服务费用</span>
                <span className="text-rose-gold-dark font-semibold">
                  {formatMoney(vendor.packages.find((p) => p.id === selectedPackage)?.price || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">定金（30%）</span>
                <span className="text-text-primary">
                  {formatMoney(Math.round((vendor.packages.find((p) => p.id === selectedPackage)?.price || 0) * 0.3))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">尾款</span>
                <span className="text-text-primary">
                  {formatMoney(Math.round((vendor.packages.find((p) => p.id === selectedPackage)?.price || 0) * 0.7))}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-text-muted mb-4">
              <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
              请在婚礼前7天支付尾款，逾期将影响服务安排
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowSignModal(false);
                  navigate('/contracts');
                }}
                className="flex-1 btn-primary"
              >
                确认签署
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
