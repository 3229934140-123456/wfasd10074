import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Search, Settings } from 'lucide-react';
import Sidebar from './Sidebar';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '婚礼总览', subtitle: '查看您的婚礼筹备进度' },
  '/vendors': { title: '供应商市场', subtitle: '发现优质婚礼服务商' },
  '/contracts': { title: '协议与付款', subtitle: '管理服务协议和付款节点' },
  '/timeline': { title: '筹备时间轴', subtitle: '跟踪待办事项和进度' },
  '/collaboration': { title: '协作中心', subtitle: '和亲友一起筹备婚礼' },
  '/guests': { title: '宾客管理', subtitle: '管理宾客名单和出席情况' },
  '/seating': { title: '座位安排', subtitle: '可视化编排宾客座位' },
  '/wedding-day': { title: '婚礼流程单', subtitle: '编排婚礼当天的每个环节' },
};

export default function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: '', subtitle: '' };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-8">
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary">{pageInfo.title}</h2>
            <p className="text-xs text-text-muted">{pageInfo.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative mr-2">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索..."
                className="w-56 pl-9 pr-4 py-2 rounded-md bg-border/30 border-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-rose-gold/20 transition-all"
              />
            </div>
            <button className="relative p-2 rounded-md text-text-secondary hover:text-rose-gold hover:bg-rose-gold/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-gold"></span>
            </button>
            <button className="p-2 rounded-md text-text-secondary hover:text-rose-gold hover:bg-rose-gold/10 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
