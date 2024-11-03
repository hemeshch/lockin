import { pipeline } from '@huggingface/transformers'

const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
	device: 'cpu',
	dtype: 'fp32',
})

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0)
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0))
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0))
	return dotProduct / (magnitudeA * magnitudeB)
}

// Main function to check if the tab content is related to the task
async function isRelated(task, tabName) {
	// Get embeddings for both the task and the tab title
	const embeddings = await extractor([task, tabName], { pooling: 'mean', normalize: true })

	// Convert tensors to arrays
	const taskEmbedding = embeddings[0].data
	const tabEmbedding = embeddings[1].data

	// Calculate the similarity between the task and the tab title
	const similarity = cosineSimilarity(taskEmbedding, tabEmbedding)

	// Define a threshold for determining relevance; adjust as needed
	const threshold = 0.2
	return similarity > threshold
}

;(async () => {
	const task = 'Learn Photoelectric Effect on Khan Academy'
	const tabName = `Khan Academy | Free Online Courses, Lessons & Practice`

	const related = await isRelated(task, tabName)
	console.log(`Is the tab related to the task? ${related}`)
})()
