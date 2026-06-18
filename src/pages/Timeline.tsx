import { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  User,
  Flag,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { TODO_CATEGORY_LABELS, type TodoCategory, type Priority, type TodoItem } from '@/types';
import { formatDate, dayjs } from '@/utils/date';
import { cn, generateId } from '@/utils';

const priorityConfig = {
  high: { label: '高', color: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
  medium: { label: '中', color: 'bg-rose-gold/15 text-rose-gold-dark', dot: 'bg-rose-gold' },
  low: { label: '低', color: 'bg-sage-green/20 text-sage-green', dot: 'bg-sage-green' },
};

const categoryColors: Record<TodoCategory, string> = {
  document: '#D4A574',
  vendor: '#7BA17C',
  preparation: '#F5D5D4',
  guest: '#B88B5C',
  dayof: '#8B7355',
};

export default function Timeline() {
  const { todos, project, collaborators, toggleTodo, deleteTodo, addTodo, assignTodo } = useAppStore();
  const [filterCategory, setFilterCategory] = useState<TodoCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: 'preparation' as TodoCategory,
    priority: 'medium' as Priority,
    assigneeId: '',
    reminderDays: 7,
  });

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf();
  });

  const filteredTodos = sortedTodos.filter((t) => {
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchCompleted = showCompleted || !t.completed;
    return matchCategory && matchCompleted;
  });

  // Group by months before wedding
  const groupedTodos: Record<string, TodoItem[]> = {};
  filteredTodos.forEach((todo) => {
    const diffDays = dayjs(todo.dueDate).diff(dayjs(project.weddingDate), 'day');
    let group: string;
    if (todo.completed) {
      group = '已完成';
    } else if (diffDays >= 0) {
      group = '婚礼当周';
    } else if (diffDays >= -30) {
      group = '婚礼前1个月';
    } else if (diffDays >= -90) {
      group = '婚礼前3个月';
    } else if (diffDays >= -180) {
      group = '婚礼前6个月';
    } else {
      group = '长期筹备';
    }
    if (!groupedTodos[group]) groupedTodos[group] = [];
    groupedTodos[group].push(todo);
  });

  const groupOrder = ['长期筹备', '婚礼前6个月', '婚礼前3个月', '婚礼前1个月', '婚礼当周', '已完成'];

  const getAssignee = (id?: string) => collaborators.find((c) => c.id === id);

  const handleAddTodo = () => {
    if (!newTodo.title.trim() || !newTodo.dueDate) return;
    addTodo({
      projectId: project.id,
      ...newTodo,
      completed: false,
    });
    setNewTodo({
      title: '',
      description: '',
      dueDate: '',
      category: 'preparation',
      priority: 'medium',
      assigneeId: '',
      reminderDays: 7,
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">总待办</p>
            <CalendarClock className="w-5 h-5 text-rose-gold" />
          </div>
          <p className="font-display text-2xl font-semibold text-text-primary">{todos.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">已完成</p>
            <CheckCircle2 className="w-5 h-5 text-sage-green" />
          </div>
          <p className="font-display text-2xl font-semibold text-sage-green">
            {todos.filter((t) => t.completed).length}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">进行中</p>
            <Circle className="w-5 h-5 text-rose-gold" />
          </div>
          <p className="font-display text-2xl font-semibold text-rose-gold-dark">
            {todos.filter((t) => !t.completed).length}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">即将到期</p>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-semibold text-amber-600">
            {todos.filter((t) => !t.completed && dayjs(t.dueDate).diff(dayjs(), 'day') <= 14 && dayjs(t.dueDate).isAfter(dayjs())).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm transition-all',
                filterCategory === 'all'
                  ? 'bg-rose-gold text-white'
                  : 'text-text-secondary hover:bg-border hover:text-text-primary',
              )}
            >
              全部
            </button>
            {(Object.keys(TODO_CATEGORY_LABELS) as TodoCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5',
                  filterCategory === cat
                    ? 'text-white'
                    : 'text-text-secondary hover:bg-border hover:text-text-primary',
                )}
                style={filterCategory === cat ? { backgroundColor: categoryColors[cat] } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryColors[cat] }}
                ></span>
                {TODO_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 rounded border-border text-rose-gold focus:ring-rose-gold/20"
              />
              显示已完成
            </label>
            <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加任务
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {groupOrder.map((group) => {
          const items = groupedTodos[group];
          if (!items || items.length === 0) return null;
          return (
            <div key={group} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: group === '已完成' ? '#E5E7EB' : '#D4A574' }}>
                  <Flag className={cn('w-4 h-4', group === '已完成' ? 'text-gray-500' : 'text-white')} />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{group}</h3>
                <div className="decorative-line flex-1"></div>
                <span className="text-xs text-text-muted">{items.length} 项</span>
              </div>
              <div className="relative pl-11">
                <div className="timeline-line !left-[15px]"></div>
                <div className="space-y-4">
                  {items.map((todo) => (
                    <TodoItemCard
                      key={todo.id}
                      todo={todo}
                      assignee={getAssignee(todo.assigneeId)}
                      onToggle={() => toggleTodo(todo.id)}
                      onDelete={() => deleteTodo(todo.id)}
                      onAssign={(id) => assignTodo(todo.id, id)}
                      collaborators={collaborators}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">添加待办任务</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">任务标题</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder="例如：预定婚礼蛋糕"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">任务描述（可选）</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  rows={2}
                  placeholder="详细描述..."
                  className="input-field resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">截止日期</label>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">任务分类</label>
                  <select
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value as TodoCategory })}
                    className="input-field"
                  >
                    {(Object.keys(TODO_CATEGORY_LABELS) as TodoCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {TODO_CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">优先级</label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Priority })}
                    className="input-field"
                  >
                    <option value="high">高优先级</option>
                    <option value="medium">中优先级</option>
                    <option value="low">低优先级</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">指派给（可选）</label>
                  <select
                    value={newTodo.assigneeId}
                    onChange={(e) => setNewTodo({ ...newTodo, assigneeId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">不指定</option>
                    {collaborators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}（{c.roleLabel}）
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">
                取消
              </button>
              <button onClick={handleAddTodo} className="flex-1 btn-primary">
                添加任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TodoCardProps {
  todo: TodoItem;
  assignee?: ReturnType<typeof useAppStore.getState>['collaborators'][number];
  onToggle: () => void;
  onDelete: () => void;
  onAssign: (id: string) => void;
  collaborators: ReturnType<typeof useAppStore.getState>['collaborators'];
}

function TodoItemCard({ todo, assignee, onToggle, onDelete }: TodoCardProps) {
  const daysLeft = dayjs(todo.dueDate).diff(dayjs(), 'day');
  const isOverdue = !todo.completed && daysLeft < 0;
  const isSoon = !todo.completed && daysLeft >= 0 && daysLeft <= 14;

  return (
    <div
      className={cn(
        'relative card p-4 transition-all',
        todo.completed && 'opacity-60',
      )}
    >
      <div
        className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white z-10 shadow-soft"
        style={{ backgroundColor: todo.completed ? '#7BA17C' : categoryColors[todo.category] }}
      ></div>
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
            todo.completed
              ? 'bg-sage-green border-sage-green'
              : 'border-rose-gold-light hover:border-rose-gold',
          )}
        >
          {todo.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-1.5 flex-wrap">
            <h4
              className={cn(
                'font-medium text-text-primary',
                todo.completed && 'line-through text-text-muted',
              )}
            >
              {todo.title}
            </h4>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full flex items-center gap-1',
                priorityConfig[todo.priority].color,
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', priorityConfig[todo.priority].dot)}></span>
              {priorityConfig[todo.priority].label}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: categoryColors[todo.category] }}
            >
              {TODO_CATEGORY_LABELS[todo.category]}
            </span>
          </div>
          {todo.description && (
            <p className="text-sm text-text-secondary mb-2">{todo.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              {formatDate(todo.dueDate)}
              {!todo.completed && (
                <span
                  className={cn(
                    'ml-1',
                    isOverdue ? 'text-red-500' : isSoon ? 'text-amber-600' : '',
                  )}
                >
                  {isOverdue
                    ? `（逾期${-daysLeft}天）`
                    : daysLeft === 0
                    ? '（今天）'
                    : isSoon
                    ? `（${daysLeft}天后）`
                    : ''}
                </span>
              )}
            </span>
            {assignee && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {assignee.name}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
