import { Router } from 'express'
const router = Router()

import taskController from './controller/taskController.js'

import axios from 'axios'
import 'dotenv/config'

// it should verify that these requests are coming from a chrome extensions
// also a uid for each user

//customize the goal and time for each task.

if (!router.locals) {
	router.locals = {}
}

router.locals.goalNeeded = 'Learn about the photoelectric effect in 2 hours.'

router.get('/', function (req, res) {
	res.send('Hello World!')
})

router.post('/initial', function (req, res) {
	router.locals.goalNeeded = req.body.taskGoal //global variable.

	let websiteData = {
		messages: [
			{
				content: `Goal: ${router.locals.goalNeeded}. Just list 5 real websites absolutely required to achieve the goal. (without www, separated by a commas)`,
				role: 'user',
			},
		],
		model: 'gpt-4',
		max_tokens: 50,
	}

	// let taskListData = {
	// 	messages: [
	// 		{
	// 			content: `Goal: Learn about the photoelectric effect in 2 hours. Just give 4 subheadings that users needs to do to achieve the goal. `,
	// 			role: 'user',
	// 		},
	// 	],
	// 	model: 'gpt-4',
	// 	max_tokens: 100,
	// }

	axios
		.post('https://api.openai.com/v1/chat/completions', websiteData, {
			headers: {
				Authorization: `Bearer ${process.env.AI21API}`,
				'Content-Type': 'application/json',
			},
		})
		.then(function (result) {
			res.json(result.data.choices[0].message.content)
		})
})

router.post('/check', function (req, res) {
	console.log(router.locals.goalNeeded)

	let requestData = {
		messages: [
			{
				content: `Help the user stay on top of completing their task. Is the current tab possibly related to achieving the goal? Just reply with a Yes or No. `,
				role: 'system',
			},
			{
				content: `Goal: ${router.locals.goalNeeded}. \n Current Browser Tab Title: ${req.body.titleTab}`,
				role: 'user',
			},
		],
		model: 'gpt-4',
		max_tokens: 10,
	}

	axios
		.post('https://api.openai.com/v1/chat/completions', requestData, {
			headers: {
				Authorization: `Bearer ${process.env.AI21API}`,
				'Content-Type': 'application/json',
			},
		})
		.then(function (result) {
			res.json(result.data.choices[0].message.content)
		})
})

export default router
