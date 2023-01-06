import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
let loadInterval

const loader = (e) => {
  e.textContent = ''

  loadInterval = setInterval(() => {
    e.textContent += '.'

    if (e.textContent === '....') {
      e.textContent = ''
    }
  })
}

const typeText = (e, text) => {
  let i = 0

  let interval = setInterval(() => {
    if (i < text.length) {
      e.innerHTML += text.charAt(i)
      i++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

const getUniqueId = () => {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

const chatStripe = (isAI, value, uniqueId) => {
  return `
      <div class='wrapper ${isAI && 'ai'}'>
        <div class='chat'>
          <div class='profile'>
            <img 
              src='${isAI ? bot : user}' 
              alt='${isAI ? 'bot' : 'user'}'
            />
          </div>

          <div class='message' id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  //  User's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  form.reset()

  // Bot's chatstripe
  const uniqueId = getUniqueId()
  chatContainer.innerHTML += chatStripe(true, '', uniqueId)

  chatContainer.scrollTo = chatContainer.scrollHeight

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  // Fetch data from server => bot's response
  const response = await fetch('http://localhost:8000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ''

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim()


    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()
    messageDiv.innerHTML = 'Something went wrong. Try again.'
    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})
