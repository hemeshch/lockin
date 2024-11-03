let secondsLeft = 20
const proceedBtn = document.getElementById('proceed-btn')
const closeTabBtn = document.getElementById('close-tab-btn')
proceedBtn.disabled = true

const countdown = setInterval(() => {
	secondsLeft--
	if (secondsLeft <= 0) {
		clearInterval(countdown)
		proceedBtn.disabled = false
		proceedBtn.textContent = 'I still wish to proceed'
		proceedBtn.addEventListener('click', proceedWithAction)
	} else {
		proceedBtn.textContent = `I still wish to proceed (Wait ${secondsLeft} seconds)`
	}
}, 1000)

const urlParams = new URLSearchParams(window.location.search)
const returnUrl = urlParams.get('website')

function proceedWithAction() {
	chrome.runtime.sendMessage({ type: 'appendBlockedLink', data: returnUrl }, function (response) {
		window.location.href = returnUrl
	})
}

document.addEventListener('DOMContentLoaded', getCurrentTask)

function getCurrentTask() {
	chrome.runtime.sendMessage({ type: 'getCurrentTask', data: returnUrl }, function (response) {
		document.getElementById('display-task').textContent = response.currentTask
	})
}

closeTabBtn.addEventListener('click', closeTab)

function closeTab() {
	window.open('', '_parent', '')
	window.close()
}
