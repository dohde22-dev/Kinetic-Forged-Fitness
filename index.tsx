/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Type } from '@google/genai';

// --- Auth DOM Elements ---
const authScreen = document.getElementById('auth-screen') as HTMLDivElement;
const appContainer = document.getElementById('app-container') as HTMLDivElement;
const loginView = document.getElementById('login-view') as HTMLDivElement;
const registerView = document.getElementById('register-view') as HTMLDivElement;
const forgotPasswordView = document.getElementById('forgot-password-view') as HTMLDivElement;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const registerForm = document.getElementById('register-form') as HTMLFormElement;
const forgotPasswordRequestForm = document.getElementById('forgot-password-request-form') as HTMLFormElement;
const forgotPasswordResetForm = document.getElementById('forgot-password-reset-form') as HTMLFormElement;
const showRegisterViewBtn = document.getElementById('show-register-view') as HTMLAnchorElement;
const showLoginViewBtn = document.getElementById('show-login-view') as HTMLAnchorElement;
const showForgotPasswordViewBtn = document.getElementById('show-forgot-password-view') as HTMLAnchorElement;
const backToLoginBtn = document.getElementById('back-to-login') as HTMLAnchorElement;
const stayLoggedInCheckbox = document.getElementById('stay-logged-in') as HTMLInputElement;
const authError = document.getElementById('auth-error') as HTMLParagraphElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const headerUsername = document.getElementById('header-username') as HTMLSpanElement;
const secretQuestionDisplay = document.getElementById('secret-question-display') as HTMLParagraphElement;


// --- App DOM Elements ---
const navTabs = document.querySelectorAll('.nav-tab');
const screens = document.querySelectorAll('.screen');
const workoutPlanScreen = document.getElementById('workout-plan') as HTMLDivElement;
const noActiveWorkoutPlaceholder = document.getElementById('no-active-workout') as HTMLDivElement;
const loader = document.getElementById('loader') as HTMLDivElement;
const workoutTitle = document.getElementById('workout-title') as HTMLHeadingElement;
const exercisesContainer = document.getElementById('exercises-container') as HTMLDivElement;
const finishWorkoutBtn = document.getElementById('finish-workout-btn') as HTMLButtonElement;

// Profile Screen
const profileForm = document.getElementById('profile-form') as HTMLFormElement;
const savedFeedback = document.querySelector('.saved-feedback') as HTMLParagraphElement;

// History Screen
const workoutsCompletedStat = document.getElementById('workouts-completed-stat') as HTMLParagraphElement;

// Library Screen
const discoverProgramsBtn = document.getElementById('discover-programs-btn') as HTMLButtonElement;
const programIdeasContainer = document.getElementById('program-ideas-container') as HTMLDivElement;
const programIdeasLoader = document.getElementById('program-ideas-loader') as HTMLDivElement;
const createNewProgramBtn = document.getElementById('create-new-program-btn') as HTMLButtonElement;
const customProgramsContainer = document.getElementById('custom-programs-container') as HTMLDivElement;
const discoverDurationOptions = document.getElementById('discover-duration-options') as HTMLDivElement;

// Create Program Modal
const createProgramModal = document.getElementById('create-program-modal') as HTMLDivElement;
const createProgramForm = document.getElementById('create-program-form') as HTMLFormElement;
const modalCloseBtn = createProgramModal.querySelector('.modal-close-btn') as HTMLButtonElement;
const addWorkoutBtn = document.getElementById('add-workout-btn') as HTMLButtonElement;
const programWorkoutsContainer = document.getElementById('program-workouts-container') as HTMLDivElement;
const workoutBlockTemplate = document.getElementById('workout-block-template') as HTMLTemplateElement;
const exerciseBlockTemplate = document.getElementById('exercise-block-template') as HTMLTemplateElement;
const analyzeFileBtn = document.getElementById('analyze-file-btn') as HTMLButtonElement;
const workoutFileUpload = document.getElementById('workout-file-upload') as HTMLInputElement;
const fileAnalysisLoader = document.getElementById('file-analysis-loader') as HTMLDivElement;

// Calendar
const calendarGrid = document.getElementById('calendar-grid') as HTMLDivElement;
const calendarMonthYear = document.getElementById('calendar-month-year') as HTMLHeadingElement;
const prevMonthBtn = document.getElementById('prev-month-btn') as HTMLButtonElement;
const nextMonthBtn = document.getElementById('next-month-btn') as HTMLButtonElement;

// Schedule Modal
const scheduleProgramModal = document.getElementById('schedule-program-modal') as HTMLDivElement;
const scheduleProgramForm = document.getElementById('schedule-program-form') as HTMLFormElement;
const scheduleModalTitle = document.getElementById('schedule-modal-title') as HTMLHeadingElement;
const scheduleModalCloseBtn = scheduleProgramModal.querySelector('.modal-close-btn') as HTMLButtonElement;

// Program Details Modal
const programDetailsModal = document.getElementById('program-details-modal') as HTMLDivElement;
const detailsModalCloseBtn = programDetailsModal.querySelector('.modal-close-btn') as HTMLButtonElement;
const detailsModalTitle = document.getElementById('details-modal-title') as HTMLHeadingElement;
const detailsModalDescription = document.getElementById('details-modal-description') as HTMLParagraphElement;
const detailsModalWorkoutsContainer = document.getElementById('details-modal-workouts-container') as HTMLDivElement;
const saveDiscoveredProgramBtn = document.getElementById('save-discovered-program-btn') as HTMLButtonElement;

// Workout Overview Modal
const workoutOverviewModal = document.getElementById('workout-overview-modal') as HTMLDivElement;
const overviewModalCloseBtn = workoutOverviewModal.querySelector('.modal-close-btn') as HTMLButtonElement;
const overviewModalTitle = document.getElementById('overview-modal-title') as HTMLHeadingElement;
const overviewModalContent = document.getElementById('overview-modal-content') as HTMLDivElement;
const overviewModalStartBtn = document.getElementById('overview-modal-start-btn') as HTMLButtonElement;

// Post-Workout Feedback Modal
const postWorkoutFeedbackModal = document.getElementById('post-workout-feedback-modal') as HTMLDivElement;
const postWorkoutFeedbackForm = document.getElementById('post-workout-feedback-form') as HTMLFormElement;
const feedbackModalCloseBtn = postWorkoutFeedbackModal.querySelector('.modal-close-btn') as HTMLButtonElement;


// --- Gemini AI Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Formats a Date object into a YYYY-MM-DD string, ignoring timezone.
 * @param {Date} date The date to format.
 * @returns {string} The formatted date string.
 */
function getYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Type Definitions & Schemas ---
interface Exercise {
  name: string;
  sets: number;
  metricValue: string;
  metricUnit: string;
  description: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  date: string; // The scheduled date of the workout (YYYY-MM-DD)
  exercises: Exercise[];
  completed: boolean;
  programId?: string;
  workoutIndex?: number;
  intensity?: number;
  notes?: string;
}

interface Profile {
    name?: string;
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
    weightUnit?: 'lbs' | 'kg';
}

interface ProgramIdea {
    programName: string;
    description: string;
    goal: string;
    level: string;
}

interface CustomExercise {
    name: string;
    sets: number;
    metricValue: string;
    metricUnit: string;
    description: string;
}

interface CustomWorkout {
    name: string;
    exercises: CustomExercise[];
}

interface CustomProgram {
    id: string;
    name:string;
    description: string;
    workouts: CustomWorkout[];
}

interface ScheduledWorkout {
    date: string; // YYYY-MM-DD
    programId: string;
    programName: string;
    workoutIndex: number;
    workoutName: string;
}

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
                                metricUnit: { type: Type.STRING, description: "The unit for the metric. Must be one of: 'reps', 'meters', 'yards', 'miles'." },
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


let loggedInUser: string | null = null;
let userToResetPassword: string | null = null;
let currentWorkout: WorkoutPlan | null = null;
let calendarDate = new Date();
let generatedProgramToSave: any | null = null; // Holds AI-generated program data before saving
let dataForWorkoutOverviewModal: { workout: CustomWorkout, program: CustomProgram, scheduledDate: string } | null = null;


// --- User Data Storage Helpers ---

function getUserKey(key: string): string {
    if (!loggedInUser) throw new Error("No user logged in. Cannot access user data.");
    return `${loggedInUser}_${key}`;
}

function saveUserData(key: string, data: any) {
    localStorage.setItem(getUserKey(key), JSON.stringify(data));
}

function loadUserData<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(getUserKey(key));
    return data ? JSON.parse(data) as T : defaultValue;
}


// --- Main App Initialization Logic ---

/**
 * Initializes the application after a user has logged in.
 * Sets up event listeners and renders user-specific data.
 */
function initializeApp() {
    headerUsername.textContent = loggedInUser;
    appContainer.classList.remove('hidden');
    authScreen.classList.add('hidden');
    
    // Tab navigation
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')!));
    });

    // Load data from localStorage (now using helpers)
    loadProfile();
    renderHistory();
    loadAndRenderCustomPrograms();

    // Event Listeners
    exercisesContainer.addEventListener('click', handleSetActionClick);
    profileForm.addEventListener('input', handleProfileChange);
    finishWorkoutBtn.addEventListener('click', handleFinishWorkout);
    discoverProgramsBtn.addEventListener('click', handleDiscoverPrograms);
    discoverDurationOptions.addEventListener('click', handleGenerateLongTermProgramClick);
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
    detailsModalCloseBtn.addEventListener('click', closeProgramDetailsModal);
    saveDiscoveredProgramBtn.addEventListener('click', handleSaveDiscoveredProgram);
    overviewModalCloseBtn.addEventListener('click', closeWorkoutOverviewModal);
    overviewModalStartBtn.addEventListener('click', handleStartWorkoutFromModal);
    postWorkoutFeedbackForm.addEventListener('submit', handleSaveFeedback);
    feedbackModalCloseBtn.addEventListener('click', () => {
        postWorkoutFeedbackModal.classList.add('hidden');
    });

    // Event delegation for dynamic elements
    createProgramModal.addEventListener('click', handleModalClickDelegation);
    customProgramsContainer.addEventListener('click', handleCustomProgramClick);
    calendarGrid.addEventListener('click', handleCalendarClick);
    programIdeasContainer.addEventListener('click', handleProgramIdeasClick);
    document.getElementById('todays-training-wrapper')?.addEventListener('click', handleStartScheduledWorkoutClick);
    noActiveWorkoutPlaceholder.addEventListener('click', handleStartScheduledWorkoutClick);

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
function switchTab(tabId: string) {
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
 * @param {MouseEvent} event The click event.
 */
function handleStartScheduledWorkoutClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const startBtn = target.closest<HTMLButtonElement>('.start-scheduled-workout-btn');
    if (!startBtn) return;

    const { programId, workoutIndex } = startBtn.dataset;
    if (!programId || workoutIndex === undefined) return;

    const programs = loadUserData<CustomProgram[]>('customPrograms', []);
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
function formatMetric(value: string, unit: string): string {
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
        const schedule = loadUserData<ScheduledWorkout[]>('workoutSchedule', []);
        const todaysWorkouts = schedule.filter(w => w.date === todayString);

        if (todaysWorkouts.length > 0) {
            const programs = loadUserData<CustomProgram[]>('customPrograms', []);
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
            noActiveWorkoutPlaceholder.innerHTML = `
                <h2>No Workout Scheduled</h2>
                <p>No workout is scheduled for today. You can start one from the Library tab.</p>
            `;
        }
    }
}


// --- Training Screen Logic ---

function renderTodaysTraining() {
    const wrapper = document.getElementById('todays-training-wrapper');
    if (!wrapper) return;

    const todayString = getYYYYMMDD(new Date());
    const schedule = loadUserData<ScheduledWorkout[]>('workoutSchedule', []);
    const todaysScheduledWorkouts = schedule.filter(w => w.date === todayString);

    // Get today's completed workouts to filter them out
    const history = loadUserData<WorkoutPlan[]>('workoutHistory', []);
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
    
    const programs = loadUserData<CustomProgram[]>('customPrograms', []);
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

function renderWorkout(plan: WorkoutPlan) {
  workoutTitle.textContent = plan.name;
  exercisesContainer.innerHTML = ''; // Clear previous content

  const profile = loadUserData<Profile>('userProfile', {});
  const weightUnit = profile.weightUnit || 'lbs';

  plan.exercises.forEach((exercise) => {
    const exerciseCard = document.createElement('div');
    exerciseCard.className = 'exercise-card';

    let setsTableHTML = `
      <table class="sets-table">
        <thead>
          <tr>
            <th>Set</th>
            <th>Weight (${weightUnit})</th>
            <th>Reps</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
    for (let i = 1; i <= exercise.sets; i++) {
      setsTableHTML += `
        <tr>
          <td data-label="Set">${i}</td>
          <td data-label="Weight (${weightUnit})"><input type="number" placeholder="-" aria-label="Weight (${weightUnit}) for ${exercise.name} set ${i}"></td>
          <td data-label="Reps"><input type="number" placeholder="-" aria-label="Reps for ${exercise.name} set ${i}"></td>
          <td class="set-actions" data-label="Actions">
            <button class="set-done-btn btn-icon" aria-label="Mark ${exercise.name} set ${i} as complete">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>
            </button>
            <button class="set-missed-btn btn-icon" aria-label="Mark ${exercise.name} set ${i} as missed">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
            </button>
          </td>
        </tr>
      `;
    }
    setsTableHTML += `</tbody></table>`;

    exerciseCard.innerHTML = `
      <h3>${exercise.name}</h3>
      <p class="details">${exercise.sets} sets of ${formatMetric(exercise.metricValue, exercise.metricUnit)}</p>
      <p>${exercise.description}</p>
      ${setsTableHTML}
    `;

    exercisesContainer.appendChild(exerciseCard);
  });
}

/**
 * Handles clicks on the 'Done' or 'Missed' buttons for a workout set.
 * Manages 'done' and 'missed' states, ensuring they are mutually exclusive,
 * and disables/enables inputs accordingly.
 * @param {MouseEvent} event The click event.
 */
function handleSetActionClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const doneBtn = target.closest<HTMLButtonElement>('.set-done-btn');
    const missedBtn = target.closest<HTMLButtonElement>('.set-missed-btn');

    if (!doneBtn && !missedBtn) return;

    const row = target.closest('tr');
    if (!row) return;
    
    const inputs = row.querySelectorAll('input');

    const toggleState = (stateClass: 'done' | 'missed', oppositeClass: 'done' | 'missed') => {
        // If the row already has this class, we're toggling it OFF.
        if (row.classList.contains(stateClass)) {
            row.classList.remove(stateClass);
            inputs.forEach(input => input.disabled = false);
        } else {
            // Otherwise, we're toggling it ON.
            // Add the new state, remove the opposite, and disable inputs.
            row.classList.add(stateClass);
            row.classList.remove(oppositeClass);
            inputs.forEach(input => input.disabled = true);
        }
    };

    if (doneBtn) {
        toggleState('done', 'missed');
    } else if (missedBtn) {
        toggleState('missed', 'done');
    }
}

function handleSaveFeedback(event: SubmitEvent) {
    event.preventDefault();
    if (!currentWorkout) return;

    const formData = new FormData(postWorkoutFeedbackForm);
    const intensity = formData.get('intensity');
    const notes = formData.get('workout-notes');
    
    if (!intensity) {
        alert("Please select an intensity rating.");
        return;
    }

    currentWorkout.completed = true;
    currentWorkout.intensity = parseInt(intensity as string, 10);
    currentWorkout.notes = notes as string;

    // DO NOT overwrite the date. The 'date' property was set when the workout
    // was started and correctly holds the scheduled date.
    
    // Save to history
    const history = loadUserData<WorkoutPlan[]>('workoutHistory', []);
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
    (postWorkoutFeedbackForm.querySelector('#workout-notes') as HTMLTextAreaElement).value = '';
    const checkedRadio = postWorkoutFeedbackForm.querySelector('input[name="intensity"]:checked') as HTMLInputElement;
    if (checkedRadio) {
        checkedRadio.checked = false;
    }
    postWorkoutFeedbackModal.classList.remove('hidden');
}

// --- History Screen Logic ---

function renderHistory() {
    const history = loadUserData<WorkoutPlan[]>('workoutHistory', []);
    const completedCount = history.filter(w => w.completed).length;
    workoutsCompletedStat.textContent = completedCount.toString();
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
        const programIdeas: ProgramIdea[] = JSON.parse(cleanedJsonText);
        renderProgramIdeas(programIdeas);

    } catch (error) {
        console.error("Error discovering programs:", error);
        programIdeasContainer.innerHTML = `<p class="error-message">Sorry, couldn't fetch program ideas. Please try again later.</p>`;
    } finally {
        discoverProgramsBtn.disabled = false;
        programIdeasLoader.classList.add('hidden');
    }
}

function renderProgramIdeas(ideas: ProgramIdea[]) {
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

function handleProgramIdeasClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('generate-full-program-btn')) {
        const ideaString = target.dataset.idea;
        if (ideaString) {
            const idea: ProgramIdea = JSON.parse(ideaString);
            generateFullProgram(idea);
        }
    }
}

async function generateFullProgram(idea: ProgramIdea) {
    loader.classList.remove('hidden');
    (loader.querySelector('p') as HTMLParagraphElement).textContent = `Generating "${idea.programName}"...`;
    
    try {
        const profile = loadUserData<Profile>('userProfile', {});
        const profileContext = profile.name ? `Tailor this for a user with the goal: ${profile.goal}.` : '';

        const prompt = `Generate a detailed weekly workout program.
        Program Name: "${idea.programName}"
        Description: "${idea.description}"
        Primary Goal: ${idea.goal}
        Experience Level: ${idea.level}
        ${profileContext}

        The program should include 3-5 distinct workout days. For each workout, provide a name and a list of 5-8 exercises.
        For each exercise, specify its name, the number of sets, a metricValue (e.g., '8-12' for reps, or '500' for distance), and a metricUnit from the list: 'reps', 'meters', 'yards', 'miles'. For traditional lifting, use 'reps'. For cardio like running or rowing, use a distance unit.
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

function handleGenerateLongTermProgramClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('.discover-duration-btn');
    if (button) {
        const duration = parseInt(button.dataset.duration!, 10);
        if (!isNaN(duration)) {
            generateLongTermProgram(duration);
        }
    }
}

async function generateLongTermProgram(duration: number) {
    loader.classList.remove('hidden');
    (loader.querySelector('p') as HTMLParagraphElement).textContent = `Generating your ${duration}-week program... This might take a moment.`;

    try {
        const profile = loadUserData<Profile>('userProfile', {});
        const profileContext = profile.goal ? `Tailor this for a user with the primary fitness goal of: ${profile.goal}.` : '';

        const prompt = `
Generate a comprehensive and structured ${duration}-week workout program.
Program Name: A creative name for a ${duration}-week plan.
Description: A detailed description of the program's purpose, progression, and weekly structure.
${profileContext}

**Constraint Checklist & Formatting Rules:**
1.  **Full Weekly Schedule:** The "workouts" array MUST contain exactly ${duration * 7} total entries, representing every single day (Monday to Sunday) for all ${duration} weeks.
2.  **Start on Monday:** Each week's schedule must begin on a Monday.
3.  **Integrate Rest Days:** Strategically include 'Rest' days within each 7-day week. A typical week should have 2-4 rest days.
4.  **Workout Naming Convention:** Name each entry clearly with its week, day, and purpose.
    - For training days: "Week 1, Day 1 (Monday): Upper Body Strength"
    - For rest days: "Week 1, Day 2 (Tuesday): Rest"
5.  **Rest Day Object:** For a 'Rest' day, the workout object must have an EMPTY "exercises" array (\`"exercises": []\`).
6.  **Exercise Details:** For training days, provide a list of 5-8 exercises. For each exercise, specify its name, number of sets, a brief description, a \`metricValue\` (e.g., '8-12' or '500'), and a \`metricUnit\` from a list: 'reps', 'meters', 'yards', 'miles'. For traditional lifting, use 'reps'. For cardio, use a distance unit.
7.  **JSON Output:** The final output must be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, comments, or markdown formatting before or after the JSON object.

Example for a 'Rest' day object in the array:
{
  "name": "Week 1, Day 2 (Tuesday): Rest",
  "exercises": []
}
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
        console.error(`Error generating ${duration}-week program:`, error);
        alert(`Sorry, there was an error generating the ${duration}-week program. Please try again.`);
    } finally {
        loader.classList.add('hidden');
    }
}


function loadAndRenderCustomPrograms() {
    const programs = loadUserData<CustomProgram[]>('customPrograms', []);
    customProgramsContainer.innerHTML = '';
    if (programs.length === 0) {
        customProgramsContainer.innerHTML = `<p>You haven't created any programs yet.</p>`;
    } else {
        programs.forEach(renderCustomProgramCard);
    }
}

function renderCustomProgramCard(program: CustomProgram) {
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

function deleteCustomProgram(programId: string) {
    let programs = loadUserData<CustomProgram[]>('customPrograms', []);
    programs = programs.filter(p => p.id !== programId);
    saveUserData('customPrograms', programs);

    // Also remove scheduled workouts associated with this program
    let schedule = loadUserData<ScheduledWorkout[]>('workoutSchedule', []);
    schedule = schedule.filter(s => s.programId !== programId);
    saveUserData('workoutSchedule', schedule);

    loadAndRenderCustomPrograms(); // Re-render the list
    renderCalendar(calendarDate.getFullYear(), calendarDate.getMonth()); // Also refresh calendar
    renderTodaysTraining();
}

function startWorkoutFromProgram(workout: CustomWorkout, program: CustomProgram, scheduledDate?: string) {
    const workoutIndex = program.workouts.indexOf(workout);

    const plan: WorkoutPlan = {
        id: `workout_${Date.now()}`,
        name: `${program.name}: ${workout.name}`,
        date: scheduledDate || getYYYYMMDD(new Date()),
        completed: false,
        exercises: workout.exercises.map(ex => ({ ...ex })),
        programId: program.id,
        workoutIndex: workoutIndex
    };

    currentWorkout = plan;
    renderWorkout(plan);
    renderWorkoutScreen();
    switchTab('workout');
    window.scrollTo(0, 0);
}

function handleCustomProgramClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const card = target.closest<HTMLElement>('.custom-program-card');
    if (!card || !card.dataset.programId) return;

    const programs = loadUserData<CustomProgram[]>('customPrograms', []);
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
            deleteCustomProgram(program.id!);
        }
    }
}


// --- Profile Screen Logic ---

function loadProfile() {
    const profile = loadUserData<Profile>('userProfile', {});
    const weightUnit = profile.weightUnit || 'lbs';

    (profileForm.elements.namedItem('name') as HTMLInputElement).value = loggedInUser || '';
    (profileForm.elements.namedItem('age') as HTMLInputElement).value = profile.age?.toString() || '';
    (profileForm.elements.namedItem('weight') as HTMLInputElement).value = profile.weight?.toString() || '';
    (profileForm.elements.namedItem('height') as HTMLInputElement).value = profile.height?.toString() || '';
    (profileForm.elements.namedItem('goal') as HTMLSelectElement).value = profile.goal || 'muscle-gain';
    
    // Set weight unit radio button
    const unitRadio = profileForm.querySelector(`input[name="weight-unit"][value="${weightUnit}"]`) as HTMLInputElement;
    if (unitRadio) {
        unitRadio.checked = true;
    }

    // Set weight label
    const weightLabel = profileForm.querySelector('label[for="weight"]') as HTMLLabelElement;
    if (weightLabel) {
        weightLabel.textContent = `Weight (${weightUnit})`;
    }
}

function handleProfileChange() {
    const formData = new FormData(profileForm);
    const profile: Profile = {
        name: loggedInUser!, // Username is the constant name
        age: Number(formData.get('age')) || undefined,
        weight: Number(formData.get('weight')) || undefined,
        height: Number(formData.get('height')) || undefined,
        goal: formData.get('goal') as string,
        weightUnit: (formData.get('weight-unit') as 'lbs' | 'kg') || 'lbs',
    };
    saveUserData('userProfile', profile);

    // Update weight label dynamically
    const weightLabel = profileForm.querySelector('label[for="weight"]') as HTMLLabelElement;
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

function openProgramDetailsModal(programData: any) {
    generatedProgramToSave = programData;

    detailsModalTitle.textContent = programData.programName || 'Generated Program';
    detailsModalDescription.textContent = programData.description || '';
    detailsModalWorkoutsContainer.innerHTML = '';

    if (programData.workouts && Array.isArray(programData.workouts)) {
        programData.workouts.forEach((workout: CustomWorkout) => {
            const workoutEl = document.createElement('div');
            workoutEl.className = 'details-workout-block';
            
            let exercisesHTML = '<ul>';
            if (workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0) {
                workout.exercises.forEach((ex: CustomExercise) => {
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

    const programs = loadUserData<CustomProgram[]>('customPrograms', []);

    const newProgram: CustomProgram = {
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
    const workoutBlock = (workoutBlockTemplate.content.cloneNode(true) as DocumentFragment);
    const exerciseContainer = workoutBlock.querySelector('.workout-exercises-container')!;
    const exerciseBlock = (exerciseBlockTemplate.content.cloneNode(true) as DocumentFragment);
    exerciseContainer.appendChild(exerciseBlock);
    programWorkoutsContainer.appendChild(workoutBlock);
}

function handleAddExercise(container: HTMLElement) {
    const exerciseBlock = (exerciseBlockTemplate.content.cloneNode(true) as DocumentFragment);
    container.appendChild(exerciseBlock);
}

function handleModalClickDelegation(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('add-exercise-btn')) {
        const exercisesContainer = target.closest('.workout-block')?.querySelector('.workout-exercises-container');
        if (exercisesContainer) {
            handleAddExercise(exercisesContainer as HTMLElement);
        }
    } else if (target.classList.contains('remove-workout-btn')) {
        target.closest('.workout-block')?.remove();
    } else if (target.classList.contains('remove-exercise-btn')) {
        target.closest('.exercise-block')?.remove();
    }
}

function handleSaveProgram(event: SubmitEvent) {
    event.preventDefault();

    const programNameInput = createProgramForm.querySelector('#program-name') as HTMLInputElement;
    const programDescriptionInput = createProgramForm.querySelector('#program-description') as HTMLTextAreaElement;

    const newProgram: CustomProgram = {
        id: `program_${Date.now()}`,
        name: programNameInput.value.trim(),
        description: programDescriptionInput.value.trim(),
        workouts: []
    };

    const workoutBlocks = programWorkoutsContainer.querySelectorAll('.workout-block');
    workoutBlocks.forEach(block => {
        const workoutNameInput = block.querySelector('.workout-name-input') as HTMLInputElement;
        const workout: CustomWorkout = {
            name: workoutNameInput.value.trim(),
            exercises: []
        };

        const exerciseBlocks = block.querySelectorAll('.exercise-block');
        exerciseBlocks.forEach(exBlock => {
            const exercise: CustomExercise = {
                name: (exBlock.querySelector('.exercise-name-input') as HTMLInputElement).value.trim(),
                sets: Number((exBlock.querySelector('.exercise-sets-input') as HTMLInputElement).value),
                metricValue: (exBlock.querySelector('.exercise-metric-input') as HTMLInputElement).value,
                metricUnit: (exBlock.querySelector('.exercise-unit-select') as HTMLSelectElement).value,
                description: (exBlock.querySelector('.exercise-description-input') as HTMLTextAreaElement).value.trim()
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
        const programs = loadUserData<CustomProgram[]>('customPrograms', []);
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
function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
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
            text: `Analyze the provided document, which contains a workout plan. Extract the program name, a brief description, and all the workouts. For each workout, extract its name (e.g., 'Day 1' or 'Push Day') and a list of its exercises. For each exercise, extract its name, the number of sets, a metricValue (e.g., '8-12' or '500'), a metricUnit from a list: 'reps', 'meters', 'yards', 'miles', and any description. Format the result as a single JSON object that strictly adheres to the provided schema. Do not include any explanatory text or markdown formatting before or after the JSON object.`
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

function populateProgramForm(programData: any) {
    try {
        (createProgramForm.querySelector('#program-name') as HTMLInputElement).value = programData.programName || '';
        (createProgramForm.querySelector('#program-description') as HTMLTextAreaElement).value = programData.description || '';

        programWorkoutsContainer.innerHTML = ''; // Clear existing

        if (programData.workouts && Array.isArray(programData.workouts)) {
            programData.workouts.forEach((workout: any) => {
                const workoutBlock = (workoutBlockTemplate.content.cloneNode(true) as DocumentFragment);
                const workoutNameInput = workoutBlock.querySelector('.workout-name-input') as HTMLInputElement;
                const exerciseContainer = workoutBlock.querySelector('.workout-exercises-container')!;
                
                workoutNameInput.value = workout.name || '';

                if (workout.exercises && Array.isArray(workout.exercises)) {
                    exerciseContainer.innerHTML = ''; // Clear default exercise
                    workout.exercises.forEach((exercise: any) => {
                        const exerciseBlock = (exerciseBlockTemplate.content.cloneNode(true) as DocumentFragment);
                        (exerciseBlock.querySelector('.exercise-name-input') as HTMLInputElement).value = exercise.name || '';
                        (exerciseBlock.querySelector('.exercise-sets-input') as HTMLInputElement).value = exercise.sets || '';
                        (exerciseBlock.querySelector('.exercise-metric-input') as HTMLInputElement).value = exercise.metricValue || '';
                        (exerciseBlock.querySelector('.exercise-unit-select') as HTMLSelectElement).value = exercise.metricUnit || 'reps';
                        (exerciseBlock.querySelector('.exercise-description-input') as HTMLTextAreaElement).value = exercise.description || '';
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

function renderCalendar(year: number, month: number) {
    calendarGrid.innerHTML = '';
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    today.setHours(0,0,0,0);

    const schedule = loadUserData<ScheduledWorkout[]>('workoutSchedule', []);
    const history = loadUserData<WorkoutPlan[]>('workoutHistory', []);

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

function handleCalendarClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const entry = target.closest<HTMLElement>('.calendar-workout-entry');
    if (entry) {
        const dayCell = entry.closest<HTMLElement>('.calendar-day');
        const scheduledDate = dayCell?.dataset.date;
        const { programId, workoutIndex } = entry.dataset;

        if (programId && workoutIndex && scheduledDate) {
            const programs = loadUserData<CustomProgram[]>('customPrograms', []);
            const program = programs.find(p => p.id === programId);
            const workout = program?.workouts[parseInt(workoutIndex, 10)];
            if(program && workout) {
                openWorkoutOverviewModal(workout, program, scheduledDate);
            }
        }
    }
}

function openScheduleModal(programId: string) {
    const programs = loadUserData<CustomProgram[]>('customPrograms', []);
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    scheduleModalTitle.textContent = `Schedule: ${program.name}`;
    scheduleProgramForm.dataset.programId = programId;
    
    // Reset the date input value and checkboxes to a default state
    (scheduleProgramForm.querySelector('#schedule-start-date') as HTMLInputElement).value = '';
    const dayCheckboxes = scheduleProgramForm.querySelectorAll<HTMLInputElement>('input[name="schedule-day"]');
    dayCheckboxes.forEach(cb => {
        // Set a default schedule like M/W/F
        const day = parseInt(cb.value);
        cb.checked = [1, 3, 5].includes(day);
    });


    scheduleProgramModal.classList.remove('hidden');
}

function closeScheduleModal() {
    scheduleProgramModal.classList.add('hidden');
}

function handleSaveSchedule(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const programId = form.dataset.programId;
    const startDateInput = form.querySelector('#schedule-start-date') as HTMLInputElement;
    const dayCheckboxes = form.querySelectorAll<HTMLInputElement>('input[name="schedule-day"]:checked');

    if (!programId || !startDateInput.value) {
        alert("Please select a start date.");
        return;
    }

    if (dayCheckboxes.length === 0) {
        alert("Please select at least one day of the week to schedule workouts.");
        return;
    }

    const programs = loadUserData<CustomProgram[]>('customPrograms', []);
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    let schedule = loadUserData<ScheduledWorkout[]>('workoutSchedule', []);
    // Remove any previously scheduled workouts for this program
    schedule = schedule.filter(s => s.programId !== programId);
    
    const selectedDays = Array.from(dayCheckboxes).map(cb => parseInt(cb.value, 10));
    
    const trainingWorkouts = program.workouts; // Include rest days to preserve indices, but we'll only schedule ones with exercises
    if (trainingWorkouts.length === 0) {
        alert("This program has no workouts to schedule.");
        closeScheduleModal();
        return;
    }

    const startDate = new Date(startDateInput.value + 'T00:00:00');
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

            const newScheduledWorkout: ScheduledWorkout = {
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
function openWorkoutOverviewModal(workout: CustomWorkout, program: CustomProgram, scheduledDate: string) {
    dataForWorkoutOverviewModal = { workout, program, scheduledDate };
    overviewModalTitle.textContent = `${program.name}: ${workout.name}`;
    
    let exercisesHTML = '';
    if (workout.exercises && workout.exercises.length > 0) {
        exercisesHTML = '<div class="details-workout-block"><ul>';
        workout.exercises.forEach((ex: CustomExercise) => {
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


// --- Authentication Logic ---

function showAuthError(message: string) {
    authError.textContent = message;
    authError.classList.remove('hidden');
}

function clearAuthError() {
    authError.textContent = '';
    authError.classList.add('hidden');
}

function handleRegister(event: SubmitEvent) {
    event.preventDefault();
    clearAuthError();
    const formData = new FormData(registerForm);
    const username = (formData.get('username') as string || '').trim();
    const password = formData.get('password') as string;
    const secretQuestion = formData.get('secret-question') as string;
    const secretAnswer = (formData.get('secret-answer') as string || '').trim();

    if (!username || !password) {
        showAuthError('Username and password cannot be empty.');
        return;
    }
    if (!secretQuestion || !secretAnswer) {
        showAuthError('Please provide a secret question and answer for account recovery.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some((user: any) => user.username.toLowerCase() === username.toLowerCase());

    if (userExists) {
        showAuthError('Username already taken. Please choose another.');
        return;
    }

    // In a real app, hash the password!
    users.push({ username, password, secretQuestion, secretAnswer });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! Please log in.');
    switchToLoginView();
}

function handleLogin(event: SubmitEvent) {
    event.preventDefault();
    clearAuthError();
    const formData = new FormData(loginForm);
    const username = (formData.get('username') as string || '').trim();
    const password = formData.get('password') as string;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());

    // In a real app, compare hashed passwords!
    if (!user || user.password !== password) {
        showAuthError('Invalid username or password.');
        return;
    }

    // Success
    loggedInUser = user.username;
    if (stayLoggedInCheckbox.checked) {
        localStorage.setItem('loggedInUser', username);
    } else {
        sessionStorage.setItem('loggedInUser', username);
    }
    
    initializeApp();
}

function handleLogout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('loggedInUser');
    window.location.reload(); // Easiest way to reset all state
}

function handleForgotPasswordRequest(event: SubmitEvent) {
    event.preventDefault();
    clearAuthError();
    const formData = new FormData(forgotPasswordRequestForm);
    const username = (formData.get('username') as string || '').trim();

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        showAuthError('Username not found.');
        return;
    }
    if (!user.secretQuestion) {
        showAuthError('This account does not have a secret question set up for recovery.');
        return;
    }

    userToResetPassword = user.username;
    secretQuestionDisplay.textContent = user.secretQuestion;
    forgotPasswordRequestForm.classList.add('hidden');
    forgotPasswordResetForm.classList.remove('hidden');
}

function handleResetPasswordSubmit(event: SubmitEvent) {
    event.preventDefault();
    clearAuthError();
    if (!userToResetPassword) return; // Should not happen

    const formData = new FormData(forgotPasswordResetForm);
    const answer = (formData.get('secret-answer') as string || '').trim();
    const newPassword = formData.get('new-password') as string;

    if (!answer || !newPassword) {
        showAuthError('Please fill out all fields.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.username === userToResetPassword);
    
    if (userIndex === -1) {
        showAuthError('An unexpected error occurred. Please try again.');
        return;
    }
    const user = users[userIndex];

    // Case-insensitive comparison for the secret answer
    if (user.secretAnswer.toLowerCase() !== answer.toLowerCase()) {
        showAuthError('The secret answer is incorrect.');
        return;
    }

    // Success - update password
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    alert('Password has been reset successfully. Please log in with your new password.');
    userToResetPassword = null;
    switchToLoginView();
}


/**
 * Switches the auth UI to the login view.
 */
function switchToLoginView() {
    clearAuthError();
    loginForm.reset();
    registerView.classList.add('hidden');
    forgotPasswordView.classList.add('hidden');
    loginView.classList.remove('hidden');
}

/**
 * Checks for a logged-in user in localStorage or sessionStorage.
 * Initializes the app if a user is found, otherwise shows the auth screen.
 */
function checkLoginStatus() {
    const user = localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser');
    if (user) {
        loggedInUser = user;
        initializeApp();
    } else {
        authScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

/**
 * Main entry point for the application.
 */
function main() {
  // --- Auth View Listeners ---
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  logoutBtn.addEventListener('click', handleLogout);
  forgotPasswordRequestForm.addEventListener('submit', handleForgotPasswordRequest);
  forgotPasswordResetForm.addEventListener('submit', handleResetPasswordSubmit);

  showRegisterViewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuthError();
    registerForm.reset();
    loginView.classList.add('hidden');
    forgotPasswordView.classList.add('hidden');
    registerView.classList.remove('hidden');
  });

  showLoginViewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchToLoginView();
  });

  showForgotPasswordViewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuthError();
    forgotPasswordRequestForm.reset();
    forgotPasswordResetForm.reset();
    loginView.classList.add('hidden');
    registerView.classList.add('hidden');
    forgotPasswordView.classList.remove('hidden');
    forgotPasswordRequestForm.classList.remove('hidden');
    forgotPasswordResetForm.classList.add('hidden');
  });

  backToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchToLoginView();
  });
  
  // Check login status on page load
  checkLoginStatus();
}


// --- App Initialization ---
main();