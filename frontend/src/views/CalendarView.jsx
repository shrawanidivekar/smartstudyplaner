import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

export default function CalendarView() {
  const [events, setEvents] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCalendar().then((data) => {
      setEvents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateStr: ''
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateStr
    });
  }

  // Selected date events
  const selectedEvents = events[selectedDateStr] || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Academic Calendar</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Consolidated schedule view combining exam dates, daily study tasks, and spaced revision deadlines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Calendar Grid Card */}
        <div className="card" style={{ flex: 2 }}>
          {/* Calendar Month Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
              {monthNames[month]} {year}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={prevMonth}>
                <ChevronLeft size={16} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const now = new Date();
                  setCurrentDate(now);
                  setSelectedDateStr(now.toISOString().split('T')[0]);
                }}
              >
                Today
              </button>
              <button className="btn btn-secondary btn-sm" onClick={nextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Days Header */}
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="calendar-day-header">
                {d}
              </div>
            ))}

            {/* Days Cells */}
            {calendarDays.map((cd, idx) => {
              const dayEvents = cd.dateStr ? events[cd.dateStr] || [] : [];
              const isToday = cd.dateStr === todayStr;
              const isSelected = cd.dateStr === selectedDateStr;

              return (
                <div
                  key={idx}
                  className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    opacity: cd.isCurrentMonth ? 1 : 0.35,
                    cursor: cd.isCurrentMonth ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (cd.isCurrentMonth) setSelectedDateStr(cd.dateStr);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: isToday ? 800 : 600, color: isToday ? '#4f46e5' : '#0f172a' }}>
                      {cd.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5' }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600,
                          background:
                            ev.type === 'exam'
                              ? '#fee2e2'
                              : ev.type === 'revision'
                              ? '#fef3c7'
                              : '#e0e7ff',
                          color:
                            ev.type === 'exam'
                              ? '#b91c1c'
                              : ev.type === 'revision'
                              ? '#b45309'
                              : '#3730a3'
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Drawer */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CalendarIcon size={18} color="#4f46e5" />
                <span>Activities for {selectedDateStr}</span>
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                {selectedDateStr === todayStr ? 'Today' : 'Selected Date'}
              </div>
            </div>
          </div>

          {selectedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <p>No scheduled exams or study tasks for this date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedEvents.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background:
                      ev.type === 'exam'
                        ? '#fff1f2'
                        : ev.type === 'revision'
                        ? '#fffbeb'
                        : '#ffffff',
                    borderLeft: `4px solid ${
                      ev.type === 'exam'
                        ? '#e11d48'
                        : ev.type === 'revision'
                        ? '#f59e0b'
                        : '#4f46e5'
                    }`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {ev.title}
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background:
                          ev.type === 'exam'
                            ? '#fecdd3'
                            : ev.type === 'revision'
                            ? '#fde68a'
                            : '#c7d2fe',
                        color:
                          ev.type === 'exam'
                            ? '#9f1239'
                            : ev.type === 'revision'
                            ? '#92400e'
                            : '#3730a3'
                      }}
                    >
                      {ev.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    {ev.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
