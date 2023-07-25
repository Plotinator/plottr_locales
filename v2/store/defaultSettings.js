export function defaultsForPlatform(platform) {
  if (platform === 'unknown') {
    return web()
  } else {
    return desktop()
  }
}

export function desktop() {
  return {
    showTheTour: false,
    backup: true,
    allowPrerelease: false,
    forceDevTools: false,
    trialMode: false,
    canGetUpdates: true,
    isInGracePeriod: false,
    gracePeriodEnd: 0,
    canEdit: true,
    canExport: true,
    user: {
      autoDownloadUpdate: true,
      autoSave: true,
      backupDays: 30,
      backupLocation: 'default',
      dark: 'system',
      themeSource: 'system',
      numberOfBackups: 30,
      backupType: 'never-delete',
      localBackups: false,
      openDashboardFirst: true,
      enableOfflineMode: false,
      streamFriendly: false,
      useSpellcheck: true,
      font: 'Forum',
      fontSize: 20,
      defaultFolder: true,
    },
  }
}

export function web() {
  return {
    showTheTour: false,
    backup: true,
    allowPrerelease: false,
    forceDevTools: false,
    trialMode: false,
    canGetUpdates: false,
    isInGracePeriod: false,
    gracePeriodEnd: 0,
    canEdit: true,
    canExport: true,
    locale: 'en',
    user: {
      autoDownloadUpdate: false,
      autoSave: true,
      backupDays: 30,
      backupLocation: 'default',
      dark: 'system',
      numberOfBackups: 30,
      openDashboardFirst: true,
      backupType: 'never-delete',
    },
  }
}
