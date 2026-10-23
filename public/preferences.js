// Shared progressive enhancements. Content and navigation work without JavaScript.
document.documentElement.dataset.enhanced = ''
const themeControl = document.querySelector('#theme')
if (themeControl) {
  try {
    themeControl.value = localStorage.getItem('portfolio-theme') || 'light'
  } catch {
    /* Optional storage. */
  }
  themeControl.addEventListener('change', () => {
    const value = themeControl.value
    if (value === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = value
    try {
      localStorage.setItem('portfolio-theme', value)
    } catch {
      /* Applies for this visit. */
    }
  })
}
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
