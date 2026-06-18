import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, MapPin, Wallet, Palette, ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { WeddingStyle } from '@/types';
import { WEDDING_STYLE_LABELS } from '@/types';
import { cn } from '@/utils';

const weddingStyles: { value: WeddingStyle; desc: string }[] = [
  { value: 'romantic', desc: '鲜花、纱幔、烛光，梦幻柔美' },
  { value: 'modern', desc: '几何线条、极简配色，时尚大气' },
  { value: 'vintage', desc: '蕾丝、复古摆件，怀旧优雅' },
  { value: 'chinese', desc: '凤冠霞帔、红烛喜字，传统喜庆' },
  { value: 'outdoor', desc: '草坪、海边、森林，自然清新' },
];

export default function Setup() {
  const navigate = useNavigate();
  const { createProject } = useAppStore();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    userName: '',
    groomName: '',
    brideName: '',
    weddingDate: '',
    location: '',
    budget: 150000,
    style: 'romantic' as WeddingStyle,
    styleNote: '',
  });

  const canNext = () => {
    if (step === 1) return formData.userName.trim() && formData.groomName.trim() && formData.brideName.trim();
    if (step === 2) return formData.weddingDate && formData.location.trim();
    if (step === 3) return formData.budget > 0;
    return true;
  };

  const handleComplete = () => {
    createProject(formData);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center marble-bg p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold flex items-center justify-center shadow-soft">
            <Heart className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <h1 className="font-display text-3xl font-semibold gold-text">WeddingPlan</h1>
        </div>

        <div className="card">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {['新人信息', '婚礼信息', '预算', '风格偏好'].map((label, idx) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                      step > idx + 1
                        ? 'bg-sage-green text-white'
                        : step === idx + 1
                        ? 'bg-rose-gold text-white shadow-soft'
                        : 'bg-border text-text-muted',
                    )}
                  >
                    {step > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span
                    className={cn(
                      'text-sm hidden sm:block',
                      step >= idx + 1 ? 'text-text-primary font-medium' : 'text-text-muted',
                    )}
                  >
                    {label}
                  </span>
                  {idx < 3 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5',
                        step > idx + 1 ? 'bg-sage-green' : 'bg-border',
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Names */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-rose-gold" />
                <h2 className="font-display text-2xl font-semibold text-text-primary">首先，介绍一下你们</h2>
              </div>
              <p className="text-text-secondary mb-6">告诉我们新人和您的称呼，让我们开启这段美好旅程</p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">您的称呼</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="如：陈明轩"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-text-secondary mb-1.5 block">新郎姓名</label>
                    <input
                      type="text"
                      value={formData.groomName}
                      onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                      placeholder="新郎姓名"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1.5 block">新娘姓名</label>
                    <input
                      type="text"
                      value={formData.brideName}
                      onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                      placeholder="新娘姓名"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Location */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-rose-gold" />
                <h2 className="font-display text-2xl font-semibold text-text-primary">婚礼基本信息</h2>
              </div>
              <p className="text-text-secondary mb-6">确定婚礼日期和举办地点</p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">婚礼日期</label>
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">
                    <MapPin className="w-4 h-4 inline mr-1 text-rose-gold" />
                    婚礼地点
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="如：上海浦东丽思卡尔顿酒店"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-rose-gold" />
                <h2 className="font-display text-2xl font-semibold text-text-primary">婚礼预算</h2>
              </div>
              <p className="text-text-secondary mb-6">设定大致预算，后续可随时调整</p>

              <div className="space-y-6">
                <div className="bg-cream/50 rounded-xl p-6 text-center">
                  <p className="text-sm text-text-muted mb-2">预计总预算</p>
                  <div className="font-display text-5xl font-bold gold-text mb-4">
                    ¥ {formData.budget.toLocaleString()}
                  </div>
                  <input
                    type="range"
                    min={30000}
                    max={1000000}
                    step={10000}
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                    className="w-full h-2 bg-border rounded-full appearance-none accent-rose-gold cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-2">
                    <span>3万</span>
                    <span>100万</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[50000, 100000, 200000, 300000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: val })}
                      className={cn(
                        'py-2.5 rounded-lg text-sm transition-all border-2',
                        formData.budget === val
                          ? 'border-rose-gold bg-rose-gold/5 text-rose-gold-dark font-medium'
                          : 'border-border hover:border-rose-gold-light text-text-secondary',
                      )}
                    >
                      ¥{(val / 10000).toFixed(0)}万
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Style */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-rose-gold" />
                <h2 className="font-display text-2xl font-semibold text-text-primary">选择婚礼风格</h2>
              </div>
              <p className="text-text-secondary mb-6">这将帮助我们为您推荐匹配的供应商</p>

              <div className="space-y-3 mb-6">
                {weddingStyles.map((s) => {
                  const isSelected = formData.style === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, style: s.value })}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 text-left transition-all',
                        isSelected
                          ? 'border-rose-gold bg-rose-gold/5'
                          : 'border-border hover:border-rose-gold-light',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            'font-medium',
                            isSelected ? 'text-rose-gold-dark' : 'text-text-primary',
                          )}
                        >
                          {WEDDING_STYLE_LABELS[s.value]}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-rose-gold flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-muted">{s.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">补充说明（可选）</label>
                <textarea
                  value={formData.styleNote}
                  onChange={(e) => setFormData({ ...formData, styleNote: e.target.value })}
                  rows={2}
                  placeholder="如：偏爱粉色系，希望有更多鲜花布置"
                  className="input-field resize-none"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 btn-secondary"
              >
                上一步
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canNext()}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="w-4 h-4" fill="currentColor" />
                创建我的婚礼项目
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          所有数据仅存储在您的浏览器中，我们不会收集任何个人信息
        </p>
      </div>
    </div>
  );
}
