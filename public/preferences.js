// Shared progressive enhancements. Content and navigation work without JavaScript.
document.documentElement.dataset.enhanced = ''
function updateClock() {
  const clock = document.querySelector('[data-ist-clock]')
  if (clock)
    clock.textContent = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    })
}
updateClock()
setInterval(updateClock, 15000)
document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy-email]')
  if (!button) return
  try {
    await navigator.clipboard.writeText(button.dataset.copyEmail)
    button.textContent = 'Copied'
    setTimeout(() => {
      button.textContent = 'Copy email'
    }, 2500)
  } catch {
    button.textContent = 'Select the email to copy'
  }
})
