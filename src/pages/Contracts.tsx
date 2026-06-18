import { useState, useMemo } from 'react';
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
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  X,
  FileImage,
  MessageSquare,
  Hash,
  Receipt,
  DollarSign,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  type ServiceContract,
  type Payment,
  type PaymentMethod,
} from '@/types';
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

const paymentTypeColors: Record<string, string> = {
  deposit: 'from-amber-400 to-amber-500',
  midterm: 'from-blue-400 to-blue-500',
  final: 'from-rose-gold-light to-rose-gold',
};

type PaymentWithContract = Payment & {
  contractId: string;
  vendorName: string;
  vendorAvatar?: string;
  packageName: string;
  category: string;
};

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment;
  contractId: string;
  contractName: string;
  paymentTypeName: string;
}

function PaymentRecordModal({ open, onClose, payment, contractId, contractName, paymentTypeName }: PaymentModalProps) {
  const { markPaymentPaid } = useAppStore();
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [note, setNote] = useState(payment.record?.note || '');
  const [voucherImage, setVoucherImage] = useState(payment.record?.voucherImage || '');
  const [transactionId, setTransactionId] = useState(payment.record?.transactionId || '');
  const [copyOk, setCopyOk] = useState(false);
  const isEditing = payment.status === 'paid';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setVoucherImage(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = () => {
    markPaymentPaid(contractId, payment.id, {
      method,
      note: note.trim() || undefined,
      voucherImage: voucherImage || undefined,
      transactionId: transactionId.trim() || undefined,
    });
    onClose();
  };

  const copyRecord = () => {
    const text = [
      `合同：${contractName}`,
      `款项：${paymentTypeName} - ${formatMoney(payment.amount)}`,
      `支付方式：${PAYMENT_METHOD_LABELS[method]}`,
      transactionId ? `流水号：${transactionId}` : null,
      payment.paidAt ? `支付日期：${formatDate(payment.paidAt)}` : null,
      note ? `备注：${note}` : null,
    ]
      .filter(Boolean)
      .join('\n');
    navigator.clipboard?.writeText(text);
    setCopyOk(true);
    setTimeout(() => setCopyOk(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-lift w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-gold" />
              {isEditing ? '付款记录详情' : '标记已付款'}
            </h3>
            <p className="text-xs text-text-muted mt-1">
              {contractName} · {paymentTypeName} · {formatMoney(payment.amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-cream/50 border border-border grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-text-muted">应付金额</span>
              <p className="font-display text-lg font-semibold gold-text mt-0.5">{formatMoney(payment.amount)}</p>
            </div>
            <div>
              <span className="text-text-muted">截止日期</span>
              <p className="text-sm font-medium text-text-primary mt-1">{formatDate(payment.dueDate)}</p>
            </div>
            {payment.paidAt && (
              <>
                <div>
                  <span className="text-text-muted">已付日期</span>
                  <p className="text-sm font-medium text-sage-green mt-1">{formatDate(payment.paidAt)}</p>
                </div>
                {payment.record?.method && (
                  <div>
                    <span className="text-text-muted">支付方式</span>
                    <p className="text-sm font-medium text-text-primary mt-1">
                      {PAYMENT_METHOD_LABELS[payment.record.method]}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {!isEditing && (
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-rose-gold" />
                支付方式
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={cn(
                      'py-2 rounded-lg border-2 text-[11px] transition-colors',
                      method === m
                        ? 'border-rose-gold bg-rose-gold/5 text-rose-gold-dark font-medium'
                        : 'border-border text-text-secondary hover:border-rose-gold-light',
                    )}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isEditing && (
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-rose-gold" />
                交易流水号（可选）
              </label>
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="转账单号、支付宝/微信流水号等"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-text-secondary mb-1.5 block flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-rose-gold" />
              备注说明（可选）
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="支付方、手续费、减免说明等..."
              className={cn('input-field resize-none', isEditing && 'bg-cream/30 cursor-default')}
              readOnly={isEditing}
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-1.5 block flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-rose-gold" />
              支付凭证（截图、回单等）
            </label>
            {voucherImage ? (
              <div className="relative rounded-lg overflow-hidden border border-border max-h-56">
                <img src={voucherImage} alt="凭证" className="w-full h-auto" />
                {!isEditing && (
                  <button
                    onClick={() => setVoucherImage('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              !isEditing && (
                <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-rose-gold/50 hover:bg-cream/30 transition-colors">
                  <FileImage className="w-8 h-8 mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-secondary">点击选择图片文件</p>
                  <p className="text-xs text-text-muted mt-1">支持 JPG / PNG</p>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              )
            )}
          </div>

          {isEditing && (
            <div className="p-3 rounded-lg bg-sage-green/5 border border-sage-green/20 flex items-start gap-2">
              <Info className="w-4 h-4 text-sage-green flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-sage-green font-medium">已完成付款</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  如需修改凭证信息，请先取消该笔付款标记后重新登记
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary">
            {isEditing ? '关闭' : '取消'}
          </button>
          {isEditing ? (
            <button
              onClick={copyRecord}
              className={cn('flex-1 flex items-center justify-center gap-2', copyOk ? 'btn-secondary !bg-emerald-500 !text-white !border-emerald-500' : 'btn-primary')}>
              {copyOk ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制记录
                </>
              )}
            </button>
          ) : (
            <button onClick={submit} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              确认已付款
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContractCard({ contract }: { contract: ServiceContract }) {
  const [expanded, setExpanded] = useState(false);
  const { updateContractStatus } = useAppStore();
  const StatusIcon = statusConfig[contract.status].icon;
  const [payModal, setPayModal] = useState<{ payment: Payment } | null>(null);

  const totalPaid = contract.payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const paymentProgress =
    contract.totalPrice > 0 ? Math.round((totalPaid / contract.totalPrice) * 100) : 0;

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
                  onMarkPaid={() => setPayModal({ payment })}
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
      {payModal && (
        <PaymentRecordModal
          open={true}
          onClose={() => setPayModal(null)}
          payment={payModal.payment}
          contractId={contract.id}
          contractName={`${contract.vendorName} - ${contract.packageName}`}
          paymentTypeName={paymentTypeLabels[payModal.payment.type]}
        />
      )}
    </div>
  );
}

function PaymentRow({
  payment,
  onMarkPaid,
  compact = false,
}: {
  payment: Payment;
  contractId: string;
  onMarkPaid: () => void;
  compact?: boolean;
}) {
  const isOverdue = payment.status === 'pending' && dayjs(payment.dueDate).isBefore(dayjs(), 'day');
  const isSoon =
    payment.status === 'pending' && dayjs(payment.dueDate).diff(dayjs(), 'day') <= 14;

  return (
    <div
      onClick={payment.status === 'paid' ? onMarkPaid : undefined}
      className={cn(
        'flex items-center justify-between rounded-lg bg-white border border-border',
        compact ? 'p-2.5' : 'p-3',
        payment.status === 'paid' && 'cursor-pointer hover:border-rose-gold/50 hover:bg-cream/30 transition-colors',
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
            payment.status === 'paid'
              ? 'bg-sage-green/20'
              : isOverdue
              ? 'bg-red-100'
              : 'bg-rose-gold/10',
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
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-text-primary">{paymentTypeLabels[payment.type]}</p>
            {payment.status === 'paid' && <span className="chip-green">已支付</span>}
            {isOverdue && payment.status === 'pending' && (
              <span className="chip !bg-red-100 !text-red-600">已逾期</span>
            )}
            {isSoon && !isOverdue && payment.status === 'pending' && (
              <span className="chip">即将到期</span>
            )}
            {payment.record?.method && (
              <span className="chip !bg-cream !text-rose-gold-dark !border-rose-gold/20">
                {PAYMENT_METHOD_LABELS[payment.record.method]}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted">
            截止日期：{formatDate(payment.dueDate)}
            {payment.paidAt && ` · 支付于 ${formatDate(payment.paidAt)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {payment.record?.voucherImage && !compact && (
          <div className="w-9 h-9 rounded-md overflow-hidden border border-border flex-shrink-0 hidden sm:block">
            <img src={payment.record.voucherImage} alt="凭证" className="w-full h-full object-cover" />
          </div>
        )}
        <span className="font-display text-lg font-semibold text-rose-gold-dark">
          {formatMoney(payment.amount)}
        </span>
        {payment.status === 'pending' && !compact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid();
            }}
            className="btn-primary !py-1.5 !px-4 text-sm">
            标记已付
          </button>
        )}
        {payment.status === 'paid' && !compact && (
          <Eye className="w-4 h-4 text-text-muted" />
        )}
      </div>
    </div>
  );
}

function CalendarView({
  payments,
  onMarkPaid,
}: {
  payments: PaymentWithContract[];
  onMarkPaid: (contractId: string, paymentId: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [payModal, setPayModal] = useState<{ payment: PaymentWithContract } | null>(null);

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startOfCalendar = startOfMonth.startOf('week');
  const endOfCalendar = endOfMonth.endOf('week');

  const days = [];
  let day = startOfCalendar;
  while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const getPaymentsForDay = (date: typeof dayjs.prototype) =>
    payments.filter((p) => dayjs(p.dueDate).isSame(date, 'day'));

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const monthPayments = payments.filter(
    (p) => dayjs(p.dueDate).isSame(currentMonth, 'month') && p.status === 'pending',
  );

  const handlePaymentClick = (payment: PaymentWithContract) => {
    setPayModal({ payment });
  };

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-cream/30">
        <button
          onClick={prevMonth}
          className="p-2 rounded-md hover:bg-border transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div className="text-center">
          <h3 className="font-display text-xl font-semibold text-text-primary">
            {currentMonth.format('YYYY年 MM月')}
          </h3>
          <p className="text-xs text-text-muted">
            本月待付款 {monthPayments.length} 笔，共{' '}
            {formatMoney(monthPayments.reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-md hover:bg-border transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((d, i) => (
          <div
            key={d}
            className={cn(
              'py-2 text-center text-xs font-medium',
              i === 0 || i === 6 ? 'text-rose-gold' : 'text-text-muted',
            )}
          >
            周{d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, idx) => {
          const isCurrentMonth = date.isSame(currentMonth, 'month');
          const isToday = date.isSame(dayjs(), 'day');
          const dayPayments = getPaymentsForDay(date);
          const hasPending = dayPayments.some((p) => p.status === 'pending');
          const hasOverdue = dayPayments.some(
            (p) => p.status === 'pending' && dayjs(p.dueDate).isBefore(dayjs(), 'day'),
          );

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[100px] border-b border-r border-border p-1.5',
                !isCurrentMonth && 'bg-bg/50',
                isToday && 'bg-rose-gold/5',
              )}
            >
              <div
                className={cn(
                  'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                  isToday && 'bg-rose-gold text-white',
                  !isCurrentMonth && 'text-text-muted/50',
                  isCurrentMonth && !isToday && 'text-text-secondary',
                )}
              >
                {date.date()}
              </div>
              <div className="space-y-1">
                {dayPayments.slice(0, 2).map((payment) => {
                  const tooltip = [
                    `${payment.vendorName} · ${payment.packageName}`,
                    `${paymentTypeLabels[payment.type]} ${formatMoney(payment.amount)}`,
                    payment.status === 'paid'
                      ? [
                          `✅ 已支付 · ${formatDate(payment.paidAt)}`,
                          payment.record?.method ? `方式：${PAYMENT_METHOD_LABELS[payment.record.method]}` : null,
                          payment.record?.transactionId ? `流水号：${payment.record.transactionId}` : null,
                          payment.record?.note ? `备注：${payment.record.note}` : null,
                        ]
                          .filter(Boolean)
                          .join('\n')
                      : `⏳ ${dayjs(payment.dueDate).isBefore(dayjs(), 'day') ? '已逾期' : '待支付'} · 截止${formatDate(payment.dueDate)}`,
                  ].join('\n');
                  return (
                    <div
                      key={payment.id}
                      onClick={() => handlePaymentClick(payment)}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer hover:opacity-80 transition-opacity',
                        payment.status === 'paid'
                          ? 'bg-sage-green text-white'
                          : `bg-gradient-to-r ${paymentTypeColors[payment.type]} text-white`,
                      )}
                      title={tooltip}>
                      {payment.status === 'paid' ? '✓ ' : ''}
                      {paymentTypeLabels[payment.type]} · {payment.vendorName.slice(0, 4)}
                    </div>
                  );
                })}
                {dayPayments.length > 2 && (
                  <p className="text-[10px] text-text-muted text-center">
                    +{dayPayments.length - 2} 笔
                  </p>
                )}
              </div>
              {hasPending && (
                <div className="absolute -mt-0.5 flex justify-center">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      hasOverdue ? 'bg-red-500' : 'bg-amber-400',
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Month Payment List */}
      <div className="p-4 border-t border-border bg-cream/20">
        <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          本月待付款详情
        </h4>
        {monthPayments.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">本月暂无待付款项</p>
        ) : (
          <div className="space-y-2">
            {monthPayments
              .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf())
              .map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-border"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={payment.vendorAvatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">
                          {payment.vendorName}
                        </p>
                        <span className="chip !text-[10px]">
                          {paymentTypeLabels[payment.type]}
                        </span>
                        {dayjs(payment.dueDate).isBefore(dayjs(), 'day') && (
                          <span className="chip !bg-red-100 !text-red-600 !text-[10px]">
                            已逾期
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">
                        {formatDate(payment.dueDate)} · {payment.packageName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-base font-semibold text-rose-gold-dark">
                      {formatMoney(payment.amount)}
                    </span>
                    <button
                      onClick={() => handlePaymentClick(payment)}
                      className="btn-primary !py-1 !px-3 text-xs"
                    >
                      标记已付
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      {payModal && (
        <PaymentRecordModal
          open={true}
          onClose={() => setPayModal(null)}
          payment={payModal.payment}
          contractId={payModal.payment.contractId}
          contractName={`${payModal.payment.vendorName} - ${payModal.payment.packageName}`}
          paymentTypeName={paymentTypeLabels[payModal.payment.type]}
        />
      )}
    </div>
  );
}

export default function Contracts() {
  const { contracts, markPaymentPaid } = useAppStore();
  const [filter, setFilter] = useState<'all' | ServiceContract['status']>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filteredContracts =
    filter === 'all' ? contracts : contracts.filter((c) => c.status === filter);

  const allPayments = useMemo(() => {
    const result: PaymentWithContract[] = [];
    contracts.forEach((c) => {
      c.payments.forEach((p) => {
        result.push({
          ...p,
          contractId: c.id,
          vendorName: c.vendorName,
          vendorAvatar: c.vendorAvatar,
          packageName: c.packageName,
          category: c.category || '',
        });
      });
    });
    return result.sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());
  }, [contracts]);

  const totalValue = contracts
    .filter((c) => c.status === 'signed' || c.status === 'pending')
    .reduce((sum, c) => sum + c.totalPrice, 0);
  const totalPaid = contracts.reduce(
    (sum, c) =>
      sum + c.payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    0,
  );
  const pendingPayments = contracts.reduce(
    (sum, c) =>
      sum +
      c.payments.filter(
        (p) => p.status === 'pending' && dayjs(p.dueDate).diff(dayjs(), 'day') <= 14,
      ).length,
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
          <p className="font-display text-2xl font-semibold gold-text">
            {formatMoney(totalValue)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">已支付金额</p>
            <CheckCircle2 className="w-5 h-5 text-sage-green" />
          </div>
          <p className="font-display text-2xl font-semibold text-text-primary">
            {formatMoney(totalPaid)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">待支付金额</p>
            <Clock className="w-5 h-5 text-rose-gold-dark" />
          </div>
          <p className="font-display text-2xl font-semibold text-text-secondary">
            {formatMoney(totalValue - totalPaid)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">即将到期付款</p>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-semibold text-amber-600">
            {pendingPayments} 笔
          </p>
        </div>
      </div>

      {/* Filters & View Toggle */}
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
                ({opt.key === 'all'
                  ? contracts.length
                  : contracts.filter((c) => c.status === opt.key).length}
                )
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-border/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-all',
                viewMode === 'list'
                  ? 'bg-white text-rose-gold shadow-soft'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              <List className="w-4 h-4" />
              列表
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-all',
                viewMode === 'calendar'
                  ? 'bg-white text-rose-gold shadow-soft'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              日历
            </button>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建合同
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredContracts.length === 0 ? (
            <div className="card text-center py-12">
              <FileCheck className="w-12 h-12 mx-auto mb-3 text-text-muted" />
              <p className="text-text-secondary">暂无相关合同</p>
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <ContractCard key={contract.id} contract={contract} />
            ))
          )}
        </div>
      ) : (
        <CalendarView payments={allPayments} onMarkPaid={markPaymentPaid} />
      )}
    </div>
  );
}
