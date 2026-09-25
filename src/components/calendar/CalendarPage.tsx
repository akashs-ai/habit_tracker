import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  Plus,
  Calendar,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { CalendarEvent, CalendarViewType, AppNotification } from '../../types';
import { NotificationDropdown } from '../NotificationDropdown';
import { CalendarHeader } from './CalendarHeader';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarDayView } from './CalendarDayView';
import { CalendarAgendaView } from './CalendarAgendaView';
import { MiniCalendar } from './MiniCalendar';
import { SelectedDayPanel } from './SelectedDayPanel';
import { UpcomingEventsPanel } from './UpcomingEventsPanel';
import { AddEventModal } from './AddEventModal';
import { EventDetailModal } from './EventDetailModal';
import { ViewOptionsPopover } from './ViewOptionsPopover';
import { MobileCalendarView } from './MobileCalendarView';
import { 
  getTodayISO,
  isDateToday,
  getStartOfWeek,
  formatDateForUI,
  getLiveTodayISO, 
  getTodayDate,
  parseDateISO, 
  formatDateISO, 
  shiftDateMonths,
  addDaysISO,
  getMonthYearLabel, 
  formatWeekRangeLabel, 
  formatFullDayHeader,
  filterEventsByTemporal,
} from '../../utils/dateUtils';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut, 
  fetchGoogleCalendarEvents,
  connectDemoCalendar,
  loadGsiClient,
  PopupBlockedError,
  GoogleCalendarUser,
} from '../../services/googleCalendar';
import { User } from 'firebase/auth';

interface CalendarPageProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onToggleMobileMenu: () => void;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onClearAllNotifications?: () => void;
  onNavigateTab?: (tab: string) => void;
  onToggleTaskComplete?: (taskId: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  isDark,
  setIsDark,
  onToggleMobileMenu,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearAllNotifications,
  onNavigateTab,
  onToggleTaskComplete,
}) => {
  const todayISO = useMemo(() => getTodayISO(), []);
  const [currentView, setCurrentView] = useState<CalendarViewType>('month');
  
  // Currently active/selected date (defaults to present live date)
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  // Active view date anchor for month/year navigation
  const [viewDate, setViewDate] = useState<Date>(() => getTodayDate());

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);
  const [isViewOptionsOpen, setIsViewOptionsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Authoritatively derive the active detail event from the latest events list to prevent stale subtask/mutation closures
  const activeDetailEvent = useMemo(() => {
    if (!selectedEventForDetail) return null;
    return events.find((e) => e.id === selectedEventForDetail.id) || selectedEventForDetail;
  }, [selectedEventForDetail, events]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Google Calendar Integration State
  const [googleUser, setGoogleUser] = useState<GoogleCalendarUser | User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [showUnauthorizedDomainModal, setShowUnauthorizedDomainModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'domain' | 'popup_blocked'>('popup_blocked');
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  React.useEffect(() => {
    // Pre-warm Google Identity Services client script so it is ready instantly when user clicks
    loadGsiClient().catch(() => {});

    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const syncGoogleEvents = async (tokenOverride?: string) => {
    const token = tokenOverride || googleToken;
    if (!token) return;
    setIsSyncingGoogle(true);
    try {
      const gcalEvents = await fetchGoogleCalendarEvents(token);
      let newCount = 0;
      for (const gev of gcalEvents) {
        const alreadyExists = events.some((e) => {
          // FIRST check googleEventId
          if (gev.googleEventId && e.googleEventId) {
            return e.googleEventId === gev.googleEventId;
          }
          if (e.id === gev.id) return true;
          // Fallback only when googleEventId is unavailable on either event
          if (!gev.googleEventId || !e.googleEventId) {
            return e.title === gev.title && e.date === gev.date && e.startTime === gev.startTime;
          }
          return false;
        });
        if (!alreadyExists) {
          onAddEvent(gev);
          newCount++;
        }
      }
      setSyncFeedback({
        message: newCount > 0 
          ? `Synced ${newCount} new event${newCount > 1 ? 's' : ''} from Google Calendar!` 
          : 'Google Calendar is up to date.',
        type: 'success',
      });
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      console.warn('Google Calendar sync issue:', err);
      setSyncFeedback({
        message: 'Unable to sync Google Calendar events. Please reconnect.',
        type: 'error',
      });
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    setIsConnectingGoogle(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSyncFeedback({
          message: `Connected as ${result.user.displayName || result.user.email}! Syncing calendar...`,
          type: 'info',
        });
        await syncGoogleEvents(result.accessToken);
      }
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';
      if (
        code === 'auth/popup-closed-by-user' || 
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled' ||
        message.includes('user-cancelled') ||
        message.includes('closed by user')
      ) {
        // User closed or declined the permission dialog
        return;
      }

      // Check specifically for popup blocked error
      if (
        err instanceof PopupBlockedError ||
        err?.isPopupBlocked ||
        code === 'popup_failed_to_open' ||
        code === 'popup_closed' ||
        message.includes('Failed to open popup window') ||
        message.includes('blocked by the browser') ||
        (typeof message === 'string' && message.toLowerCase().includes('popup'))
      ) {
        setAuthModalType('popup_blocked');
        setShowUnauthorizedDomainModal(true);
        return;
      }

      // Check specifically for unauthorized-domain error
      if (
        code === 'auth/unauthorized-domain' ||
        message.includes('auth/unauthorized-domain') ||
        err?.name === 'UnauthorizedDomainError'
      ) {
        setAuthModalType('domain');
        setShowUnauthorizedDomainModal(true);
        return;
      }

      console.warn('Sign in issue:', err);
      setSyncFeedback({
        message: 'Google authentication was not completed. Please try again.',
        type: 'error',
      });
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleConnectDemo = async () => {
    setShowUnauthorizedDomainModal(false);
    const demoResult = connectDemoCalendar();
    setGoogleUser(demoResult.user);
    setGoogleToken(demoResult.accessToken);
    setSyncFeedback({
      message: 'Connected with Demo Calendar! Syncing sample events...',
      type: 'info',
    });
    await syncGoogleEvents(demoResult.accessToken);
  };

  const handleDisconnectGoogleCalendar = async () => {
    const confirmed = window.confirm('Disconnect Google Calendar? You can reconnect anytime.');
    if (!confirmed) return;
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      setSyncFeedback({
        message: 'Google Calendar disconnected.',
        type: 'info',
      });
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // Dynamically formatted period label based on current view
  const currentMonthLabel = useMemo(() => {
    switch (currentView) {
      case 'week':
        return formatWeekRangeLabel(selectedDate);
      case 'day':
        return formatDateForUI(selectedDate, 'full');
      case 'month':
      case 'agenda':
      default:
        return getMonthYearLabel(viewDate.getFullYear(), viewDate.getMonth());
    }
  }, [currentView, selectedDate, viewDate]);

  // Filtered events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  // Dates with events for mini-calendar dot indicator
  const hasEventsDates = useMemo(() => {
    return new Set(events.map((e) => e.date));
  }, [events]);

  // Events on currently selected day
  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.date === selectedDate);
  }, [filteredEvents, selectedDate]);

  // Upcoming events (today and next 14 days, sorted chronologically)
  const upcomingEvents = useMemo(() => {
    return filterEventsByTemporal(events, 'upcoming', todayISO);
  }, [events, todayISO]);

  // Period navigation handlers
  const handlePrevPeriod = () => {
    if (currentView === 'month' || currentView === 'agenda') {
      const base = parseDateISO(selectedDate);
      const prevDate = shiftDateMonths(base, -1, true);
      const prevISO = formatDateISO(prevDate);
      setSelectedDate(prevISO);
      setViewDate(prevDate);
    } else if (currentView === 'week') {
      const nextDate = addDaysISO(selectedDate, -7);
      setSelectedDate(nextDate);
      setViewDate(parseDateISO(nextDate));
    } else if (currentView === 'day') {
      const nextDate = addDaysISO(selectedDate, -1);
      setSelectedDate(nextDate);
      setViewDate(parseDateISO(nextDate));
    }
  };

  const handleNextPeriod = () => {
    if (currentView === 'month' || currentView === 'agenda') {
      const base = parseDateISO(selectedDate);
      const nextDate = shiftDateMonths(base, 1, true);
      const nextISO = formatDateISO(nextDate);
      setSelectedDate(nextISO);
      setViewDate(nextDate);
    } else if (currentView === 'week') {
      const nextDate = addDaysISO(selectedDate, 7);
      setSelectedDate(nextDate);
      setViewDate(parseDateISO(nextDate));
    } else if (currentView === 'day') {
      const nextDate = addDaysISO(selectedDate, 1);
      setSelectedDate(nextDate);
      setViewDate(parseDateISO(nextDate));
    }
  };

  const handleGoToToday = () => {
    const liveToday = getTodayISO();
    setSelectedDate(liveToday);
    setViewDate(getTodayDate());
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setViewDate(parseDateISO(dateStr));
  };

  const handleOpenAddOnDate = (date: string) => {
    setSelectedDate(date);
    setViewDate(parseDateISO(date));
    setIsAddEventOpen(true);
  };

  return (
    <div 
      id="calendar-page-root" 
      className="min-h-screen bg-slate-50 dark:bg-[#08090B] text-slate-900 dark:text-[#F5F7FF] flex flex-col flex-1 pb-24 lg:pb-12 select-none"
    >
      {/* Top Header Bar */}
      <header
        id="calendar-top-header"
        className="h-[72px] bg-white/80 dark:bg-[#0D0F12]/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 border-b border-slate-200 dark:border-white/8 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {/* Mobile Menu Trigger */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#A6AEC0] hover:text-white hover:bg-white/5"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="relative w-full max-w-sm sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#6F7789] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, tasks, or type / for commands..."
              className="w-full h-10 pl-9 pr-14 bg-slate-100 dark:bg-[#151820] border border-slate-200 dark:border-white/8 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F5F7FF] placeholder:text-slate-400 dark:placeholder:text-[#6F7789] focus:outline-none focus:ring-1 focus:ring-[#6C63FF] focus:border-[#6C63FF] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-[#A6AEC0] bg-slate-200 dark:bg-[#111318] border border-slate-300 dark:border-white/10 rounded shadow-2xs">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3.5 pl-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-slate-600 dark:text-[#A6AEC0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#F4B942]" />
            ) : (
              <Moon className="w-4 h-4 text-[#A6AEC0]" />
            )}
          </button>

          {/* Notification Bell with Badge & Dropdown */}
          <div ref={notificationRef} className="relative">
            <button
              id="calendar-notification-bell-btn"
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                isNotificationOpen
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF]'
                  : 'text-[#A6AEC0] hover:text-white hover:bg-white/5'
              }`}
              aria-label="Notifications"
              aria-expanded={isNotificationOpen}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[12px] h-[12px] px-0.5 bg-[#F25567] text-white text-[8px] font-bold rounded-full ring-2 ring-[#0D0F12] flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              onMarkAsRead={(id) => onMarkNotificationAsRead?.(id)}
              onMarkAllAsRead={() => onMarkAllNotificationsAsRead?.()}
              onClearAll={() => onClearAllNotifications?.()}
              onNavigateToTab={(tab) => onNavigateTab?.(tab)}
            />
          </div>

          <div className="w-8 h-8 rounded-full bg-[#6C63FF] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            A
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1520px] w-full mx-auto flex flex-col gap-6">
        {/* Sync Toast Feedback Banner */}
        {syncFeedback && (
          <div
            id="gcal-sync-toast"
            className={`px-4 py-2.5 rounded-[9px] text-xs sm:text-sm font-medium flex items-center justify-between border transition-all ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : syncFeedback.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current shrink-0" />
              {syncFeedback.message}
            </span>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white text-xs ml-3 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Calendar Page Header */}
        <CalendarHeader
          currentView={currentView}
          onChangeView={setCurrentView}
          currentMonthLabel={currentMonthLabel}
          onPrevPeriod={handlePrevPeriod}
          onNextPeriod={handleNextPeriod}
          onGoToToday={handleGoToToday}
          onOpenAddEvent={() => setIsAddEventOpen(true)}
          onOpenViewOptions={() => setIsViewOptionsOpen(true)}
          onConnectGoogleCalendar={handleConnectGoogleCalendar}
          isConnected={!!googleUser}
          isConnecting={isConnectingGoogle}
          isSyncing={isSyncingGoogle}
          googleAccountName={googleUser?.displayName || googleUser?.email}
          onDisconnectGoogleCalendar={handleDisconnectGoogleCalendar}
          onSyncGoogleCalendar={() => syncGoogleEvents()}
        />

        {/* Desktop Layout (1024px+) */}
        <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_300px] gap-4 items-start w-full">
          {/* Calendar Main Grid (Left ~70%) */}
          <div className="min-w-0 flex flex-col gap-4">
            {currentView === 'month' && (
              <CalendarMonthView
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                events={filteredEvents}
                onSelectEvent={setSelectedEventForDetail}
                onAddEventOnDate={handleOpenAddOnDate}
                viewYear={viewDate.getFullYear()}
                viewMonth={viewDate.getMonth()}
              />
            )}
            {currentView === 'week' && (
              <CalendarWeekView
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                events={filteredEvents}
                onSelectEvent={setSelectedEventForDetail}
                onAddEventOnDate={handleOpenAddOnDate}
              />
            )}
            {currentView === 'day' && (
              <CalendarDayView
                selectedDate={selectedDate}
                events={filteredEvents}
                onSelectEvent={setSelectedEventForDetail}
                onAddEvent={() => setIsAddEventOpen(true)}
              />
            )}
            {currentView === 'agenda' && (
              <CalendarAgendaView
                events={filteredEvents}
                onSelectEvent={setSelectedEventForDetail}
              />
            )}
          </div>

          {/* Right Panel (Desktop 300px) */}
          <aside className="w-[300px] flex flex-col gap-4 sticky top-24">
            {/* 1. Mini Calendar with live date awareness */}
            <MiniCalendar
              currentMonth={getMonthYearLabel(viewDate.getFullYear(), viewDate.getMonth())}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onPrevMonth={() => {
                const prev = shiftDateMonths(viewDate, -1, true);
                setViewDate(prev);
                setSelectedDate(formatDateISO(prev));
              }}
              onNextMonth={() => {
                const next = shiftDateMonths(viewDate, 1, true);
                setViewDate(next);
                setSelectedDate(formatDateISO(next));
              }}
              hasEventsDates={hasEventsDates}
              viewYear={viewDate.getFullYear()}
              viewMonth={viewDate.getMonth()}
            />

            {/* 2. Selected-Day Events */}
            <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-white/8 rounded-xl p-4 shadow-xs">
              <SelectedDayPanel
                selectedDate={selectedDate}
                events={selectedDayEvents}
                onSelectEvent={setSelectedEventForDetail}
                onAddEvent={() => setIsAddEventOpen(true)}
                onToggleTaskComplete={onToggleTaskComplete}
              />
            </div>

            {/* 3. Upcoming Events (Next 7-14 Days) */}
            <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-white/8 rounded-xl p-4 shadow-xs">
              <UpcomingEventsPanel
                events={upcomingEvents}
                onSelectEvent={setSelectedEventForDetail}
                onViewAll={() => setCurrentView('agenda')}
              />
            </div>
          </aside>
        </div>

        {/* Tablet Layout (768px - 1023px) */}
        <div className="hidden sm:flex lg:hidden flex-col gap-6 w-full">
          {currentView === 'month' && (
            <CalendarMonthView
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEventForDetail}
              onAddEventOnDate={handleOpenAddOnDate}
              viewYear={viewDate.getFullYear()}
              viewMonth={viewDate.getMonth()}
            />
          )}
          {currentView === 'week' && (
            <CalendarWeekView
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEventForDetail}
              onAddEventOnDate={handleOpenAddOnDate}
            />
          )}
          {currentView === 'day' && (
            <CalendarDayView
              selectedDate={selectedDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEventForDetail}
              onAddEvent={() => setIsAddEventOpen(true)}
            />
          )}
          {currentView === 'agenda' && (
            <CalendarAgendaView
              events={filteredEvents}
              onSelectEvent={setSelectedEventForDetail}
            />
          )}

          {/* Selected-Day Section in bottom panel */}
          <div className="bg-[#111318] border border-white/8 rounded-xl p-4 shadow-xs">
            <SelectedDayPanel
              selectedDate={selectedDate}
              events={selectedDayEvents}
              onSelectEvent={setSelectedEventForDetail}
              onAddEvent={() => setIsAddEventOpen(true)}
              onToggleTaskComplete={onToggleTaskComplete}
            />
          </div>
        </div>

        {/* Mobile Layout (< 768px) */}
        <div className="sm:hidden flex flex-col gap-6 w-full">
          <MobileCalendarView
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            events={filteredEvents}
            onSelectEvent={setSelectedEventForDetail}
            onOpenAddEvent={() => setIsAddEventOpen(true)}
          />

          {/* Mobile Upcoming Section */}
          <div className="bg-[#111318] border border-white/8 rounded-xl p-4 shadow-xs">
            <UpcomingEventsPanel
              events={upcomingEvents}
              onSelectEvent={setSelectedEventForDetail}
              onViewAll={() => setCurrentView('agenda')}
            />
          </div>
        </div>
      </main>

      {/* Mobile Floating Add Button '+' */}
      <button
        id="mobile-floating-add-event"
        onClick={() => setIsAddEventOpen(true)}
        className="sm:hidden fixed right-[18px] bottom-[76px] w-[52px] h-[52px] rounded-full bg-[#6C63FF] hover:bg-[#7B73FF] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all z-30"
        aria-label="Add event"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onSave={onAddEvent}
        initialDate={selectedDate}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={activeDetailEvent}
        isOpen={!!activeDetailEvent}
        onClose={() => setSelectedEventForDetail(null)}
        onUpdateEvent={onUpdateEvent}
        onDeleteEvent={onDeleteEvent}
        onToggleTaskComplete={onToggleTaskComplete}
      />

      {/* View Options & Shortcuts Popover */}
      <ViewOptionsPopover
        isOpen={isViewOptionsOpen}
        onClose={() => setIsViewOptionsOpen(false)}
        currentView={currentView}
        onChangeView={setCurrentView}
        onAddEvent={() => setIsAddEventOpen(true)}
        onGoToToday={handleGoToToday}
      />

      {/* Unauthorized Domain / Popup Blocked Modal */}
      {showUnauthorizedDomainModal && (
        <div
          id="unauthorized-domain-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="bg-[#181920] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-[#F5F7FF]">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                {authModalType === 'popup_blocked' ? <ShieldAlert className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {authModalType === 'popup_blocked' ? 'Google Sign-In Popup Blocked' : 'Google Calendar Authorization'}
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  {authModalType === 'popup_blocked'
                    ? 'Browser prevented the authentication popup from opening'
                    : 'Domain authorization requirement detected'}
                </p>
              </div>
              <button
                id="btn-close-domain-modal"
                onClick={() => setShowUnauthorizedDomainModal(false)}
                className="text-white/40 hover:text-white p-1 rounded-lg transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {authModalType === 'popup_blocked' ? (
              <>
                <p className="text-sm text-white/80 leading-relaxed">
                  Your browser or embedded iframe preview blocked the Google authentication popup window.
                </p>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 text-xs text-white/70 space-y-2">
                  <div className="font-medium text-white/90">Option 1: Connect with Demo Calendar (Instant)</div>
                  <p className="text-white/60">
                    Populates your schedule with realistic demo events immediately so you can test all calendar views, task conversions, and time-blocking features.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 text-xs text-white/70 space-y-2">
                  <div className="font-medium text-white/90">Option 2: Open in a Full Browser Tab</div>
                  <p className="text-white/60">
                    Open LifeRPG in a separate browser tab where iframe security restrictions will not block Google OAuth popups.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                  <button
                    id="btn-domain-cancel"
                    onClick={() => setShowUnauthorizedDomainModal(false)}
                    className="px-3.5 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <a
                    id="btn-open-app-tab"
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Full Tab</span>
                  </a>
                  <button
                    id="btn-connect-demo-calendar"
                    onClick={handleConnectDemo}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#6C63FF] hover:bg-[#7B73FF] text-white shadow-md transition-all active:scale-95"
                  >
                    Connect Demo Calendar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-white/80 leading-relaxed">
                  The preview domain (<code className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-mono text-xs">{typeof window !== 'undefined' ? window.location.hostname : 'run.app'}</code>) is not listed under Firebase Authentication&apos;s authorized domains.
                </p>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 text-xs text-white/70 space-y-2">
                  <div className="font-medium text-white/90">Option A: Connect with Demo Calendar (Instant)</div>
                  <p className="text-white/60">
                    Populates your schedule with realistic demo events immediately so you can test all features without domain restrictions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 text-xs text-white/70 space-y-2">
                  <div className="font-medium text-white/90">Option B: Whitelist domain in Firebase Console</div>
                  <ol className="list-decimal list-inside space-y-1 text-white/60">
                    <li>Open Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</li>
                    <li>Add <span className="font-mono text-white/90">{typeof window !== 'undefined' ? window.location.hostname : 'current domain'}</span></li>
                  </ol>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    id="btn-domain-cancel"
                    onClick={() => setShowUnauthorizedDomainModal(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-connect-demo-calendar"
                    onClick={handleConnectDemo}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#6C63FF] hover:bg-[#7B73FF] text-white shadow-md transition-all active:scale-95"
                  >
                    Connect Demo Calendar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
