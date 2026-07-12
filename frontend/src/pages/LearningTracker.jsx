import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FiSearch, FiBook, FiVideo, FiFileText, FiBookmark, 
  FiCheckSquare, FiCalendar, FiClock, FiPlus, FiTrash2, FiDownload, FiExternalLink, FiBell
} from 'react-icons/fi';
import api from '../config/api';
import './LearningTracker.css';

const LearningTracker = () => {
  const { userProfile } = useOutletContext();
  const [activeTab, setActiveTab] = useState('courses');

  // 1. Courses States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // 2. Notes States
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // 3. Bookmarks States
  const [bookmarks, setBookmarks] = useState([]);
  const [bmTitle, setBmTitle] = useState('');
  const [bmUrl, setBmUrl] = useState('');

  // 4. Completed Topics States
  const [topics, setTopics] = useState([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // 5. Revision Reminders States
  const [reminders, setReminders] = useState([]);
  const [remTopic, setRemTopic] = useState('');
  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [remDate, setRemDate] = useState(getTodayDateString());
  const [remHour, setRemHour] = useState('09');
  const [remMinute, setRemMinute] = useState('00');
  const [remAmPm, setRemAmPm] = useState('AM');

  // Load state from localStorage on init
  useEffect(() => {
    const savedNotes = localStorage.getItem('lt_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));

    const savedBookmarks = localStorage.getItem('lt_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedTopics = localStorage.getItem('lt_topics');
    if (savedTopics) setTopics(JSON.parse(savedTopics));

    const savedReminders = localStorage.getItem('lt_reminders');
    if (savedReminders) setReminders(JSON.parse(savedReminders));
  }, []);

  // Sync state helpers
  const saveNotesToStore = (data) => {
    setNotes(data);
    localStorage.setItem('lt_notes', JSON.stringify(data));
  };

  const saveBookmarksToStore = (data) => {
    setBookmarks(data);
    localStorage.setItem('lt_bookmarks', JSON.stringify(data));
  };

  const saveTopicsToStore = (data) => {
    setTopics(data);
    localStorage.setItem('lt_topics', JSON.stringify(data));
  };

  const saveRemindersToStore = (data) => {
    setReminders(data);
    localStorage.setItem('lt_reminders', JSON.stringify(data));
  };

  // 1. Course Search handler
  const handleCourseSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulate course database return
    const mockCourses = [
      {
        title: `${searchQuery} Specialization`,
        platform: 'Coursera',
        url: `https://www.coursera.org/search?query=${encodeURIComponent(searchQuery)}`,
        rating: '4.8',
        duration: '3-6 months'
      },
      {
        title: `The Ultimate ${searchQuery} Bootcamp 2026`,
        platform: 'Udemy',
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(searchQuery)}`,
        rating: '4.7',
        duration: '42 hours'
      },
      {
        title: `Introduction to ${searchQuery}`,
        platform: 'Coursera',
        url: `https://www.coursera.org/search?query=${encodeURIComponent(searchQuery)}`,
        rating: '4.6',
        duration: '4 weeks'
      },
      {
        title: `${searchQuery} Masterclass: Zero to Mastery`,
        platform: 'Udemy',
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(searchQuery)}`,
        rating: '4.9',
        duration: '28 hours'
      }
    ];
    setSearchResults(mockCourses);
  };

  const formatIndianTime = (timeStr) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return timeStr;
    }
  };

  // 2. Notes handlers
  const getWordCount = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    if (getWordCount(noteContent) > 500) {
      alert("Note content cannot exceed 500 words.");
      return;
    }
    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: noteContent,
      date: new Date().toLocaleDateString()
    };
    saveNotesToStore([newNote, ...notes]);
    setNoteTitle('');
    setNoteContent('');
    setIsCreatingNote(false);
  };

  const handleDeleteNote = (id) => {
    saveNotesToStore(notes.filter(n => n.id !== id));
  };

  const handleDownloadNote = (note) => {
    const element = document.createElement("a");
    const file = new Blob([`# ${note.title}\nDate: ${note.date}\n\n${note.content}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 3. Bookmarks handlers
  const handleAddBookmark = (e) => {
    e.preventDefault();
    if (!bmTitle.trim() || !bmUrl.trim()) return;
    const newBm = {
      id: Date.now(),
      title: bmTitle,
      url: bmUrl.startsWith('http') ? bmUrl : `https://${bmUrl}`
    };
    saveBookmarksToStore([...bookmarks, newBm]);
    setBmTitle('');
    setBmUrl('');
  };

  const handleDeleteBookmark = (id) => {
    saveBookmarksToStore(bookmarks.filter(b => b.id !== id));
  };

  // 4. Completed Topics handlers
  const handleToggleTopic = (id) => {
    const updated = topics.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTopicsToStore(updated);
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    const newT = {
      id: Date.now(),
      title: newTopicTitle,
      completed: false
    };
    saveTopicsToStore([...topics, newT]);
    setNewTopicTitle('');
  };

  const handleDeleteTopic = (id) => {
    saveTopicsToStore(topics.filter(t => t.id !== id));
  };

  // 5. Revision Reminder handlers
  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/calendar-events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data.data || [];
      // Filter for revision reminder events
      const filtered = list.filter(event => event.type === 'reminder');
      setReminders(filtered.map(item => ({
        id: item.id,
        topic: item.title.replace('Revision: ', ''),
        time: item.eventDate
      })));
    } catch (err) {
      console.error("Failed to fetch revision reminders", err);
    }
  };

  useEffect(() => {
    const savedNotes = localStorage.getItem('lt_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));

    const savedBookmarks = localStorage.getItem('lt_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedTopics = localStorage.getItem('lt_topics');
    if (savedTopics) setTopics(JSON.parse(savedTopics));

    fetchReminders();
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!remTopic.trim() || !remDate || !remHour || !remMinute || !remAmPm) return;

    try {
      let hour24 = parseInt(remHour);
      if (remAmPm === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (remAmPm === 'AM' && hour24 === 12) {
        hour24 = 0;
      }

      const dateParts = remDate.split('-');
      const scheduledDate = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]),
        hour24,
        parseInt(remMinute),
        0
      );

      const token = localStorage.getItem('token');
      await api.post('/api/calendar-events', {
        title: `Revision: ${remTopic}`,
        type: 'reminder',
        eventDate: scheduledDate,
        sendEmail: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchReminders();
      setRemTopic('');
      setRemDate(getTodayDateString());
      setRemHour('09');
      setRemMinute('00');
      setRemAmPm('AM');
    } catch (err) {
      console.error("Failed to schedule revision reminder email", err);
      alert("Failed to schedule reminder alarm.");
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/calendar-events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders();
    } catch (err) {
      console.error("Failed to delete reminder", err);
    }
  };

  return (
    <div className="lt-container">
      <div className="lt-header-row">
        <h1 className="page-heading" style={{ margin: 0 }}>Learning Tracker</h1>
        <div className="lt-tabs">
          <button className={`lt-tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <FiSearch /> Courses Search
          </button>
          <button className={`lt-tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            <FiFileText /> Study Notes
          </button>
          <button className={`lt-tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>
            <FiBookmark /> Resource Bookmarks
          </button>
          <button className={`lt-tab-btn ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')}>
            <FiCheckSquare /> Topic Progression
          </button>
          <button className={`lt-tab-btn ${activeTab === 'reminders' ? 'active' : ''}`} onClick={() => setActiveTab('reminders')}>
            <FiClock /> Revision Reminders
          </button>
        </div>
      </div>

      <div className="lt-content-layout">
        <div className="lt-content-panel">
          
          {/* 1. Course Search */}
          {activeTab === 'courses' && (
            <div className="lt-panel-card">
              <h2>Search Courses (Coursera & Udemy)</h2>
              <form onSubmit={handleCourseSearch} className="lt-search-form">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn? (e.g. React, Python)"
                  className="lt-search-input"
                  required
                />
                <button type="submit" className="lt-search-btn"><FiSearch /> Search</button>
              </form>

              <div className="lt-results-list">
                {searchResults.length === 0 ? (
                  <div className="lt-empty-state">
                    <FiBook size={40} />
                    <p>Enter a topic above to search for Coursera and Udemy courses.</p>
                  </div>
                ) : (
                  searchResults.map((course, idx) => (
                    <div key={idx} className="lt-course-result-card">
                      <div className="lt-course-info">
                        <span className={`lt-platform-badge ${course.platform.toLowerCase()}`}>
                          {course.platform}
                        </span>
                        <h3>{course.title}</h3>
                        <div className="lt-course-meta">
                          <span>Rating: ⭐ {course.rating}</span>
                          <span>Duration: {course.duration}</span>
                        </div>
                      </div>
                      <a href={course.url} target="_blank" rel="noreferrer" className="lt-course-go-btn">
                        Go to course <FiExternalLink />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. Notes Section */}
          {activeTab === 'notes' && (
            <div className="lt-panel-card">
              {!isCreatingNote ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ margin: 0 }}>Study Notes</h2>
                    <button 
                      className="lt-submit-btn" 
                      onClick={() => setIsCreatingNote(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <FiPlus /> Add Note
                    </button>
                  </div>

                  <div className="lt-notes-grid">
                    {notes.length === 0 ? (
                      <p className="lt-empty-msg">No notes saved yet.</p>
                    ) : (
                      notes.map(note => (
                        <div key={note.id} className="lt-note-card">
                          <div className="lt-note-header">
                            <h3>{note.title}</h3>
                            <span className="lt-note-date">{note.date}</span>
                          </div>
                          <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                          <div className="lt-note-actions">
                            <button className="lt-action-btn" onClick={() => handleDownloadNote(note)} title="Download Note">
                              <FiDownload /> Download
                            </button>
                            <button className="lt-action-btn delete" onClick={() => handleDeleteNote(note.id)} title="Delete Note">
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ margin: 0 }}>Create New Note</h2>
                    <button 
                      onClick={() => {
                        setIsCreatingNote(false);
                        setNoteTitle('');
                        setNoteContent('');
                      }}
                      style={{
                        background: 'transparent',
                        border: '1.5px solid #cbd5e1',
                        color: '#64748b',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleAddNote} className="lt-form">
                    <input 
                      type="text" 
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Note Title (e.g. React Hooks)"
                      className="lt-input"
                      required
                      style={{ padding: '12px 16px', fontSize: '15px' }}
                    />
                    <div style={{ position: 'relative', width: '100%' }}>
                      <textarea 
                        value={noteContent}
                        onChange={(e) => {
                          setNoteContent(e.target.value);
                          // Auto expand height slightly, but maintain min-height
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.max(280, e.target.scrollHeight)}px`;
                        }}
                        placeholder="Type your notes here... (Support up to 500 words)"
                        className="lt-textarea"
                        required
                        style={{ 
                          minHeight: '280px', 
                          resize: 'none', 
                          overflowY: 'auto',
                          lineHeight: '1.6',
                          padding: '16px'
                        }}
                      />
                      <div style={{
                        textAlign: 'right',
                        fontSize: '12px',
                        color: getWordCount(noteContent) > 500 ? '#ef4444' : '#6b7280',
                        marginTop: '6px',
                        fontWeight: getWordCount(noteContent) > 500 ? 'bold' : 'normal'
                      }}>
                        {getWordCount(noteContent)} / 500 words
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button 
                        type="submit" 
                        className="lt-submit-btn" 
                        disabled={getWordCount(noteContent) > 500}
                        style={{ 
                          flex: 1, 
                          padding: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px',
                          opacity: getWordCount(noteContent) > 500 ? 0.5 : 1, 
                          cursor: getWordCount(noteContent) > 500 ? 'not-allowed' : 'pointer' 
                        }}
                      >
                        <FiPlus /> Save Note
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* 3. Bookmarks Section */}
          {activeTab === 'bookmarks' && (
            <div className="lt-panel-card">
              <h2>Resource Bookmarks</h2>
              <form onSubmit={handleAddBookmark} className="lt-form-row">
                <input 
                  type="text" 
                  value={bmTitle} 
                  onChange={(e) => setBmTitle(e.target.value)} 
                  placeholder="Title (e.g. MDN Flexbox)"
                  className="lt-input"
                  required 
                />
                <input 
                  type="text" 
                  value={bmUrl} 
                  onChange={(e) => setBmUrl(e.target.value)} 
                  placeholder="URL (e.g. developer.mozilla.org)"
                  className="lt-input"
                  required 
                />
                <button type="submit" className="lt-submit-btn"><FiPlus /> Bookmark</button>
              </form>

              <div className="lt-bookmarks-list">
                {bookmarks.length === 0 ? (
                  <p className="lt-empty-msg">No bookmarks added yet.</p>
                ) : (
                  bookmarks.map(bm => (
                    <div key={bm.id} className="lt-bookmark-row">
                      <div className="lt-bm-details">
                        <FiBookmark className="lt-bm-icon" />
                        <span className="lt-bm-title">{bm.title}</span>
                        <a href={bm.url} target="_blank" rel="noreferrer" className="lt-bm-link">{bm.url}</a>
                      </div>
                      <button className="lt-delete-btn" onClick={() => handleDeleteBookmark(bm.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. Completed Topics Section */}
          {activeTab === 'topics' && (
            <div className="lt-panel-card">
              <h2>Topic Progression</h2>
              <form onSubmit={handleAddTopic} className="lt-form-row">
                <input 
                  type="text" 
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Add new topic..."
                  className="lt-input"
                  required
                />
                <button type="submit" className="lt-submit-btn"><FiPlus /> Add Topic</button>
              </form>

              <div className="lt-topics-list">
                {topics.map(topic => (
                  <div key={topic.id} className="lt-topic-row">
                    <label className="lt-topic-label">
                      <input 
                        type="checkbox" 
                        checked={topic.completed} 
                        onChange={() => handleToggleTopic(topic.id)} 
                        className="lt-checkbox"
                      />
                      <span className={topic.completed ? 'completed' : ''}>{topic.title}</span>
                    </label>
                    <button className="lt-delete-btn" onClick={() => handleDeleteTopic(topic.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Revision Reminders Section */}
          {activeTab === 'reminders' && (
            <div className="lt-panel-card">
              <h2>Revision Reminders</h2>
              <p className="panel-desc">Set an alarm alert to receive email notifications when it is time to revise a topic.</p>
              <form onSubmit={handleAddReminder} className="lt-form-row">
                <input 
                  type="text" 
                  value={remTopic}
                  onChange={(e) => setRemTopic(e.target.value)}
                  placeholder="Topic to revise..."
                  className="lt-input"
                  required
                />
                <input 
                  type="date" 
                  value={remDate}
                  onChange={(e) => setRemDate(e.target.value)}
                  className="lt-input"
                  required
                  style={{ minWidth: '150px' }}
                />
                <select 
                  value={remHour} 
                  onChange={(e) => setRemHour(e.target.value)}
                  className="lt-input"
                  style={{ minWidth: '70px', padding: '10px' }}
                >
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <select 
                  value={remMinute} 
                  onChange={(e) => setRemMinute(e.target.value)}
                  className="lt-input"
                  style={{ minWidth: '70px', padding: '10px' }}
                >
                  {Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select 
                  value={remAmPm} 
                  onChange={(e) => setRemAmPm(e.target.value)}
                  className="lt-input"
                  style={{ minWidth: '70px', padding: '10px' }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
                <button type="submit" className="lt-submit-btn"><FiBell /> Set Alarm</button>
              </form>

              <div className="lt-reminders-list">
                {reminders.length === 0 ? (
                  <p className="lt-empty-msg">No reminders scheduled.</p>
                ) : (
                  reminders.map(rem => (
                    <div key={rem.id} className="lt-reminder-row">
                      <div className="lt-rem-info">
                        <FiClock />
                        <strong>{rem.topic}</strong>
                        <span>scheduled at: {formatIndianTime(rem.time)}</span>
                      </div>
                      <button className="lt-delete-btn" onClick={() => handleDeleteReminder(rem.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LearningTracker;
