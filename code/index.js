const port = 3000
const upstream_uri = process.env.UPSTREAM_URI || 'https://worldtimeapi.org/api/timezone/America/Sao_Paulo'
const service_name = process.env.SERVICE_NAME || 'test-1-v1'
const json_key = process.env.JSON_KEY || 'datetime'

import express from 'express'
const app = express()
import request from 'node-fetch'


app.get('/', async(req, res) => {

	const begin = Date.now()

	// Retorna 500 x% das vezes
	createIssues(req, res)

	// Passa os Headers para frente
	const headers = forwardTraceHeaders(req)

	let up
	try {
		let response  = await request(upstream_uri, {
			headers: headers
		});
        up = await response.text();
	} catch (error) {
		up = error
	}
	const timeSpent = (Date.now() - begin) / 1000 + "segundos"

	res.end(`${service_name} - ${timeSpent}\n${up}`)
})

app.listen(port, () => {
	console.log(`${service_name} listening on port ${port}!`)
})



function forwardTraceHeaders(req) {
	const incoming_headers = [
		'x-request-id',
		'x-b3-traceid',
		'x-b3-spanid',
		'x-b3-parentspanid',
		'x-b3-sampled',
		'x-b3-flags',
		'x-ot-span-context',
		'x-dev-user',
		'fail'
	]
	const headers = {}
	for (let h of incoming_headers) {
		if (req.header(h))
			headers[h] = req.header(h)
	}
	return headers
}



function createIssues(req, res) {
	// define a quantidade de falhas dependendo do header "fail %".
	// falhas ocorrem em cascata, logo não coloque muito alto (menos de 0.3 é o recomendado)
	const failPercent = Number(req.header('fail')) || 0
	console.log(`failPercent: ${failPercent}`)
	if (Math.random() < failPercent) {
		res.status(500).end()
	}
}