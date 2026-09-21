import { useEffect, useCallback } from 'react';
import { VoucherType } from '../types/voucher';

interface HotkeyOptions {
  onSave: () => void;
  onQuickCreate: () => void;
  onEscape: () => void;
  onSwitchType: (type: VoucherType) => void;
  onAddRow?: () => void;
  onSwitchTab?: (tab: 'entry' | 'register') => void;
  onToggleMode?: () => void;
  isModalOpen: boolean;
}

export function useVoucherHotkeys({
  onSave,
  onQuickCreate,
  onEscape,
  onSwitchType,
  onAddRow,
  onSwitchTab,
  onToggleMode,
  isModalOpen,
}: HotkeyOptions) {
  /**
   * Enter key focus advancement
   */
  const handleEnterNavigation = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Enter') return;

    const activeEl = document.activeElement as HTMLElement;
    if (!activeEl) return;

    // If inside a multiline textarea without Ctrl/Cmd, allow standard newline
    if (activeEl.tagName === 'TEXTAREA' && !e.ctrlKey && !e.metaKey) {
      return;
    }

    e.preventDefault();

    const currentNavIndex = activeEl.getAttribute('data-nav-idx');
    if (currentNavIndex !== null) {
      const nextIdx = parseInt(currentNavIndex, 10) + 1;
      const nextElement = document.querySelector<HTMLElement>(`[data-nav-idx="${nextIdx}"]`);

      if (nextElement) {
        nextElement.focus();
        if (nextElement instanceof HTMLInputElement) {
          nextElement.select();
        }
      }
    }
  }, []);

  /**
   * Global Keyboard Shortcut Listener
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Alt + C: Inline Quick Create (Ledger/Item)
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        onQuickCreate();
        return;
      }

      // 2. Alt + A: Add Row / Line
      if (e.altKey && !e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        if (onAddRow) {
          e.preventDefault();
          e.stopPropagation();
          onAddRow();
          return;
        }
      }

      // 3. Ctrl + A: Save / Accept Voucher
      if (e.ctrlKey && !e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        e.stopPropagation();
        onSave();
        return;
      }

      // 4. Alt + V: Switch to Voucher Entry Tab
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        if (onSwitchTab) {
          e.preventDefault();
          e.stopPropagation();
          onSwitchTab('entry');
          return;
        }
      }

      // 5. Alt + D: Switch to Day Book / Register Tab
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        if (onSwitchTab) {
          e.preventDefault();
          e.stopPropagation();
          onSwitchTab('register');
          return;
        }
      }

      // 6. Ctrl + H: Toggle Entry Mode
      if (e.ctrlKey && (e.key === 'h' || e.key === 'H')) {
        if (onToggleMode) {
          e.preventDefault();
          e.stopPropagation();
          onToggleMode();
          return;
        }
      }

      // 7. Escape: Close Modal or Exit
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
        return;
      }

      // If modal is open, don't trigger voucher type function keys
      if (isModalOpen) return;

      // 8. Standard Function Key Shortcuts (F4 - F9)
      switch (e.key) {
        case 'F4':
          e.preventDefault();
          onSwitchType('CONTRA');
          break;
        case 'F5':
          e.preventDefault();
          onSwitchType('PAYMENT');
          break;
        case 'F6':
          e.preventDefault();
          onSwitchType('RECEIPT');
          break;
        case 'F7':
          e.preventDefault();
          onSwitchType('JOURNAL');
          break;
        case 'F8':
          e.preventDefault();
          onSwitchType('SALES');
          break;
        case 'F9':
          e.preventDefault();
          onSwitchType('PURCHASE');
          break;
      }

      // 9. Enter field navigation
      handleEnterNavigation(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onQuickCreate, onEscape, onSwitchType, onAddRow, onSwitchTab, onToggleMode, isModalOpen, handleEnterNavigation]);
}
