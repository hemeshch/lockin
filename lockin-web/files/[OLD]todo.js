document.addEventListener('DOMContentLoaded', loadTasks)

// Modal functionality
const modal = document.getElementById('saved-links-modal')
const btn = document.getElementById('saved-links-btn')
const span = document.getElementById('close-modal')

btn.onclick = function () {
	modal.style.display = 'block'
}

span.onclick = function () {
	modal.style.display = 'none'
}

window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = 'none'
	}
}

function loadTasks() {
	const tasks = JSON.parse(localStorage.getItem('tasks')) || []
	tasks.forEach((task) => renderTask(task))
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

	renderTask(task)
	saveTask(task)
	input.value = ''
}

function renderTask(task) {
	const taskItem = document.createElement('li')
	taskItem.className = 'task-item flex items-center p-4 bg-gray-50 rounded-xl transition-all duration-200'

	const checkbox = document.createElement('input')
	checkbox.type = 'checkbox'
	checkbox.className = 'custom-checkbox mr-4'
	checkbox.checked = task.completed
	checkbox.onclick = () => toggleTask(task.id, taskLabel, checkbox)

	const taskLabel = document.createElement('span')
	taskLabel.className = `flex-grow text-gray-700 ${task.completed ? 'completed' : ''}`
	taskLabel.textContent = task.text
	taskLabel.onclick = () => toggleTask(task.id, taskLabel, checkbox)

	const deleteBtn = document.createElement('button')
	deleteBtn.className = 'delete-btn ml-4 text-red-500 hover:text-red-700 transition-colors duration-200'
	deleteBtn.textContent = 'Delete'
	deleteBtn.onclick = () => deleteTask(task.id, taskItem)

	taskItem.appendChild(checkbox)
	taskItem.appendChild(taskLabel)
	taskItem.appendChild(deleteBtn)
	document.getElementById('todo-list').appendChild(taskItem)
}

function saveTask(task) {
	const tasks = JSON.parse(localStorage.getItem('tasks')) || []
	tasks.push(task)
	localStorage.setItem('tasks', JSON.stringify(tasks))
}

function toggleTask(id, label, checkbox) {
	const tasks = JSON.parse(localStorage.getItem('tasks'))
	const task = tasks.find((t) => t.id === id)
	task.completed = checkbox.checked
	label.classList.toggle('completed', task.completed)
	localStorage.setItem('tasks', JSON.stringify(tasks))
}

function deleteTask(id, taskElement) {
	let tasks = JSON.parse(localStorage.getItem('tasks'))
	tasks = tasks.filter((t) => t.id !== id)
	localStorage.setItem('tasks', JSON.stringify(tasks))
	taskElement.classList.add('opacity-0')
	setTimeout(() => taskElement.remove(), 200)
}

function handleEnter(event) {
	if (event.key === 'Enter') {
		addTask()
		event.preventDefault()
	}
}
