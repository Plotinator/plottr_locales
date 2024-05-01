import { onStoreChanges } from './app/store/onStoreChanges'

export const keepGlobalFontVariablesUpToDate = (getStore, selectors) => {
  return onStoreChanges(getStore, [selectors.appSettingsSelector], (settings) => {
    if (settings.user?.fonts?.global?.headingFont) {
      window.document.documentElement.style.setProperty(
        '--global-header-font',
        settings.user.fonts.global.headingFont
      )
    }
    if (settings.user?.fonts?.global?.bodyFont) {
      window.document.documentElement.style.setProperty(
        '--global-body-font',
        settings.user.fonts.global.bodyFont
      )
    }
    if (settings.user?.fonts?.timeline?.headings?.font) {
      window.document.documentElement.style.setProperty(
        '--timeline-header-font',
        settings.user.fonts.timeline.headings.font
      )
    }
    if (settings.user?.fonts?.timeline?.headings?.fontSize) {
      window.document.documentElement.style.setProperty(
        '--timeline-header-font-size',
        settings.user.fonts.timeline.headings.fontSize
      )
    }
    if (settings.user?.fonts?.timeline?.plotlines?.font) {
      window.document.documentElement.style.setProperty(
        '--plotline-font',
        settings.user.fonts.timeline.plotlines.font
      )
    }
    if (settings.user?.fonts?.timeline?.plotlines?.fontSize) {
      window.document.documentElement.style.setProperty(
        '--plotline-font-size',
        settings.user.fonts.timeline.plotlines.fontSize
      )
    }
    if (settings.user?.fonts?.timeline?.sceneCardTitles?.font) {
      window.document.documentElement.style.setProperty(
        '--scenecard-title-font',
        settings.user.fonts.timeline.sceneCardTitles.font
      )
    }
    if (settings.user?.fonts?.timeline?.sceneCardTitles?.fontSize) {
      window.document.documentElement.style.setProperty(
        '--scenecard-title-font-size',
        settings.user.fonts.timeline.sceneCardTitles.fontSize
      )
    }
    if (settings.user?.fonts?.rce?.defaultFont) {
      window.document.documentElement.style.setProperty(
        '--rce-default-font',
        settings.user.fonts.rce.defaultFont
      )
    }
    if (settings.user?.fonts?.rce?.defaultFontSize) {
      window.document.documentElement.style.setProperty(
        '--rce-default-font-size',
        settings.user.fonts.rce.defaultFontSize
      )
    }
    if (settings.user?.fonts?.rce?.defaultFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-default-font-color',
        settings.user.fonts.rce.defaultFontColor
      )
    }
    if (settings.user?.fonts?.rce?.defaultDarkModeFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-default-darkmode-font-color',
        settings.user.fonts.rce.defaultDarkModeFontColor
      )
    }
    if (settings.user?.fonts?.rce?.titleFont) {
      window.document.documentElement.style.setProperty(
        '--rce-title-font',
        settings.user.fonts.rce.titleFont
      )
    }
    if (settings.user?.fonts?.rce?.titleFontSize) {
      window.document.documentElement.style.setProperty(
        '--rce-title-font-size',
        settings.user.fonts.rce.titleFontSize
      )
    }
    if (settings.user?.fonts?.rce?.titleFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-title-font-color',
        settings.user.fonts.rce.titleFontColor
      )
    }
    if (settings.user?.fonts?.rce?.titleDarkModeFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-title-darkmode-font-color',
        settings.user.fonts.rce.titleDarkModeFontColor
      )
    }
    if (settings.user?.fonts?.rce?.titleFontWeight) {
      window.document.documentElement.style.setProperty(
        '--rce-title-font-weight',
        settings.user.fonts.rce.titleFontWeight
      )
    }
    if (settings.user?.fonts?.rce?.subtitleFont) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-font',
        settings.user.fonts.rce.subtitleFont
      )
    }
    if (settings.user?.fonts?.rce?.subtitleFontSize) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-font-size',
        settings.user.fonts.rce.subtitleFontSize
      )
    }
    if (settings.user?.fonts?.rce?.subtitleFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-font-color',
        settings.user.fonts.rce.subtitleFontColor
      )
    }
    if (settings.user?.fonts?.rce?.subtitleDarkModeFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-darkmode-font-color',
        settings.user.fonts.rce.subtitleDarkModeFontColor
      )
    }
    if (settings.user?.fonts?.rce?.subtitleFontWeight) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-font-weight',
        settings.user.fonts.rce.subtitleFontWeight
      )
    }
  })
}
