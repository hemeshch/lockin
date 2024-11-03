import { OpenAI } from 'openai'
import 'dotenv/config'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

// Function to create embeddings for a given text
async function getEmbedding(text) {
	const response = await openai.embeddings.create({
		model: 'text-embedding-3-small',
		input: text,
		encoding_format: 'float',
	})

	return response.data[0].embedding
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0)
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0))
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0))
	return dotProduct / (magnitudeA * magnitudeB)
}

// Main function to check if the tab content is related to the task
async function isRelated(task, tabName) {
	// Get embeddings for both the task and the tab title
	const taskEmbedding = await getEmbedding(task)
	const tabEmbedding = await getEmbedding(tabName)

	// Calculate the similarity between the task and the tab title
	const similarity = cosineSimilarity(taskEmbedding, tabEmbedding)

	// Define a threshold for determining relevance; adjust as needed
	const threshold = 0.2
	return similarity > threshold
}

;(async () => {
	const task = 'Learn Photoelectric Effect'
	const tabName = 'Khan Academy'

	const related = await isRelated(task, tabName)
	console.log(`Is the tab related to the task? ${related}`)
})()
