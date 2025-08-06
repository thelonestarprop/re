// app.js

// Global object to store fetched quiz data, keyed by module name (e.g., 'module1', 'module2')
const quizDataCache = {};

// DOM elements
const quizTitleEl = document.getElementById('quiz-title');
const quizContentEl = document.getElementById('quiz-content');
const progressContainer = document.getElementById('progress-container');
const correctCountEl = document.getElementById('correct-count');
const incorrectCountEl = document.getElementById('incorrect-count');
const correctBarEl = document.getElementById('correct-bar');
const incorrectBarEl = document.getElementById('incorrect-bar');
const quizListContainer = document.getElementById('quiz-list-container');


// State variables
let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let totalQuestions = 0;

/**
 * Loads a quiz by first fetching its module data if not already cached.
 * @param {string} category The name of the quiz unit to load (e.g., "M1 - Unit 1").
 */
async function loadQuiz(category) {
    // Extract the module identifier from the category string (e.g., "M1" from "M1 - Unit 1")
    // This assumes module names are consistent (e.g., "M1", "M2", etc.)
    const modulePrefix = category.split(' ')[0]; // Gets "M1", "M2", etc.
    const moduleFileName = modulePrefix.toLowerCase(); // Converts to "m1", "m2" for file names

    // Check if the module data is already in our cache
    if (!quizDataCache[modulePrefix]) {
        try {
            // Construct the path to the JSON file
            const filePath = `data/${moduleFileName}.json`;
            const response = await fetch(filePath);

            if (!response.ok) {
                // Handle HTTP errors (e.g., 404 Not Found)
                throw new Error(`Failed to load quiz data for ${modulePrefix}: ${response.statusText}`);
            }
            const data = await response.json();
            // Store the fetched data in the cache using the module prefix as the key
            quizDataCache[modulePrefix] = data;
        } catch (error) {
            console.error('Error fetching quiz data:', error);
            quizContentEl.innerHTML = `<p class="text-center text-red-500">Error loading quiz data. Please check the console for details.</p>`;
            return; // Stop execution if data fetching fails
        }
    }

    // Now that the module's data is guaranteed to be in quizDataCache,
    // retrieve the specific unit's questions.
    const quizUnitData = quizDataCache[modulePrefix][category];

    if (!quizUnitData) {
        quizContentEl.innerHTML = `<p class="text-center text-red-500">Error: Quiz unit "${category}" not found within its module.</p>`;
        return;
    }

    // Reset quiz state for the new quiz
    currentQuizQuestions = quizUnitData;
    totalQuestions = currentQuizQuestions.length;
    currentQuestionIndex = 0;
    correctCount = 0;
    incorrectCount = 0;

    // Update UI and display the first question
    quizTitleEl.textContent = `${category} Quiz`;
    progressContainer.classList.remove('hidden');
    updateProgress();
    showQuestion();
}

/**
 * Displays the current question and its answers.
 */
function showQuestion() {
    if (currentQuestionIndex < totalQuestions) {
        const question = currentQuizQuestions[currentQuestionIndex];
        
        // Clear previous content
        quizContentEl.innerHTML = '';

        // Create and append the question element
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('text-2xl', 'font-bold', 'mb-6', 'text-gray-900', 'dark:text-gray-200', 'text-center');
        questionDiv.textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}: ${question.question}`;
        quizContentEl.appendChild(questionDiv);

        // Create and append the answers container
        const answersDiv = document.createElement('div');
        answersDiv.classList.add('space-y-4');
        question.answers.forEach((answer) => {
            const answerBtn = document.createElement('button');
            answerBtn.classList.add('answer-btn', 'w-full', 'p-4', 'bg-gray-200', 'dark:bg-gray-700', 'rounded-lg', 'text-gray-800', 'dark:text-gray-200', 'font-medium', 'text-left', 'hover:bg-gray-300', 'dark:hover:bg-gray-600', 'transition-colors', 'duration-200');
            answerBtn.textContent = answer.text;
            answerBtn.addEventListener('click', () => handleAnswer(answerBtn, answer.correct, question.explanation));
            answersDiv.appendChild(answerBtn);
        });
        quizContentEl.appendChild(answersDiv);

        // Add feedback and next button containers
        const feedbackContainer = document.createElement('div');
        feedbackContainer.id = 'feedback-container';
        feedbackContainer.classList.add('mt-4', 'p-4', 'rounded-lg', 'text-white', 'font-semibold', 'whitespace-pre-wrap', 'hidden'); // Hidden by default
        quizContentEl.appendChild(feedbackContainer);

        const nextButton = document.createElement('button');
        nextButton.id = 'next-button';
        nextButton.classList.add('mt-6', 'w-full', 'p-4', 'bg-blue-600', 'text-white', 'rounded-lg', 'font-bold', 'hover:bg-blue-700', 'transition-colors', 'duration-200', 'hidden'); // Hidden by default
        nextButton.textContent = 'Next Question';
        nextButton.addEventListener('click', nextQuestion);
        quizContentEl.appendChild(nextButton);

    } else {
        // Quiz finished
        displayQuizResults();
    }
}

/**
 * Handles the user's answer selection.
 * @param {HTMLElement} selectedButton The button element that was clicked.
 * @param {boolean} isCorrect Whether the selected answer is correct.
 * @param {string} explanation The explanation for the answer.
 */
function handleAnswer(selectedButton, isCorrect, explanation) {
    // Disable all answer buttons after selection
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('hover:bg-gray-300', 'dark:hover:bg-gray-600');
    });

    const feedbackContainer = document.getElementById('feedback-container');
    const nextButton = document.getElementById('next-button');

    feedbackContainer.classList.remove('hidden');
    nextButton.classList.remove('hidden');

    if (isCorrect) {
        correctCount++;
        selectedButton.classList.add('bg-green-500', 'dark:bg-green-700');
        feedbackContainer.classList.remove('bg-red-500', 'dark:bg-red-700');
        feedbackContainer.classList.add('bg-green-500', 'dark:bg-green-700');
        feedbackContainer.textContent = 'Correct!';
    } else {
        incorrectCount++;
        selectedButton.classList.add('bg-red-500', 'dark:bg-red-700');
        feedbackContainer.classList.remove('bg-green-500', 'dark:bg-green-700');
        feedbackContainer.classList.add('bg-red-500', 'dark:bg-red-700');
        feedbackContainer.textContent = `Incorrect. ${explanation}`;
        // Highlight the correct answer
        const currentQuestion = currentQuizQuestions[currentQuestionIndex];
        currentQuestion.answers.forEach(answer => {
            if (answer.correct) {
                document.querySelectorAll('.answer-btn').forEach(btn => {
                    if (btn.textContent === answer.text) {
                        btn.classList.add('bg-green-500', 'dark:bg-green-700', 'border-2', 'border-green-800');
                    }
                });
            }
        });
    }
    updateProgress();
}

/**
 * Moves to the next question or displays quiz results.
 */
function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

/**
 * Updates the progress bar and counts.
 */
function updateProgress() {
    correctCountEl.textContent = `Correct: ${correctCount}`;
    incorrectCountEl.textContent = `Incorrect: ${incorrectCount}`;

    const correctPercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const incorrectPercentage = totalQuestions > 0 ? (incorrectCount / totalQuestions) * 100 : 0;
    const totalAnswered = correctCount + incorrectCount;
    const remainingPercentage = totalQuestions > 0 ? ((totalQuestions - totalAnswered) / totalQuestions) * 100 : 0;


    correctBarEl.style.width = `${correctPercentage}%`;
    incorrectBarEl.style.width = `${incorrectPercentage}%`;

    // Adjust the position of the incorrect bar based on the correct bar
    incorrectBarEl.style.left = `${correctPercentage}%`;
}

/**
 * Displays the final quiz results.
 */
function displayQuizResults() {
    quizContentEl.innerHTML = `
        <h2 class="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">Quiz Complete!</h2>
        <div class="text-center text-xl space-y-2">
            <p class="text-green-600">Total Correct: ${correctCount}</p>
            <p class="text-red-600">Total Incorrect: ${incorrectCount}</p>
            <p class="text-gray-700 dark:text-gray-300">You scored ${((correctCount / totalQuestions) * 100).toFixed(2)}%</p>
        </div>
        <button onclick="restartQuiz()" class="mt-8 w-full p-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors duration-200">
            Restart Quiz
        </button>
    `;
    // Hide progress container when quiz is over
    progressContainer.classList.add('hidden');
}

/**
 * Restarts the current quiz.
 */
function restartQuiz() {
    const currentCategory = quizTitleEl.textContent.replace(' Quiz', '');
    loadQuiz(currentCategory);
}

// Event listener for quiz selection buttons
quizListContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('quiz-btn')) {
        const category = event.target.dataset.quiz;
        loadQuiz(category);
    }
});
