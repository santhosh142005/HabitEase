document.addEventListener('DOMContentLoaded', () => {

    // Dark Mode Toggle
    function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    }
  
    // Expose to global so HTML onclick works
    window.toggleDarkMode = toggleDarkMode;
  
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
    }
  
    // Modal Handling
    const modal = document.getElementById('auth-modal');
    const authTitle = document.getElementById('auth-title');
  
    window.toggleSign = function(type) {
      authTitle.textContent = type === 'signin' ? 'Sign In' : 'Sign Up';
      modal.style.display = 'flex';
    }
  
    window.closeModal = function() {
      modal.style.display = 'none';
    }
  
    window.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  
    // Login/Logout UI
    let loggedInUser = localStorage.getItem('loggedInUser') || null;
    const authButtons = document.querySelector('.auth-buttons');
  
    function updateAuthUI() {
      if (loggedInUser) {
        authButtons.innerHTML = `<span>Welcome, ${loggedInUser}</span> <button id="logout-btn">Log Out</button>`;
        document.getElementById('logout-btn').addEventListener('click', logout);
      } else {
        authButtons.innerHTML = `
          <button onclick="toggleSign('signin')">Sign In</button>
          <button onclick="toggleSign('signup')">Sign Up</button>
        `;
      }
    }
    updateAuthUI();
  
    modal.querySelector('button').onclick = () => {
      const emailInput = modal.querySelector('input[type="email"]');
      const passwordInput = modal.querySelector('input[type="password"]');
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (email && password) {
        loggedInUser = email.split('@')[0];
        localStorage.setItem('loggedInUser', loggedInUser);
        updateAuthUI();
        closeModal();
        emailInput.value = '';
        passwordInput.value = '';
        alert(`${authTitle.textContent} successful!`);
      } else {
        alert('Please enter email and password.');
      }
    };
  
    function logout() {
      loggedInUser = null;
      localStorage.removeItem('loggedInUser');
      updateAuthUI();
    }
    window.logout = logout;
  
    // Habit Tracker
    const form = document.getElementById('habit-form');
    const habitInput = document.getElementById('habit-input');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const alarmToggle = document.getElementById('alarm-toggle');
    const habitList = document.getElementById('habit-list');
  
    let habits = JSON.parse(localStorage.getItem('habits')) || [];
  
    function saveHabits() {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  
    function renderHabits() {
      habitList.innerHTML = '';
      const today = new Date();
      habits.forEach((habit, index) => {
        const li = document.createElement('li');
        li.className = habit.done ? 'completed' : '';
  
        const start = new Date(habit.startDate);
        const end = new Date(habit.endDate);
        const isActive = today >= start && today <= end;
  
        let alarmMsg = '';
        if (habit.alarm && isActive && !habit.done) {
          alarmMsg = '<span class="reminder">Reminder: Time to do this habit!</span>';
        }
  
        li.innerHTML = `
          <span>${habit.name}</span>
          <div style="display:flex; flex-direction: column; gap: 4px;">
            <span>From: ${habit.startDate} To: ${habit.endDate}</span>
            ${alarmMsg}
            <div>
              <button data-index="${index}" class="toggle-btn">${habit.done ? 'Undo' : 'Done'}</button>
              <button data-index="${index}" class="delete-btn">Delete</button>
            </div>
          </div>
        `;
        habitList.appendChild(li);
      });
  
      // Attach event listeners after render
      habitList.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.onclick = e => {
          toggleHabit(+e.target.dataset.index);
        }
      });
      habitList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = e => {
          deleteHabit(+e.target.dataset.index);
        }
      });
    }
  
    function toggleHabit(index) {
      habits[index].done = !habits[index].done;
      saveHabits();
      renderHabits();
    }
  
    function deleteHabit(index) {
      habits.splice(index, 1);
      saveHabits();
      renderHabits();
    }
  
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = habitInput.value.trim();
      const startDate = startDateInput.value;
      const endDate = endDateInput.value;
      const alarm = alarmToggle.checked;
  
      if (!name || !startDate || !endDate) {
        alert('Please fill in all fields.');
        return;
      }
      if (new Date(endDate) < new Date(startDate)) {
        alert('End date must be after start date.');
        return;
      }
  
      habits.push({ name, startDate, endDate, alarm, done: false });
      habitInput.value = '';
      startDateInput.value = '';
      endDateInput.value = '';
      alarmToggle.checked = false;
      saveHabits();
      renderHabits();
    });
  
    renderHabits();
  
    // Yearly Calendar
    const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventForm = document.getElementById('event-form');
    const eventText = document.getElementById('event-text');
    const saveEventBtn = document.getElementById('save-event');
    const deleteEventBtn = document.getElementById('delete-event');
    const cancelEventBtn = document.getElementById('cancel-event');
  
    let currentDate = new Date();
    let selectedDateKey = null;
  
    function formatDateKey(date) {
      return date.toISOString().split('T')[0]; // yyyy-mm-dd
    }
  
    function loadEvents() {
      const events = localStorage.getItem('calendarEvents');
      return events ? JSON.parse(events) : {};
    }
  
    function saveEvents(events) {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
  
    function renderCalendar() {
      calendarDays.innerHTML = '';
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
  
      monthYear.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  
      for (let i = 0; i < firstDayOfMonth; i++) {
        const blank = document.createElement('div');
        calendarDays.appendChild(blank);
      }
  
      const events = loadEvents();
  
      for (let day = 1; day <= totalDaysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dateKey = formatDateKey(dateObj);
  
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
  
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = day;
        dayDiv.appendChild(dayNumber);
  
        const eventsList = document.createElement('div');
        eventsList.classList.add('events-list');
  
        if (events[dateKey]) {
          events[dateKey].forEach(evt => {
            const evtSpan = document.createElement('span');
            evtSpan.textContent = `• ${evt}`;
            eventsList.appendChild(evtSpan);
            eventsList.appendChild(document.createElement('br'));
          });
        }
        dayDiv.appendChild(eventsList);
  
        dayDiv.addEventListener('click', () => {
          selectedDateKey = dateKey;
          eventText.value = events[dateKey] ? events[dateKey][0] : '';
          eventForm.classList.remove('hidden');
          deleteEventBtn.classList.toggle('hidden', !events[dateKey]);
        });
  
        calendarDays.appendChild(dayDiv);
      }
    }
  
    prevMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
  
    nextMonthBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  
    saveEventBtn.addEventListener('click', () => {
      if (!selectedDateKey) return alert('Select a date first');
      const text = eventText.value.trim();
      if (!text) return alert('Enter event title');
  
      const events = loadEvents();
      if (!events[selectedDateKey]) events[selectedDateKey] = [];
      events[selectedDateKey].unshift(text);
      saveEvents(events);
      eventForm.classList.add('hidden');
      eventText.value = '';
      renderCalendar();
    });
  
    deleteEventBtn.addEventListener('click', () => {
      if (!selectedDateKey) return;
      const events = loadEvents();
      if (events[selectedDateKey]) {
        events[selectedDateKey].shift();
        if (events[selectedDateKey].length === 0) {
          delete events[selectedDateKey];
        }
        saveEvents(events);
        eventForm.classList.add('hidden');
        eventText.value = '';
        renderCalendar();
      }
    });
  
    cancelEventBtn.addEventListener('click', () => {
      eventForm.classList.add('hidden');
      eventText.value = '';
      selectedDateKey = null;
    });
  
    renderCalendar();
  
  });
  