import React, { useState, useEffect, useRef } from 'react';
import { 
  FiLayout, FiCalendar, FiClock, FiCheckSquare, 
  FiPlus, FiPlay, FiPause, FiRotateCcw, FiMoreHorizontal,
  FiTarget, FiFileText, FiEdit3
} from 'react-icons/fi';
import './Planner.css';

const initialHabits = [
  { id: 1, name: 'Read 1 Tech Article', streak: 12, days: [true, true, true, false, true, true, false] },
  { id: 2, name: 'LeetCode Problem', streak: 45, days: [true, true, true, true, true, true, true] },
  { id: 3, name: 'Networking Outreach', streak: 3, days: [false, false, true, true, false, true, false] }
];

const initialTasks = {
  todo: [
    { id: 1, title: 'Update Resume', desc: 'Add new fullstack project and rewrite summary.', tag: 'tag-red', type: 'High Priority' }
  ],
  inProgress: [
    { id: 3, title: 'Apply for Internships', desc: 'Send 5 applications on LinkedIn.', tag: 'tag-green', type: 'Job Search' }
  ],
  done: [
    { id: 4, title: 'Mock Interview', desc: 'Completed peer mock interview.', tag: 'tag-blue', type: 'Prep' }
  ]
};

const initialNotes = [
  { id: 1, title: 'Interview Prep Notes', body: 'Concepts to review:\n- React hooks lifecycle\n- Event Loop in Node.js\n- System Design tradeoffs' },
  { id: 2, title: 'Job Application Strategy', body: 'Targeting mid-level frontend roles in FinTech.' }
];

const Planner = () => {
  const [activeTab, setActiveTab] = useState('board');
  
  // Board State
  const [tasks, setTasks] = useState(initialTasks);
  const [addingTaskCol, setAddingTaskCol] = useState(null); // 'todo', 'inProgress', 'done'
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Notes State
  const [notes, setNotes] = useState(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState(1);
  const bodyRef = useRef(null);

  // Habits State
  const [habits, setHabits] = useState(initialHabits);
  const [newHabitName, setNewHabitName] = useState('');

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState([5, 12, 15, 22]); // Array of dates that have events

  // Load from local storage
  useEffect(() => {
    const savedTasks = localStorage.getItem('careerTrackerTasks');
    const savedNotes = localStorage.getItem('careerTrackerNotes');
    const savedHabits = localStorage.getItem('careerTrackerHabits');
    const savedEvents = localStorage.getItem('careerTrackerEvents');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedNotes) {
      const pNotes = JSON.parse(savedNotes);
      setNotes(pNotes);
      if (pNotes.length > 0) setActiveNoteId(pNotes[0].id);
    }
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedEvents) setCalendarEvents(JSON.parse(savedEvents));
  }, []);

  // Save to local storage
  useEffect(() => { localStorage.setItem('careerTrackerTasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('careerTrackerNotes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('careerTrackerHabits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('careerTrackerEvents', JSON.stringify(calendarEvents)); }, [calendarEvents]);

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

  const moveTask = (taskId, fromCol, toCol) => {
    setTasks(prev => {
      const task = prev[fromCol].find(t => t.id === taskId);
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
              <FiMoreHorizontal />
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
      <div className="notes-sidebar">
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
      <div className="notes-editor-area">
        {activeNote ? (
          <>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCheckSquare /> Daily Habit Tracker</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="New habit..." 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text-main)' }}
          />
          <button 
            onClick={handleAddHabit}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'var(--dash-primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
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
  const toggleCalendarEvent = (date) => {
    if (date <= 0 || date > 31) return; // Ignore mock padding dates
    setCalendarEvents(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const renderCalendar = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dates = Array.from({length: 35}, (_, i) => i - 2); 
    
    return (
      <div className="calendar-grid">
        {days.map(d => <div key={d} className="cal-header-day">{d}</div>)}
        {dates.map((date, i) => {
          const isToday = date === 15; // mock today
          const hasEvent = calendarEvents.includes(date);
          return (
            <div 
              key={i} 
              className={`cal-day ${isToday ? 'today' : ''}`} 
              style={{ opacity: date <= 0 || date > 31 ? 0.3 : 1, cursor: date > 0 && date <= 31 ? 'pointer' : 'default' }}
              onClick={() => toggleCalendarEvent(date)}
            >
              <div className="cal-date">{date > 0 && date <= 31 ? date : ''}</div>
              {hasEvent && <div className="cal-dot"></div>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="planner-container">
      <div className="planner-header">
        <div className="planner-title">
          <h1>Planner Hub</h1>
          <p>Organize your tasks, notes, and track your habits.</p>
        </div>
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
          <button className={`planner-tab ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>
            <FiClock /> Focus Timer
          </button>
        </div>
      </div>

      <div className="planner-content">
        {activeTab === 'board' && renderKanban()}
        {activeTab === 'notes' && renderNotes()}
        {activeTab === 'timer' && renderPomodoro()}
        {activeTab === 'habits' && renderHabits()}
        {activeTab === 'calendar' && renderCalendar()}
      </div>
    </div>
  );
};

export default Planner;
