let timer
let timeLeft
let isPaused = false
let originalDuration
let lastStorageUpdate = 0
const STORAGE_UPDATE_INTERVAL = 1000

document.addEventListener('DOMContentLoaded', function () {
	const stopBtn = document.getElementById('stop-btn')
	const pauseBtn = document.getElementById('pause-btn')

	stopBtn.addEventListener('click', function () {
		stopTimer()
		// Force all other tabs to refresh and show input form
		chrome.storage.local.remove('timerState', function () {
			console.log('Timer stopped and state cleared')
			toggleModules(false)
		})
	})

	pauseBtn.addEventListener('click', function () {
		togglePause()
	})
})

// Listen for storage changes from other tabs
chrome.storage.onChanged.addListener(function (changes, namespace) {
	if (namespace === 'local' && changes.timerState) {
		const newState = changes.timerState.newValue
		if (newState && !timer) {
			// Only update if we're not the active timer
			timeLeft = newState.timeRemaining
			originalDuration = newState.duration
			isPaused = !newState.isRunning
			updateTimerDisplay()

			if (newState.isRunning && !timer) {
				startTimer()
			}
		}
	}
})

// Check timer state when page loads
document.addEventListener('DOMContentLoaded', function () {
	chrome.storage.local.get(['timerState'], function (result) {
		if (result.timerState) {
			const { taskName, duration, timeRemaining, isRunning } = result.timerState

			timeLeft = timeRemaining
			originalDuration = duration
			isPaused = !isRunning

			// Update UI
			document.getElementById('focus-task').textContent = `Task: ${taskName}`
			toggleModules(true)
			updateTimerDisplay()

			if (isRunning) {
				startTimer()
			}
		}
	})
})

// Initialize timer when form is submitted
document.querySelector('form').addEventListener('submit', function (e) {
	e.preventDefault()

	const durationSelect = document.getElementById('duration')
	const selectedDuration = parseInt(durationSelect.value)
	const task = document.querySelector('textarea[name="currentTask"]').value.trim()

	if (!task) {
		alert('Please enter a task description')
		return
	}

	// Set up timer
	originalDuration = selectedDuration * 60 // Convert to seconds
	timeLeft = originalDuration
	isPaused = false

	// Save timer state to Chrome storage
	const timerState = {
		taskName: task,
		duration: originalDuration,
		timeRemaining: timeLeft,
		isRunning: true,
		lastUpdate: Date.now(),
	}

	chrome.storage.local.set({ timerState }, function () {
		console.log('Timer state saved')
	})

	// Update UI
	document.getElementById('focus-task').textContent = `Task: ${task}`
	toggleModules(true)
	updateTimerDisplay()
	startTimer()
})

function startTimer() {
	if (!timer && !isPaused) {
		timer = setInterval(updateTimer, 1000)
	}
}

function togglePause() {
	const pauseBtn = document.getElementById('pause-btn')
	if (isPaused) {
		isPaused = false
		pauseBtn.textContent = 'Pause'

		// Update storage with running state
		chrome.storage.local.get(['timerState'], function (result) {
			if (result.timerState) {
				result.timerState.isRunning = true
				result.timerState.timeRemaining = timeLeft
				result.timerState.lastUpdate = Date.now()
				chrome.storage.local.set({ timerState: result.timerState })
			}
		})

		startTimer()
	} else {
		isPaused = true
		pauseBtn.textContent = 'Resume'
		clearInterval(timer)
		timer = null

		// Update storage with paused state
		chrome.storage.local.get(['timerState'], function (result) {
			if (result.timerState) {
				result.timerState.isRunning = false
				result.timerState.timeRemaining = timeLeft
				result.timerState.lastUpdate = Date.now()
				chrome.storage.local.set({ timerState: result.timerState })
			}
		})
	}
}

function stopTimer() {
	clearInterval(timer)
	timer = null
	isPaused = false
	timeLeft = originalDuration

	// Clear timer state from storage
	chrome.storage.local.remove('timerState', function () {
		console.log('Timer state cleared')
	})

	// Reset form
	document.querySelector('textarea[name="currentTask"]').value = ''
	document.getElementById('duration').value = '25'

	// Switch back to input form
	toggleModules(false)
}

function updateTimer() {
	if (timeLeft <= 0) {
		clearInterval(timer)
		timer = null
		alert("Time's up!")
		stopTimer()
		return
	}

	timeLeft--
	updateTimerDisplay()

	// Update storage periodically instead of every second
	const now = Date.now()
	if (now - lastStorageUpdate >= STORAGE_UPDATE_INTERVAL) {
		lastStorageUpdate = now
		chrome.storage.local.get(['timerState'], function (result) {
			if (result.timerState) {
				result.timerState.timeRemaining = timeLeft
				result.timerState.lastUpdate = now
				chrome.storage.local.set({ timerState: result.timerState })
			}
		})
	}
}

function updateTimerDisplay() {
	const hours = Math.floor(timeLeft / 3600)
	const minutes = Math.floor((timeLeft % 3600) / 60)
	const seconds = timeLeft % 60

	const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
	document.getElementById('timer').textContent = display

	// Optionally add visual indication of paused state
	const timerElement = document.getElementById('timer')
	if (isPaused) {
		timerElement.classList.add('opacity-50')
	} else {
		timerElement.classList.remove('opacity-50')
	}
}

// Function to show/hide timer and input modules
function toggleModules(showTimer) {
	const inputModule = document.querySelector('.max-w-4xl.mx-auto.bg-white\\/95:first-of-type')
	const timerModule = document.querySelector('.max-w-4xl.mx-auto.bg-white\\/95:nth-of-type(2)')

	if (showTimer) {
		inputModule.classList.add('hidden')
		timerModule.classList.remove('hidden')
	} else {
		inputModule.classList.remove('hidden')
		timerModule.classList.add('hidden')
	}
}
