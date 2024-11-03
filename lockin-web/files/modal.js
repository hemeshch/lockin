const modal = document.getElementById('saved-links-modal')
const modalBtn = document.getElementById('saved-links-btn')
const closeBtn = document.getElementById('close-modal')
const linksList = document.getElementById('saved-links-list')

modalBtn.addEventListener('click', () => {
	// Get saved links from background script
	chrome.runtime.sendMessage({ type: 'getSavedLinks' }, (response) => {
		if (response && response.savedLinks) {
			// Clear existing links
			linksList.innerHTML = ''

			// Add new links
			response.savedLinks.forEach((link) => {
				const li = document.createElement('li')
				const a = document.createElement('a')

				a.href = link
				a.target = '_blank'
				a.className = 'text-blue-600 hover:underline'
				a.textContent = link

				li.appendChild(a)
				linksList.appendChild(li)
			})
		}
	})

	modal.style.display = 'block'
})

// Close modal when clicking X
closeBtn.addEventListener('click', () => {
	modal.style.display = 'none'
})

// Close modal when clicking outside
window.addEventListener('click', (event) => {
	if (event.target === modal) {
		modal.style.display = 'none'
	}
})

// Refresh links periodically (every 5 seconds)
setInterval(() => {
	if (modal.style.display === 'block') {
		chrome.runtime.sendMessage({ type: 'getSavedLinks' }, (response) => {
			if (response && response.savedLinks) {
				// Update only if the content is different
				const currentLinks = Array.from(linksList.getElementsByTagName('a')).map((a) => a.href)
				const newLinks = response.savedLinks

				if (JSON.stringify(currentLinks) !== JSON.stringify(newLinks)) {
					linksList.innerHTML = ''
					newLinks.forEach((link) => {
						const li = document.createElement('li')
						const a = document.createElement('a')

						a.href = link
						a.target = '_blank'
						a.className = 'text-blue-600 hover:underline'
						a.textContent = link

						li.appendChild(a)
						linksList.appendChild(li)
					})
				}
			}
		})
	}
}, 5000)
