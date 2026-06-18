import { useState } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  Plus,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_LABELS, type ServiceContract, type Payment } from '@/types';
import { formatMoney, formatDate, dayjs } from '@/utils/date';
import { cn } from '@/utils';

const statusConfig = {
  draft: { label: '草稿', icon: FileCheck, color: 'bg-border text-text-secondary' },
  pending: { label: '待确认', icon: Clock, color: 'bg-rose-gold/15 text-rose-gold-dark' },
  signed: { label: '已签约', icon: CheckCircle2, color: 'bg-sage-green/20 text-sage-green' },
  completed: { label: '已完成', icon: CheckCircle2, color: 'bg-sage-green/20 text-sage-green' },
  cancelled: { label: '已取消', icon: XCircle, color: 'bg-red-100 text-red-600' },
};

const paymentTypeLabels = {
  deposit: '定金',
  midterm: '中期款',
  final: '尾款',
};

function ContractCard({ contract }: { contract: ServiceContract }) {
  const [expanded, setExpanded] = useState(false);
  const { markPaymentPaid, updateContractStatus } = useAppStore();
  const StatusIcon = statusConfig[contract.status].icon;

  const totalPaid = contract.payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const paymentProgress = contract.totalPrice > 0 ? Math.round((totalPaid / contract.totalPrice) * 100) : 0;

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <img
              src={contract.vendorAvatar}
              alt=""
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-soft"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-text-primary">{contract.vendorName}</h3>
                {contract.category && (
                  <span className="chip !text-xs">{CATEGORY_LABELS[contract.category]}</span>
                )}
              </div>
              <p className="text-sm text-text-muted mb-2">{contract.packageName}</p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  服务日期：{formatDate(contract.serviceDate)}
                </span>
                {contract.signedAt && (
                  <span className="flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    签约：{formatDate(contract.signedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                statusConfig[contract.status].color,
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {statusConfig[contract.status].label}
            </span>
            <p className="font-display text-2xl font-semibold gold-text mt-3">
              {formatMoney(contract.totalPrice)}
            </p>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-muted">付款进度</span>
            <span className="text-text-secondary">
              已付 {formatMoney(totalPaid)} / {formatMoney(contract.totalPrice)} ({paymentProgress}%)
            </span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-gold-light to-rose-gold rounded-full transition-all duration-500"
              style={{ width: `${paymentProgress}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-sm text-text-secondary hover:text-rose-gold transition-colors py-2"
        >
          {expanded ? '收起详情' : '展开付款详情'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 bg-cream/30">
          {contract.notes && (
            <p className="text-sm text-text-secondary mb-4 italic">备注：{contract.notes}</p>
          )}
          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-gold" />
            付款节点
          </h4>
          <div className="space-y-2">
            {contract.payments.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-3">暂无付款计划</p>
            ) : (
              contract.payments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  contractId={contract.id}
                  onMarkPaid={() => markPaymentPaid(contract.id, payment.id)}
                />
              ))
            )}
          </div>
          {contract.status === 'draft' && (
            <button
              onClick={() => updateContractStatus(contract.id, 'pending')}
              className="w-full btn-secondary mt-4"
            >
              提交签约申请
            </button>
          )}
          {contract.status === 'pending' && (
            <button
              onClick={() => updateContractStatus(contract.id, 'signed')}
              className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              确认签署协议
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentRow({
  payment,
  onMarkPaid,
}: {
  payment: Payment;
  contractId: string;
  onMarkPaid: () => void;
}) {
  const isOverdue = payment.status === 'pending' && dayjs(payment.dueDate).isBefore(dayjs());
  const isSoon = payment.status === 'pending' && dayjs(payment.dueDate).diff(dayjs(), 'day') <= 14;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-border">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center',
            payment.status === 'paid' ? 'bg-sage-green/20' : isOverdue ? 'bg-red-100' : 'bg-rose-gold/10',
          )}
        >
          {payment.status === 'paid' ? (
            <CheckCircle2 className="w-4 h-4 text-sage-green" />
          ) : isOverdue ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <CreditCard className="w-4 h-4 text-rose-gold-dark" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-text-primary">{paymentTypeLabels[payment.type]}</p>
            {payment.status === 'paid' && (
              <span className="chip-green">已支付</span>
            )}
            {isOverdue && payment.status === 'pending' && (
              <span className="chip !bg-red-100 !text-red-600">已逾期</span>
            )}
            {isSoon && !isOverdue && payment.status === 'pending' && (
              <span className="chip">即将到期</span>
            )}
          </div>
          <p className="text-xs text-text-muted">
            截止日期：{formatDate(payment.dueDate)}
            {payment.paidAt && ` · 支付于 ${formatDate(payment.paidAt)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-display text-lg font-semibold text-rose-gold-dark">
          {formatMoney(payment.amount)}
        </span>
        {payment.status === 'pending' && (
          <button
            onClick={onMarkPaid}
            className="btn-primary !py-1.5 !px-4 text-sm"
          >
            标记已付
          </button>
        )}
      </div>
    </div>
  );
}

export default function Contracts() {
  const { contracts } = useAppStore();
  const [filter, setFilter] = useState<'all' | ServiceContract['status']>('all');

  const filteredContracts = filter === 'all' ? contracts : contracts.filter((c) => c.status === filter);

  const totalValue = contracts.filter((c) => c.status === 'signed' || c.status === 'pending').reduce((sum, c) => sum + c.totalPrice, 0);
  const totalPaid = contracts.reduce(
    (sum, c) => sum + c.payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    0,
  );
  const pendingPayments = contracts.reduce(
    (sum, c) => sum + c.payments.filter((p) => p.status === 'pending' && dayjs(p.dueDate).diff(dayjs(), 'day') <= 14).length,
    0,
  );

  const filterOptions: Array<{ key: 'all' | ServiceContract['status']; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'signed', label: '已签约' },
    { key: 'pending', label: '待确认' },
    { key: 'draft', label: '草稿' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">合同总金额</p>
            <FileCheck className="w-5 h-5 text-rose-gold" />
          </div>
          <p className="font-display text-2xl font-semibold gold-text">{formatMoney(totalValue)}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">已支付金额</p>
            <CheckCircle2 className="w-5 h-5 text-sage-green" />
          </div>
          <p className="font-display text-2xl font-semibold text-text-primary">{formatMoney(totalPaid)}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">待支付金额</p>
            <Clock className="w-5 h-5 text-rose-gold-dark" />
          </div>
          <p className="font-display text-2xl font-semibold text-text-secondary">{formatMoney(totalValue - totalPaid)}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">即将到期付款</p>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-semibold text-amber-600">{pendingPayments} 笔</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={cn(
                'px-4 py-2 rounded-md text-sm transition-all',
                filter === opt.key
                  ? 'bg-rose-gold text-white shadow-soft'
                  : 'text-text-secondary hover:bg-border hover:text-text-primary',
              )}
            >
              {opt.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({opt.key === 'all' ? contracts.length : contracts.filter((c) => c.status === opt.key).length})
              </span>
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新建合同
        </button>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="card text-center py-12">
            <FileCheck className="w-12 h-12 mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary">暂无相关合同</p>
          </div>
        ) : (
          filteredContracts.map((contract) => <ContractCard key={contract.id} contract={contract} />)
        )}
      </div>
    </div>
  );
}
