import React, { useState, useEffect, useRef } from 'react';
import { 
  FiLayout, FiCalendar, FiClock, FiCheckSquare, 
  FiPlus, FiPlay, FiPause, FiRotateCcw, FiMoreHorizontal,
  FiTarget, FiFileText, FiEdit3, FiTrash2
} from 'react-icons/fi';
import './Planner.css';
import api from '../config/api';

const initialHabits = [];

const initialTasks = {
  todo: [],
  inProgress: [],
  done: []
};

const initialNotes = [];

const Planner = () => {
  const [activeTab, setActiveTab] = useState('board');
  
  // Board State
  const [tasks, setTasks] = useState(initialTasks);
  const [addingTaskCol, setAddingTaskCol] = useState(null); // 'todo', 'inProgress', 'done'
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Notes State
  const [notes, setNotes] = useState(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const bodyRef = useRef(null);

  // Habits State
  const [habits, setHabits] = useState(initialHabits);
  const [newHabitName, setNewHabitName] = useState('');

  // Calendar States
  const [selectedDate, setSelectedDate] = useState(12); // Default to July 12 (today)
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedAmPm, setSelectedAmPm] = useState('AM');
  const [newCalendarItem, setNewCalendarItem] = useState({ type: 'task', text: '' });
  const [calendarEventsData, setCalendarEventsData] = useState({});

  const fetchCalendarEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/calendar-events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data.data || [];
      const grouped = {};
      list.forEach(event => {
        const dateObj = new Date(event.eventDate);
        if (dateObj.getMonth() === 6 && dateObj.getFullYear() === 2026) {
          const dateVal = dateObj.getDate();
          if (!grouped[dateVal]) grouped[dateVal] = [];
          grouped[dateVal].push({
            id: event.id,
            type: event.type,
            text: event.title,
            completed: event.completed,
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          });
        }
      });
      setCalendarEventsData(grouped);
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    }
  };

  // Load from local storage & API
  useEffect(() => {
    const savedTasks = localStorage.getItem('careerTrackerTasks');
    const savedNotes = localStorage.getItem('careerTrackerNotes');
    const savedHabits = localStorage.getItem('careerTrackerHabits');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedNotes) {
      const pNotes = JSON.parse(savedNotes);
      setNotes(pNotes);
      if (pNotes.length > 0) setActiveNoteId(pNotes[0].id);
    }
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    fetchCalendarEvents();
  }, []);

  // Save to local storage
  useEffect(() => { localStorage.setItem('careerTrackerTasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('careerTrackerNotes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('careerTrackerHabits', JSON.stringify(habits)); }, [habits]);

  // Task Handlers
  const handleAddTask = (col) => {
    if (!newTaskTitle.trim()) {
      setAddingTaskCol(null);
      return;
    }
    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      desc: '',
      tag: 'tag-blue',
      type: 'General'
    };
    
    setTasks(prev => ({
      ...prev,
      [col]: [...prev[col], newTask]
    }));
    setNewTaskTitle('');
    setAddingTaskCol(null);
  };

  const handleDeleteTask = (taskId, col) => {
    setTasks(prev => ({
      ...prev,
      [col]: prev[col].filter(t => t.id !== taskId)
    }));
  };

  const moveTask = (taskId, fromCol, toCol) => {
    setTasks(prev => {
      const task = prev[fromCol].find(t => t.id === taskId);
      if (!task) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
        [toCol]: [...prev[toCol], task]
      };
    });
  };

  // Notes Handlers
  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleNoteChange = (field, value) => {
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, [field]: value } : n));
  };

  const createNewNote = () => {
    const newNote = { id: Date.now(), title: '', body: '' };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('focus');

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
  };
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-resize textarea
  const handleAutoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    handleNoteChange('body', e.target.value);
  };

  const renderKanbanColumn = (title, colKey) => (
    <div className="kanban-column" onDragOver={e => e.preventDefault()} onDrop={e => {
      const data = e.dataTransfer.getData("text/plain");
      if (data) {
        const { id, sourceCol } = JSON.parse(data);
        if (sourceCol !== colKey) moveTask(id, sourceCol, colKey);
      }
    }}>
      <div className="column-header">
        <span>{title}</span>
        <span className="column-count">{tasks[colKey].length}</span>
      </div>
      <div className="column-body">
        {tasks[colKey].map(task => (
          <div 
            key={task.id} 
            className="kanban-card" 
            draggable 
            onDragStart={e => e.dataTransfer.setData("text/plain", JSON.stringify({id: task.id, sourceCol: colKey}))}
          >
            <div className="card-title" style={colKey === 'done' ? { textDecoration: 'line-through', color: 'var(--dash-text-muted)' } : {}}>{task.title}</div>
            {task.desc && <div className="card-desc">{task.desc}</div>}
            <div className="card-meta">
              <span className={`card-tag ${task.tag}`}>{task.type}</span>
              <button 
                onClick={() => handleDeleteTask(task.id, colKey)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#ef4444', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s' 
                }}
                title="Delete Task"
                className="kanban-card-delete-btn"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {addingTaskCol === colKey ? (
          <div className="inline-add-task">
            <input 
              autoFocus 
              type="text" 
              placeholder="Task title..." 
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask(colKey)}
            />
            <div className="inline-add-actions">
              <button className="btn-cancel-task" onClick={() => { setAddingTaskCol(null); setNewTaskTitle(''); }}>Cancel</button>
              <button className="btn-save-task" onClick={() => handleAddTask(colKey)}>Add</button>
            </div>
          </div>
        ) : (
          <button className="add-task-btn" onClick={() => setAddingTaskCol(colKey)}>
            <FiPlus /> Add Task
          </button>
        )}
      </div>
    </div>
  );

  const renderKanban = () => (
    <div className="kanban-board">
      {renderKanbanColumn('To Do', 'todo')}
      {renderKanbanColumn('In Progress', 'inProgress')}
      {renderKanbanColumn('Done', 'done')}
    </div>
  );

  const renderNotes = () => (
    <div className="notes-container">
      <div className={`notes-sidebar ${activeNoteId ? 'has-active-note' : ''}`}>
        <div className="notes-sidebar-header">
          <span style={{ fontWeight: 600, color: 'var(--dash-text-muted)', fontSize: '14px' }}>Private Notes</span>
          <button className="btn-new-note" onClick={createNewNote} title="New Note"><FiEdit3 /></button>
        </div>
        <div className="notes-list">
          {notes.map(note => (
            <div 
              key={note.id} 
              className={`note-item ${activeNoteId === note.id ? 'active' : ''}`}
              onClick={() => setActiveNoteId(note.id)}
            >
              <FiFileText /> {note.title || 'Untitled'}
            </div>
          ))}
        </div>
      </div>
      <div className={`notes-editor-area ${activeNoteId ? 'active-note' : ''}`}>
        {activeNote ? (
          <>
            <button 
              className="notes-back-btn-mobile"
              onClick={() => setActiveNoteId(null)}
              style={{ display: 'none', marginBottom: '16px', background: 'none', border: 'none', color: 'var(--dash-primary)', fontWeight: 700, cursor: 'pointer', alignItems: 'center', gap: '4px', padding: 0 }}
            >
              ← Back to Notes
            </button>
            <input 
              className="notion-title-input" 
              placeholder="Untitled" 
              value={activeNote.title}
              onChange={(e) => handleNoteChange('title', e.target.value)}
            />
            <textarea 
              className="notion-body-input" 
              placeholder="Start typing..."
              value={activeNote.body}
              ref={bodyRef}
              onChange={handleAutoResize}
              onFocus={(e) => { e.target.style.height = e.target.scrollHeight + 'px'; }}
            ></textarea>
          </>
        ) : (
          <div className="note-empty-state">Select a note or create a new one.</div>
        )}
      </div>
    </div>
  );

  const renderPomodoro = () => (
    <div className="pomodoro-container">
      <div className="timer-circle">
        <div className="timer-time">{formatTime(timeLeft)}</div>
        <div className="timer-label">{timerMode === 'focus' ? 'Focus Time' : 'Break Time'}</div>
      </div>
      <div className="timer-controls">
        <button className={`btn-timer ${isTimerRunning ? 'btn-pause' : 'btn-start'}`} onClick={toggleTimer}>
          {isTimerRunning ? <><FiPause /> Pause</> : <><FiPlay /> Start</>}
        </button>
        <button className="btn-timer btn-reset" onClick={resetTimer}>
          <FiRotateCcw /> Reset
        </button>
      </div>
    </div>
  );

  // Habit Handlers
  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      streak: 0,
      days: [false, false, false, false, false, false, false]
    };
    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
  };

  const toggleHabitDay = (habitId, dayIndex) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newDays = [...habit.days];
        newDays[dayIndex] = !newDays[dayIndex];
        
        // Recalculate basic streak based on completed days in the week for now
        const streak = newDays.filter(Boolean).length; 
        
        return { ...habit, days: newDays, streak: habit.streak > streak ? habit.streak : streak };
      }
      return habit;
    }));
  };

  const renderHabits = () => (
    <div className="habit-tracker">
      <div className="habit-header-row">
        <h2 className="habit-title"><FiCheckSquare /> Daily Habit Tracker</h2>
        <div className="habit-add-form">
          <input 
            type="text" 
            placeholder="New habit..." 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            className="habit-input"
          />
          <button 
            onClick={handleAddHabit}
            className="habit-add-btn"
          >
            <FiPlus /> Add
          </button>
        </div>
      </div>
      
      {habits.length === 0 && <p style={{ color: 'var(--dash-text-muted)' }}>No habits added yet. Create one above!</p>}
      
      {habits.map(habit => (
        <div key={habit.id} className="habit-row">
          <div className="habit-info">
            <div className="habit-name">{habit.name}</div>
            <div className="habit-streak"><FiTarget /> {habit.streak} Day Streak</div>
          </div>
          <div className="habit-days">
            {habit.days.map((completed, index) => (
              <div 
                key={index} 
                onClick={() => toggleHabitDay(habit.id, index)}
                className={`habit-day ${completed ? 'completed' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <FiCheckSquare />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Calendar Handlers
  // Convert 12h picker values → 24h for ISO
  const getEventTimeISO = () => {
    let hour = parseInt(selectedHour, 10);
    if (selectedAmPm === 'AM' && hour === 12) hour = 0;
    if (selectedAmPm === 'PM' && hour !== 12) hour += 12;
    const hh = String(hour).padStart(2, '0');
    return `2026-07-${String(selectedDate).padStart(2, '0')}T${hh}:${selectedMinute}:00`;
  };

  const handleAddCalendarItem = async (e) => {
    e.preventDefault();
    if (!newCalendarItem.text.trim()) return;

    const selectedEvents = calendarEventsData[selectedDate] || [];
    if (selectedEvents.length >= 7) {
      alert("You can only add up to 7 events for a single day.");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const eventDateStr = getEventTimeISO();
      
      await api.post('/api/calendar-events', {
        title: newCalendarItem.text,
        type: newCalendarItem.type,
        eventDate: eventDateStr,
        sendEmail: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewCalendarItem(prev => ({ ...prev, text: '' }));
      fetchCalendarEvents();
    } catch (err) {
      console.error('Failed to create calendar event:', err);
    }
  };

  const handleToggleCalendarItem = async (eventId, currentCompleted) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/calendar-events/${eventId}`, {
        completed: !currentCompleted
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCalendarEvents();
    } catch (err) {
      console.error('Failed to toggle event completion:', err);
    }
  };

  const handleDeleteCalendarItem = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/calendar-events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCalendarEvents();
    } catch (err) {
      console.error('Failed to delete calendar event:', err);
    }
  };

  const renderCalendar = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dates = Array.from({length: 35}, (_, i) => i - 2); 
    
    const selectedEvents = calendarEventsData[selectedDate] || [];

    return (
      <div className="planner-calendar-view" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left Grid */}
        <div className="calendar-grid-box" style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>July 2026</h3>
          <div className="calendar-grid">
            {days.map(d => <div key={d} className="cal-header-day">{d}</div>)}
            {dates.map((date, i) => {
              const isToday = date === 12; // mock today is July 12
              const isSelected = selectedDate === date;
              const hasEvents = calendarEventsData[date] && calendarEventsData[date].length > 0;
              
              const dayOfWeekIndex = i % 7;
              const pastelColors = [
                { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' }, // Sun - Light Blue
                { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8' }, // Mon - Light Purple
                { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46' }, // Tue - Light Emerald
                { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412' }, // Wed - Light Amber
                { bg: '#fff1f2', border: '#fecdd3', text: '#9d174d' }, // Thu - Light Rose
                { bg: '#ecfeff', border: '#a5f3fc', text: '#075985' }, // Fri - Light Cyan
                { bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3' }  // Sat - Light Indigo
              ];

              const colorConfig = date > 0 && date <= 31 
                ? pastelColors[dayOfWeekIndex] 
                : { bg: '#f8fafc', border: '#e2e8f0', text: '#cbd5e1' };

              return (
                <div 
                  key={i} 
                  className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`} 
                  style={{ 
                    opacity: date <= 0 || date > 31 ? 0.35 : 1, 
                    cursor: date > 0 && date <= 31 ? 'pointer' : 'default',
                    background: colorConfig.bg,
                    border: isSelected ? '2px solid #2563eb' : `1px solid ${colorConfig.border}`,
                    position: 'relative'
                  }}
                  onClick={() => date > 0 && date <= 31 && setSelectedDate(date)}
                >
                  <div className="cal-date" style={{ color: colorConfig.text }}>
                    {date > 0 && date <= 31 ? date : ''}
                  </div>
                  {hasEvents && (
                    <div className="cal-dot" style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="calendar-details-panel">
          <div className="details-header">
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Events on July {selectedDate}</h3>
          </div>

          <div className="details-items-list">
            {selectedEvents.length === 0 ? (
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>No deadlines, tasks, or reminders for this day.</p>
            ) : (
              selectedEvents.map((item, idx) => {
                let badgeColor = '#ef4444'; // default red
                let badgeText = 'Reminder';
                let icon = '🔔';
                
                if (item.type === 'goal') {
                  badgeColor = '#ea580c';
                  badgeText = 'Goal Deadline';
                  icon = '🎯';
                } else if (item.type === 'task') {
                  badgeColor = '#2563eb';
                  badgeText = 'Daily Task';
                  icon = '✔';
                } else if (item.type === 'planner') {
                  badgeColor = '#10b981';
                  badgeText = 'Planner Event';
                  icon = '📅';
                }

                return (
                  <div key={idx} className="cal-event-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <span style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => handleToggleCalendarItem(item.id, item.completed)}>
                        {item.completed ? '✅' : icon}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--dash-text-muted)' : 'var(--dash-text-main)' }}>
                          {item.text} <span style={{ fontSize: '11px', color: 'var(--dash-text-muted)', fontWeight: 400 }}>({item.time})</span>
                        </span>
                        <span style={{ fontSize: '11px', color: badgeColor, fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
                          {badgeText}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteCalendarItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--dash-text-muted)', fontSize: '18px', cursor: 'pointer' }}
                    >
                      &times;
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleAddCalendarItem} className="cal-add-event-form">
            <span className="cal-form-label">Add Event / Goal / Task (Max 7)</span>
            
            <input 
              type="text"
              placeholder="Event title..."
              value={newCalendarItem.text}
              onChange={e => setNewCalendarItem({ ...newCalendarItem, text: e.target.value })}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text-main)', fontSize: '13px', width: '100%' }}
            />

            <div className="cal-form-row-grid">
              <select 
                value={newCalendarItem.type} 
                onChange={e => setNewCalendarItem({ ...newCalendarItem, type: e.target.value })}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text-main)', fontSize: '13px', width: '100%' }}
              >
                <option value="task">Daily Task</option>
                <option value="goal">Goal Deadline</option>
                <option value="planner">Planner Event</option>
                <option value="reminder">Reminder</option>
              </select>

              <div className="cal-time-picker-row">
                <select
                  value={selectedHour}
                  onChange={e => setSelectedHour(e.target.value)}
                  className="cal-time-select"
                >
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span style={{ color: 'var(--dash-text-muted)', fontWeight: 700, fontSize: '13px' }}>:</span>
                <select
                  value={selectedMinute}
                  onChange={e => setSelectedMinute(e.target.value)}
                  className="cal-time-select"
                >
                  {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                
                <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
                  {['AM','PM'].map(period => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSelectedAmPm(period)}
                      className="cal-period-btn"
                      style={{
                        background: selectedAmPm === period ? 'var(--dash-primary)' : 'transparent',
                        color: selectedAmPm === period ? 'white' : 'var(--dash-text-muted)'
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="cal-add-submit-btn"
            >
              Add Event
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="planner-container">
      <div className="planner-header">
        <h1 className="page-heading" style={{ margin: 0 }}>Career Planner</h1>
        <div className="planner-tabs">
          <button className={`planner-tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
            <FiLayout /> Task Board
          </button>
          <button className={`planner-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            <FiFileText /> Notes
          </button>
          <button className={`planner-tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <FiCalendar /> Calendar
          </button>
          <button className={`planner-tab ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}>
            <FiCheckSquare /> Habits
          </button>
        </div>
        <div className="planner-header-spacer" />
      </div>

      <div className="planner-content">
        {activeTab === 'board' && renderKanban()}
        {activeTab === 'notes' && renderNotes()}
        {activeTab === 'habits' && renderHabits()}
        {activeTab === 'calendar' && renderCalendar()}
      </div>
    </div>
  );
};

export default Planner;
