document.addEventListener('DOMContentLoaded', function () {
	// Load initial tasks
	loadTasks()

	// Add event listeners
	document.getElementById('add-todo-btn').addEventListener('click', addTask)
	document.getElementById('todo-input').addEventListener('keypress', function (event) {
		if (event.key === 'Enter') {
			addTask()
			event.preventDefault()
		}
	})
})

function loadTasks() {
	chrome.storage.sync.get(['tasks'], function (result) {
		const tasks = result.tasks || []
		tasks.forEach((task) => renderTask(task))
	})
}

function addTask() {
	const input = document.getElementById('todo-input')
	const taskText = input.value.trim()
	if (!taskText) return

	const task = {
		id: Date.now(),
		text: taskText,
		completed: false,
	}

	chrome.storage.sync.get(['tasks'], function (result) {
		const tasks = result.tasks || []
		tasks.push(task)
		chrome.storage.sync.set({ tasks: tasks }, function () {
			renderTask(task)
			input.value = ''
		})
	})
}

function renderTask(task) {
	const taskItem = document.createElement('li')
	taskItem.className = 'task-item flex items-center p-4 bg-gray-50 rounded-xl transition-all duration-200'

	const checkbox = document.createElement('input')
	checkbox.type = 'checkbox'
	checkbox.className = 'custom-checkbox mr-4'
	checkbox.checked = task.completed

	const taskLabel = document.createElement('span')
	taskLabel.className = `flex-grow text-gray-700 ${task.completed ? 'completed' : ''}`
	taskLabel.textContent = task.text

	const deleteBtn = document.createElement('button')
	deleteBtn.className = 'delete-btn text-red-500 hover:text-red-700 transition-colors duration-200'
	deleteBtn.textContent = 'Delete'

	// Add event listeners
	checkbox.addEventListener('change', () => toggleTask(task.id, taskLabel, checkbox))
	taskLabel.addEventListener('click', () => toggleTask(task.id, taskLabel, checkbox))
	deleteBtn.addEventListener('click', () => deleteTask(task.id, taskItem))

	taskItem.appendChild(checkbox)
	taskItem.appendChild(taskLabel)
	taskItem.appendChild(deleteBtn)
	document.getElementById('todo-list').appendChild(taskItem)
}

function toggleTask(id, label, checkbox) {
	chrome.storage.sync.get(['tasks'], function (result) {
		const tasks = result.tasks || []
		const task = tasks.find((t) => t.id === id)
		if (task) {
			task.completed = checkbox.checked
			label.classList.toggle('completed', task.completed)
			chrome.storage.sync.set({ tasks: tasks })
		}
	})
}

function deleteTask(id, taskElement) {
	chrome.storage.sync.get(['tasks'], function (result) {
		let tasks = result.tasks || []
		tasks = tasks.filter((t) => t.id !== id)
		chrome.storage.sync.set({ tasks: tasks }, function () {
			taskElement.style.opacity = '0'
			setTimeout(() => taskElement.remove(), 200)
		})
	})
}
