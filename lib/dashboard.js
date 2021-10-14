export const closeDashboard = () => {
  const closeDashbaordEvent = new Event('close-dashboard', { bubbles: true, cancelable: false })
  document.dispatchEvent(closeDashbaordEvent)
}

export const openDashboard = (dashboardTab) => {
  const openDashbaordEvent = new Event('open-dashboard', { bubbles: true, cancelable: false })
  openDashbaordEvent.dashboardTab = dashboardTab
  document.dispatchEvent(openDashbaordEvent)
}
