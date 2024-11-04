import { cat, pipeline } from '@huggingface/transformers'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Hugging Face pipeline
let extractor
;(async () => {
	extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
		device: 'cpu',
		dtype: 'fp32',
	})
})()

const cosineSimilarity = (vecA, vecB) => {
	const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0)
	const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0))
	const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0))
	return dotProduct / (magnitudeA * magnitudeB)
}

const checkRelevanceMiniLM = async (task, tabName) => {
	const embeddings = await extractor([task, tabName], { pooling: 'mean', normalize: true })
	const taskEmbedding = embeddings[0].data
	const tabEmbedding = embeddings[1].data
	const similarity = cosineSimilarity(taskEmbedding, tabEmbedding)
	return similarity > 0.4
}

// // This is just an alternative method using OpenAI's text-embedding-3-small model
//
// const getOpenAIEmbedding = async (text) => {
// 	const response = await openai.embeddings.create({
// 		model: 'text-embedding-3-small',
// 		input: text,
// 		encoding_format: 'float',
// 	})
// 	return response.data[0].embedding
// }

// const checkRelevanceOpenAI = async (task, tabName) => {
// 	const taskEmbedding = await getOpenAIEmbedding(task)
// 	const tabEmbedding = await getOpenAIEmbedding(tabName)
// 	const similarity = cosineSimilarity(taskEmbedding, tabEmbedding)
// 	return similarity > 0.2
// }

export const getHome = (req, res) => {
	res.send('Hello World!')
}

export const createInitialTask = async (req, res) => {
	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			max_tokens: 50,
			messages: [
				{
					content: `Goal: ${req.body.taskGoal}. Just list 5 real websites absolutely required to achieve the goal (without www, separated by commas). Nothing else. `,
					role: 'user',
				},
			],
		})

		console.log(completion.choices[0].message.content)
		res.json(completion.choices[0].message.content)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
}

export const checkTask = async (req, res) => {
	try {
		const { titleTab, goalNeeded, URLTab } = req.body
		console.log(titleTab, goalNeeded)

		const isRelevant = await checkRelevanceMiniLM(goalNeeded, titleTab)

		// If tab is not relevant, get GPT-4's opinion as a backup
		if (!isRelevant) {
			try {
				const completion = await openai.chat.completions.create({
					model: 'gpt-4o',
					max_tokens: 10,
					temperature: 0,
					messages: [
						{
							role: 'system',
							content: `Help the user stay on top of completing their task. Is the current tab possibly related to achieving the goal? Carefully check YouTube videos. Just reply with a Yes or No.`,
						},
						{
							content: `Goal: ${goalNeeded}. \n Current Browser Tab Title: ${titleTab}`,
							role: 'user',
						},
					],
				})

				console.log(goalNeeded, titleTab, URLTab)
				console.log("AI's opinion:", completion.choices[0].message)
				res.json({
					result: completion.choices[0].message,
				})
			} catch (error) {
				res.status(500).json({ error: error.message })
			}
		} else {
			console.log('Embeddings opinion:', isRelevant)
			res.json({
				result: 'Yes',
			})
		}
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
}
