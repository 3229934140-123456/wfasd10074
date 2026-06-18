import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Building2,
  Flower2,
  Mic2,
  Music,
  Sparkles,
  Shirt,
  Gift,
  Star,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_LABELS, type VendorCategory } from '@/types';
import { formatMoney } from '@/utils/date';

const categoryIcons: Record<VendorCategory, typeof Camera> = {
  photography: Camera,
  venue: Building2,
  florist: Flower2,
  host: Mic2,
  band: Music,
  makeup: Sparkles,
  dress: Shirt,
  candy: Gift,
};

type FilterCategory = VendorCategory | 'all';

export default function Vendors() {
  const navigate = useNavigate();
  const { vendors } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: FilterCategory[] = ['all', 'photography', 'venue', 'florist', 'host', 'band', 'makeup', 'dress', 'candy'];

  const filteredVendors = vendors.filter((v) => {
    const matchCategory = activeCategory === 'all' || v.category === activeCategory;
    const matchSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Category Nav */}
      <div className="card py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const Icon = cat === 'all' ? Gift : categoryIcons[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md whitespace-nowrap transition-all duration-200 relative ${
                  isActive
                    ? 'bg-rose-gold/10 text-rose-gold-dark font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-border/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-rose-gold rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索供应商..."
              className="w-64 pl-9 pr-4 py-2 rounded-md border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-white text-sm text-text-secondary hover:text-text-primary hover:border-rose-gold transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            筛选排序
          </button>
        </div>
        <p className="text-sm text-text-muted">
          共找到 <span className="text-rose-gold-dark font-medium">{filteredVendors.length}</span> 家优质供应商
        </p>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const Icon = categoryIcons[vendor.category];
          return (
            <div
              key={vendor.id}
              onClick={() => navigate(`/vendors/${vendor.id}`)}
              className="card overflow-hidden cursor-pointer group !p-0"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vendor.coverImages[0]}
                  alt={vendor.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-rose-gold-dark">
                    <Icon className="w-3 h-3" />
                    {CATEGORY_LABELS[vendor.category]}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm">
                  <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                  <span className="text-xs font-medium text-text-primary">{vendor.rating}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={vendor.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-soft -mt-8 relative z-10"
                  />
                  <div className="flex-1 pt-1">
                    <h3 className="font-display text-lg font-semibold text-text-primary group-hover:text-rose-gold transition-colors">
                      {vendor.name}
                    </h3>
                    <p className="text-xs text-text-muted">{vendor.reviewCount} 条真实评价</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2 mb-4">{vendor.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <span className="text-xs text-text-muted">价格区间</span>
                    <p className="font-medium text-rose-gold-dark">
                      {formatMoney(vendor.priceRange.min)} - {formatMoney(vendor.priceRange.max)}
                    </p>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-rose-gold font-medium group-hover:gap-2 transition-all">
                    查看详情
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
