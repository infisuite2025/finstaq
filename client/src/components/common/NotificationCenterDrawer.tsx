import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCheck, Trash2, X, Info, AlertTriangle, CheckCircle2, MessageSquare, Mail, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface InAppNotification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  category: 'system' | 'voucher' | 'inventory' | 'sales' | 'purchase' | 'approval';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  link?: string;
  createdAt: string;
}

export const NotificationCenterDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { success, info } = useToast();
  const { getAuthHeaders } = useAuth();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/communication/notifications?limit=50', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/communication/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/v1/communication/notifications/read-all', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      success('All notifications marked as read', 'Cleared');
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'high': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'voucher': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'inventory': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'sales': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'purchase': return <Mail className="w-4 h-4 text-indigo-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      {/* Trigger Bell Button */}
      <button
        onClick={() => { setIsOpen(true); fetchNotifications(); }}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Transparent Click-away Overlay & Notification Popover */}
      {isOpen && (
        <>
          {/* Completely transparent backdrop to detect outside clicks without darkening the page */}
          <div 
            className="fixed inset-0 z-[9990] bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Floating Notification Panel */}
          <div className="fixed top-16 right-6 z-[9991] w-full max-w-sm sm:max-w-md max-h-[calc(100vh-5rem)] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-900/5 dark:ring-white/10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Center</h3>
                  <p className="text-xs text-slate-500">{unreadCount} unread alerts</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-semibold flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center p-6">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">No notifications for your organization right now.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markAsRead(n.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                      n.read 
                        ? 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800/60 opacity-75' 
                        : 'bg-white dark:bg-slate-800 border-indigo-200/80 dark:border-indigo-900/50 shadow-sm ring-1 ring-indigo-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {getCategoryIcon(n.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className={`text-xs font-bold truncate ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                            {n.title}
                          </h4>
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${getPriorityBadge(n.priority)}`}>
                            {n.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}</span>
                          {!n.read && (
                            <span className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-semibold">
                              Mark read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
