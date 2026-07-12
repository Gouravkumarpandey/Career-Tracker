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
  const [remTime, setRemTime] = useState('');

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

  // 2. Notes handlers
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: noteContent,
      date: new Date().toLocaleDateString()
    };
    saveNotesToStore([newNote, ...notes]);
    setNoteTitle('');
    setNoteContent('');
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
    if (!remTopic.trim() || !remTime) return;

    try {
      const token = localStorage.getItem('token');
      await api.post('/api/calendar-events', {
        title: `Revision: ${remTopic}`,
        type: 'reminder',
        eventDate: new Date(remTime),
        sendEmail: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchReminders();
      setRemTopic('');
      setRemTime('');
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
      <h1 className="page-heading">Learning Tracker</h1>

      {/* Grid Menu */}
      <div className="lt-grid-layout">
        <div className="lt-sidebar-menu">
          <button className={`lt-menu-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <FiSearch /> Courses Search
          </button>
          <button className={`lt-menu-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            <FiFileText /> Study Notes
          </button>
          <button className={`lt-menu-btn ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>
            <FiBookmark /> Resource Bookmarks
          </button>
          <button className={`lt-menu-btn ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')}>
            <FiCheckSquare /> Topic Progression
          </button>
          <button className={`lt-menu-btn ${activeTab === 'reminders' ? 'active' : ''}`} onClick={() => setActiveTab('reminders')}>
            <FiClock /> Revision Reminders
          </button>
        </div>

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
              <h2>Study Notes</h2>
              <form onSubmit={handleAddNote} className="lt-form">
                <input 
                  type="text" 
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title (e.g. React Hooks)"
                  className="lt-input"
                  required
                />
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your notes here..."
                  className="lt-textarea"
                  rows="4"
                  required
                />
                <button type="submit" className="lt-submit-btn"><FiPlus /> Save Note</button>
              </form>

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
                      <p>{note.content}</p>
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
                  type="datetime-local" 
                  value={remTime}
                  onChange={(e) => setRemTime(e.target.value)}
                  className="lt-input"
                  required
                />
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
                        <span>scheduled at: {new Date(rem.time).toLocaleString()}</span>
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
