import React from 'react';
import { Bell, CheckCheck, X, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.js';
import { PageId } from '../types.js';

interface NotificationPanelProps {
  onClose: () => void;
  setCurrentPage: (page: PageId) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose, setCurrentPage }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleItemClick = (notif: any) => {
    markAsRead(notif._id);
    if (notif.link) {
      const cleanPath = notif.link.replace('/', '') as PageId;
      setCurrentPage(cleanPath);
      onClose();
    }
  };

  return (
    <div
      id="notifications-popover"
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-stone-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-stone-900">Notifications & Alerts</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              id="btn-mark-all-read"
              onClick={markAllAsRead}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-emerald-50"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-500">
            No notifications right now. Everything is calm on the farm!
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif._id}
              onClick={() => handleItemClick(notif)}
              className={`p-3 text-left transition-colors cursor-pointer hover:bg-stone-50 flex items-start gap-2.5 ${
                !notif.read ? 'bg-emerald-50/40' : ''
              }`}
            >
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-emerald-600' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">{notif.title}</p>
                <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">{notif.message}</p>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {notif.link && <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-1" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
