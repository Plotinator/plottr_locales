import React from 'react'
import path from 'path'
import t from 'format-message'
import { IoIosDocument } from 'react-icons/io'
import { shell } from 'electron'

export default function BackupFiles ({folder}) {

  const fileName = (name) => {
    if (name.includes('(start-session)-')) {
      const nameSansStart = name.replace('(start-session)-', '')
      return <p><strong>{t('Session Start')}</strong><br/><span>{nameSansStart}</span></p>
    } else {
      return name
    }
  }

  const renderedFiles = folder.backups.map(b => {
    const filePath = path.join(folder.path, b)
    return <div key={b} className='dashboard__backups__item icon' onClick={() => shell.showItemInFolder(filePath)}>
      <IoIosDocument/>
      <div>{fileName(b)}</div>
    </div>
  })

  return renderedFiles
}