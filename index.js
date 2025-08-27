/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Type } from '@google/genai';

// --- App DOM Elements ---
const navTabs = document.querySelectorAll('.nav-tab');
const screens = document.querySelectorAll('.screen');
const workoutPlanScreen = document.getElementById('workout-plan');
const noActiveWorkoutPlaceholder = document.getElementById('no-active-workout');
const loader = document.getElementById('loader');
const workoutTitle = document.getElementById('workout-title');
const exercisesContainer = document.getElementById('exercises-container');
const finishWorkoutBtn = document.getElementById('finish-workout-btn');

// Profile Screen
const profileForm = document.getElementById('profile-form');
const savedFeedback = document.querySelector('.saved-feedback');

// History Screen
const workoutsCompletedStat = document.getElementById('workouts-completed-stat');

// Library Screen
const discoverProgramsBtn = document.getElementById('discover-programs-btn');
const programIdeasContainer = document.getElementById('program-ideas-container');
const programIdeasLoader = document.getElementById('program-ideas-loader');
const createNewProgramBtn = document.getElementById('create-new-program-btn');
const customProgramsContainer = document.getElementById('custom-programs-container');
const generateFromIdeaForm = document.getElementById('generate-from-idea-form');
const programIdeaInput = document.getElementById('program-idea-input');

// Create Program Modal
const createProgramModal = document.getElementById('create-program-modal');
const createProgramForm = document.getElementById('create-program-form');
const modalCloseBtn = createProgramModal.querySelector('.modal-close-btn');
const addWorkoutBtn = document.getElementById('add-workout-btn');
const programWorkoutsContainer = document.getElementById('program-workouts-container');
const workoutBlockTemplate = document.getElementById('workout-block-template');
const exerciseBlockTemplate = document.getElementById('exercise-block-template');
const analyzeFileBtn = document.getElementById('analyze-file-btn');
const workoutFileUpload = document.getElementById('workout-file-upload');
const fileAnalysisLoader = document.getElementById('file-analysis-loader');

// Calendar
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthYear = document.getElementById('calendar-month-year');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

// Schedule Modal
const scheduleProgramModal = document.getElementById('schedule-program-modal');
const scheduleProgramForm = document.getElementById('schedule-program-form');
const scheduleModalTitle = document.getElementById('schedule-modal-title');
const scheduleModalCloseBtn = scheduleProgramModal.querySelector('.modal-close-btn');
const scheduleStartDateInput = document.getElementById('schedule-start-date');
const scheduleCalendarGrid = document.getElementById('schedule-calendar-grid');
const scheduleCalendarMonthYear = document.getElementById('schedule-calendar-month-year');
const schedulePrevMonthBtn = document.getElementById('schedule-prev-month-btn');
const scheduleNextMonthBtn = document.getElementById('schedule-next-month-btn');


// Program Details Modal
const programDetailsModal = document.getElementById('program-details-modal');
const detailsModalCloseBtn = programDetailsModal.querySelector('.modal-close-btn');
const detailsModalTitle = document.getElementById('details-modal-title');
const detailsModalDescription = document.getElementById('details-modal-description');
const detailsModalWorkoutsContainer = document.getElementById('details-modal-workouts-container');
const saveDiscoveredProgramBtn = document.getElementById('save-discovered-program-btn');

// Workout Overview Modal
const workoutOverviewModal = document.getElementById('workout-overview-modal');
const overviewModalCloseBtn = workoutOverviewModal.querySelector('.modal-close-btn');
const overviewModalTitle = document.getElementById('overview-modal-title');
const overviewModalContent = document.getElementById('overview-modal-content');
const overviewModalStartBtn = document.getElementById('overview-modal-start-btn');

// Post-Workout Feedback Modal
const postWorkoutFeedbackModal = document.getElementById('post-workout-feedback-modal');
const postWorkoutFeedbackForm = document.getElementById('post-workout-feedback-form');
const feedbackModalCloseBtn = postWorkoutFeedbackModal.querySelector('.modal-close-btn');

// History Modal
const workoutHistoryModal = document.getElementById('workout-history-modal');
const historyModalCloseBtn = workoutHistoryModal.querySelector('.modal-close-btn');
const historyModalTitle = document.getElementById('history-modal-title');
const historyModalDate = document.getElementById('history-modal-date');
const historyModalIntensity = document.getElementById('history-modal-intensity');
const historyModalNotes = document.getElementById('history-modal-notes');
const historyModalExercisesContainer = document.getElementById('history-modal-exercises-container');


// --- Gemini AI Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Formats a Date object into a YYYY-MM-DD string, ignoring timezone.
 * @param {Date} date The date to format.
 * @returns {string} The formatted date string.
 */
function getYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Schemas ---
const programIdeasSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            programName: { type: Type.STRING, description: "A catchy name for the workout program." },
            description: { type: Type.STRING, description: "A short, compelling description of the program." },
            goal: { type: Type.STRING, description: "The primary fitness goal (e.g., 'Muscle Gain', 'Strength')." },
            level: { type: Type.STRING, description: "The target experience level (e.g., 'Beginner', 'Advanced')." }
        },
        required: ["programName", "description", "goal", "level"]
    }
};

const workoutExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        programName: { type: Type.STRING, description: "The name of the entire workout program." },
        description: { type: Type.STRING, description: "A brief description of the program's goals or structure." },
        workouts: {
            type: Type.ARRAY,
            description: "A list of the individual workouts within the program.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the specific workout day (e.g., 'Day 1: Chest & Triceps')." },
                    exercises: {
                        type: Type.ARRAY,
                        description: "A list of exercises for this workout day.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the exercise (e.g., 'Bench Press')." },
                                sets: { type: Type.INTEGER, description: "The number of sets to perform." },
                                metricValue: { type: Type.STRING, description: "The target value for the metric (e.g., '8-12', '500', '1.5')." },
                                metricUnit: { type: Type.STRING, description: "The unit for the metric. Must be one of: 'reps', 'seconds', 'meters', 'feet', 'yards', 'miles'." },
                                description: { type: Type.STRING, description: "Optional notes, tempo, or rest period information for the exercise." }
                            },
                            required: ["name", "sets", "metricValue", "metricUnit"]
                        }
                    }
                },
                required: ["name", "exercises"]
            }
        }
    },
    required: ["programName", "workouts"]
};

let currentWorkout = null;
let calendarDate = new Date();
let scheduleCalendarDate = new Date();
let generatedProgramToSave = null; // Holds AI-generated program data before saving
let dataForWorkoutOverviewModal = null;


// --- User Data Storage Helpers ---

function getUserKey(key) {
    // No user login, so we use a constant prefix for all data.
    return `kinetic_fitness_${key}`;
}

function saveUserData(key, data) {
    localStorage.setItem(getUserKey(key), JSON.stringify(data));
}

function loadUserData(key, defaultValue) {
    const data = localStorage.getItem(getUserKey(key));
    return data ? JSON.parse(data) : defaultValue;
}


// --- Main App Initialization Logic ---

/**
 * Initializes the application.
 * Sets up event listeners and renders user-specific data.
 */
function initializeApp() {
    // Tab navigation
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
    });

    // Load data from localStorage (now using helpers)
    loadProfile();
    renderHistory();
    loadAndRenderCustomPrograms();

    // Event Listeners
    exercisesContainer.addEventListener('click', handleWorkoutInteraction);
    profileForm.addEventListener('input', handleProfileChange);
    finishWorkoutBtn.addEventListener('click', handleFinishWorkout);
    discoverProgramsBtn.addEventListener('click', handleDiscoverPrograms);
    generateFromIdeaForm.addEventListener('submit', handleGenerateFromIdea);
    createNewProgramBtn.addEventListener('click', openCreateProgramModal);
    modalCloseBtn.addEventListener('click', closeCreateProgramModal);
    createProgramForm.addEventListener('submit', handleSaveProgram);
    addWorkoutBtn.addEventListener('click', handleAddWorkoutDay);
    analyzeFileBtn.addEventListener('click', handleAnalyzeFile);
    prevMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar(calendarDate.getFullYear(), calendarDate.getMonth());
    });
    nextMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar(calendarDate.getFullYear(), calendarDate.getMonth());
    });
    scheduleModalCloseBtn.addEventListener('click', closeScheduleModal);
    scheduleProgramForm.addEventListener('submit', handleSaveSchedule);
    schedulePrevMonthBtn.addEventListener('click', () => {
        scheduleCalendarDate.setMonth(scheduleCalendarDate.getMonth() - 1);
        renderScheduleCalendar(scheduleCalendarDate.getFullYear(), scheduleCalendarDate.getMonth());
    });
    scheduleNextMonthBtn.addEventListener('click', () => {
        scheduleCalendarDate.setMonth(scheduleCalendarDate.getMonth() + 1);
        renderScheduleCalendar(scheduleCalendarDate.getFullYear(), scheduleCalendarDate.getMonth());
    });
    detailsModalCloseBtn.addEventListener('click', closeProgramDetailsModal);
    saveDiscoveredProgramBtn.addEventListener('click', handleSaveDiscoveredProgram);
    overviewModalCloseBtn.addEventListener('click', closeWorkoutOverviewModal);
    overviewModalStartBtn.addEventListener('click', handleStartWorkoutFromModal);
    postWorkoutFeedbackForm.addEventListener('submit', handleSaveFeedback);
    feedbackModalCloseBtn.addEventListener('click', () => {
        postWorkoutFeedbackModal.classList.add('hidden');
    });
    historyModalCloseBtn.addEventListener('click', closeWorkoutHistoryModal);

    // Event delegation for dynamic elements
    createProgramModal.addEventListener('click', handleModalClickDelegation);
    customProgramsContainer.addEventListener('click', handleCustomProgramClick);
    calendarGrid.addEventListener('click', handleCalendarClick);
    scheduleCalendarGrid.addEventListener('click', handleScheduleCalendarClick);
    programIdeasContainer.addEventListener('click', handleProgramIdeasClick);
    document.getElementById('todays-training-wrapper')?.addEventListener('click', handleStartScheduledWorkoutClick);
    noActiveWorkoutPlaceholder.addEventListener('click', handleStartScheduledWorkoutClick);
    document.getElementById('history-screen').addEventListener('click', handleHistoryClick);

    // Initial renders
    renderCalendar(calendarDate.getFullYear(), calendarDate.getMonth());
    renderTodaysTraining();
    renderWorkoutScreen();
    switchTab('training');
}

/**
 * Switches the visible screen based on the selected tab.
 * @param {string} tabId The ID of the tab to switch to.
 */
function switchTab(tabId) {
  screens.forEach(screen => {
    screen.classList.toggle('hidden', screen.id !== `${tabId}-screen`);
  });
  navTabs.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
  });
  if (tabId === 'training') {
      renderTodaysTraining();
  }
  if (tabId === 'workout') {
      renderWorkoutScreen();
  }
}

/**
 * Handles clicks within the 'Today's Training' and 'No Active Workout' sections
 * to start a scheduled workout. Uses event delegation.
 * @param {Event} event The click event.
 */
function handleStartScheduledWorkoutClick(event) {
    const target = event.target;
    const startBtn = target.closest('.start-scheduled-workout-btn');
    if (!startBtn) return;

    const { programId, workoutIndex } = startBtn.dataset;
    if (!programId || workoutIndex === undefined) return;

    const programs = loadUserData('customPrograms', []);
    const program = programs.find(p => p.id === programId);
    if (!program) {
        console.error(`Program with ID ${programId} not found.`);
        return;
    }
    
    const workout = program.workouts[parseInt(workoutIndex, 10)];
    if (!workout) {
        console.error(`Workout with index ${workoutIndex} not found in program ${program.name}.`);
        return;
    }
    
    // For these buttons, the scheduled date is always the current date.
    startWorkoutFromProgram(workout, program, getYYYYMMDD(new Date()));
}

/**
 * Formats an exercise metric and unit into a readable string.
 * @param {string} value The metric value (e.g., '10-12', '500').
 * @param {string} unit The metric unit (e.g., 'reps', 'meters').
 * @returns {string} The formatted string (e.g., '10-12 reps', '1 mile').
 */
function formatMetric(value, unit) {
    if (!value || !unit) return '';
    const numericValue = parseFloat(value);
    if (unit === 'miles' && numericValue === 1) {
        return `${value} mile`;
    }
    return `${value} ${unit}`;
}


/**
 * Renders the Workout screen.
 * If a workout is active, shows the ongoing session.
 * If not, shows today's scheduled workout overview or a placeholder.
 */
function renderWorkoutScreen() {
    if (currentWorkout) {
        workoutPlanScreen.classList.remove('hidden');
        noActiveWorkoutPlaceholder.classList.add('hidden');
    } else {
        workoutPlanScreen.classList.add('hidden');
        noActiveWorkoutPlaceholder.classList.remove('hidden');

        const todayString = getYYYYMMDD(new Date());
        const schedule = loadUserData('workoutSchedule', []);
        const scheduledForToday = schedule.filter(w => w.date === todayString);

        // Get today's completed workouts to filter them out
        const history = loadUserData('workoutHistory', []);
        const completedToday = history.filter(h => h.date === todayString && h.completed);

        const todaysWorkouts = scheduledForToday.filter(scheduled => {
            return !completedToday.some(completed =>
                completed.programId === scheduled.programId &&
                completed.workoutIndex === scheduled.workoutIndex
            );
        });

        if (todaysWorkouts.length > 0) {
            const programs = loadUserData('customPrograms', []);
            let contentHTML = '<h2>Today\'s Scheduled Workouts</h2>';

            todaysWorkouts.forEach(todaysWorkoutData => {
                const program = programs.find(p => p.id === todaysWorkoutData.programId);
                const workout = program?.workouts[todaysWorkoutData.workoutIndex];

                if (program && workout) {
                    let exercisesHTML = '';
                    if (workout.exercises && workout.exercises.length > 0) {
                        exercisesHTML = `<ul class="todays-exercise-list">
                            ${workout.exercises.map(ex => `<li><strong>${ex.name}:</strong> ${ex.sets} sets of ${formatMetric(ex.metricValue, ex.metricUnit)}</li>`).join('')}
                        </ul>`;
                    } else {
                        exercisesHTML = `<p>This is a scheduled rest day. Enjoy your recovery!</p>`;
                    }

                    contentHTML += `
                        <div class="todays-training-card">
                            <h3>${program.name}: ${workout.name}</h3>
                            ${exercisesHTML}
                            ${workout.exercises.length > 0 ? `<button class="start-scheduled-workout-btn" data-program-id="${program.id}" data-workout-index="${todaysWorkoutData.workoutIndex}">Start This Workout</button>` : ''}
                        </div>
                    `;
                }
            });
            noActiveWorkoutPlaceholder.innerHTML = contentHTML;
        } else {
            // Check if workouts were scheduled but are all complete
            if (scheduledForToday.length > 0) {
                noActiveWorkoutPlaceholder.innerHTML = `
                    <h2>All Workouts Complete!</h2>
                    <p>You've finished all your scheduled workouts for today. Great job!</p>
                `;
            } else {
                noActiveWorkoutPlaceholder.innerHTML = `
                    <h2>No Workout Scheduled</h2>
                    <p>No workout is scheduled for today. You can start one from the Library tab.</p>
                `;
            }
        }
    }
}


// --- Training Screen Logic ---

function renderTodaysTraining() {
    const wrapper = document.getElementById('todays-training-wrapper');
    if (!wrapper) return;

    const todayString = getYYYYMMDD(new Date());
    const schedule = loadUserData('workoutSchedule', []);
    const todaysScheduledWorkouts = schedule.filter(w => w.date === todayString);

    // Get today's completed workouts to filter them out
    const history = loadUserData('workoutHistory', []);
    const completedToday = history.filter(h => h.date === todayString && h.completed);

    const todaysWorkouts = todaysScheduledWorkouts.filter(scheduled => {
        return !completedToday.some(completed =>
            completed.programId === scheduled.programId &&
            completed.workoutIndex === scheduled.workoutIndex
        );
    });

    wrapper.innerHTML = `<h3>Today's Training</h3>`;

    if (todaysScheduledWorkouts.length > 0 && todaysWorkouts.length === 0) {
        // Had workouts scheduled, but all are now complete
        wrapper.innerHTML += `
            <div class="placeholder-section" style="margin-top: 1rem;">
                <p>All workouts for today are complete. Great job!</p>
            </div>
        `;
        return;
    }
    
    if (todaysWorkouts.length === 0) {
        // No workouts were scheduled for today in the first place
        wrapper.innerHTML += `
            <div class="placeholder-section" style="margin-top: 1rem;">
                <p>No workout scheduled for today. Start one from the Library or schedule a program.</p>
            </div>
        `;
        return;
    }
    
    const programs = loadUserData('customPrograms', []);
    let contentHTML = '';

    todaysWorkouts.forEach(todaysWorkout => {
        const program = programs.find(p => p.id === todaysWorkout.programId);

        if (!program || !program.workouts[todaysWorkout.workoutIndex]) {
            contentHTML += `
                <div class="todays-training-card error-message">
                    <p>Error: Could not load data for a scheduled workout.</p>
                </div>
            `;
            return; // continue to next iteration
        }
        const workout = program.workouts[todaysWorkout.workoutIndex];

        contentHTML += `
            <div class="todays-training-card">
                <h4>${program.name}: ${workout.name}</h4>
        `;
    
        if (workout.exercises && workout.exercises.length > 0) {
            contentHTML += `<button class="start-scheduled-workout-btn" data-program-id="${program.id}" data-workout-index="${todaysWorkout.workoutIndex}">Start Workout</button>`;
        } else {
            contentHTML += `<p>Today is a scheduled rest day. Enjoy your recovery!</p>`;
        }

        contentHTML += '</div>';
    });
    wrapper.innerHTML += contentHTML;
}

function renderWorkout(plan) {
  workoutTitle.textContent = plan.name;
  exercisesContainer.innerHTML = ''; // Clear previous content

  const profile = loadUserData('userProfile', {});
  const weightUnit = profile.weightUnit || 'lbs';

  plan.exercises.forEach((exercise, index) => {
    const exerciseCard = document.createElement('div');
    exerciseCard.className = 'exercise-card';
    exerciseCard.dataset.exerciseIndex = index.toString();

    let setsTableHTML = `
      <table class="sets-table">
        <thead>
          <tr>
            <th>Set</th>
            <th>Weight (${weightUnit})</th>
            <th>Reps</th>
            <th>Complete</th>
          </tr>
        </thead>
        <tbody>
    `;
    for (let i = 1; i <= exercise.sets; i++) {
      const setPerformance = exercise.performance?.[i-1];
      const isDone = setPerformance?.status === 'done';
      setsTableHTML += `
        <tr class="${isDone ? 'done' : ''}" data-set-index="${i-1}">
          <td data-label="Set">${i}</td>
          <td data-label="Weight (${weightUnit})"><input type="number" placeholder="-" value="${setPerformance?.weight || ''}" aria-label="Weight (${weightUnit}) for ${exercise.name} set ${i}"></td>
          <td data-label="Reps"><input type="number" placeholder="-" value="${setPerformance?.reps || ''}" aria-label="Reps for ${exercise.name} set ${i}"></td>
          <td data-label="Complete">
            <button class="set-status-btn" data-action="toggle-set" aria-label="Toggle set ${i} completion"></button>
          </td>
        </tr>
      `;
    }
    setsTableHTML += `</tbody></table>`;

    exerciseCard.innerHTML = `
      <h3>${exercise.name}</h3>
      <div class="exercise-details">
        <p>Sets: ${exercise.sets}</p>
        <button class="exercise-metric" data-action="edit-metric">
            Target: <span>${formatMetric(exercise.metricValue, exercise.metricUnit)}</span>
        </button>
      </div>
      <p>${exercise.description}</p>
      ${setsTableHTML}
    `;

    exercisesContainer.appendChild(exerciseCard);
  });
}

/**
 * Handles all user interactions within an active workout, like completing a set
 * or editing an exercise metric. Uses event delegation.
 * @param {Event} event The click event.
 */
function handleWorkoutInteraction(event) {
    const target = event.target;

    // Handle toggling a set's completion status
    const toggleBtn = target.closest('.set-status-btn');
    if (toggleBtn) {
        handleToggleSet(toggleBtn);
        return;
    }

    // Handle editing an exercise's metric (reps, time, distance)
    const editMetricBtn = target.closest('.exercise-metric');
    if (editMetricBtn) {
        handleEditMetric(editMetricBtn);
        return;
    }
}

/**
 * Toggles the completion status of a single set.
 * @param {HTMLButtonElement} button The status button that was clicked.
 */
function handleToggleSet(button) {
    if (!currentWorkout) return;
    const row = button.closest('tr');
    const card = button.closest('.exercise-card');
    if (!row || !card) return;

    const exerciseIndex = parseInt(card.dataset.exerciseIndex, 10);
    const setIndex = parseInt(row.dataset.setIndex, 10);

    const exercise = currentWorkout.exercises[exerciseIndex];
    if (!exercise?.performance) return;
    
    const isDone = row.classList.toggle('done');
    exercise.performance[setIndex].status = isDone ? 'done' : 'missed';
}

/**
 * Creates and displays an inline editor for an exercise's metric.
 * @param {HTMLButtonElement} button The metric button that was clicked.
 */
function handleEditMetric(button) {
    if (!currentWorkout) return;
    const card = button.closest('.exercise-card');
    if (!card) return;
    
    const exerciseIndex = parseInt(card.dataset.exerciseIndex, 10);
    const exercise = currentWorkout.exercises[exerciseIndex];
    if (!exercise) return;

    const originalDisplay = button.querySelector('span');

    // Prevent multiple editors from opening
    if (card.querySelector('.metric-editor-wrapper')) return;

    // Create a temporary element to hold the editor
    const editorWrapper = document.createElement('div');
    editorWrapper.className = 'metric-editor-wrapper';
    editorWrapper.innerHTML = `
        <div class="metric-editor">
            <input type="text" class="metric-editor-value" value="${exercise.metricValue}">
            <select class="metric-editor-unit">
                <option value="reps">reps</option>
                <option value="seconds">seconds</option>
                <option value="meters">meters</option>
                <option value="feet">feet</option>
                <option value="yards">yards</option>
                <option value="miles">miles</option>
            </select>
            <button class="btn-save-metric">Save</button>
            <button class="btn-cancel-metric btn-tertiary">Cancel</button>
        </div>
    `;
    editorWrapper.querySelector('.metric-editor-unit').value = exercise.metricUnit;

    // Hide original button, show editor
    button.style.display = 'none';
    button.parentElement.insertBefore(editorWrapper, button.nextSibling);

    const saveBtn = editorWrapper.querySelector('.btn-save-metric');
    const cancelBtn = editorWrapper.querySelector('.btn-cancel-metric');
    const valueInput = editorWrapper.querySelector('.metric-editor-value');
    const unitSelect = editorWrapper.querySelector('.metric-editor-unit');

    // Auto-focus the input for a better user experience
    valueInput.focus();
    valueInput.select();

    const cleanup = () => {
        editorWrapper.remove();
        button.style.display = '';
    };

    saveBtn.addEventListener('click', () => {
        const newValue = valueInput.value.trim();
        const newUnit = unitSelect.value;
        if (newValue) {
            // Update data model
            exercise.metricValue = newValue;
            exercise.metricUnit = newUnit;
            // Update UI
            originalDisplay.textContent = formatMetric(newValue, newUnit);
        }
        cleanup();
    });

    cancelBtn.addEventListener('click', cleanup);
}


function handleSaveFeedback(event) {
    event.preventDefault();
    if (!currentWorkout) return;

    // Capture weight/reps from inputs and update the data model.
    // The 'status' is already up-to-date from handleToggleSet.
    const exerciseCards = exercisesContainer.querySelectorAll('.exercise-card');
    currentWorkout.exercises.forEach((exercise, index) => {
        const card = exerciseCards[index];
        if (!card) return;
        const rows = card.querySelectorAll('.sets-table tbody tr');
        rows.forEach((row, setIndex) => {
            const weightInput = row.querySelector('input[type="number"][aria-label^="Weight"]');
            const repsInput = row.querySelector('input[type="number"][aria-label^="Reps"]');

            const performanceSet = exercise.performance[setIndex];
            if (performanceSet) {
                performanceSet.weight = parseFloat(weightInput.value) || undefined;
                performanceSet.reps = parseFloat(repsInput.value) || undefined;
            }
        });
    });

    const formData = new FormData(postWorkoutFeedbackForm);
    const intensity = formData.get('intensity');
    const notes = formData.get('workout-notes');
    
    if (!intensity) {
        alert("Please select an intensity rating.");
        return;
    }

    currentWorkout.completed = true;
    currentWorkout.intensity = parseInt(intensity, 10);
    currentWorkout.notes = notes;

    // DO NOT overwrite the date. The 'date' property was set when the workout
    // was started and correctly holds the scheduled date.
    
    // Save to history
    const history = loadUserData('workoutHistory', []);
    history.push(currentWorkout);
    saveUserData('workoutHistory', history);

    // Reset view
    currentWorkout = null;
    
    postWorkoutFeedbackForm.reset();
    postWorkoutFeedbackModal.classList.add('hidden');
    
    renderWorkoutScreen();
    renderTodaysTraining();
    renderHistory();
    renderCalendar(calendarDate.getFullYear(), calendarDate.getMonth()); // Refresh calendar
}

function handleFinishWorkout() {
    if (!currentWorkout) return;
    // Reset form in case it was opened before
    postWorkoutFeedbackForm.querySelector('#workout-notes').value = '';
    const checkedRadio = postWorkoutFeedbackForm.querySelector('input[name="intensity"]:checked');
    if (checkedRadio) {
        checkedRadio.checked = false;
    }
    postWorkoutFeedbackModal.classList.remove('hidden');
}

// --- History Screen Logic ---

function renderHistory() {
    const history = loadUserData('workoutHistory', []);
    const completedCount = history.filter(w => w.completed).length;
    workoutsCompletedStat.textContent = completedCount.toString();

    const historyListContainer = document.getElementById('completed-workouts-list');
    if (!historyListContainer) return;

    // Sort history from newest to oldest for display
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (history.length === 0) {
        historyListContainer.innerHTML = '<p>No completed workouts yet. Go crush one!</p>';
        return;
    }
    
    historyListContainer.innerHTML = ''; // Clear previous entries
    history.forEach((workout, index) => {
        const card = document.createElement('div');
        card.className = 'history-workout-card';
        card.dataset.historyIndex = index.toString();
        
        // Ensure date parsing is timezone-agnostic for display
        const date = new Date(workout.date + 'T00:00:00'); 
        const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

        card.innerHTML = `
            <h4>${workout.name}</h4>
            <p>Completed: ${formattedDate}</p>
            <p>Intensity: <strong>${workout.intensity || 'N/A'}/10</strong></p>
        `;
        historyListContainer.appendChild(card);
    });
}

function handleHistoryClick(event) {
    const target = event.target;
    const card = target.closest('.history-workout-card');
    if (card && card.dataset.historyIndex) {
        const history = loadUserData('workoutHistory', []);
        // Sort history again to ensure the index matches the rendered order
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const workout = history[parseInt(card.dataset.historyIndex, 10)];
        if (workout) {
            openWorkoutHistoryModal(workout);
        }
    }
}

function openWorkoutHistoryModal(workout) {
    historyModalTitle.textContent = workout.name;
    const date = new Date(workout.date + 'T00:00:00');
    historyModalDate.textContent = `Completed on ${date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    historyModalIntensity.innerHTML = `<strong>Intensity:</strong> ${workout.intensity}/10`;
    historyModalNotes.textContent = workout.notes || 'No notes were added for this workout.';
    
    const profile = loadUserData('userProfile', {});
    const weightUnit = profile.weightUnit || 'lbs';
    
    historyModalExercisesContainer.innerHTML = '';
    
    workout.exercises.forEach(exercise => {
        if (!exercise.performance) return; // Skip if for some reason performance data is missing

        const exerciseEl = document.createElement('div');
        exerciseEl.className = 'history-exercise-block';

        let setsTableHTML = `
            <table class="sets-table">
                <thead>
                    <tr>
                        <th>Set</th>
                        <th>Target</th>
                        <th>Weight (${weightUnit})</th>
                        <th>Reps</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        exercise.performance.forEach((set, index) => {
            let statusIcon = '';
            if (set.status === 'done') {
                statusIcon = `<svg class="status-icon done" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`;
            } else {
                statusIcon = `<svg class="status-icon missed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`;
            }
            setsTableHTML += `
                <tr>
                    <td data-label="Set">${index + 1}</td>
                    <td data-label="Target">${formatMetric(exercise.metricValue, exercise.metricUnit)}</td>
                    <td data-label="Weight (${weightUnit})">${set.weight ?? '-'}</td>
                    <td data-label="Reps">${set.reps ?? '-'}</td>
                    <td data-label="Status">${statusIcon}</td>
                </tr>
            `;
        });

        setsTableHTML += `</tbody></table>`;
        
        exerciseEl.innerHTML = `
            <h4>${exercise.name}</h4>
            ${setsTableHTML}
        `;
        historyModalExercisesContainer.appendChild(exerciseEl);
    });
    
    workoutHistoryModal.classList.remove('hidden');
}

function closeWorkoutHistoryModal() {
    workoutHistoryModal.classList.add('hidden');
}

// --- Library Screen Logic ---

async function handleDiscoverPrograms() {
    discoverProgramsBtn.disabled = true;
    programIdeasLoader.classList.remove('hidden');
    programIdeasContainer.innerHTML = '';

    try {
        const prompt = `Generate 5 diverse, pre-made workout program ideas. For each, provide a name, a short description, the primary goal, and the intended experience level.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: programIdeasSchema }
        });

        const cleanedJsonText = response.text.trim().replace(/^```json\n?/, '').replace(/```$/, '');
        const programIdeas = JSON.parse(cleanedJsonText);
        renderProgramIdeas(programIdeas);

    } catch (error) {
        console.error("Error discovering programs:", error);
        programIdeasContainer.innerHTML = `<p class="error-message">Sorry, couldn't fetch program ideas. Please try again later.</p>`;
    } finally {
        discoverProgramsBtn.disabled = false;
        programIdeasLoader.classList.add('hidden');
    }
}

function renderProgramIdeas(ideas) {
    programIdeasContainer.innerHTML = ''; // Clear
    ideas.forEach(idea => {
        const card = document.createElement('div');
        card.className = 'program-idea-card';

        // By using double quotes for the data-idea attribute and HTML-encoding the double quotes
        // within the JSON string, we create a robust way to store JSON in a data attribute
        // that is safe from parsing errors when using .innerHTML.
        const ideaJsonString = JSON.stringify(idea).replace(/"/g, '&quot;');

        card.innerHTML = `
            <h4>${idea.programName}</h4>
            <p>${idea.description}</p>
            <p class="tags"><strong>Goal:</strong> ${idea.goal} &nbsp;|&nbsp; <strong>Level:</strong> ${idea.level}</p>
            <div class="program-card-actions">
                <button class="generate-full-program-btn" data-idea="${ideaJsonString}">Generate Full Program</button>
            </div>
        `;
        programIdeasContainer.appendChild(card);
    });
}

function handleProgramIdeasClick(event) {
    const target = event.target;
    if (target.classList.contains('generate-full-program-btn')) {
        const ideaString = target.dataset.idea;
        if (ideaString) {
            const idea = JSON.parse(ideaString);
            generateFullProgram(idea);
        }
    }
}

async function generateFullProgram(idea) {
    loader.classList.remove('hidden');
    loader.querySelector('p').textContent = `Generating "${idea.programName}"...`;
    
    try {
        const profile = loadUserData('userProfile', {});
        const profileContext = profile.name ? `Tailor this for a user with the goal: ${profile.goal}.` : '';

        const prompt = `Generate a detailed weekly workout program.
        Program Name: "${idea.programName}"
        Description: "${idea.description}"
        Primary Goal: ${idea.goal}
        Experience Level: ${idea.level}
        ${profileContext}

        The program should include 3-5 distinct workout days. For each workout, provide a name and a list of 5-8 exercises.
        For each exercise, specify its name, the number of sets, a metricValue (e.g., '8-12' for reps, or '500' for distance), and a metricUnit from the list: 'reps', 'seconds', 'meters', 'feet', 'yards', 'miles'. For traditional lifting, use 'reps'. For cardio like running or rowing, use a distance unit.
        Format the result as a single JSON object that strictly adheres to the provided schema. Do not include any explanatory text or markdown formatting.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutExtractionSchema
            }
        });
        
        const cleanedJsonText = response.text.trim().replace(/^```json\n?/, '').replace(/```$/, '');
        const programData = JSON.parse(cleanedJsonText);
        openProgramDetailsModal(programData);

    } catch (error) {
        console.error("Error generating full program:", error);
        alert(`Sorry, there was an error generating the full program for "${idea.programName}". Please try again.`);
    } finally {
        loader.classList.add('hidden');
    }
}

async function handleGenerateFromIdea(event) {
    event.preventDefault();
    const idea = programIdeaInput.value.trim();
    if (!idea) {
        alert('Please enter your program idea.');
        return;
    }

    loader.classList.remove('hidden');
    loader.querySelector('p').textContent = `Generating your custom program... This might take a moment.`;

    try {
        const profile = loadUserData('userProfile', {});
        const profileContext = profile.goal ? `Tailor this for a user with the primary fitness goal of: ${profile.goal}.` : '';

        const prompt = `
Act as an expert fitness coach. Generate a comprehensive and structured workout program based on the user's request: "${idea}".

Program Name: A creative name based on the user's request.
Description: A detailed description of the program's purpose, progression, and weekly structure.
${profileContext}

**Constraint Checklist & Formatting Rules:**
1.  **Full Weekly Schedule:** The "workouts" array MUST contain an entry for every single day (e.g., Monday to Sunday) for the entire duration of the plan.
2.  **Start on Monday:** Each week's schedule must begin on a Monday.
3.  **Integrate Rest Days:** Strategically include 'Rest' days within each 7-day week. A typical week should have 2-4 rest days.
4.  **Workout Naming Convention:** Name each entry clearly with its week, day, and purpose.
    - For training days: "Week 1, Day 1 (Monday): Upper Body Strength"
    - For rest days: "Week 1, Day 2 (Tuesday): Rest"
5.  **Rest Day Object:** For a 'Rest' day, the workout object must have an EMPTY "exercises" array (\`"exercises": []\`).
6.  **Exercise Details:** For training days, provide a list of 5-8 exercises. For each exercise, specify its name, number of sets, a brief description, a \`metricValue\` (e.g., '8-12' for reps, or '500' for distance), and a \`metricUnit\` from a list: 'reps', 'seconds', 'meters', 'feet', 'yards', 'miles'. For traditional lifting, use 'reps'. For cardio, use a distance unit.
7.  **JSON Output:** The final output must be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, comments, or markdown formatting before or after the JSON object.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutExtractionSchema
            }
        });

        const cleanedJsonText = response.text.trim().replace(/^```json\n?/, '').replace(/```$/, '');
        const programData = JSON.parse(cleanedJsonText);
        openProgramDetailsModal(programData);

    } catch (error) {
        console.error('Error generating program from idea:', error);
        alert('Sorry, there was an error generating your custom program. Please try again or refine your idea.');
    } finally {
        loader.classList.add('hidden');
        programIdeaInput.value = '';
    }
}


function loadAndRenderCustomPrograms() {
    const programs = loadUserData('customPrograms', []);
    customProgramsContainer.innerHTML = '';
    if (programs.length === 0) {
        customProgramsContainer.innerHTML = `<p>You haven't created any programs yet.</p>`;
    } else {
        programs.forEach(renderCustomProgramCard);
    }
}

function renderCustomProgramCard(program) {
    const card = document.createElement('div');
    card.className = 'custom-program-card';
    card.dataset.programId = program.id;
    card.innerHTML = `
        <h4>${program.name}</h4>
        <p>${program.description}</p>
        <div class="program-card-actions">
            <button class="btn-tertiary start-workout-btn">Start First</button>
            <button class="btn-tertiary schedule-program-btn">Schedule</button>
            <button class="btn-tertiary delete-program-btn">Delete</button>
        </div>
    `;
    customProgramsContainer.appendChild(card);
}

function deleteCustomProgram(programId) {
    let programs = loadUserData('customPrograms', []);
    programs = programs.filter(p => p.id !== programId);
    saveUserData('customPrograms', programs);

    // Also remove scheduled workouts associated with this program
    let schedule = loadUserData('workoutSchedule', []);
    schedule = schedule.filter(s => s.programId !== programId);
    saveUserData('workoutSchedule', schedule);

    loadAndRenderCustomPrograms(); // Re-render the list
    renderCalendar(calendarDate.getFullYear(), calendarDate.getMonth()); // Also refresh calendar
    renderTodaysTraining();
}

function startWorkoutFromProgram(workout, program, scheduledDate) {
    const workoutIndex = program.workouts.indexOf(workout);

    const plan = {
        id: `workout_${Date.now()}`,
        name: `${program.name}: ${workout.name}`,
        date: scheduledDate || getYYYYMMDD(new Date()),
        completed: false,
        exercises: workout.exercises.map(ex => {
            const performance = [];
            for (let i = 0; i < ex.sets; i++) {
                performance.push({ status: 'missed' }); // Default to incomplete
            }
            const performedExercise = {
                ...ex,
                performance,
            };
            return performedExercise;
        }),
        programId: program.id,
        workoutIndex: workoutIndex
    };

    currentWorkout = plan;
    renderWorkout(plan);
    renderWorkoutScreen();
    switchTab('workout');
    window.scrollTo(0, 0);
}

function handleCustomProgramClick(event) {
    const target = event.target;
    const card = target.closest('.custom-program-card');
    if (!card || !card.dataset.programId) return;

    const programs = loadUserData('customPrograms', []);
    const program = programs.find(p => p.id === card.dataset.programId);
    if (!program) return;

    if (target.classList.contains('start-workout-btn')) {
        if (program.workouts && program.workouts.length > 0) {
            // This starts an ad-hoc workout, default date of "today" is correct.
            startWorkoutFromProgram(program.workouts[0], program);
        } else {
            alert('This program has no workouts defined.');
        }
    } else if (target.classList.contains('schedule-program-btn')) {
        openScheduleModal(program.id);
    } else if (target.classList.contains('delete-program-btn')) {
        if (confirm(`Are you sure you want to delete the program "${program.name}"? This will also remove all of its scheduled entries from your calendar.`)) {
            deleteCustomProgram(program.id);
        }
    }
}


// --- Profile Screen Logic ---

function loadProfile() {
    const profile = loadUserData('userProfile', {});
    const weightUnit = profile.weightUnit || 'lbs';

    profileForm.elements.namedItem('name').value = profile.name || '';
    profileForm.elements.namedItem('age').value = profile.age?.toString() || '';
    profileForm.elements.namedItem('weight').value = profile.weight?.toString() || '';
    profileForm.elements.namedItem('height').value = profile.height?.toString() || '';
    profileForm.elements.namedItem('goal').value = profile.goal || 'muscle-gain';
    
    // Set weight unit radio button
    const unitRadio = profileForm.querySelector(`input[name="weight-unit"][value="${weightUnit}"]`);
    if (unitRadio) {
        unitRadio.checked = true;
    }

    // Set weight label
    const weightLabel = profileForm.querySelector('label[for="weight"]');
    if (weightLabel) {
        weightLabel.textContent = `Weight (${weightUnit})`;
    }
}

function handleProfileChange() {
    const formData = new FormData(profileForm);
    const profile = {
        name: formData.get('name'),
        age: Number(formData.get('age')) || undefined,
        weight: Number(formData.get('weight')) || undefined,
        height: Number(formData.get('height')) || undefined,
        goal: formData.get('goal'),
        weightUnit: formData.get('weight-unit') || 'lbs',
    };
    saveUserData('userProfile', profile);

    // Update weight label dynamically
    const weightLabel = profileForm.querySelector('label[for="weight"]');
    if (weightLabel) {
        weightLabel.textContent = `Weight (${profile.weightUnit})`;
    }

    savedFeedback.classList.remove('hidden');
    setTimeout(() => {
        savedFeedback.classList.add('hidden');
    }, 2000);
}

// --- Create & View Program Modal Logic ---

function openCreateProgramModal() {
    createProgramForm.reset();
    programWorkoutsContainer.innerHTML = ''; // Clear previous state
    handleAddWorkoutDay(); // Start with one workout day
    createProgramModal.classList.remove('hidden');
}

function closeCreateProgramModal() {
    createProgramModal.classList.add('hidden');
}

function openProgramDetailsModal(programData) {
    generatedProgramToSave = programData;

    detailsModalTitle.textContent = programData.programName || 'Generated Program';
    detailsModalDescription.textContent = programData.description || '';
    detailsModalWorkoutsContainer.innerHTML = '';

    if (programData.workouts && Array.isArray(programData.workouts)) {
        programData.workouts.forEach((workout) => {
            const workoutEl = document.createElement('div');
            workoutEl.className = 'details-workout-block';
            
            let exercisesHTML = '<ul>';
            if (workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0) {
                workout.exercises.forEach((ex) => {
                    exercisesHTML += `<li><strong>${ex.name}</strong>: ${ex.sets} sets of ${formatMetric(ex.metricValue, ex.metricUnit)}</li>`;
                });
            } else {
                 exercisesHTML += `<li>Rest Day</li>`
            }
            exercisesHTML += '</ul>';

            workoutEl.innerHTML = `
                <h4>${workout.name}</h4>
                ${exercisesHTML}
            `;
            detailsModalWorkoutsContainer.appendChild(workoutEl);
        });
    }

    programDetailsModal.classList.remove('hidden');
}

function closeProgramDetailsModal() {
    programDetailsModal.classList.add('hidden');
    generatedProgramToSave = null;
}

function handleSaveDiscoveredProgram() {
    if (!generatedProgramToSave) {
        alert("No program data to save.");
        return;
    }

    const programs = loadUserData('customPrograms', []);

    const newProgram = {
        id: `program_${Date.now()}`,
        name: generatedProgramToSave.programName,
        description: generatedProgramToSave.description,
        workouts: generatedProgramToSave.workouts
    };

    programs.push(newProgram);
    saveUserData('customPrograms', programs);
    
    loadAndRenderCustomPrograms();
    closeProgramDetailsModal();
    alert(`"${newProgram.name}" has been saved to your library!`);
}

function handleAddWorkoutDay() {
    const workoutBlock = (workoutBlockTemplate.content.cloneNode(true));
    const exerciseContainer = workoutBlock.querySelector('.workout-exercises-container');
    const exerciseBlock = (exerciseBlockTemplate.content.cloneNode(true));
    exerciseContainer.appendChild(exerciseBlock);
    programWorkoutsContainer.appendChild(workoutBlock);
}

function handleAddExercise(container) {
    const exerciseBlock = (exerciseBlockTemplate.content.cloneNode(true));
    container.appendChild(exerciseBlock);
}

function handleModalClickDelegation(event) {
    const target = event.target;
    if (target.classList.contains('add-exercise-btn')) {
        const exercisesContainer = target.closest('.workout-block')?.querySelector('.workout-exercises-container');
        if (exercisesContainer) {
            handleAddExercise(exercisesContainer);
        }
    } else if (target.classList.contains('remove-workout-btn')) {
        target.closest('.workout-block')?.remove();
    } else if (target.classList.contains('remove-exercise-btn')) {
        target.closest('.exercise-block')?.remove();
    }
}

function handleSaveProgram(event) {
    event.preventDefault();

    const programNameInput = createProgramForm.querySelector('#program-name');
    const programDescriptionInput = createProgramForm.querySelector('#program-description');

    const newProgram = {
        id: `program_${Date.now()}`,
        name: programNameInput.value.trim(),
        description: programDescriptionInput.value.trim(),
        workouts: []
    };

    const workoutBlocks = programWorkoutsContainer.querySelectorAll('.workout-block');
    workoutBlocks.forEach(block => {
        const workoutNameInput = block.querySelector('.workout-name-input');
        const workout = {
            name: workoutNameInput.value.trim(),
            exercises: []
        };

        const exerciseBlocks = block.querySelectorAll('.exercise-block');
        exerciseBlocks.forEach(exBlock => {
            const exercise = {
                name: (exBlock.querySelector('.exercise-name-input')).value.trim(),
                sets: Number((exBlock.querySelector('.exercise-sets-input')).value),
                metricValue: (exBlock.querySelector('.exercise-metric-input')).value,
                metricUnit: (exBlock.querySelector('.exercise-unit-select')).value,
                description: (exBlock.querySelector('.exercise-description-input')).value.trim()
            };
            if (exercise.name) { // Only add if name is not empty
                workout.exercises.push(exercise);
            }
        });

        if (workout.name && workout.exercises.length > 0) {
            newProgram.workouts.push(workout);
        }
    });

    if (newProgram.name && newProgram.workouts.length > 0) {
        const programs = loadUserData('customPrograms', []);
        programs.push(newProgram);
        saveUserData('customPrograms', programs);
        
        loadAndRenderCustomPrograms(); // Re-render the whole list
        closeCreateProgramModal();
    } else {
        alert('Please fill out the program name and at least one workout with one valid exercise.');
    }
}

/**
 * Converts a File object to a base64 string.
 */
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            // remove prefix `data:${file.type};base64,`
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
}

async function handleAnalyzeFile() {
    const file = workoutFileUpload.files?.[0];
    if (!file) {
        alert('Please select a file first.');
        return;
    }

    fileAnalysisLoader.classList.remove('hidden');
    analyzeFileBtn.disabled = true;

    try {
        const base64Data = await toBase64(file);
        const filePart = {
            inlineData: {
                mimeType: file.type,
                data: base64Data
            }
        };

        const textPart = {
            text: `Analyze the provided document, which contains a workout plan. Extract the program name, a brief description, and all the workouts. For each workout, extract its name (e.g., 'Day 1' or 'Push Day') and a list of its exercises. For each exercise, extract its name, the number of sets, a metricValue (e.g., '8-12' or '500'), a metricUnit from a list: 'reps', 'seconds', 'meters', 'feet', 'yards', 'miles', and any description. Format the result as a single JSON object that strictly adheres to the provided schema. Do not include any explanatory text or markdown formatting before or after the JSON object.`
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, filePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutExtractionSchema
            }
        });
        
        const cleanedJsonText = response.text.trim().replace(/^```json\n?/, '').replace(/```$/, '');
        const programData = JSON.parse(cleanedJsonText);
        
        populateProgramForm(programData);

    } catch (error) {
        console.error("Error analyzing file:", error);
        alert("Sorry, there was an error analyzing the file. Please check the file format or try again.");
    } finally {
        fileAnalysisLoader.classList.add('hidden');
        analyzeFileBtn.disabled = false;
        workoutFileUpload.value = ''; // Reset file input
    }
}

function populateProgramForm(programData) {
    try {
        createProgramForm.querySelector('#program-name').value = programData.programName || '';
        createProgramForm.querySelector('#program-description').value = programData.description || '';

        programWorkoutsContainer.innerHTML = ''; // Clear existing

        if (programData.workouts && Array.isArray(programData.workouts)) {
            programData.workouts.forEach((workout) => {
                const workoutBlock = (workoutBlockTemplate.content.cloneNode(true));
                const workoutNameInput = workoutBlock.querySelector('.workout-name-input');
                const exerciseContainer = workoutBlock.querySelector('.workout-exercises-container');
                
                workoutNameInput.value = workout.name || '';

                if (workout.exercises && Array.isArray(workout.exercises)) {
                    exerciseContainer.innerHTML = ''; // Clear default exercise
                    workout.exercises.forEach((exercise) => {
                        const exerciseBlock = (exerciseBlockTemplate.content.cloneNode(true));
                        exerciseBlock.querySelector('.exercise-name-input').value = exercise.name || '';
                        exerciseBlock.querySelector('.exercise-sets-input').value = exercise.sets || '';
                        exerciseBlock.querySelector('.exercise-metric-input').value = exercise.metricValue || '';
                        exerciseBlock.querySelector('.exercise-unit-select').value = exercise.metricUnit || 'reps';
                        exerciseBlock.querySelector('.exercise-description-input').value = exercise.description || '';
                        exerciseContainer.appendChild(exerciseBlock);
                    });
                }
                programWorkoutsContainer.appendChild(workoutBlock);
            });
        }
    } catch (error) {
        console.error("Error populating form from AI data:", error);
        alert("Could not automatically populate the form. The data structure from the AI was unexpected.");
    }
}


// --- Calendar & Scheduling Functions ---

function renderCalendar(year, month) {
    calendarGrid.innerHTML = '';
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    today.setHours(0,0,0,0);

    const schedule = loadUserData('workoutSchedule', []);
    const history = loadUserData('workoutHistory', []);

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyCell);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const currentDate = new Date(year, month, day);
        const dateString = getYYYYMMDD(currentDate);
        
        dayCell.className = 'calendar-day';
        dayCell.dataset.date = dateString;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day.toString();
        if (currentDate.getTime() === today.getTime()) {
            dayCell.classList.add('today');
        }
        dayCell.appendChild(dayNumber);
        
        const workoutsForDay = schedule.filter(w => w.date === dateString);
        workoutsForDay.forEach(w => {
            const entry = document.createElement('div');
            entry.className = 'calendar-workout-entry';

            const isCompleted = history.some(completedWorkout => 
                completedWorkout.completed &&
                completedWorkout.date === dateString &&
                completedWorkout.programId === w.programId &&
                completedWorkout.workoutIndex === w.workoutIndex
            );

            if (isCompleted) {
                entry.classList.add('completed');
                entry.innerHTML = `
                    <span>${w.workoutName}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                `;
            } else {
                 entry.textContent = w.workoutName;
            }

            entry.title = `${w.programName}: ${w.workoutName}`;
            entry.dataset.programId = w.programId;
            entry.dataset.workoutIndex = w.workoutIndex.toString();
            dayCell.appendChild(entry);
        });

        calendarGrid.appendChild(dayCell);
    }
}

function handleCalendarClick(event) {
    const target = event.target;
    const entry = target.closest('.calendar-workout-entry');
    if (entry) {
        const dayCell = entry.closest('.calendar-day');
        const scheduledDate = dayCell?.dataset.date;
        const { programId, workoutIndex } = entry.dataset;

        if (programId && workoutIndex && scheduledDate) {
            const programs = loadUserData('customPrograms', []);
            const program = programs.find(p => p.id === programId);
            const workout = program?.workouts[parseInt(workoutIndex, 10)];
            if(program && workout) {
                openWorkoutOverviewModal(workout, program, scheduledDate);
            }
        }
    }
}

function renderScheduleCalendar(year, month) {
    scheduleCalendarGrid.innerHTML = '';
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    scheduleCalendarMonthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = scheduleStartDateInput.value;

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'schedule-calendar-day other-month';
        scheduleCalendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const currentDate = new Date(year, month, day);
        const dateString = getYYYYMMDD(currentDate);
        
        dayCell.className = 'schedule-calendar-day';
        dayCell.dataset.date = dateString;
        dayCell.textContent = day.toString();
        
        if (currentDate.getTime() === today.getTime()) {
            dayCell.classList.add('today');
        }
        if (dateString === selectedDate) {
            dayCell.classList.add('selected');
        }
        
        scheduleCalendarGrid.appendChild(dayCell);
    }
}

function handleScheduleCalendarClick(event) {
    const target = event.target;
    const dayCell = target.closest('.schedule-calendar-day');

    if (dayCell && dayCell.dataset.date) {
        scheduleStartDateInput.value = dayCell.dataset.date;
        // Re-render to show the new selection
        renderScheduleCalendar(scheduleCalendarDate.getFullYear(), scheduleCalendarDate.getMonth());
    }
}

function openScheduleModal(programId) {
    const programs = loadUserData('customPrograms', []);
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    scheduleModalTitle.textContent = `Schedule: ${program.name}`;
    scheduleProgramForm.dataset.programId = programId;
    
    // Reset date state and render mini-calendar
    scheduleCalendarDate = new Date();
    scheduleStartDateInput.value = ''; // Clear previous selection
    renderScheduleCalendar(scheduleCalendarDate.getFullYear(), scheduleCalendarDate.getMonth());

    // Reset checkboxes to a default state
    const dayCheckboxes = scheduleProgramForm.querySelectorAll('input[name="schedule-day"]');
    dayCheckboxes.forEach(cb => {
        const day = parseInt(cb.value);
        cb.checked = [1, 3, 5].includes(day);
    });

    scheduleProgramModal.classList.remove('hidden');
}

function closeScheduleModal() {
    scheduleProgramModal.classList.add('hidden');
}

function handleSaveSchedule(event) {
    event.preventDefault();
    const form = event.target;
    const programId = form.dataset.programId;
    const dayCheckboxes = form.querySelectorAll('input[name="schedule-day"]:checked');

    if (!programId || !scheduleStartDateInput.value) {
        alert("Please select a start date from the calendar.");
        return;
    }

    if (dayCheckboxes.length === 0) {
        alert("Please select at least one day of the week to schedule workouts.");
        return;
    }

    const programs = loadUserData('customPrograms', []);
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    let schedule = loadUserData('workoutSchedule', []);
    // Remove any previously scheduled workouts for this program
    schedule = schedule.filter(s => s.programId !== programId);
    
    const selectedDays = Array.from(dayCheckboxes).map(cb => parseInt(cb.value, 10));
    
    const trainingWorkouts = program.workouts; // Include rest days to preserve indices, but we'll only schedule ones with exercises
    if (trainingWorkouts.length === 0) {
        alert("This program has no workouts to schedule.");
        closeScheduleModal();
        return;
    }

    const startDate = new Date(scheduleStartDateInput.value + 'T00:00:00');
    let currentWorkoutIndex = 0;
    let scheduledCount = 0;
    
    // Iterate through calendar days starting from the selected start date
    for (let dayOffset = 0; currentWorkoutIndex < trainingWorkouts.length; dayOffset++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayOffset);
        const workoutToSchedule = trainingWorkouts[currentWorkoutIndex];
        
        // Skip scheduling if it's a rest day (no exercises)
        if (!workoutToSchedule.exercises || workoutToSchedule.exercises.length === 0) {
            currentWorkoutIndex++;
            dayOffset--; // Don't consume a calendar day for a rest day
            continue;
        }

        // If the current calendar day is one of the selected training days
        if (selectedDays.includes(currentDate.getDay())) {
            
            const weekNum = Math.floor(scheduledCount / selectedDays.length) + 1;
            const dayNum = (scheduledCount % selectedDays.length) + 1;
            const workoutDisplayName = `Week ${weekNum}, Day ${dayNum}`;

            const newScheduledWorkout = {
                date: getYYYYMMDD(currentDate), // Format to YYYY-MM-DD
                programId: programId,
                programName: program.name,
                workoutIndex: currentWorkoutIndex,
                workoutName: workoutDisplayName
            };
            schedule.push(newScheduledWorkout);
            currentWorkoutIndex++;
            scheduledCount++;
        }
        
        // Safety break to prevent infinite loops if something goes wrong.
        if (dayOffset > 365 * 5) { // 5 years of scheduling
             console.error("Scheduling loop exceeded safety limit.");
             break;
        }
    }

    saveUserData('workoutSchedule', schedule);
    closeScheduleModal();
    renderCalendar(calendarDate.getFullYear(), calendarDate.getMonth());
    renderTodaysTraining();
}

// --- Workout Overview Modal ---
function openWorkoutOverviewModal(workout, program, scheduledDate) {
    dataForWorkoutOverviewModal = { workout, program, scheduledDate };
    overviewModalTitle.textContent = `${program.name}: ${workout.name}`;
    
    let exercisesHTML = '';
    if (workout.exercises && workout.exercises.length > 0) {
        exercisesHTML = '<div class="details-workout-block"><ul>';
        workout.exercises.forEach((ex) => {
            exercisesHTML += `<li><strong>${ex.name}</strong>: ${ex.sets} sets of ${formatMetric(ex.metricValue, ex.metricUnit)}</li>`;
        });
        exercisesHTML += '</ul></div>';
    } else {
        exercisesHTML = `<div class="details-workout-block"><ul><li>Rest Day</li></ul></div>`;
    }

    overviewModalContent.innerHTML = exercisesHTML;
    overviewModalStartBtn.style.display = workout.exercises.length > 0 ? 'inline-block' : 'none';

    workoutOverviewModal.classList.remove('hidden');
}

function closeWorkoutOverviewModal() {
    workoutOverviewModal.classList.add('hidden');
    dataForWorkoutOverviewModal = null;
}

function handleStartWorkoutFromModal() {
    if (dataForWorkoutOverviewModal) {
        startWorkoutFromProgram(
            dataForWorkoutOverviewModal.workout, 
            dataForWorkoutOverviewModal.program,
            dataForWorkoutOverviewModal.scheduledDate
        );
        closeWorkoutOverviewModal();
    }
}

/**
 * Main entry point for the application.
 */
function main() {
  // App starts directly, no login check.
  initializeApp();
}


// --- App Initialization ---
main();
