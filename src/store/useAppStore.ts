import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  WeddingProject,
  TodoItem,
  ServiceContract,
  Collaborator,
  Guest,
  SeatTable,
  WeddingTimelineItem,
  CurrentUser,
  Vendor,
  Payment,
  WeddingStyle,
  VendorCategory,
} from '@/types';
import { MOCK_VENDORS } from '@/data/mock';
import { generateId } from '@/utils';

interface AppState {
  currentUser: CurrentUser | null;
  project: WeddingProject | null;
  vendors: Vendor[];
  todos: TodoItem[];
  contracts: ServiceContract[];
  collaborators: Collaborator[];
  guests: Guest[];
  tables: SeatTable[];
  timeline: WeddingTimelineItem[];
  hasCompletedSetup: boolean;

  // Auth & Project
  setCurrentUser: (user: CurrentUser) => void;
  createProject: (data: {
    groomName: string;
    brideName: string;
    weddingDate: string;
    location: string;
    budget: number;
    style: WeddingStyle;
    styleNote?: string;
    userName: string;
  }) => void;
  resetAll: () => void;

  // Todo actions
  toggleTodo: (id: string) => void;
  addTodo: (todo: Omit<TodoItem, 'id' | 'reminded'>) => void;
  deleteTodo: (id: string) => void;
  assignTodo: (todoId: string, assigneeId: string) => void;

  // Contract actions
  createContract: (data: {
    vendorId: string;
    packageId: string;
    packageName: string;
    totalPrice: number;
  }) => boolean;
  updateContractStatus: (id: string, status: ServiceContract['status']) => void;
  markPaymentPaid: (contractId: string, paymentId: string) => void;

  // Guest actions
  updateGuestRsvp: (id: string, status: Guest['rsvpStatus']) => void;
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  deleteGuest: (id: string) => void;

  // Seating actions
  assignGuestToTable: (guestId: string, tableId: string) => boolean;
  removeGuestFromTable: (guestId: string) => void;
  addTable: (table: Omit<SeatTable, 'id'>) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;

  // Timeline actions
  addTimelineItem: (item: Omit<WeddingTimelineItem, 'id'>) => void;
  updateTimelineItem: (id: string, updates: Partial<WeddingTimelineItem>) => void;
  deleteTimelineItem: (id: string) => void;

  // Collaborator actions
  addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
}

function autoGeneratePayments(totalPrice: number, weddingDate: string): Payment[] {
  const dayjs = (d: string) => new Date(d);
  const wDate = dayjs(weddingDate);

  const depositDate = new Date();
  depositDate.setDate(depositDate.getDate() + 7);

  const finalDate = new Date(wDate);
  finalDate.setDate(finalDate.getDate() - 7);

  const depositAmount = Math.round(totalPrice * 0.3);
  const finalAmount = totalPrice - depositAmount;

  const payments: Payment[] = [
    {
      id: `pay-${generateId()}`,
      type: 'deposit',
      amount: depositAmount,
      dueDate: depositDate.toISOString().split('T')[0],
      status: 'pending',
    },
  ];

  if (totalPrice >= 20000) {
    const midtermAmount = Math.round(totalPrice * 0.4);
    const finalAmountAdj = totalPrice - depositAmount - midtermAmount;
    const midtermDate = new Date(wDate);
    midtermDate.setDate(midtermDate.getDate() - 30);
    payments.length = 0;
    payments.push(
      {
        id: `pay-${generateId()}`,
        type: 'deposit',
        amount: depositAmount,
        dueDate: depositDate.toISOString().split('T')[0],
        status: 'pending',
      },
      {
        id: `pay-${generateId()}`,
        type: 'midterm',
        amount: midtermAmount,
        dueDate: midtermDate.toISOString().split('T')[0],
        status: 'pending',
      },
      {
        id: `pay-${generateId()}`,
        type: 'final',
        amount: finalAmountAdj,
        dueDate: finalDate.toISOString().split('T')[0],
        status: 'pending',
      },
    );
  } else {
    payments.push({
      id: `pay-${generateId()}`,
      type: 'final',
      amount: finalAmount,
      dueDate: finalDate.toISOString().split('T')[0],
      status: 'pending',
    });
  }

  return payments;
}

const initialState = {
  currentUser: null,
  project: null,
  vendors: MOCK_VENDORS,
  todos: [],
  contracts: [],
  collaborators: [],
  guests: [],
  tables: [],
  timeline: [],
  hasCompletedSetup: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentUser: (user) => set({ currentUser: user }),

      createProject: (data) => {
        const projectId = `project-${generateId()}`;
        const userId = `user-${generateId()}`;

        const collaborators: Collaborator[] = [
          {
            id: `col-${generateId()}`,
            projectId,
            name: data.userName || data.groomName,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.groomName)}`,
            role: 'couple',
            roleLabel: '新人',
            phone: '',
            tasksAssigned: 0,
            tasksCompleted: 0,
          },
        ];

        const weddingDate = new Date(data.weddingDate);
        const today = new Date();

        const defaultTodos: TodoItem[] = [
          {
            id: `todo-${generateId()}`,
            projectId,
            title: '确定婚礼预算分配方案',
            description: '根据总预算确定各项支出占比',
            dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'preparation',
            priority: 'high',
            completed: false,
            reminderDays: 3,
            reminded: false,
          },
          {
            id: `todo-${generateId()}`,
            projectId,
            title: '预定婚礼场地',
            description: '确认场地档期并签订合同',
            dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'vendor',
            priority: 'high',
            completed: false,
            reminderDays: 14,
            reminded: false,
          },
          {
            id: `todo-${generateId()}`,
            projectId,
            title: '拍摄婚纱照',
            dueDate: new Date(weddingDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'vendor',
            priority: 'high',
            completed: false,
            reminderDays: 30,
            reminded: false,
          },
          {
            id: `todo-${generateId()}`,
            projectId,
            title: '收集宾客名单',
            description: '双方家长整理需要邀请的亲友',
            dueDate: new Date(weddingDate.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'guest',
            priority: 'high',
            completed: false,
            reminderDays: 30,
            reminded: false,
          },
          {
            id: `todo-${generateId()}`,
            projectId,
            title: '发出电子请柬',
            dueDate: new Date(weddingDate.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'guest',
            priority: 'medium',
            completed: false,
            reminderDays: 14,
            reminded: false,
          },
          {
            id: `todo-${generateId()}`,
            projectId,
            title: '确定伴郎伴娘服装',
            dueDate: new Date(weddingDate.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'preparation',
            priority: 'medium',
            completed: false,
            reminderDays: 14,
            reminded: false,
          },
          {
            id: `todo-${generateId()}`,
            projectId,
            title: '婚前体检',
            dueDate: new Date(weddingDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'document',
            priority: 'high',
            completed: false,
            reminderDays: 7,
            reminded: false,
          },
          {
            id: `todo-${generateId()}`,
            projectId,
            title: '领取结婚证',
            category: 'document',
            priority: 'high',
            completed: false,
            dueDate: new Date(weddingDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            reminderDays: 7,
            reminded: false,
          },
        ];

        const defaultTimeline: WeddingTimelineItem[] = [
          {
            id: `wt-${generateId()}`,
            projectId,
            time: '10:00',
            title: '宾客签到迎宾',
            location: '酒店迎宾区',
            responsibleIds: [],
            responsibleType: 'both',
          },
          {
            id: `wt-${generateId()}`,
            projectId,
            time: '11:18',
            title: '婚礼仪式',
            location: '宴会厅主舞台',
            responsibleIds: [],
            responsibleType: 'both',
          },
          {
            id: `wt-${generateId()}`,
            projectId,
            time: '12:00',
            title: '婚宴开席',
            location: '宴会厅',
            responsibleIds: [],
            responsibleType: 'both',
          },
        ];

        set({
          hasCompletedSetup: true,
          currentUser: {
            id: userId,
            name: data.userName || data.groomName,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.userName || data.groomName)}`,
            role: 'couple',
            projectId,
          },
          project: {
            id: projectId,
            coupleName: `${data.groomName} & ${data.brideName}`,
            groomName: data.groomName,
            brideName: data.brideName,
            weddingDate: data.weddingDate,
            location: data.location,
            budget: {
              total: data.budget,
              used: 0,
            },
            style: data.style,
            styleNote: data.styleNote,
            createdAt: new Date().toISOString().split('T')[0],
          },
          collaborators,
          todos: defaultTodos,
          timeline: defaultTimeline,
          guests: [],
          contracts: [],
          tables: [],
        });
      },

      resetAll: () => {
        set({
          ...initialState,
          vendors: MOCK_VENDORS,
        });
      },

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString().split('T')[0] : undefined,
                }
              : t,
          ),
        })),

      addTodo: (todo) =>
        set((state) => ({
          todos: [
            ...state.todos,
            {
              ...todo,
              id: `todo-${generateId()}`,
              reminded: false,
            },
          ],
        })),

      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),

      assignTodo: (todoId, assigneeId) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === todoId ? { ...t, assigneeId } : t)),
          collaborators: state.collaborators.map((c) =>
            c.id === assigneeId ? { ...c, tasksAssigned: c.tasksAssigned + 1 } : c,
          ),
        })),

      createContract: (data) => {
        const state = get();
        if (!state.project) return false;

        const exists = state.contracts.some(
          (c) => c.vendorId === data.vendorId && c.packageId === data.packageId && c.status !== 'cancelled',
        );
        if (exists) return false;

        const vendor = state.vendors.find((v) => v.id === data.vendorId);
        const payments = autoGeneratePayments(data.totalPrice, state.project.weddingDate);

        const newContract: ServiceContract = {
          id: `contract-${generateId()}`,
          projectId: state.project.id,
          vendorId: data.vendorId,
          vendorName: vendor?.name || '',
          vendorAvatar: vendor?.avatar,
          category: vendor?.category as VendorCategory,
          packageId: data.packageId,
          packageName: data.packageName,
          totalPrice: data.totalPrice,
          status: 'signed',
          signedAt: new Date().toISOString().split('T')[0],
          serviceDate: state.project.weddingDate,
          payments,
        };

        set((s) => ({
          contracts: [...s.contracts, newContract],
          project: s.project
            ? {
                ...s.project,
                budget: {
                  ...s.project.budget,
                  used: s.project.budget.used + data.totalPrice,
                },
              }
            : s.project,
        }));

        return true;
      },

      updateContractStatus: (id, status) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id
              ? { ...c, status, signedAt: status === 'signed' ? new Date().toISOString().split('T')[0] : c.signedAt }
              : c,
          ),
        })),

      markPaymentPaid: (contractId, paymentId) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === contractId
              ? {
                  ...c,
                  payments: c.payments.map((p) =>
                    p.id === paymentId
                      ? { ...p, status: 'paid' as const, paidAt: new Date().toISOString().split('T')[0] }
                      : p,
                  ),
                }
              : c,
          ),
        })),

      updateGuestRsvp: (id, status) =>
        set((state) => ({
          guests: state.guests.map((g) => (g.id === id ? { ...g, rsvpStatus: status } : g)),
        })),

      addGuest: (guest) =>
        set((state) => ({
          guests: [
            ...state.guests,
            {
              ...guest,
              id: `g-${generateId()}`,
            },
          ],
        })),

      deleteGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((g) => g.id !== id),
          tables: state.tables.map((t) => ({
            ...t,
            guestIds: t.guestIds.filter((gid) => gid !== id),
          })),
        })),

      assignGuestToTable: (guestId, tableId) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table) return false;
        if (table.guestIds.includes(guestId)) return true;
        if (table.guestIds.length >= table.capacity) return false;

        set({
          guests: state.guests.map((g) => (g.id === guestId ? { ...g, tableId } : g)),
          tables: state.tables.map((t) => {
            if (t.id === tableId) {
              return { ...t, guestIds: [...t.guestIds, guestId] };
            }
            return {
              ...t,
              guestIds: t.guestIds.filter((gid) => gid !== guestId),
            };
          }),
        });
        return true;
      },

      removeGuestFromTable: (guestId) =>
        set((state) => ({
          guests: state.guests.map((g) =>
            g.id === guestId ? { ...g, tableId: undefined, seatNumber: undefined } : g,
          ),
          tables: state.tables.map((t) => ({
            ...t,
            guestIds: t.guestIds.filter((gid) => gid !== guestId),
          })),
        })),

      addTable: (table) =>
        set((state) => ({
          tables: [
            ...state.tables,
            {
              ...table,
              id: `t-${generateId()}`,
            },
          ],
        })),

      updateTablePosition: (id, position) =>
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? { ...t, position } : t)),
        })),

      addTimelineItem: (item) =>
        set((state) => ({
          timeline: [
            ...state.timeline,
            {
              ...item,
              id: `wt-${generateId()}`,
            },
          ].sort((a, b) => a.time.localeCompare(b.time)),
        })),

      updateTimelineItem: (id, updates) =>
        set((state) => ({
          timeline: state.timeline
            .map((t) => (t.id === id ? { ...t, ...updates } : t))
            .sort((a, b) => a.time.localeCompare(b.time)),
        })),

      deleteTimelineItem: (id) =>
        set((state) => ({
          timeline: state.timeline.filter((t) => t.id !== id),
        })),

      addCollaborator: (collaborator) =>
        set((state) => ({
          collaborators: [
            ...state.collaborators,
            {
              ...collaborator,
              id: `col-${generateId()}`,
            },
          ],
        })),
    }),
    {
      name: 'wedding-plan-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        project: state.project,
        vendors: state.vendors,
        todos: state.todos,
        contracts: state.contracts,
        collaborators: state.collaborators,
        guests: state.guests,
        tables: state.tables,
        timeline: state.timeline,
        hasCompletedSetup: state.hasCompletedSetup,
      }),
    },
  ),
);
