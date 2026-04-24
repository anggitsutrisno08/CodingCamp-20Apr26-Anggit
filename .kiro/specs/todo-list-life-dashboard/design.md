# Design Document

## Architecture Overview

The To-Do List Life Dashboard is a single-page web application built with vanilla JavaScript, HTML, and CSS. The architecture follows a simple client-side MVC-like pattern with no framework dependencies.

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│                  (View Layer)                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   js/app.js                             │
│              (Controller + Model)                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  TimeModule                                      │  │
│  │  - getCurrentTime()                              │  │
│  │  - getCurrentDate()                              │  │
│  │  - getGreeting()                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  TimerModule                                     │  │
│  │  - start()                                       │  │
│  │  - stop()                                        │  │
│  │  - reset()                                       │  │
│  │  - tick()                                        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  TaskModule                                      │  │
│  │  - addTask(text)                                 │  │
│  │  - editTask(id, text)                            │  │
│  │  - toggleTask(id)                                │  │
│  │  - deleteTask(id)                                │  │
│  │  - loadTasks()                                   │  │
│  │  - saveTasks()                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  QuickLinkModule                                 │  │
│  │  - addLink(name, url)                            │  │
│  │  - deleteLink(id)                                │  │
│  │  - loadLinks()                                   │  │
│  │  - saveLinks()                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  StorageModule                                   │  │
│  │  - save(key, data)                               │  │
│  │  - load(key)                                     │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Browser LocalStorage                    │
│                  (Persistence)                          │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Initialization**: On page load, the app loads tasks and quick links from LocalStorage
2. **User Interaction**: User actions trigger module functions
3. **State Update**: Modules update in-memory state
4. **Persistence**: Changes are saved to LocalStorage
5. **View Update**: DOM is updated to reflect new state

## Component Design

### 1. TimeModule

**Purpose**: Manages time display and greeting logic

**Data Structures**:
```javascript
// No persistent state - uses Date API
```

**Key Functions**:

- `getCurrentTime()`: Returns formatted current time string (HH:MM:SS)
- `getCurrentDate()`: Returns formatted current date string (Day, Month DD, YYYY)
- `getGreeting()`: Returns greeting string based on current hour
  - 5:00-11:59 → "Good Morning"
  - 12:00-16:59 → "Good Afternoon"
  - 17:00-20:59 → "Good Evening"
  - 21:00-4:59 → "Good Night"
- `updateDisplay()`: Updates DOM elements with current time, date, and greeting

**Update Strategy**: Uses `setInterval()` to update every 1000ms

### 2. TimerModule

**Purpose**: Manages 25-minute focus timer

**Data Structures**:
```javascript
{
  totalSeconds: 1500,        // 25 minutes in seconds
  remainingSeconds: 1500,    // Current countdown value
  isRunning: false,          // Timer state
  intervalId: null           // Reference to setInterval
}
```

**Key Functions**:

- `start()`: Begins countdown, sets `isRunning = true`, starts interval
- `stop()`: Pauses countdown, sets `isRunning = false`, clears interval
- `reset()`: Resets `remainingSeconds` to 1500, stops timer
- `tick()`: Decrements `remainingSeconds`, updates display, stops at zero
- `formatTime(seconds)`: Converts seconds to MM:SS format
- `updateDisplay()`: Updates DOM with formatted time

**State Transitions**:
```
[Idle: 25:00] --start()--> [Running] --stop()--> [Paused]
     ↑                         |                      |
     |                    tick() to 0:00         start()
     |                         |                      |
     +--------reset()----------+--------reset()-------+
```

### 3. TaskModule

**Purpose**: Manages to-do list operations

**Data Structures**:
```javascript
{
  tasks: [
    {
      id: "uuid-string",      // Unique identifier
      text: "Task description",
      completed: false         // Completion status
    }
  ]
}
```

**Key Functions**:

- `addTask(text)`: Creates new task with unique ID, adds to array, saves, renders
  - Validates: text must be non-empty after trim
- `editTask(id, text)`: Updates task text, saves, renders
  - Validates: text must be non-empty after trim
- `toggleTask(id)`: Flips `completed` status, saves, renders
- `deleteTask(id)`: Removes task from array, saves, renders
- `loadTasks()`: Retrieves tasks from LocalStorage, parses JSON
- `saveTasks()`: Serializes tasks to JSON, stores in LocalStorage
- `renderTasks()`: Updates DOM with current task list

**ID Generation**: Use `crypto.randomUUID()` or timestamp-based fallback

### 4. QuickLinkModule

**Purpose**: Manages favorite website links

**Data Structures**:
```javascript
{
  links: [
    {
      id: "uuid-string",      // Unique identifier
      name: "Link Name",
      url: "https://example.com"
    }
  ]
}
```

**Key Functions**:

- `addLink(name, url)`: Creates new link with unique ID, adds to array, saves, renders
  - Validates: name and url must be non-empty after trim
- `deleteLink(id)`: Removes link from array, saves, renders
- `loadLinks()`: Retrieves links from LocalStorage, parses JSON
- `saveLinks()`: Serializes links to JSON, stores in LocalStorage
- `renderLinks()`: Updates DOM with current link list
- `openLink(url)`: Opens URL in new tab using `window.open(url, '_blank')`

### 5. StorageModule

**Purpose**: Abstracts LocalStorage operations

**Key Functions**:

- `save(key, data)`: Serializes data to JSON, stores with key
- `load(key)`: Retrieves data by key, parses JSON, returns null if not found

**Error Handling**: Catches JSON parse errors, returns null on failure

## File Structure

```
todo-list-life-dashboard/
├── index.html           # Main HTML file
├── css/
│   └── styles.css       # All styles
└── js/
    └── app.js           # All JavaScript logic
```

## DOM Structure

```html
<body>
  <div class="container">
    <!-- Time and Greeting Section -->
    <section class="time-section">
      <div id="greeting"></div>
      <div id="current-time"></div>
      <div id="current-date"></div>
    </section>

    <!-- Focus Timer Section -->
    <section class="timer-section">
      <h2>Focus Timer</h2>
      <div id="timer-display">25:00</div>
      <div class="timer-controls">
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
      </div>
    </section>

    <!-- To-Do List Section -->
    <section class="todo-section">
      <h2>To-Do List</h2>
      <form id="task-form">
        <input type="text" id="task-input" placeholder="Add a new task...">
        <button type="submit">Add</button>
      </form>
      <ul id="task-list"></ul>
    </section>

    <!-- Quick Links Section -->
    <section class="links-section">
      <h2>Quick Links</h2>
      <form id="link-form">
        <input type="text" id="link-name" placeholder="Link name">
        <input type="text" id="link-url" placeholder="URL">
        <button type="submit">Add Link</button>
      </form>
      <div id="links-container"></div>
    </section>
  </div>
</body>
```

## Event Handling

### Task List Events
- Form submit: Add new task
- Checkbox click: Toggle task completion
- Edit button click: Enter edit mode
- Edit form submit: Save edited task
- Delete button click: Remove task

### Timer Events
- Start button click: Begin countdown
- Stop button click: Pause countdown
- Reset button click: Reset to 25:00

### Quick Links Events
- Form submit: Add new link
- Link button click: Open URL in new tab
- Delete button click: Remove link

## Styling Approach

- **Layout**: Flexbox for responsive layout
- **Typography**: System fonts for fast loading
- **Colors**: Simple, clean color scheme
- **Responsive**: Mobile-first approach with media queries
- **Visual Feedback**: Hover states, transitions for smooth interactions
- **Completed Tasks**: Strike-through text, reduced opacity

## Browser Compatibility Strategy

- Use standard ES6+ features supported in target browsers (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Avoid experimental APIs
- Use `crypto.randomUUID()` with fallback for ID generation
- Test LocalStorage availability before use

## Performance Considerations

- **Minimal DOM Updates**: Only update changed elements
- **Debouncing**: Not needed for current interactions
- **LocalStorage Limits**: Typical limit is 5-10MB, sufficient for this use case
- **Timer Precision**: 1-second intervals are sufficient for focus timer

## Error Handling

- **LocalStorage Unavailable**: Display error message, continue with in-memory state
- **JSON Parse Errors**: Log error, return empty array/object
- **Invalid Input**: Validate before processing, provide visual feedback
- **Timer Edge Cases**: Handle rapid start/stop clicks, prevent negative time

## Correctness Properties

### Property 1: Time Display Accuracy
**Requirement**: Requirement 1 (Display Current Time and Date)

**Property**: The displayed time and date SHALL always reflect the current system time within 1 second accuracy

**Test Strategy**: Example-based test
- Verify time format matches expected pattern (HH:MM:SS)
- Verify date format matches expected pattern
- Verify display updates within 1 second

**Rationale**: Time display is deterministic based on system clock, not suitable for property-based testing

---

### Property 2: Greeting Time Boundaries
**Requirement**: Requirement 2 (Show Time-Based Greeting)

**Property**: FOR ALL hours h in [0, 23], getGreeting(h) SHALL return exactly one greeting that matches the time range containing h

**Test Strategy**: Property-based test
- Generate random hours (0-23)
- Verify greeting matches expected range:
  - 5 ≤ h ≤ 11 → "Good Morning"
  - 12 ≤ h ≤ 16 → "Good Afternoon"
  - 17 ≤ h ≤ 20 → "Good Evening"
  - 21 ≤ h ≤ 23 OR 0 ≤ h ≤ 4 → "Good Night"

**Rationale**: Boundary conditions are critical; property-based testing will explore edge cases

---

### Property 3: Timer Countdown Invariant
**Requirement**: Requirement 3 (Focus Timer Countdown)

**Property**: FOR ALL timer states, 0 ≤ remainingSeconds ≤ 1500 SHALL hold true

**Test Strategy**: Property-based test
- Generate random sequences of start/stop/reset/tick operations
- Verify remainingSeconds never goes negative
- Verify remainingSeconds never exceeds 1500
- Verify timer stops at zero

**Rationale**: State machine with clear invariants; property-based testing ensures state consistency

---

### Property 4: Timer State Transitions
**Requirement**: Requirement 3 (Focus Timer Countdown)

**Property**: Timer state transitions SHALL follow valid state machine rules:
- start() when isRunning=false → isRunning=true
- stop() when isRunning=true → isRunning=false
- reset() → remainingSeconds=1500, isRunning=false
- tick() when isRunning=true → remainingSeconds decrements by 1

**Test Strategy**: Property-based test
- Generate random sequences of timer operations
- Verify state transitions are valid
- Verify no invalid state combinations occur

**Rationale**: State machine correctness is critical; property-based testing explores operation sequences

---

### Property 5: Task Input Validation
**Requirement**: Requirement 4 (Add Tasks to To-Do List)

**Property**: FOR ALL input strings s, addTask(s) SHALL add a task IF AND ONLY IF s.trim() is non-empty

**Test Strategy**: Property-based test
- Generate random strings (empty, whitespace, valid text, special characters)
- Verify empty/whitespace strings do not create tasks
- Verify non-empty strings create exactly one task
- Verify task count increases by 1 for valid inputs

**Rationale**: Input validation is critical; property-based testing explores edge cases (whitespace, special chars)

---

### Property 6: Task Edit Validation
**Requirement**: Requirement 5 (Edit Existing Tasks)

**Property**: FOR ALL task IDs and input strings, editTask(id, text) SHALL update the task IF AND ONLY IF text.trim() is non-empty

**Test Strategy**: Property-based test
- Generate random task IDs and edit strings
- Verify empty/whitespace strings do not update tasks
- Verify valid strings update task text
- Verify original text is preserved when edit is rejected

**Rationale**: Edit validation mirrors add validation; property-based testing ensures consistency

---

### Property 7: Task Completion Toggle Idempotence
**Requirement**: Requirement 6 (Mark Tasks as Complete)

**Property**: FOR ALL tasks, toggleTask(toggleTask(task)) SHALL return task to original completion state

**Test Strategy**: Property-based test
- Generate random tasks with random completion states
- Apply toggle twice
- Verify completion state returns to original

**Rationale**: Toggle operations must be reversible; property-based testing verifies idempotence

---

### Property 8: Task Persistence Round-Trip
**Requirement**: Requirement 8 (Persist Tasks in Local Storage)

**Property**: FOR ALL valid task arrays, load(save(tasks)) SHALL equal tasks (round-trip property)

**Test Strategy**: Property-based test
- Generate random task arrays (various sizes, text content, completion states)
- Save to storage, then load
- Verify loaded data matches original
- Verify task IDs, text, and completion status are preserved

**Rationale**: Serialization/deserialization must preserve data; round-trip testing is essential for parsers/serializers

---

### Property 9: Task List Size After Delete
**Requirement**: Requirement 7 (Delete Tasks)

**Property**: FOR ALL task lists with n tasks, deleteTask(validId) SHALL result in a list with n-1 tasks

**Test Strategy**: Property-based test
- Generate random task lists
- Delete random valid task
- Verify list size decreases by exactly 1
- Verify correct task was removed

**Rationale**: Delete operations must maintain list integrity; property-based testing verifies invariants

---

### Property 10: Quick Link Input Validation
**Requirement**: Requirement 9 (Add Quick Links)

**Property**: FOR ALL name and url strings, addLink(name, url) SHALL add a link IF AND ONLY IF name.trim() and url.trim() are both non-empty

**Test Strategy**: Property-based test
- Generate random name/url combinations (empty, whitespace, valid)
- Verify links are added only when both are non-empty
- Verify link count increases by 1 for valid inputs

**Rationale**: Input validation with two fields; property-based testing explores combinations

---

### Property 11: Quick Link Persistence Round-Trip
**Requirement**: Requirement 12 (Persist Quick Links in Local Storage)

**Property**: FOR ALL valid link arrays, load(save(links)) SHALL equal links (round-trip property)

**Test Strategy**: Property-based test
- Generate random link arrays (various sizes, names, URLs)
- Save to storage, then load
- Verify loaded data matches original
- Verify link IDs, names, and URLs are preserved

**Rationale**: Serialization/deserialization must preserve data; round-trip testing is essential

---

### Property 12: UI Response Time
**Requirement**: Requirement 13 (Responsive User Interface)

**Property**: FOR ALL user interactions, the UI SHALL respond within 100 milliseconds

**Test Strategy**: Example-based test with timing measurements
- Measure time for add/edit/delete/toggle operations
- Verify all operations complete within 100ms
- Test on target browsers

**Rationale**: Performance testing requires real timing measurements, not suitable for property-based testing

---

### Property 13: Initial Load Time
**Requirement**: Requirement 13 (Responsive User Interface)

**Property**: The Dashboard SHALL display the initial interface within 1 second of page load

**Test Strategy**: Example-based test with timing measurements
- Measure DOMContentLoaded to first paint
- Verify load time < 1000ms
- Test with various LocalStorage data sizes

**Rationale**: Load time is a single measurement, not suitable for property-based testing

---

### Property 14: Browser Compatibility
**Requirement**: Requirement 14 (Browser Compatibility)

**Property**: All functionality SHALL work correctly in Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

**Test Strategy**: Example-based cross-browser testing
- Run functional tests in each target browser
- Verify all features work as expected
- Check for console errors

**Rationale**: Browser compatibility requires actual browser testing, not suitable for property-based testing

---

### Property 15: File Structure Compliance
**Requirement**: Requirement 15 (Single File Architecture)

**Property**: The codebase SHALL contain exactly one HTML file, one CSS file in css/, and one JS file in js/

**Test Strategy**: Example-based test
- Verify file structure matches specification
- Verify no additional files exist

**Rationale**: File structure is a static property, not suitable for property-based testing

---

## Summary of Test Strategy

**Property-Based Tests** (11 properties):
- Greeting time boundaries
- Timer countdown invariant
- Timer state transitions
- Task input validation
- Task edit validation
- Task completion toggle
- Task persistence round-trip
- Task list size after delete
- Quick link input validation
- Quick link persistence round-trip

**Example-Based Tests** (4 properties):
- Time display accuracy
- UI response time
- Initial load time
- Browser compatibility
- File structure compliance

**Total Coverage**: 15 correctness properties covering all 15 requirements
