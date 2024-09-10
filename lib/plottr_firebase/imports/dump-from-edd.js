const admin = require('firebase-admin')
const fs = require('fs')
const readline = require('node:readline')
const { stdin, stdout } = require('node:process')
const axios = require('axios')
const { uniqWith, isEqual, sortBy, last } = require('lodash')

const { writeFile, open } = fs.promises

const { sequencePromises } = require('../migrations/util')

if (!admin.apps.length) {
  if (!process.env.FIREBASE_ENV || process.env.FIREBASE_ENV === '') {
    console.error(
      'No FIREBASE_ENV set.  Please set one and try again.  Options: "development", "preview" or "production".'
    )
    process.exit(1)
  } else if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    admin.initializeApp({ projectId })
  } else if (process.env.FIREBASE_ENV === 'preview') {
    // @ts-ignore
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.FIREBASE_ENV === 'production') {
    // @ts-ignore
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

// test@test.com (on CI): 'ToWgxrNhLif4O89bZD2jhAQQYJ83'
const main = (argv) => {
  const filePath = argv[2]
  const uid = argv[3]
  const email = argv[4]
  if (!filePath || typeof filePath !== 'string') {
    return Promise.reject(Error('Invalid path for file to dump to'))
  } else {
    console.log('Ready to dump to:', filePath)
    const rl = readline.createInterface({ input: stdin, output: stdout })
    return new Promise((resolve, reject) => {
      rl.question('Please enter your user id: ', (executingUserId) => {
        return checkUserId(executingUserId)
          .then(() => {
            return open(filePath + '__raw_data.json', 'w+').then((rawDataFileHandle) => {
              if (uid && typeof uid === 'string' && email && typeof email === 'string') {
                return Promise.resolve([{ uid, email }]).then((uids) => {
                  return sequencePromises(
                    uids.map(({ uid, email }) => {
                      return () => {
                        console.log(`> ${uid}`)
                        return subscriptions(email).then((subs) => {
                          console.log('subscriptions', subs)
                          return writeFile(filePath, JSON.stringify(subs, null, 2))
                        })
                      }
                    })
                  )
                })
              } else {
                return allUsers().then((uids) => {
                  return sequencePromises(
                    uids.map(({ uid, email }) => {
                      return () => {
                        console.log(`> ${uid}`)
                        return subscriptions(email, rawDataFileHandle).then((subs) => {
                          return { userId: uid, subscription: subs }
                        })
                      }
                    })
                  ).then((subs) => {
                    return writeFile(filePath, JSON.stringify(subs, null, 2))
                  })
                })
              }
            })
          })
          .then(resolve, reject)
      })
    })
  }
}

const subscriptions = (email, rawDataFileHandle) => {
  return getEDDSaleDetails(email).then(({ sales, rawSalesData }) => {
    console.log('unique sales', JSON.stringify(sales, null, 2))
    return getEDDSubscriptionDetails(email).then(({ subscriptions, rawSubsData }) => {
      return (
        rawDataFileHandle
          ? rawDataFileHandle.write(
              JSON.stringify({ email, rawSalesData, rawSubsData }, null, 2) + '\n'
            )
          : Promise.resolve()
      ).then(() => {
        console.log('unique, active subs', JSON.stringify(subscriptions, null, 2))
        const proSales = sales.filter(({ isPro }) => {
          return isPro
        })
        const lifetimePro = proSales.find(({ expiration }) => {
          return expiration === null
        })
        const plottrSales = sales.filter(({ isPlottr }) => {
          return isPlottr
        })
        const lifetimePlottr = plottrSales.find(({ expiration }) => {
          return expiration === null
        })
        const latestExpiringProSubscription = last(
          sortBy(
            subscriptions.filter(({ isPro }) => {
              return isPro
            }),
            'expiration'
          )
        )
        const latestExpiringPlottrSubscription = last(
          sortBy(
            subscriptions.filter(({ isPlottr }) => {
              return isPlottr
            }),
            'expiration'
          )
        )
        const now = new Date().toISOString()
        const fromExpiration = (lifetime, latestSub) => {
          return lifetime?.expiration === null ? null : new Date(latestSub.expiration).toISOString()
        }
        const proSubscription =
          lifetimePro || latestExpiringProSubscription
            ? {
                effectiveStartDate: now,
                effectiveEndDate: fromExpiration(lifetimePro, latestExpiringProSubscription),
                purchaseDate: now,
              }
            : null
        const plottrSubscription =
          lifetimePlottr || latestExpiringPlottrSubscription
            ? {
                effectiveStartDate: now,
                effectiveEndDate: fromExpiration(lifetimePlottr, latestExpiringPlottrSubscription),
                purchaseDate: now,
              }
            : null
        return {
          proSubscription,
          plottrSubscription,
        }
      })
    })
  })
}

const allUsers = () => {
  function iter(acc, nextPageToken) {
    return admin
      .auth()
      .listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        const nextUsers = listUsersResult.users.map((user) => {
          return { uid: user.uid, email: user.email }
        })
        if (listUsersResult.pageToken) {
          return iter([...nextUsers, ...acc], listUsersResult.pageToken)
        } else {
          return acc
        }
      })
      .catch((error) => {
        console.log('Error listing users:', error)
      })
  }

  return iter([])
}

const checkUserId = (userId) => {
  return admin
    .auth()
    .getUser(userId)
    .catch((error) => {
      if (error.errorInfo.code === 'auth/user-not-found') {
        console.error('Executing user does not exist.  Please check the user id!')
      }

      return Promise.reject(error)
    })
}

const PRO_PRODUCT_ID = '104900'

const PLOTTR_PRODUCT_IDS = ['33347', '33345', '11321', '11322']

const getEDDSaleDetails = (email) => {
  return (
    axios
      // @ts-ignore
      .get(
        `http://my.plottr.com/edd-api/sales/?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}&email=${email}`
      )
      .then((response) => {
        console.log('sales', JSON.stringify(response?.data?.sales, null, 2))
        return {
          sales: uniqWith(
            (
              response?.data?.sales?.flatMap?.(({ products }) => {
                if (Array.isArray(products)) {
                  return products.map(({ name, price_name }) => {
                    const isPlottr = !!name.match(/^Plottr/)
                    const isPro = !!name.match(/^Plottr.*Pro/)
                    const isLifetime = !!price_name.match(/Lifetime/) || !!name.match(/Lifetime/)
                    if (isLifetime) {
                      return {
                        isPlottr: isPlottr && !isPro,
                        isPro,
                        expiration: null,
                      }
                    } else {
                      return null
                    }
                  })
                } else {
                  return []
                }
              }) ?? []
            ).filter(Boolean),
            isEqual
          ),
          rawSalesData: response.data,
        }
      })
      .catch((error) => {
        console.error(`Error fetching sales for ${email}`, error)
        return {
          sales: [],
          rawSalesData: {},
        }
      })
  )
}

const getEDDSubscriptionDetails = (customerId) => {
  return (
    axios
      // @ts-ignore
      .get(
        `http://my.plottr.com/edd-api/subscriptions/?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}&customer=${customerId}`
      )
      .then((response) => {
        console.log('subs', response?.data?.subscriptions)
        return {
          subscriptions: uniqWith(
            (response?.data?.subscriptions ?? [])
              .filter(({ info }) => {
                return (
                  (info?.product_id === PRO_PRODUCT_ID ||
                    PLOTTR_PRODUCT_IDS.includes(info?.product_id)) &&
                  info.status === 'active'
                )
              })
              .map(({ info }) => {
                const isPro = info?.product_id === PRO_PRODUCT_ID
                const isPlottr = PLOTTR_PRODUCT_IDS.includes(info?.product_id)
                const expiration = info?.expiration
                return {
                  isPro,
                  isPlottr,
                  expiration,
                }
              }),
            isEqual
          ),
          rawSubsData: response.data,
        }
      })
      .catch((error) => {
        console.error(`Error fetching subs for ${customerId}`, error)
        return {
          subscriptions: [],
          rawSubsData: {},
        }
      })
  )
}

main(process.argv)
  .then(() => {
    console.log('Success!')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
