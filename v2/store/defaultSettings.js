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
      fonts: {
        rce: {
          defaultFont: 'Forum',
          defaultFontSize: '20px',
          defaultDarkModeFontColor: '#CCCCCC',
          defaultFontColor: '#102A42', //$gray-0
          titleFont: 'Forum',
          titleFontSize: '24px',
          titleFontWeight: 400,
          titleDarkModeFontColor: '#CCCCCC',
          titleFontColor: '#102A42',
          subtitleFont: 'Forum',
          subtitleFontSize: '24px',
          subtitleFontWeight: 400,
          subtitleDarkModeFontColor: '#CCCCCC',
          subtitleFontColor: '#102A42',
        },
        global: {
          headingFont: 'IBM Plex Serif',
          bodyFont: 'Forum',
        },
        timeline: {
          headings: {
            font: 'IBM Plex Serif',
            fontSize: '24px',
          },
          plotlines: {
            font: 'IBM Plex Serif',
            fontSize: '20px',
          },
          sceneCardTitles: {
            font: 'Forum',
            fontSize: '16px',
          },
        },
      },
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
      fonts: {
        rce: {
          defaultFont: 'Forum',
          defaultFontSize: '20px',
          defaultDarkModeFontColor: '#CCCCCC',
          defaultFontColor: '#102A42', //$gray-0
          titleFont: 'Forum',
          titleFontSize: '24px',
          titleFontWeight: 400,
          titleDarkModeFontColor: '#CCCCCC',
          titleFontColor: '#102A42',
          subtitleFont: 'Forum',
          subtitleFontSize: '24px',
          subtitleFontWeight: 400,
          subtitleDarkModeFontColor: '#CCCCCC',
          subtitleFontColor: '#102A42',
        },
        global: {
          headerFont: 'IBM Plex Serif',
          bodyFont: 'Forum',
        },
        timeline: {
          headings: {
            font: 'IBM Plex Serif',
            fontSize: '24px',
          },
          plotlines: {
            font: 'IBM Plex Serif',
            fontSize: '20px',
          },
          sceneCardTitles: {
            font: 'Forum',
            fontSize: '16px',
          },
        },
      },
    },
  }
}
