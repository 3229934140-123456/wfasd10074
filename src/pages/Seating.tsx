import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Armchair,
  Plus,
  Users,
  UserPlus,
  X,
  GripVertical,
  Trash2,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { SeatTable, Guest } from '@/types';
import { cn } from '@/utils';

function TableCard({
  table,
  guests,
  onRemoveGuest,
  isDragOver,
}: {
  table: SeatTable;
  guests: Guest[];
  onRemoveGuest: (guestId: string) => void;
  isDragOver?: boolean;
}) {
  const capacityUsed = table.guestIds.length;
  const isFull = capacityUsed >= table.capacity;

  return (
    <div
      className={cn(
        'absolute bg-white rounded-xl shadow-medium border-2 p-3 transition-all hover:shadow-lift',
        isFull ? 'border-border' : isDragOver ? 'border-rose-gold shadow-lift' : 'border-border',
      )}
      style={{
        left: table.position.x,
        top: table.position.y,
        width: table.shape === 'round' ? '200px' : '260px',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs text-text-muted">桌号</span>
          <h4 className="font-display text-lg font-semibold text-text-primary leading-tight">
            {table.tableNumber}{table.name ? ` · ${table.name}` : ''}
          </h4>
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full',
          isFull ? 'bg-sage-green/20 text-sage-green' : 'bg-rose-gold/10 text-rose-gold-dark',
        )}>
          {capacityUsed}/{table.capacity}
        </span>
      </div>
      <div className="decorative-line mb-2"></div>
      {guests.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4">拖拽宾客到此处</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="group flex items-center gap-1.5 px-2 py-1 rounded-full bg-cream text-xs"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold flex items-center justify-center text-white text-xs">
                {guest.name.charAt(0)}
              </div>
              <span className="text-text-primary max-w-[60px] truncate">{guest.name}</span>
              <button
                onClick={() => onRemoveGuest(guest.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {isFull && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-sage-green text-center">已满座</p>
        </div>
      )}
    </div>
  );
}

function GuestItem({ guest, onRemove }: { guest: Guest; onRemove?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: guest.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2.5 rounded-lg bg-white border border-border cursor-grab active:cursor-grabbing transition-all',
        isDragging && 'shadow-medium border-rose-gold',
      )}
    >
      <div {...attributes} {...listeners} className="text-text-muted hover:text-rose-gold">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold flex items-center justify-center text-white text-sm flex-shrink-0">
        {guest.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{guest.name}</p>
        <p className="text-xs text-text-muted">{guest.relationLabel}</p>
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 rounded text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function Seating() {
  const { guests, tables, project, assignGuestToTable, removeGuestFromTable, addTable, updateTablePosition } =
    useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverTableId, setDragOverTableId] = useState<string | null>(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [newTable, setNewTable] = useState({
    tableNumber: tables.length + 1,
    name: '',
    capacity: 10,
    shape: 'round' as 'round' | 'rectangle',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  if (!project) return null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const unassignedGuests = guests.filter((g) => !g.tableId);
  const assignedGuests = guests.filter((g) => g.tableId);
  const activeGuest = guests.find((g) => g.id === activeId);

  const getTableGuests = (table: SeatTable) =>
    table.guestIds.map((id) => guests.find((g) => g.id === id)).filter(Boolean) as Guest[];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setDragOverTableId(null);
    const { active, over } = event;

    if (!over) return;

    const guestId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith('table-')) {
      const tableId = overId.replace('table-', '');
      const table = tables.find((t) => t.id === tableId);
      if (table && table.guestIds.length >= table.capacity && !table.guestIds.includes(guestId)) {
        showToast(`桌${table.tableNumber}已满座，无法添加`);
        return;
      }
      const success = assignGuestToTable(guestId, tableId);
      if (!success) {
        showToast('该桌已满座');
      }
    }
  };

  const handleTableDrop = (e: React.DragEvent, tableId: string) => {
    e.preventDefault();
    setDragOverTableId(null);
    if (activeId) {
      const table = tables.find((t) => t.id === tableId);
      if (table && table.guestIds.length >= table.capacity && !table.guestIds.includes(activeId)) {
        showToast(`桌${table.tableNumber}已满座，无法添加`);
        return;
      }
      const success = assignGuestToTable(activeId, tableId);
      if (!success) {
        showToast('该桌已满座');
      }
    }
  };

  const handleAddTable = () => {
    addTable({
      projectId: project.id,
      tableNumber: newTable.tableNumber,
      name: newTable.name,
      capacity: newTable.capacity,
      shape: newTable.shape,
      position: { x: 200 + tables.length * 50, y: 100 + tables.length * 30 },
      guestIds: [],
    });
    setNewTable({
      ...newTable,
      tableNumber: newTable.tableNumber + 1,
      name: '',
    });
    setShowAddTable(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">桌子总数</p>
            <Armchair className="w-5 h-5 text-rose-gold" />
          </div>
          <p className="font-display text-2xl font-semibold text-text-primary">{tables.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">总座位数</p>
            <Users className="w-5 h-5 text-rose-gold" />
          </div>
          <p className="font-display text-2xl font-semibold text-text-primary">
            {tables.reduce((sum, t) => sum + t.capacity, 0)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">已入座</p>
            <UserPlus className="w-5 h-5 text-sage-green" />
          </div>
          <p className="font-display text-2xl font-semibold text-sage-green">{assignedGuests.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">待安排</p>
            <Settings className="w-5 h-5 text-amber-500" />
          </div>
          <p className="font-display text-2xl font-semibold text-amber-600">{unassignedGuests.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 h-[calc(100vh-340px)]">
        {/* Guest List */}
        <div className="col-span-1 card flex flex-col !p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">待安排宾客</h3>
            <span className="text-xs text-text-muted">{unassignedGuests.length} 人</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {unassignedGuests.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">所有宾客已安排座位</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={unassignedGuests.map((g) => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {unassignedGuests.map((guest) => (
                    <GuestItem key={guest.id} guest={guest} />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeGuest ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white shadow-lift border-2 border-rose-gold">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-gold-light to-rose-gold flex items-center justify-center text-white text-sm">
                        {activeGuest.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{activeGuest.name}</span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>

        {/* Seating Canvas */}
        <div className="col-span-3 card !p-0 overflow-hidden relative">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">宴会厅座位布局</h3>
            <button onClick={() => setShowAddTable(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加桌子
            </button>
          </div>
          <div className="relative w-full h-full seating-grid overflow-auto">
            {/* Stage indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-12 bg-gradient-to-r from-rose-gold-light via-rose-gold to-rose-gold-light rounded-lg flex items-center justify-center text-white font-medium shadow-medium">
              主舞台
            </div>

            {tables.map((table) => (
              <div
                key={table.id}
                id={`table-${table.id}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverTableId(table.id);
                }}
                onDragLeave={() => setDragOverTableId(null)}
                onDrop={(e) => handleTableDrop(e, table.id)}
                className="transition-colors"
              >
                <TableCard
                  table={table}
                  guests={getTableGuests(table)}
                  onRemoveGuest={removeGuestFromTable}
                  isDragOver={dragOverTableId === table.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-dark-brown/90 text-white px-6 py-3 rounded-lg shadow-lift animate-slide-up flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          {toastMsg}
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lift w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">添加桌位</h3>
              <button
                onClick={() => setShowAddTable(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">桌号</label>
                  <input
                    type="number"
                    min={1}
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({ ...newTable, tableNumber: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">座位数</label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 10 })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">桌名（可选）</label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  placeholder="如：主桌、亲友桌"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">桌子形状</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewTable({ ...newTable, shape: 'round' })}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                      newTable.shape === 'round'
                        ? 'border-rose-gold bg-rose-gold/5'
                        : 'border-border hover:border-rose-gold-light',
                    )}
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-current text-rose-gold flex items-center justify-center">
                      <span className="text-xs">圆桌</span>
                    </div>
                    <span className="text-sm">圆桌</span>
                  </button>
                  <button
                    onClick={() => setNewTable({ ...newTable, shape: 'rectangle' })}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                      newTable.shape === 'rectangle'
                        ? 'border-rose-gold bg-rose-gold/5'
                        : 'border-border hover:border-rose-gold-light',
                    )}
                  >
                    <div className="w-16 h-10 rounded-md border-2 border-current text-rose-gold flex items-center justify-center">
                      <span className="text-xs">长桌</span>
                    </div>
                    <span className="text-sm">长桌</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddTable(false)} className="flex-1 btn-secondary">
                取消
              </button>
              <button onClick={handleAddTable} className="flex-1 btn-primary">
                添加桌位
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
