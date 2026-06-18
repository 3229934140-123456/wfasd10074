import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'couple',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/setup');
  };

  return (
    <div className="min-h-screen flex marble-bg">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-gold/90 via-rose-gold to-rose-gold-dark/90 z-10"></div>
        <img
          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20wedding%20ceremony%20romantic%20sunset%20golden%20hour&image_size=portrait_16_9"
          alt="wedding"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center items-center text-white p-16 w-full">
          <div className="mb-8 animate-float">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Heart className="w-12 h-12 text-white" fill="currentColor" />
            </div>
          </div>
          <h1 className="font-display text-6xl font-semibold mb-4 text-center leading-tight">
            WeddingPlan
          </h1>
          <div className="decorative-line w-48 my-6 !bg-white/40"></div>
          <p className="text-xl text-white/90 text-center max-w-md mb-8">
            让婚礼筹备变得优雅从容<br />每一个细节都值得被精心对待
          </p>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-display text-4xl font-bold mb-1">1000+</p>
              <p className="text-sm text-white/70">优质供应商</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold mb-1">5000+</p>
              <p className="text-sm text-white/70">幸福新人</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold mb-1">99%</p>
              <p className="text-sm text-white/70">好评率</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <h1 className="font-display text-3xl font-semibold gold-text">WeddingPlan</h1>
          </div>

          <h2 className="font-display text-3xl font-semibold text-text-primary mb-2">
            {isLogin ? '欢迎回来' : '开启美好旅程'}
          </h2>
          <p className="text-text-secondary mb-8">
            {isLogin ? '登录您的账号继续筹备婚礼' : '注册账号开始您的婚礼筹备之旅'}
          </p>

          {/* Tab Switch */}
          <div className="flex bg-border/50 rounded-lg p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                isLogin ? 'bg-white text-rose-gold-dark shadow-soft' : 'text-text-secondary'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                !isLogin ? 'bg-white text-rose-gold-dark shadow-soft' : 'text-text-secondary'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">您的称呼</label>
                <div className="relative">
                  <User className="w-5 h-5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="新人姓名"
                    className="input-field pl-11"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">邮箱/手机号</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入邮箱或手机号"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">密码</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码"
                  className="input-field pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-rose-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin ? (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-rose-gold focus:ring-rose-gold/20"
                  />
                  记住我
                </label>
                <button type="button" className="text-rose-gold hover:underline">
                  忘记密码？
                </button>
              </div>
            ) : (
              <div>
                <label className="text-sm text-text-secondary mb-2 block">您的身份</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'couple', label: '新人', icon: Heart },
                    { value: 'collaborator', label: '亲友', icon: Sparkles },
                    { value: 'vendor', label: '供应商', icon: Sparkles },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = formData.role === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: opt.value })}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-rose-gold bg-rose-gold/5'
                            : 'border-border hover:border-rose-gold-light'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-rose-gold' : 'text-text-muted'}`} />
                        <span className={`text-sm ${isSelected ? 'text-rose-gold-dark font-medium' : 'text-text-secondary'}`}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 group"
            >
              {isLogin ? '登录' : '立即注册'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            {isLogin ? (
              <>
                还没有账号？
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-rose-gold font-medium hover:underline ml-1"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号？
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-rose-gold font-medium hover:underline ml-1"
                >
                  立即登录
                </button>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-xs text-text-muted mb-4">
              其他登录方式
            </p>
            <div className="flex justify-center gap-4">
              {['微信', 'QQ', '微博'].map((name) => (
                <button
                  key={name}
                  type="button"
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-text-secondary hover:border-rose-gold hover:text-rose-gold transition-all"
                >
                  <span className="text-xs">{name.charAt(0)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
