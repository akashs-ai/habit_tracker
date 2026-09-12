import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  Plus, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CalendarEvent, CalendarViewType } from '../../types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarDayView } from './CalendarDayView';
import { CalendarAgendaView } from './CalendarAgendaView';
import { MiniCalendar } from './MiniCalendar';
import { SelectedDayPanel } from './SelectedDayPanel';
import { UpcomingEventsPanel } from './UpcomingEventsPanel';
import { MobileCalendarView } from './MobileCalendarView';
import { AddEventModal } from './AddEventModal';
import { EventDetailModal } from './EventDetailModal';
import { ViewOptionsPopover } from './ViewOptionsPopover';

interface CalendarPageProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onToggleMobileMenu: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  isDark,
  setIsDark,
  onToggleMobileMenu,
}) => {
  const [currentView, setCurrentView] = useState<CalendarViewType>('month');
  const [selectedDate, setSelectedDate] = useState('2025-03-11');
  const [currentMonthLabel, setCurrentMonthLabel] = useState('March 2025');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);
  const [isViewOptionsOpen, setIsViewOptionsOpen] = useState(false);

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

  // Navigation handlers
  const handlePrevPeriod = () => {
    if (currentMonthLabel === 'March 2025') {
      setCurrentMonthLabel('February 2025');
      setSelectedDate('2025-02-25');
    } else {
      setCurrentMonthLabel('March 2025');
      setSelectedDate('2025-03-11');
    }
  };

  const handleNextPeriod = () => {
    if (currentMonthLabel === 'March 2025') {
      setCurrentMonthLabel('April 2025');
      setSelectedDate('2025-04-02');
    } else {
      setCurrentMonthLabel('March 2025');
      setSelectedDate('2025-03-11');
    }
  };

  const handleGoToToday = () => {
    setCurrentMonthLabel('March 2025');
    setSelectedDate('2025-03-11');
  };

  const handleOpenAddOnDate = (date: string) => {
    setSelectedDate(date);
    setIsAddEventOpen(true);
  };

  return (
    <div 
      id="calendar-page-root" 
      className="min-h-screen bg-[#08090B] text-[#F5F7FF] flex flex-col flex-1 pb-24 lg:pb-12 select-none"
    >
      {/* Top Header Bar */}
      <header
        id="calendar-top-header"
        className="h-[72px] bg-[#0D0F12]/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 border-b border-white/8 flex items-center justify-between transition-colors"
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
            <Search className="w-4 h-4 text-[#6F7789] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, tasks, or type / for commands..."
              className="w-full h-10 pl-9 pr-14 bg-[#151820] border border-white/8 rounded-xl text-xs sm:text-sm text-[#F5F7FF] placeholder:text-[#6F7789] focus:outline-none focus:ring-1 focus:ring-[#6C63FF] focus:border-[#6C63FF] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#A6AEC0] bg-[#111318] border border-white/10 rounded shadow-2xs">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3.5 pl-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#F4B942]" />
            ) : (
              <Moon className="w-4 h-4 text-[#A6AEC0]" />
            )}
          </button>

          <button
            className="relative p-2 rounded-xl text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F25567] rounded-full ring-2 ring-[#0D0F12]" />
          </button>

          <div className="w-8 h-8 rounded-full bg-[#6C63FF] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            A
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1520px] w-full mx-auto flex flex-col gap-6">
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
        />

        {/* Desktop Layout (1024px+) */}
        <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_300px] gap-4 items-start w-full">
          {/* Calendar Main Grid (Left ~70%) */}
          <div className="min-w-0 flex flex-col gap-4">
            {currentView === 'month' && (
              <CalendarMonthView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                events={filteredEvents}
                onSelectEvent={setSelectedEventForDetail}
                onAddEventOnDate={handleOpenAddOnDate}
              />
            )}
            {currentView === 'week' && (
              <CalendarWeekView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
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
            {/* 1. Mini Calendar */}
            <MiniCalendar
              currentMonth={currentMonthLabel}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPrevMonth={handlePrevPeriod}
              onNextMonth={handleNextPeriod}
              hasEventsDates={hasEventsDates}
            />

            {/* 2. Selected-Day Events */}
            <div className="bg-[#111318] border border-white/8 rounded-xl p-4 shadow-xs">
              <SelectedDayPanel
                selectedDate={selectedDate}
                events={selectedDayEvents}
                onSelectEvent={setSelectedEventForDetail}
                onAddEvent={() => setIsAddEventOpen(true)}
              />
            </div>

            {/* 3. Upcoming Events (Next 7 Days) */}
            <div className="bg-[#111318] border border-white/8 rounded-xl p-4 shadow-xs">
              <UpcomingEventsPanel
                events={events.filter((e) => e.date > '2025-03-11')}
                onSelectEvent={setSelectedEventForDetail}
                onViewAll={() => setCurrentView('agenda')}
              />
            </div>
          </aside>
        </div>

        {/* Tablet Layout (768px - 1023px) */}
        <div className="hidden sm:flex lg:hidden flex-col gap-6 w-full">
          {/* Full width calendar */}
          {currentView === 'month' && (
            <CalendarMonthView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={filteredEvents}
              onSelectEvent={setSelectedEventForDetail}
              onAddEventOnDate={handleOpenAddOnDate}
            />
          )}
          {currentView === 'week' && (
            <CalendarWeekView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
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
          <div className="bg-[#111318] border border-white/8 rounded-xl p-4">
            <SelectedDayPanel
              selectedDate={selectedDate}
              events={selectedDayEvents}
              onSelectEvent={setSelectedEventForDetail}
              onAddEvent={() => setIsAddEventOpen(true)}
            />
          </div>
        </div>

        {/* Mobile Layout (< 768px) */}
        <div className="sm:hidden flex flex-col gap-6 w-full">
          <MobileCalendarView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            events={filteredEvents}
            onSelectEvent={setSelectedEventForDetail}
            onOpenAddEvent={() => setIsAddEventOpen(true)}
          />

          {/* Mobile Upcoming Section */}
          <div className="bg-[#111318] border border-white/8 rounded-xl p-4">
            <UpcomingEventsPanel
              events={events.filter((e) => e.date > '2025-03-11')}
              onSelectEvent={setSelectedEventForDetail}
              onViewAll={() => setCurrentView('agenda')}
            />
          </div>
        </div>
      </main>

      {/* Mobile Floating Add Button '+' (52x52px, above bottom nav) */}
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
        event={selectedEventForDetail}
        isOpen={!!selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onUpdateEvent={onUpdateEvent}
        onDeleteEvent={onDeleteEvent}
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
    </div>
  );
};
