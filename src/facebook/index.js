const Bot = require('messenger-bot');


let inform = {
	  token: 'EAAB88KgOVIMBACcAIMquCpZA5s4ebZAnJygIYZAZBL5XYlc4MuEJpS0am7mmuyR2A2FftFDtwIcudTNSedqjnYBvXRR6sZA7QpmStNmfOb2ugcsG7zbcLzo3luheGBbFUCK5ZAQg0m5EQAKzwuL4hBE4JREUAFms98UWmHTykEFQZDZD',
	  verify: 'veryveryverify_token_for_my_test_bot',
	  app_secret: 'ee4ae72413dcef839fadf7def128730f'
	};

let getStartedPayload = [{
      "payload":"USER_DEFINED_PAYLOAD"
	}];

let persistentMenuPayload = [{
      "title":"Some payload",
      "type":"postback",
      "payload":"SOME_PAYLOAD"
    }];

export let bot = new Bot(inform);

bot.setGetStartedButton(getStartedPayload, (err, profile) => {
    if(err) console.log(err)
})

bot.setPersistentMenu(persistentMenuPayload, (err, profile) => {
    if(err) console.log(err)
})

bot.on('postback', (payload, reply, actions) => {
  reply({ text: 'Click payload'}, (err, info) => {})
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err
    let text_answ = `Your message: ${text}`
    reply({ text: text_answ }, (err) => {
      if (err) throw JSON.stringify(err)

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
    })
  })
})
