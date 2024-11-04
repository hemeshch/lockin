let allowedWebsites = ['google.com', 'notion.so', 'chrome://', 'chrome-extension://', 'asana.com', 'perplexity.ai', 'chatgpt.com', 'wikipedia.org', 'stackoverflow.com', 'github.com', 'khanacademy.org', 'claude.ai', 'youtube.com/watch?v=0b0axfyJ4oo']
let taskSpecificWebsites = []
let currentTask = ''
let savedBlockLinks = []

chrome.runtime.onInstalled.addListener(({ reason }) => {
	if (reason === 'install') {
		chrome.tabs.create({
			url: 'files/installed.html',
		})
	}
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request)
	if (request.type === 'getCurrentTask') {
		if (!savedBlockLinks.includes(request.data)) {
			savedBlockLinks.push(request.data)
		}
		sendResponse({ currentTask: currentTask })
	}
	if (request.type === 'getSavedLinks') {
		sendResponse({ savedLinks: savedBlockLinks })
	}
	if (request.type === 'sendData') {
		//data sent by frontend — this is so cool!
		taskSpecificWebsites = request.data.receivedArray.split(',').map((website) => website.trim().replace(/^"|"$/g, ''))
		currentTask = request.data.taskGoal

		console.log('Task Specific Websites:', taskSpecificWebsites)

		chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
			if (changeInfo.status === 'complete') {
				console.log(`${tab.title}: ${tab.url}`)

				let tabDetails = {
					tabTitle: tab.title,
					tabURL: tab.url,
				}

				if (allowedWebsites.some((website1) => tab.url.includes(website1))) {
					console.log("Essential: It isn't a distraction.")
				} else if (taskSpecificWebsites.some((website2) => tab.url.includes(website2))) {
					console.log("TaskSpecific: It isn't a distraction.")
				} else {
					fetch(`http://localhost:3000/check`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							titleTab: tab.title,
							URLTab: tab.url,
							goalNeeded: currentTask,
						}),
					})
						.then(function (res) {
							return res.text()
						})
						.then(function (data) {
							console.log(data)
							if (data.includes('No')) {
								chrome.tabs.update(tabId, { url: chrome.runtime.getURL('files/blocked.html') + '?website=' + tab.url })
							} else {
								console.log("Tri-Filter: It isn't a distraction.")
							}
						})
						.catch((err) => {
							console.log(err + 'Server API might not be working.')
						})
				}
			}
		})
	}
	if (request.type === 'appendBlockedLink') {
		taskSpecificWebsites.push(request.data)
	} else {
		taskSpecificWebsites = []
	}
})
