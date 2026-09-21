/**
 * FINSTAQ Centralized UI Theme & Design System
 * 
 * Standard design tokens and utility classes for consistent UX across all screens.
 * Modify in index.css (@layer components) or here to update styling universally.
 */

export const UI = {
  // Cards & Containers
  card: {
    base: 'finstaq-card',
    header: 'finstaq-card-header',
  },

  // Page & Module Header Banners
  banner: {
    container: 'finstaq-banner',
    icon: 'finstaq-banner-icon',
  },

  // Buttons
  btn: {
    primary: 'finstaq-btn-primary',
    secondary: 'finstaq-btn-secondary',
    success: 'finstaq-btn-success',
    danger: 'finstaq-btn-danger',
    outline: 'finstaq-btn-outline',
  },

  // Data Tables
  table: {
    container: 'finstaq-table-container',
    table: 'finstaq-table',
    th: 'finstaq-th',
    td: 'finstaq-td',
    tr: 'finstaq-tr',
  },

  // Form Controls
  input: {
    text: 'finstaq-input',
    select: 'finstaq-select',
    label: 'finstaq-label',
  },

  // KPI Scorecards (Executive 360° Standard)
  kpi: {
    card: 'finstaq-kpi-card',
    header: 'finstaq-kpi-header',
    label: 'finstaq-kpi-label',
    value: 'finstaq-kpi-value',
    valueEmerald: 'finstaq-kpi-value-emerald',
    valueRose: 'finstaq-kpi-value-rose',
    valueIndigo: 'finstaq-kpi-value-indigo',
    footer: 'finstaq-kpi-footer',
    trendUp: 'finstaq-kpi-trend-up',
    trendDown: 'finstaq-kpi-trend-down',
  },

  // Dynamic Status Badges
  badge: (status?: string | null): string => {
    if (!status) return 'finstaq-badge-neutral';
    const s = status.toUpperCase();
    switch (s) {
      case 'ACTIVE':
      case 'PAID':
      case 'NORMAL':
      case 'APPROVED':
      case 'SUCCESS':
      case 'SETTLED':
      case 'VERIFIED':
      case 'PUBLISHED':
        return 'finstaq-badge-success';

      case 'DUE':
      case 'WARNING':
      case 'PENDING':
      case 'IN_REVIEW':
      case 'TRIAL':
      case 'DRAFT_PENDING_APPROVAL':
        return 'finstaq-badge-warning';

      case 'SUSPENDED':
      case 'CRITICAL':
      case 'OVERDUE':
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
      case 'EXCEEDED':
        return 'finstaq-badge-danger';

      case 'PROCESSING':
      case 'INFO':
      case 'SUBMITTED':
        return 'finstaq-badge-info';

      default:
        return 'finstaq-badge-neutral';
    }
  },

  // Modals & Overlays
  modal: {
    backdrop: 'finstaq-modal-backdrop',
    box: 'finstaq-modal-box',
  },
};
