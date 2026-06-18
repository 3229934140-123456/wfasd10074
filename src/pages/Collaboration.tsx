import { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Mail,
  Phone,
  Crown,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { COLLABORATOR_ROLE_LABELS, type Collaborator, type CollaboratorRole } from '@/types';
import { generateId, cn, getInitials } from '@/utils';

const roleColors: Record<CollaboratorRole, string> = {
  couple: 'bg-rose-gold/20 text-rose-gold-dark',
  groom_family: 'bg-blue-100 text-blue-700',
  bride_family: 'bg-pink-100 text-pink-700',
  bridesmaid: 'bg-rose-gold/20 text-rose-gold-dark',
  groomsman: 'bg-indigo-100 text-indigo-700',
  friend: 'bg-sage-green/20 text-sage-green',
};

export default function Collaboration() {
  const { collaborators, todos, project, addCollaborator, addTodo } = useAppStore();
  const [activeTab, setActiveTab] = useState<'members' | 'tasks'>('members');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    role: 'friend' as CollaboratorRole,
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assigneeId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  if (!project) return null;

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.phone.trim()) return;
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newMember.name)}`;
    addCollaborator({
      projectId: project.id,
      name: newMember.name,
      avatar,
      role: newMember.role,
      roleLabel: COLLABORATOR_ROLE_LABELS[newMember.role],
      phone: newMember.phone,
      tasksAssigned: 0,
      tasksCompleted: 0,
    });
    setNewMember({ name: '', phone: '', role: 'friend' });
    setShowAddMember(false);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.dueDate || !newTask.assigneeId) return;
    addTodo({
      projectId: project.id,
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      category: 'preparation',
      priority: newTask.priority,
      assigneeId: newTask.assigneeId,
      reminderDays: 7,
      completed: false,
    });
    setNewTask({ title: '', description: '', dueDate: '', assigneeId: '', priority: 'medium' });
    setShowAddTask(false);
  };

  const memberTasks = (memberId: string) => {
    return todos.filter((t) => t.assigneeId === memberId);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="card py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all',
              activeTab === 'members'
                ? 'bg-rose-gold text-white shadow-soft'
                : 'text-text-secondary hover:bg-border hover:text-text-primary',
            )}
          >
            <Users className="w-4 h-4" />
            协作成员
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all',
              activeTab === 'tasks'
                ? 'bg-rose-gold text-white shadow-soft'
                : 'text-text-secondary hover:bg-border hover:text-text-primary',
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            任务分配
          </button>
        </div>
      </div>

      {activeTab === 'members' ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              共 <span className="text-rose-gold-dark font-medium">{collaborators.length}</span> 位协作成员
            </p>
            <button onClick={() => setShowAddMember(true)} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              邀请成员
            </button>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {collaborators.map((member) => {
              const tasks = memberTasks(member.id);
              const completed = tasks.filter((t) => t.completed).length;
              const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(selectedMemberId === member.id ? null : member.id)}
                  className={cn(
                    'card cursor-pointer transition-all',
                    selectedMemberId === member.id && 'ring-2 ring-rose-gold shadow-medium',
                  )}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      {member.role === 'couple' ? (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold flex items-center justify-center text-white font-display text-xl font-semibold shadow-medium">
                          {getInitials(member.name)}
                        </div>
                      ) : (
                        <img
                          src={member.avatar}
                          alt=""
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-soft"
                        />
                      )}
                      {member.role === 'couple' && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-soft">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-text-primary">{member.name}</h4>
                      </div>
                      <span className={cn('chip !text-xs', roleColors[member.role])}>
                        {member.roleLabel}
                      </span>
                      <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-text-muted">任务进度</span>
                      <span className="text-text-secondary">
                        {completed}/{tasks.length} 完成 ({progress}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-gold-light to-rose-gold rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {selectedMemberId === member.id && tasks.length > 0 && (
                    <div className="pt-4 border-t border-border space-y-2 animate-fade-in">
                      <p className="text-xs font-medium text-text-secondary mb-2">分配的任务</p>
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-sm">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-sage-green flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-rose-gold-light flex-shrink-0" />
                          )}
                          <span className={task.completed ? 'text-text-muted line-through' : 'text-text-primary'}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              共分配 <span className="text-rose-gold-dark font-medium">{todos.filter((t) => t.assigneeId).length}</span> 个任务
            </p>
            <button onClick={() => setShowAddTask(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              分配新任务
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {collaborators.filter((c) => c.role !== 'couple').map((member) => {
              const tasks = memberTasks(member.id);
              return (
                <div key={member.id} className="card">
                  <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                    <img src={member.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-medium text-text-primary">{member.name}</h4>
                      <span className={cn('chip !text-xs', roleColors[member.role])}>
                        {member.roleLabel}
                      </span>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="font-display text-xl font-semibold text-rose-gold-dark">
                        {tasks.filter((t) => t.completed).length}/{tasks.length}
                      </p>
                      <p className="text-xs text-text-muted">已完成/总数</p>
                    </div>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="text-center text-text-muted py-6 text-sm">暂无分配任务</p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg transition-all',
                            task.completed ? 'bg-sage-green/5' : 'bg-cream/50',
                          )}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                              task.completed
                                ? 'bg-sage-green border-sage-green'
                                : 'border-rose-gold-light',
                            )}
                          >
                            {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm font-medium',
                              task.completed ? 'text-text-muted line-through' : 'text-text-primary',
                            )}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-text-muted mt-0.5">{task.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">邀请协作成员</h3>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">姓名</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="请输入姓名"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">联系电话</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">角色</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as CollaboratorRole })}
                  className="input-field"
                >
                  {(Object.keys(COLLABORATOR_ROLE_LABELS) as CollaboratorRole[])
                    .filter((r) => r !== 'couple')
                    .map((role) => (
                      <option key={role} value={role}>
                        {COLLABORATOR_ROLE_LABELS[role]}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddMember(false)} className="flex-1 btn-secondary">
                取消
              </button>
              <button onClick={handleAddMember} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">分配任务</h3>
              <button
                onClick={() => setShowAddTask(false)}
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
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="例如：帮忙统计宾客人数"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">任务描述（可选）</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">截止日期</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">优先级</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="input-field"
                  >
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">分配给</label>
                <select
                  value={newTask.assigneeId}
                  onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                  className="input-field"
                >
                  <option value="">请选择成员</option>
                  {collaborators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}（{c.roleLabel}）
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddTask(false)} className="flex-1 btn-secondary">
                取消
              </button>
              <button onClick={handleAddTask} className="flex-1 btn-primary">
                分配任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
