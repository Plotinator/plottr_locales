import Cryptr from 'cryptr'

const fallbackEncryptionKey = process.env.FALLBACK_ENCRYPTION_KEY
const cryptr = new Cryptr(fallbackEncryptionKey, { encoding: 'base64' })

// Based on the node documentation at: https://nodejs.org/api/crypto.html#class-cipher
export const fallbackEncrypt = (plainText) => {
  if (plainText === '') {
    return Promise.resolve(plainText)
  } else {
    try {
      return Promise.resolve(cryptr.encrypt(plainText))
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export const fallbackDecrypt = (base64CipherText) => {
  if (base64CipherText === '') {
    return Promise.resolve(base64CipherText)
  } else {
    try {
      return Promise.resolve(cryptr.decrypt(base64CipherText))
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export const encryptStringToBase64 = (s) => {
  return fallbackEncrypt(s)
}

export const decryptStringFromBase64 = (base64) => {
  return fallbackDecrypt(base64)
}
