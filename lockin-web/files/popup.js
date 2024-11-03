let startTaskButton = document.getElementById('startTaskButton')

startTaskButton.addEventListener('click', function () {
	console.log('Clicked')

	// Retrieve task details
	const taskGoal = document.getElementById('currentTask').value.trim()
	const timeValue = parseInt(document.getElementById('duration').value)

	if (isNaN(timeValue)) {
		alert('Please enter a valid task and time.')
		return
	}

	console.log('Task:', taskGoal)
	console.log('Time:', timeValue)

	// Save to Chrome storage for timer persistence
	const timerState = {
		taskName: taskGoal,
		duration: timeValue * 60, // Convert to seconds
		timeRemaining: timeValue * 60,
		isRunning: true,
		startTime: Date.now(),
	}

	chrome.storage.local.set({ timerState }, function () {
		console.log('Timer state saved from popup')
	})

	// Make the API call to the backend
	fetch('http://localhost:3000/initial', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			taskGoal: taskGoal,
			duration: timeValue,
		}),
	})
		.then(function (res) {
			return res.text()
		})
		.then(function (receivedArray) {
			// Send data to Chrome extension
			console.log(receivedArray)
			chrome.runtime.sendMessage(
				{
					type: 'sendData',
					data: {
						receivedArray: receivedArray,
						taskGoal: taskGoal,
					},
				},
				function (response) {
					console.log('Data sent to Chrome extension:', receivedArray)
				}
			)
		})
		.catch(() => {
			console.log("Server API isn't working")
			// Even if API fails, timer will still work due to Chrome storage
		})
})
