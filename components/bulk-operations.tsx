'use client';

// ==========================================
// Rwanda Technology Institute Management System
// Bulk Operations Component
// ==========================================

import { useState } from 'react';
import { CheckSquare, Square, MoreHorizontal, Trash2, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';

interface BulkOperation {
  id: string;
  label: string;
  icon: React.ElementType;
  action: (selectedIds: string[]) => void | Promise<void>;
  variant?: 'primary' | 'danger' | 'secondary';
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
}

interface BulkOperationsProps<T> {
  items: T[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  getItemId: (item: T) => string;
  operations: BulkOperation[];
  className?: string;
}

export function BulkOperations<T>({
  items,
  selectedIds,
  onSelectionChange,
  getItemId,
  operations,
  className = '',
}: BulkOperationsProps<T>) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<BulkOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(getItemId));
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (selectedIds.includes(itemId)) {
      onSelectionChange(selectedIds.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedIds, itemId]);
    }
  };

  const executeOperation = async (operation: BulkOperation) => {
    if (operation.requiresConfirmation) {
      setPendingOperation(operation);
      setShowConfirmModal(true);
    } else {
      await performOperation(operation);
    }
  };

  const performOperation = async (operation: BulkOperation) => {
    setIsProcessing(true);
    try {
      await operation.action(selectedIds);
      onSelectionChange([]); // Clear selection after operation
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
      setPendingOperation(null);
    }
  };

  const confirmOperation = async () => {
    if (pendingOperation) {
      await performOperation(pendingOperation);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <div className={`flex items-center justify-between p-4 border-b bg-muted/50 ${className}`}>
        <div className="flex items-center gap-4">
          {/* Select All Checkbox */}
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : someSelected ? (
              <div className="h-4 w-4 border-2 border-primary rounded flex items-center justify-center">
                <div className="h-2 w-2 bg-primary rounded-sm" />
              </div>
            ) : (
              <Square className="h-4 w-4" />
            )}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>

          {/* Selection Count */}
          {selectedIds.length > 0 && (
            <Badge variant="default" className="px-2 py-1">
              {selectedIds.length} selected
            </Badge>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            {operations.map((operation) => {
              const Icon = operation.icon;
              return (
                <Button
                  key={operation.id}
                  variant={operation.variant || 'outline'}
                  size="sm"
                  onClick={() => executeOperation(operation)}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {operation.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual Item Selection Helper */}
      <div className="hidden">
        {items.map((item) => {
          const itemId = getItemId(item);
          const isSelected = selectedIds.includes(itemId);
          return (
            <button
              key={itemId}
              onClick={() => handleSelectItem(itemId)}
              className="flex items-center gap-2"
              aria-label={`Select item ${itemId}`}
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={pendingOperation?.confirmationTitle || 'Confirm Action'}
        description={pendingOperation?.confirmationMessage || 'Are you sure you want to perform this action?'}
      >
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              This action will affect <strong>{selectedIds.length}</strong> items.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={pendingOperation?.variant === 'danger' ? 'danger' : 'primary'}
              onClick={confirmOperation}
              isLoading={isProcessing}
            >
              {pendingOperation?.label}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Hook for managing bulk selection state
export function useBulkSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAll = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}