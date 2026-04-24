// ============================================================================
// StorageModule - Abstracts LocalStorage operations
// ============================================================================

const StorageModule = (() => {
    /**
     * Save data to LocalStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to store (will be JSON serialized)
     */
    function save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`Failed to save to LocalStorage (key: ${key}):`, error);
        }
    }

    /**
     * Load data from LocalStorage
     * @param {string} key - Storage key
     * @returns {*} Parsed data or null if not found or error
     */
    function load(key) {
        try {
            const serialized = localStorage.getItem(key);
            if (serialized === null) {
                return null;
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error(`Failed to load from LocalStorage (key: ${key}):`, error);
            return null;
        }
    }

    return {
        save,
        load
    };
})();

// ============================================================================
// TimeModule - Manages time display and greeting logic
// ============================================================================

const TimeModule = (() => {
    let intervalId = null;

    /**
     * Get current time in HH:MM:SS format
     * @returns {string} Formatted time string
     */
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Get current date in "Day, Month DD, YYYY" format
     * @returns {string} Formatted date string
     */
    function getCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return now.toLocaleDateString('en-US', options);
    }

    /**
     * Get time-based greeting
     * @returns {string} Greeting message
     */
    function getGreeting() {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 5 && hour <= 11) {
            return 'Good Morning';
        } else if (hour >= 12 && hour <= 16) {
            return 'Good Afternoon';
        } else if (hour >= 17 && hour <= 20) {
            return 'Good Evening';
        } else {
            return 'Good Night';
        }
    }

    /**
     * Update DOM elements with current time, date, and greeting
     */
    function updateDisplay() {
        const greetingEl = document.getElementById('greeting');
        const timeEl = document.getElementById('current-time');
        const dateEl = document.getElementById('current-date');

        if (greetingEl) greetingEl.textContent = getGreeting();
        if (timeEl) timeEl.textContent = getCurrentTime();
        if (dateEl) dateEl.textContent = getCurrentDate();
    }

    /**
     * Start the time update interval
     */
    function start() {
        updateDisplay(); // Initial update
        intervalId = setInterval(updateDisplay, 1000);
    }

    /**
     * Stop the time update interval
     */
    function stop() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    return {
        getCurrentTime,
        getCurrentDate,
        getGreeting,
        updateDisplay,
        start,
        stop
    };
})();

// ============================================================================
// TimerModule - Manages 25-minute focus timer
// ============================================================================

const TimerModule = (() => {
    let totalSeconds = 1500; // 25 minutes

    let state = {
        totalSeconds: totalSeconds,
        remainingSeconds: totalSeconds,
        isRunning: false,
        intervalId: null
    };
    function setTime(minutes) {
    stop();

    totalSeconds = minutes * 60;
    state.totalSeconds = totalSeconds;
    state.remainingSeconds = totalSeconds;

    updateDisplay();
}
    /**
     * Format seconds to MM:SS
     * @param {number} seconds - Seconds to format
     * @returns {string} Formatted time string
     */
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    /**
     * Update timer display in DOM
     */
    function updateDisplay() {
        const displayEl = document.getElementById('timer-display');
        if (displayEl) {
            displayEl.textContent = formatTime(state.remainingSeconds);
        }
    }

    /**
     * Decrement timer by one second
     */
    function tick() {
        if (state.remainingSeconds > 0) {
            state.remainingSeconds--;
            updateDisplay();
        }

        if (state.remainingSeconds === 0) {
            stop();
        }
    }

    /**
     * Start the timer countdown
     */
    function start() {
        if (!state.isRunning) {
            state.isRunning = true;
            state.intervalId = setInterval(tick, 1000);
        }
    }

    /**
     * Stop (pause) the timer countdown
     */
    function stop() {
        if (state.isRunning) {
            state.isRunning = false;
            if (state.intervalId) {
                clearInterval(state.intervalId);
                state.intervalId = null;
            }
        }
    }

    /**
     * Reset timer to 25 minutes
     */
    function reset() {
        stop();
        state.remainingSeconds = TOTAL_SECONDS;
        updateDisplay();
    }

    /**
     * Get current timer state (for testing)
     */
    function getState() {
        return { ...state };
    }

    return {
        start,
        stop,
        reset,
        formatTime,
        updateDisplay,
        getState,
        setTime 
    };
})();

// ============================================================================
// TaskModule - Manages to-do list operations
// ============================================================================

const TaskModule = (() => {
    const STORAGE_KEY = 'dashboard_tasks';
    let tasks = [];

    /**
     * Generate unique ID for tasks
     * @returns {string} Unique identifier
     */
    function generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for older browsers
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Load tasks from LocalStorage
     */
    function loadTasks() {
        const loaded = StorageModule.load(STORAGE_KEY);
        tasks = loaded || [];
    }

    /**
     * Save tasks to LocalStorage
     */
    function saveTasks() {
        StorageModule.save(STORAGE_KEY, tasks);
    }

    /**
     * Add a new task
     * @param {string} text - Task description
     * @returns {boolean} True if task was added
     */
    function addTask(text) {
    const trimmed = text.trim();

    if (trimmed === '') {
        return false;
    }

    //  CEK DUPLIKAT
    if (tasks.some(t => t.text.toLowerCase() === trimmed.toLowerCase())) {
        alert("Task already exists!");
        return false;
    }

    const task = {
        id: generateId(),
        text: trimmed,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    return true;
}



    /**
     * Edit an existing task
     * @param {string} id - Task ID
     * @param {string} text - New task description
     * @returns {boolean} True if task was updated
     */
    function editTask(id, text) {
        const trimmed = text.trim();
        if (trimmed === '') {
            return false;
        }

        const task = tasks.find(t => t.id === id);
        if (task) {
            task.text = trimmed;
            saveTasks();
            renderTasks();
            return true;
        }
        return false;
    }

    /**
     * Toggle task completion status
     * @param {string} id - Task ID
     */
    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    /**
     * Delete a task
     * @param {string} id - Task ID
     */
    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }

    /**
     * Render tasks to DOM
     */
    function renderTasks() {
        const listEl = document.getElementById('task-list');
        if (!listEl) return;

        listEl.innerHTML = '';

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed) {
                li.classList.add('completed');
            }

            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.className = 'task-checkbox';
            checkbox.addEventListener('change', () => toggleTask(task.id));

            // Task text
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = task.text;

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'btn-small btn-edit';
            editBtn.addEventListener('click', () => enterEditMode(task.id, li));

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'btn-small btn-delete';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(textSpan);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);

            listEl.appendChild(li);
        });
    }

    /**
     * Enter edit mode for a task
     * @param {string} id - Task ID
     * @param {HTMLElement} li - List item element
     */
    function enterEditMode(id, li) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        // Create edit form
        const editForm = document.createElement('form');
        editForm.className = 'task-edit-form';

        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = task.text;
        editInput.className = 'task-edit-input';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.textContent = 'Save';
        saveBtn.className = 'btn-small btn-save';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'btn-small btn-cancel';
        cancelBtn.addEventListener('click', () => renderTasks());

        editForm.appendChild(editInput);
        editForm.appendChild(saveBtn);
        editForm.appendChild(cancelBtn);

        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            editTask(id, editInput.value);
        });

        // Replace list item content with edit form
        li.innerHTML = '';
        li.appendChild(editForm);
        editInput.focus();
    }

    /**
     * Get all tasks (for testing)
     */
    function getTasks() {
        return [...tasks];
    }

    return {
        loadTasks,
        saveTasks,
        addTask,
        editTask,
        toggleTask,
        deleteTask,
        renderTasks,
        getTasks
    };
})();

// ============================================================================
// QuickLinkModule - Manages favorite website links
// ============================================================================

const QuickLinkModule = (() => {
    const STORAGE_KEY = 'dashboard_links';
    let links = [];

    /**
     * Generate unique ID for links
     * @returns {string} Unique identifier
     */
    function generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for older browsers
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Load links from LocalStorage
     */
    function loadLinks() {
        const loaded = StorageModule.load(STORAGE_KEY);
        links = loaded || [];
    }

    /**
     * Save links to LocalStorage
     */
    function saveLinks() {
        StorageModule.save(STORAGE_KEY, links);
    }

    /**
     * Add a new quick link
     * @param {string} name - Link name
     * @param {string} url - Link URL
     * @returns {boolean} True if link was added
     */
    function addLink(name, url) {
        const trimmedName = name.trim();
        const trimmedUrl = url.trim();

        if (trimmedName === '' || trimmedUrl === '') {
            return false;
        }

        const link = {
            id: generateId(),
            name: trimmedName,
            url: trimmedUrl
        };

        links.push(link);
        saveLinks();
        renderLinks();
        return true;
    }

    /**
     * Delete a quick link
     * @param {string} id - Link ID
     */
    function deleteLink(id) {
        links = links.filter(l => l.id !== id);
        saveLinks();
        renderLinks();
    }

    /**
     * Open a link in new tab
     * @param {string} url - URL to open
     */
    function openLink(url) {
        window.open(url, '_blank');
    }

    /**
     * Render links to DOM
     */
    function renderLinks() {
        const containerEl = document.getElementById('links-container');
        if (!containerEl) return;

        containerEl.innerHTML = '';

        links.forEach(link => {
            const linkDiv = document.createElement('div');
            linkDiv.className = 'link-item';

            // Link button
            const linkBtn = document.createElement('button');
            linkBtn.textContent = link.name;
            linkBtn.className = 'btn btn-link';
            linkBtn.addEventListener('click', () => openLink(link.url));

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'btn-small btn-delete-link';
            deleteBtn.title = 'Delete link';
            deleteBtn.addEventListener('click', () => deleteLink(link.id));

            linkDiv.appendChild(linkBtn);
            linkDiv.appendChild(deleteBtn);

            containerEl.appendChild(linkDiv);
        });
    }

    /**
     * Get all links (for testing)
     */
    function getLinks() {
        return [...links];
    }

    return {
        loadLinks,
        saveLinks,
        addLink,
        deleteLink,
        openLink,
        renderLinks,
        getLinks
    };
})();

// ============================================================================
// Application Initialization
// ============================================================================

function initializeApp() {
    // Initialize TimeModule
    TimeModule.start();

    // Load and render tasks
    TaskModule.loadTasks();
    TaskModule.renderTasks();

    // Load and render quick links
    QuickLinkModule.loadLinks();
    QuickLinkModule.renderLinks();

    // Timer controls event listeners
    const timerStartBtn = document.getElementById('timer-start');
    const timerStopBtn = document.getElementById('timer-stop');
    const timerResetBtn = document.getElementById('timer-reset');

    if (timerStartBtn) {
        timerStartBtn.addEventListener('click', () => TimerModule.start());
    }
    if (timerStopBtn) {
        timerStopBtn.addEventListener('click', () => TimerModule.stop());
    }
    if (timerResetBtn) {
        timerResetBtn.addEventListener('click', () => TimerModule.reset());
    }

    const setBtn = document.getElementById("set-timer");
const input = document.getElementById("pomodoro-input");

if (setBtn && input) {
    setBtn.addEventListener("click", () => {
        const minutes = parseInt(input.value);

        if (!minutes || minutes <= 0) {
            alert("Enter valid minutes!");
            return;
        }

        TimerModule.setTime(minutes);
        input.value = '';
    });
}
    // Task form event listener
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');

    if (taskForm && taskInput) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = taskInput.value;
            if (TaskModule.addTask(text)) {
                taskInput.value = '';
            }
        });
    }
    // 🌙 DARK MODE TOGGLE
const themeBtn = document.getElementById("toggle-theme");

if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        const mode = document.body.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("theme", mode);
    });
}

// Load saved theme saat pertama buka
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark");
}
    // Quick link form event listener
    const linkForm = document.getElementById('link-form');
    const linkNameInput = document.getElementById('link-name');
    const linkUrlInput = document.getElementById('link-url');

    if (linkForm && linkNameInput && linkUrlInput) {
        linkForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = linkNameInput.value;
            const url = linkUrlInput.value;
            if (QuickLinkModule.addLink(name, url)) {
                linkNameInput.value = '';
                linkUrlInput.value = '';
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
