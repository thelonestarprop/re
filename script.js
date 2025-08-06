// script.js

// DOM elements
const questionDisplay = document.getElementById('question-display');
const answerButtons = document.getElementById('answer-buttons');
const feedbackMessage = document.getElementById('feedback-message');
const nextButton = document.getElementById('next-button');

// Quiz state variables
let currentQuestionIndex = 0;
let score = 0;

/**
 * Starts the quiz by resetting state and displaying the first question.
 */
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.classList.add('hidden'); // Hide next button initially
    feedbackMessage.classList.add('hidden'); // Hide feedback initially
    showQuestion();
}

/**
 * Displays the current question and its answer choices.
 */
function showQuestion() {
    // Clear previous answers and feedback
    answerButtons.innerHTML = '';
    feedbackMessage.classList.add('hidden');
    feedbackMessage.textContent = '';
    nextButton.classList.add('hidden');

    if (currentQuestionIndex < quizQuestions.length) {
        const currentQuestion = quizQuestions[currentQuestionIndex];
        questionDisplay.textContent = currentQuestion.question;

        // Create answer buttons
        currentQuestion.answers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer.text;
            button.classList.add(
                'answer-btn', // Custom class for easy selection
                'w-full', 'p-4', 'bg-gray-200', 'dark:bg-gray-700', 'rounded-lg',
                'text-gray-800', 'dark:text-gray-200', 'font-medium', 'text-left',
                'hover:bg-gray-300', 'dark:hover:bg-gray-600', 'transition-colors', 'duration-200'
            );
            // Add a data attribute to store whether the answer is correct
            button.dataset.correct = answer.correct;
            button.addEventListener('click', selectAnswer);
            answerButtons.appendChild(button);
        });
    } else {
        // Quiz finished
        displayResults();
    }
}

/**
 * Handles the user's answer selection.
 * @param {Event} event The click event.
 */
function selectAnswer(event) {
    const selectedButton = event.target;
    const isCorrect = selectedButton.dataset.correct === 'true';

    // Disable all answer buttons after one is selected
    Array.from(answerButtons.children).forEach(button => {
        button.disabled = true;
        button.classList.remove('hover:bg-gray-300', 'dark:hover:bg-gray-600');
    });

    // Show feedback message
    feedbackMessage.classList.remove('hidden');
    nextButton.classList.remove('hidden'); // Show next button

    if (isCorrect) {
        score++;
        selectedButton.classList.add('bg-green-500', 'dark:bg-green-700');
        feedbackMessage.classList.remove('bg-red-500', 'dark:bg-red-700');
        feedbackMessage.classList.add('bg-green-500', 'dark:bg-green-700');
        feedbackMessage.textContent = 'Correct!';
    } else {
        selectedButton.classList.add('bg-red-500', 'dark:bg-red-700');
        feedbackMessage.classList.remove('bg-green-500', 'dark:bg-green-700');
        feedbackMessage.classList.add('bg-red-500', 'dark:bg-red-700');
        
        // Find and highlight the correct answer
        const currentQuestion = quizQuestions[currentQuestionIndex];
        currentQuestion.answers.forEach(answer => {
            if (answer.correct) {
                Array.from(answerButtons.children).find(btn => btn.textContent === answer.text)
                    .classList.add('bg-green-500', 'dark:bg-green-700', 'border-2', 'border-green-800');
            }
        });
        feedbackMessage.textContent = `Incorrect. The correct answer was: ${currentQuestion.answers.find(a => a.correct).text}. ${currentQuestion.explanation}`;
    }
}

/**
 * Advances to the next question or ends the quiz.
 */
function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

/**
 * Displays the final quiz results.
 */
function displayResults() {
    questionDisplay.textContent = `Quiz Complete!`;
    answerButtons.innerHTML = `
        <p class="text-center text-xl text-gray-700 dark:text-gray-300 mb-4">You scored ${score} out of ${quizQuestions.length} questions correctly!</p>
        <button onclick="startQuiz()" class="w-full p-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors duration-200">
            Restart Quiz
        </button>
    `;
    feedbackMessage.classList.add('hidden');
    nextButton.classList.add('hidden');
}

// Event listener for the next button
nextButton.addEventListener('click', nextQuestion);

// Start the quiz when the page loads
document.addEventListener('DOMContentLoaded', startQuiz);
