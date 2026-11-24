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

function handleAltCreateShortcuts(e: KeyboardEvent, options: HotkeyOptions): boolean {
  if (e.altKey && (e.key === 'c' || e.key === 'C')) {
    e.preventDefault();
    e.stopPropagation();
    options.onQuickCreate();
    return true;
  }
  if (e.altKey && !e.ctrlKey && (e.key === 'a' || e.key === 'A') && options.onAddRow) {
    e.preventDefault();
    e.stopPropagation();
    options.onAddRow();
    return true;
  }
  return false;
}

function handleAltTabShortcuts(e: KeyboardEvent, options: HotkeyOptions): boolean {
  if (e.altKey && (e.key === 'v' || e.key === 'V') && options.onSwitchTab) {
    e.preventDefault();
    e.stopPropagation();
    options.onSwitchTab('entry');
    return true;
  }
  if (e.altKey && (e.key === 'd' || e.key === 'D') && options.onSwitchTab) {
    e.preventDefault();
    e.stopPropagation();
    options.onSwitchTab('register');
    return true;
  }
  return false;
}

function handleSaveModeEscape(e: KeyboardEvent, options: HotkeyOptions): boolean {
  if (e.ctrlKey && !e.altKey && (e.key === 'a' || e.key === 'A')) {
    e.preventDefault();
    e.stopPropagation();
    options.onSave();
    return true;
  }
  if (e.ctrlKey && (e.key === 'h' || e.key === 'H') && options.onToggleMode) {
    e.preventDefault();
    e.stopPropagation();
    options.onToggleMode();
    return true;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    options.onEscape();
    return true;
  }
  return false;
}

function handleVoucherFunctionKey(e: KeyboardEvent, onSwitchType: (type: VoucherType) => void) {
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
    default:
      break;
  }
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
      const nextIdx = Number.parseInt(currentNavIndex, 10) + 1;
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
      const options = { onSave, onQuickCreate, onEscape, onSwitchType, onAddRow, onSwitchTab, onToggleMode, isModalOpen };
      if (handleAltCreateShortcuts(e, options) || handleAltTabShortcuts(e, options)) return;
      if (handleSaveModeEscape(e, options)) return;
      if (isModalOpen) return;
      handleVoucherFunctionKey(e, onSwitchType);
      handleEnterNavigation(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onQuickCreate, onEscape, onSwitchType, onAddRow, onSwitchTab, onToggleMode, isModalOpen, handleEnterNavigation]);
}
