import { create } from 'zustand';
import type { WeddingProject, TodoItem, ServiceContract, Collaborator, Guest, SeatTable, WeddingTimelineItem, CurrentUser, Vendor } from '@/types';
import {
  MOCK_PROJECT,
  MOCK_TODOS,
  MOCK_CONTRACTS,
  MOCK_COLLABORATORS,
  MOCK_GUESTS,
  MOCK_TABLES,
  MOCK_TIMELINE,
  MOCK_USER,
  MOCK_VENDORS,
} from '@/data/mock';

interface AppState {
  currentUser: CurrentUser;
  project: WeddingProject;
  vendors: Vendor[];
  todos: TodoItem[];
  contracts: ServiceContract[];
  collaborators: Collaborator[];
  guests: Guest[];
  tables: SeatTable[];
  timeline: WeddingTimelineItem[];

  // Todo actions
  toggleTodo: (id: string) => void;
  addTodo: (todo: Omit<TodoItem, 'id' | 'reminded'>) => void;
  deleteTodo: (id: string) => void;
  assignTodo: (todoId: string, assigneeId: string) => void;

  // Contract actions
  updateContractStatus: (id: string, status: ServiceContract['status']) => void;
  markPaymentPaid: (contractId: string, paymentId: string) => void;

  // Guest actions
  updateGuestRsvp: (id: string, status: Guest['rsvpStatus']) => void;
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  deleteGuest: (id: string) => void;

  // Seating actions
  assignGuestToTable: (guestId: string, tableId: string) => void;
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

export const useAppStore = create<AppState>((set) => ({
  currentUser: MOCK_USER,
  project: MOCK_PROJECT,
  vendors: MOCK_VENDORS,
  todos: MOCK_TODOS,
  contracts: MOCK_CONTRACTS,
  collaborators: MOCK_COLLABORATORS,
  guests: MOCK_GUESTS,
  tables: MOCK_TABLES,
  timeline: MOCK_TIMELINE,

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
          id: `todo-${Date.now()}`,
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
                  : p
              ),
            }
          : c
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
          id: `g-${Date.now()}`,
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

  assignGuestToTable: (guestId, tableId) =>
    set((state) => ({
      guests: state.guests.map((g) => (g.id === guestId ? { ...g, tableId } : g)),
      tables: state.tables.map((t) => {
        if (t.id === tableId) {
          const newGuestIds = t.guestIds.includes(guestId)
            ? t.guestIds
            : [...t.guestIds.filter((gid) => gid !== guestId), guestId];
          return { ...t, guestIds: newGuestIds };
        }
        return {
          ...t,
          guestIds: t.guestIds.filter((gid) => gid !== guestId),
        };
      }),
    })),

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
          id: `t-${Date.now()}`,
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
          id: `wt-${Date.now()}`,
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
          id: `col-${Date.now()}`,
        },
      ],
    })),
}));
