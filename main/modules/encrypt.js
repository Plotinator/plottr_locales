import { safeStorage } from 'electron'
import Cryptr from 'cryptr'

const fallbackEncryptionKey = process.env.FALLBACK_ENCRYPTION_KEY
const cryptr = new Cryptr(fallbackEncryptionKey, { encoding: 'base64' })

// Based on the node documentation at: https://nodejs.org/api/crypto.html#class-cipher
export const fallbackEncrypt = (plainText) => {
  if (plainText === '') {
    return Promise.resolve(plainText)
  } else {
    return Promise.resolve(cryptr.encrypt(plainText))
  }
}

export const fallbackDecrypt = (base64CipherText) => {
  if (base64CipherText === '') {
    return Promise.resolve(base64CipherText)
  } else {
    return Promise.resolve(cryptr.decrypt(base64CipherText))
  }
}

export const encryptStringToBase64 = (s) => {
  return new Promise((resolve, reject) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        fallbackEncrypt(s).then(resolve, reject)
      } else {
        const encryptedBuffer = safeStorage.encryptString(s)
        resolve(encryptedBuffer.toString('base64'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

export const decryptStringFromBase64 = (base64) => {
  return new Promise((resolve, reject) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        fallbackDecrypt(base64).then(resolve, reject)
      } else {
        const s = Buffer.from(base64, 'base64')
        const encryptedBuffer = safeStorage.decryptString(s)
        resolve(encryptedBuffer.toString('base64'))
      }
    } catch (error) {
      reject(error)
    }
  })
}
