import { isEqual } from 'lodash'
import { assertEqual, assertGreaterThan, describe } from '../../../test/simpleIntegrationTest'

import Saver, {
  DUMMY_ROLLBAR,
  DUMMY_SHOW_ERROR_BOX,
  DUMMY_SHOW_MESSAGE_BOX,
  DUMMY_SERVER_IS_BUSY_RESTARTING,
} from '../saver'

const CONSOLE_LOGGER = {
  info: (...args) => console.log(args),
  warn: (...args) => console.warn(args),
  error: (...args) => console.error(args),
}

const NOP_LOGGER = {
  info: (...args) => {},
  warn: (...args) => {},
  error: (...args) => {},
}

function expectToMatchArrayLoosely(received, expected, allowedMissing = 1, allowedAdditional = 1) {
  if (!Array.isArray(expected)) {
    throw new Error(
      `expectToMatchArrayLoosely: expected an array as the first argument, got ${typeof expected}`
    )
  }
  if (typeof allowedMissing !== 'number' || typeof allowedAdditional !== 'number') {
    throw new Error(
      `allowedMissing and allowedAdditional must be numbers, got ${typeof allowedMissing} and ${typeof allowedAdditional}`
    )
  }

  if (!Array.isArray(received)) {
    throw new Error(`expected ${JSON.stringify(received, null, 2)} to be an array`)
  }

  let matched = []
  for (let i = 0; i < received.length && i < expected.length; ++i) {
    if (isEqual(received[i], expected[i])) {
      matched.push(received[i])
    } else {
      break
    }
  }

  if (received.length > expected.length + allowedAdditional) {
    throw new Error(
      `expected ${JSON.stringify(received, null, 2)} to match ${JSON.stringify(
        expected,
        null,
        2
      )}, but it has too many additional elements ${JSON.stringify(
        received.slice(matched.length),
        null,
        2
      )}`
    )
  } else if (Math.abs(matched.length - expected.length) <= allowedMissing) {
    return true
  } else {
    return new Error(
      `expected ${JSON.stringify(received, null, 2)} to match ${JSON.stringify(
        expected,
        null,
        2
      )}, but it only had ${JSON.stringify(matched, null, 2)}`
    )
  }
}

describe('Saver', (describe, it) => {
  describe('save', (describe, it) => {
    describe('given a dummy getState function', (describe, it) => {
      describe('and a 100ms interval', (describe, it) => {
        it('should attempt to save the same thing 10 times in one second', () => {
          let stateCounter = 1
          const getState = () => {
            return {
              stateCounter: stateCounter++,
            }
          }
          const saveCalls = []
          const saveFile = (...args) => {
            saveCalls.push(args)
            return Promise.resolve()
          }
          const backupFile = () => {
            return Promise.resolve()
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            100,
            60000,
            NOP_LOGGER,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            DUMMY_SHOW_ERROR_BOX,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          new Promise((resolve) => {
            setTimeout(resolve, 1100)
          }).then(() => {
            expectToMatchArrayLoosely(
              saveCalls,
              [
                [
                  {
                    stateCounter: 1,
                  },
                ],
                [
                  {
                    stateCounter: 2,
                  },
                ],
                [
                  {
                    stateCounter: 3,
                  },
                ],
                [
                  {
                    stateCounter: 4,
                  },
                ],
                [
                  {
                    stateCounter: 5,
                  },
                ],
                [
                  {
                    stateCounter: 6,
                  },
                ],
                [
                  {
                    stateCounter: 7,
                  },
                ],
                [
                  {
                    stateCounter: 8,
                  },
                ],
                [
                  {
                    stateCounter: 9,
                  },
                ],
                [
                  {
                    stateCounter: 10,
                  },
                ],
              ],
              3,
              3
            )
            saver.cancelAllRemainingRequests()
          })
        })
        describe('and the get state function returns the same state as its previous call every other time', (describe, it) => {
          it('should attempt to save the same thing *6* times in one second', () => {
            let getStateCounter = 0
            let stateCounter = 1
            const getState = () => {
              getStateCounter++
              if (getStateCounter % 2 === 0) {
                return {
                  stateCounter,
                }
              }

              return {
                stateCounter: stateCounter++,
              }
            }
            const saveCalls = []
            const saveFile = (...args) => {
              saveCalls.push(args)
              return Promise.resolve()
            }
            const backupFile = () => {
              return Promise.resolve()
            }
            const saver = Saver(
              getState,
              saveFile,
              backupFile,
              100,
              60000,
              NOP_LOGGER,
              DUMMY_ROLLBAR,
              DUMMY_SHOW_MESSAGE_BOX,
              DUMMY_SHOW_ERROR_BOX,
              DUMMY_SERVER_IS_BUSY_RESTARTING
            )
            new Promise((resolve) => {
              setTimeout(resolve, 1100)
            }).then(() => {
              expectToMatchArrayLoosely(
                saveCalls,
                [
                  [
                    {
                      stateCounter: 1,
                    },
                  ],
                  [
                    {
                      stateCounter: 2,
                    },
                  ],
                  [
                    {
                      stateCounter: 3,
                    },
                  ],
                  [
                    {
                      stateCounter: 4,
                    },
                  ],
                  [
                    {
                      stateCounter: 5,
                    },
                  ],
                  [
                    {
                      stateCounter: 6,
                    },
                  ],
                ],
                2,
                2
              )
              saver.cancelAllRemainingRequests()
            })
          })
        })
        describe('given  a saveFile function that succeeds, fails and then succeeds', (describe, it) => {
          it('should show an error box once and then show a message box to indicate failure and subsequent success', () => {
            let stateCounter = 1
            const getState = () => {
              return {
                stateCounter: stateCounter++,
              }
            }
            const saveCalls = []
            const saveFile = (...args) => {
              saveCalls.push(args)
              if (saveCalls.length === 1) {
                return Promise.resolve()
              } else if (saveCalls.length === 2) {
                return Promise.reject(new Error('boom!'))
              } else {
                return Promise.resolve()
              }
            }
            const backupFile = () => {
              return Promise.resolve()
            }
            let calledShowErrorBox = 0
            const showErrorBox = () => {
              calledShowErrorBox++
            }
            let calledShowMessageBox = 0
            const showMessageBox = () => {
              calledShowMessageBox++
            }
            const saver = Saver(
              getState,
              saveFile,
              backupFile,
              100,
              10000,
              NOP_LOGGER,
              DUMMY_ROLLBAR,
              showMessageBox,
              showErrorBox,
              DUMMY_SERVER_IS_BUSY_RESTARTING
            )
            assertEqual(calledShowErrorBox, 0)
            assertEqual(calledShowMessageBox, 0)
            new Promise((resolve) => {
              setTimeout(resolve, 110)
            }).then(() => {
              assertEqual(calledShowErrorBox, 0)
              assertEqual(calledShowMessageBox, 0)
              new Promise((resolve) => {
                setTimeout(resolve, 110)
              }).then(() => {
                assertEqual(calledShowErrorBox, 1)
                assertEqual(calledShowMessageBox, 0)
                new Promise((resolve) => {
                  setTimeout(resolve, 110)
                }).then(() => {
                  assertEqual(calledShowErrorBox, 1)
                  assertEqual(calledShowMessageBox, 1)
                  new Promise((resolve) => {
                    setTimeout(resolve, 110)
                  }).then(() => {
                    assertEqual(calledShowErrorBox, 1)
                    assertEqual(calledShowMessageBox, 1)
                    expectToMatchArrayLoosely(
                      saveCalls,
                      [
                        [
                          {
                            stateCounter: 1,
                          },
                        ],
                        [
                          {
                            stateCounter: 2,
                          },
                        ],
                        [
                          {
                            stateCounter: 3,
                          },
                        ],
                        [
                          {
                            stateCounter: 4,
                          },
                        ],
                      ],
                      2,
                      2
                    )
                    saver.cancelAllRemainingRequests()
                  })
                })
              })
            })
          })
          describe('and a busy restarting function that always reports that it is busy restarting', (describe, it) => {
            it('should not indicate that there was a failure saving the file', () => {
              let stateCounter = 1
              const getState = () => {
                return {
                  stateCounter: stateCounter++,
                }
              }
              const saveCalls = []
              const saveFile = (...args) => {
                saveCalls.push(args)
                if (saveCalls.length === 1) {
                  return Promise.resolve()
                } else if (saveCalls.length === 2) {
                  return Promise.reject(new Error('boom!'))
                } else {
                  return Promise.resolve()
                }
              }
              const backupFile = () => {
                return Promise.resolve()
              }
              let calledShowErrorBox = 0
              const showErrorBox = () => {
                calledShowErrorBox++
              }
              let calledShowMessageBox = 0
              const showMessageBox = () => {
                calledShowMessageBox++
              }
              const alwaysBusyRestarting = () => {
                return Promise.resolve(true)
              }
              const saver = Saver(
                getState,
                saveFile,
                backupFile,
                100,
                10000,
                NOP_LOGGER,
                DUMMY_ROLLBAR,
                showMessageBox,
                showErrorBox,
                alwaysBusyRestarting
              )
              assertEqual(calledShowErrorBox, 0)
              assertEqual(calledShowMessageBox, 0)
              new Promise((resolve) => {
                setTimeout(resolve, 110)
              }).then(() => {
                assertEqual(calledShowErrorBox, 0)
                assertEqual(calledShowMessageBox, 0)
                new Promise((resolve) => {
                  setTimeout(resolve, 110)
                }).then(() => {
                  assertEqual(calledShowErrorBox, 0)
                  assertEqual(calledShowMessageBox, 0)
                  new Promise((resolve) => {
                    setTimeout(resolve, 110)
                  }).then(() => {
                    assertEqual(calledShowErrorBox, 0)
                    assertEqual(calledShowMessageBox, 0)
                    new Promise((resolve) => {
                      setTimeout(resolve, 110)
                    }).then(() => {
                      assertEqual(calledShowErrorBox, 0)
                      assertEqual(calledShowMessageBox, 0)
                      expectToMatchArrayLoosely(
                        saveCalls,
                        [
                          [
                            {
                              stateCounter: 1,
                            },
                          ],
                          [
                            {
                              stateCounter: 2,
                            },
                          ],
                          [
                            {
                              stateCounter: 3,
                            },
                          ],
                          [
                            {
                              stateCounter: 4,
                            },
                          ],
                        ],
                        2,
                        2
                      )
                      saver.cancelAllRemainingRequests()
                    })
                  })
                })
              })
            })
          })
        })
      })
      describe('and a 500ms interval', (desrcibe, it) => {
        it('should attempt to save the same thing 2 times in one second', () => {
          let stateCounter = 1
          const getState = () => {
            return {
              stateCounter: stateCounter++,
            }
          }
          const saveCalls = []
          const saveFile = (...args) => {
            saveCalls.push(args)
            return Promise.resolve()
          }
          const backupFile = () => {
            return Promise.resolve()
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            500,
            60000,
            NOP_LOGGER,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            DUMMY_SHOW_ERROR_BOX,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          new Promise((resolve) => {
            setTimeout(resolve, 1100)
          }).then(() => {
            expectToMatchArrayLoosely(
              saveCalls,
              [
                [
                  {
                    stateCounter: 1,
                  },
                ],
                [
                  {
                    stateCounter: 2,
                  },
                ],
              ],
              1,
              1
            )
            saver.cancelAllRemainingRequests()
          })
        })
      })
    })
    describe('given a getState function that produces a sequence of values', (describe, it) => {
      describe('and a 100ms interval', (desrcribe, it) => {
        it('should attempt to save ten different items in the right order', () => {
          let counter = 0
          const getState = () => {
            counter++
            return {
              counter,
            }
          }
          const saveCalls = []
          const saveFile = (...args) => {
            saveCalls.push(args)
            return Promise.resolve()
          }
          const backupFile = () => {
            return Promise.resolve()
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            100,
            60000,
            NOP_LOGGER,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            DUMMY_SHOW_ERROR_BOX,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          new Promise((resolve) => {
            setTimeout(resolve, 1100)
          }).then(() => {
            expectToMatchArrayLoosely(
              saveCalls,
              [
                [
                  {
                    counter: 1,
                  },
                ],
                [
                  {
                    counter: 2,
                  },
                ],
                [
                  {
                    counter: 3,
                  },
                ],
                [
                  {
                    counter: 4,
                  },
                ],
                [
                  {
                    counter: 5,
                  },
                ],
                [
                  {
                    counter: 6,
                  },
                ],
                [
                  {
                    counter: 7,
                  },
                ],
                [
                  {
                    counter: 8,
                  },
                ],
                [
                  {
                    counter: 9,
                  },
                ],
                [
                  {
                    counter: 10,
                  },
                ],
              ],
              3,
              3
            )
            saver.cancelAllRemainingRequests()
          })
        })
        describe('and a save function that takes 200ms to complete', (describe, it) => {
          describe('and we cancel saving after 1 second', (describe, it) => {
            it('should still attempt 10 saves in 1 second (the lockfile in the socket server handles concurrent access errors)', () => {
              let counter = 0
              const getState = () => {
                counter++
                return {
                  counter,
                }
              }
              const saveCalls = []
              const saveFile = (...args) => {
                saveCalls.push(args)
                return new Promise((resolve) => {
                  setTimeout(resolve, 200)
                })
              }
              const backupFile = () => {
                return Promise.resolve()
              }
              const saver = Saver(
                getState,
                saveFile,
                backupFile,
                100,
                60000,
                NOP_LOGGER,
                DUMMY_ROLLBAR,
                DUMMY_SHOW_MESSAGE_BOX,
                DUMMY_SHOW_ERROR_BOX,
                DUMMY_SERVER_IS_BUSY_RESTARTING
              )
              new Promise((resolve) => {
                setTimeout(resolve, 1050)
              }).then(() => {
                saver.cancelAllRemainingRequests()
                expectToMatchArrayLoosely(
                  saveCalls,
                  [
                    [
                      {
                        counter: 1,
                      },
                    ],
                    [
                      {
                        counter: 2,
                      },
                    ],
                    [
                      {
                        counter: 3,
                      },
                    ],
                    [
                      {
                        counter: 4,
                      },
                    ],
                    [
                      {
                        counter: 5,
                      },
                    ],
                    [
                      {
                        counter: 6,
                      },
                    ],
                    [
                      {
                        counter: 7,
                      },
                    ],
                    [
                      {
                        counter: 8,
                      },
                    ],
                    [
                      {
                        counter: 9,
                      },
                    ],
                    [
                      {
                        counter: 10,
                      },
                    ],
                  ],
                  2,
                  2
                )
              })
            })
            it('should not save after cancel is called', (desrcibe, it) => {
              let counter = 0
              const getState = () => {
                counter++
                return {
                  counter,
                }
              }
              const saveCalls = []
              const saveFile = (...args) => {
                saveCalls.push(args)
                return new Promise((resolve) => {
                  setTimeout(resolve, 100)
                })
              }
              const backupFile = () => {
                return Promise.resolve()
              }
              const saver = Saver(
                getState,
                saveFile,
                backupFile,
                200,
                60000,
                NOP_LOGGER,
                DUMMY_ROLLBAR,
                DUMMY_SHOW_MESSAGE_BOX,
                DUMMY_SHOW_ERROR_BOX,
                DUMMY_SERVER_IS_BUSY_RESTARTING
              )
              new Promise((resolve) => {
                setTimeout(resolve, 1050)
              }).then(() => {
                saver.cancelAllRemainingRequests()
                new Promise((resolve) => {
                  setTimeout(resolve, 1050)
                }).then(() => {
                  expectToMatchArrayLoosely(
                    saveCalls,
                    [
                      [
                        {
                          counter: 1,
                        },
                      ],
                      [
                        {
                          counter: 2,
                        },
                      ],
                      [
                        {
                          counter: 3,
                        },
                      ],
                      [
                        {
                          counter: 4,
                        },
                      ],
                      [
                        {
                          counter: 5,
                        },
                      ],
                    ],
                    2,
                    2
                  )
                })
              })
            })
          })
        })
      })
      describe('and a 500ms interval', (describe, it) => {
        it('should attempt to save values in the correct order 2 times in one second', () => {
          let counter = 0
          const getState = () => {
            counter++
            return {
              counter,
            }
          }
          const saveCalls = []
          const saveFile = (...args) => {
            saveCalls.push(args)
            return Promise.resolve()
          }
          const backupFile = () => {
            return Promise.resolve()
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            500,
            60000,
            NOP_LOGGER,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            DUMMY_SHOW_ERROR_BOX,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          new Promise((resolve) => {
            setTimeout(resolve, 1100)
          }).then(() => {
            expectToMatchArrayLoosely(
              saveCalls,
              [
                [
                  {
                    counter: 1,
                  },
                ],
                [
                  {
                    counter: 2,
                  },
                ],
              ],
              1,
              1
            )
            saver.cancelAllRemainingRequests()
          })
        })
      })
    })
    describe('given a state that doesnt change', (describe, it) => {
      it('should only save once', () => {
        const THE_STATE = {
          a: 'haha',
        }
        const getState = () => {
          return THE_STATE
        }
        const backupFile = (...args) => {
          return Promise.resolve()
        }
        const saveCalls = []
        const saveFile = (file) => {
          saveCalls.push(file)
          return Promise.resolve()
        }
        let loggedErrors = 0
        let loggedWarnings = 0
        let loggedInfos = 0
        const countingLogger = {
          info: (...args) => {
            loggedInfos++
          },
          warn: (...args) => {
            loggedWarnings++
          },
          error: (...args) => {
            loggedErrors++
          },
        }
        let notifierCount = 0
        const trackingErrorNotifier = () => {
          notifierCount++
        }
        const saver = Saver(
          getState,
          saveFile,
          backupFile,
          100,
          10000,
          countingLogger,
          DUMMY_ROLLBAR,
          DUMMY_SHOW_MESSAGE_BOX,
          trackingErrorNotifier,
          DUMMY_SERVER_IS_BUSY_RESTARTING
        )
        new Promise((resolve) => {
          setTimeout(resolve, 510)
        }).then(() => {
          assertGreaterThan(loggedInfos, 5)
          assertEqual(loggedWarnings, 0)
          assertEqual(loggedErrors, 0)
          assertEqual(notifierCount, 0)
          expectToMatchArrayLoosely(saveCalls, [THE_STATE], 0, 0)
          saver.stop()
        })
      })
    })
    describe('given a state that doesnt change', (describe, it) => {
      describe('and given  a save function that always fails', (describe, it) => {
        it('should report failure each time', () => {
          const THE_STATE = {
            a: 'haha',
          }
          const getState = () => {
            return THE_STATE
          }
          const backupFile = (...args) => {
            return Promise.resolve()
          }
          const saveFile = () => {
            return Promise.reject(new Error('Boom'))
          }
          let loggedErrors = 0
          let loggedWarnings = 0
          let loggedInfos = 0
          const countingLogger = {
            info: (...args) => {
              loggedInfos++
            },
            warn: (...args) => {
              loggedWarnings++
            },
            error: (...args) => {
              loggedErrors++
            },
          }
          let notifierCount = 0
          const trackingErrorNotifier = () => {
            notifierCount++
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            100,
            10000,
            countingLogger,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            trackingErrorNotifier,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          assertGreaterThan(loggedInfos, 0)
          assertEqual(loggedWarnings, 0)
          assertEqual(loggedErrors, 0)
          assertEqual(notifierCount, 0)
          new Promise((resolve) => {
            setTimeout(resolve, 110)
          }).then(() => {
            assertGreaterThan(loggedInfos, 0)
            assertEqual(loggedWarnings, 1)
            assertEqual(loggedErrors, 0)
            assertEqual(notifierCount, 1)
            new Promise((resolve) => {
              setTimeout(resolve, 110)
            }).then(() => {
              assertGreaterThan(loggedInfos, 0)
              assertEqual(loggedWarnings, 2)
              assertEqual(loggedErrors, 0)
              assertEqual(notifierCount, 2)
              new Promise((resolve) => {
                setTimeout(resolve, 110)
              }).then(() => {
                assertGreaterThan(loggedInfos, 0)
                assertEqual(loggedWarnings, 3)
                assertEqual(loggedErrors, 0)
                assertEqual(notifierCount, 3)
                saver.cancelAllRemainingRequests()
              })
            })
          })
        })
      })
    })
  })
  describe('backup', (describe, it) => {
    describe('given a dummy getState function', (describe, it) => {
      describe('and a 100ms interval', (describe, it) => {
        it('should attempt to backup the same thing 10 times in one second', () => {
          let stateCounter = 1
          const getState = () => {
            return {
              stateCounter: stateCounter++,
            }
          }
          const backupCalls = []
          const saveFile = () => {
            return Promise.resolve()
          }
          const backupFile = (...args) => {
            backupCalls.push(args)
            return Promise.resolve()
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            100000,
            100,
            NOP_LOGGER,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            DUMMY_SHOW_ERROR_BOX,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          new Promise((resolve) => {
            setTimeout(resolve, 1100)
          }).then(() => {
            expectToMatchArrayLoosely(
              backupCalls,
              [
                [
                  {
                    stateCounter: 1,
                  },
                ],
                [
                  {
                    stateCounter: 2,
                  },
                ],
                [
                  {
                    stateCounter: 3,
                  },
                ],
                [
                  {
                    stateCounter: 4,
                  },
                ],
                [
                  {
                    stateCounter: 5,
                  },
                ],
                [
                  {
                    stateCounter: 6,
                  },
                ],
                [
                  {
                    stateCounter: 7,
                  },
                ],
                [
                  {
                    stateCounter: 8,
                  },
                ],
                [
                  {
                    stateCounter: 9,
                  },
                ],
                [
                  {
                    stateCounter: 10,
                  },
                ],
              ],
              3,
              3
            )
            saver.cancelAllRemainingRequests()
          })
        })
        describe('and the get state function returns the same state every other time', (describe, it) => {
          it('should attempt to backup the same thing *6* times in one second', () => {
            let getStateCounter = 0
            let stateCounter = 1
            const getState = () => {
              getStateCounter++
              if (getStateCounter % 2 === 0) {
                return {
                  stateCounter,
                }
              }

              return {
                stateCounter: stateCounter++,
              }
            }
            const backupCalls = []
            const backupFile = (...args) => {
              backupCalls.push(args)
              return Promise.resolve()
            }
            const saveFile = () => {
              return Promise.resolve()
            }
            const saver = Saver(
              getState,
              saveFile,
              backupFile,
              10000,
              100,
              NOP_LOGGER,
              DUMMY_ROLLBAR,
              DUMMY_SHOW_MESSAGE_BOX,
              DUMMY_SHOW_ERROR_BOX,
              DUMMY_SERVER_IS_BUSY_RESTARTING
            )
            new Promise((resolve) => {
              setTimeout(resolve, 1100)
            }).then(() => {
              expectToMatchArrayLoosely(
                backupCalls,
                [
                  [
                    {
                      stateCounter: 1,
                    },
                  ],
                  [
                    {
                      stateCounter: 2,
                    },
                  ],
                  [
                    {
                      stateCounter: 3,
                    },
                  ],
                  [
                    {
                      stateCounter: 4,
                    },
                  ],
                  [
                    {
                      stateCounter: 5,
                    },
                  ],
                  [
                    {
                      stateCounter: 6,
                    },
                  ],
                ],
                2,
                2
              )
              saver.cancelAllRemainingRequests()
            })
          })
        })
        describe('given  a saveBackup function that succeeds, fails and then succeeds', (describe, it) => {
          it('should call the appropriate error and success functions', () => {
            let stateCounter = 1
            const getState = () => {
              return {
                stateCounter: stateCounter++,
              }
            }
            const backupCalls = []
            const backupFile = (...args) => {
              backupCalls.push(args)
              if (backupCalls.length === 1) {
                return Promise.resolve()
              } else if (backupCalls.length === 2) {
                return Promise.reject(new Error('boom!'))
              } else {
                return Promise.resolve()
              }
            }
            const saveFile = () => {
              return Promise.resolve()
            }
            let loggedErrors = 0
            let loggedWarnings = 0
            let loggedInfos = 0
            const countingLogger = {
              info: (...args) => {
                loggedInfos++
              },
              warn: (...args) => {
                loggedWarnings++
              },
              error: (...args) => {
                loggedErrors++
              },
            }
            const saver = Saver(
              getState,
              saveFile,
              backupFile,
              10000,
              100,
              countingLogger,
              DUMMY_ROLLBAR,
              DUMMY_SHOW_MESSAGE_BOX,
              DUMMY_SHOW_ERROR_BOX,
              DUMMY_SERVER_IS_BUSY_RESTARTING
            )
            assertGreaterThan(loggedInfos, 0)
            assertEqual(loggedWarnings, 0)
            assertEqual(loggedErrors, 0)
            new Promise((resolve) => {
              setTimeout(resolve, 110)
            }).then(() => {
              assertGreaterThan(loggedInfos, 0)
              assertEqual(loggedWarnings, 0)
              assertEqual(loggedErrors, 0)
              new Promise((resolve) => {
                setTimeout(resolve, 110)
              }).then(() => {
                assertGreaterThan(loggedInfos, 0)
                assertEqual(loggedWarnings, 0)
                assertEqual(loggedErrors, 1)
                new Promise((resolve) => {
                  setTimeout(resolve, 110)
                }).then(() => {
                  assertGreaterThan(loggedInfos, 0)
                  assertEqual(loggedWarnings, 0)
                  assertEqual(loggedErrors, 1)
                  new Promise((resolve) => {
                    setTimeout(resolve, 110)
                  }).then(() => {
                    assertGreaterThan(loggedInfos, 0)
                    assertEqual(loggedWarnings, 0)
                    assertEqual(loggedErrors, 1)
                    expectToMatchArrayLoosely(
                      backupCalls,
                      [
                        [
                          {
                            stateCounter: 1,
                          },
                        ],
                        [
                          {
                            stateCounter: 2,
                          },
                        ],
                        [
                          {
                            stateCounter: 3,
                          },
                        ],
                        [
                          {
                            stateCounter: 4,
                          },
                        ],
                      ],
                      1,
                      1
                    )
                    saver.cancelAllRemainingRequests()
                  })
                })
              })
            })
          })
          describe('and a serverIsBusy function that always reports that the server is busy restarting', (describe, it) => {
            it('should call the appropriate error and success functions', () => {
              let stateCounter = 1
              const getState = () => {
                return {
                  stateCounter: stateCounter++,
                }
              }
              const backupCalls = []
              const backupFile = (...args) => {
                backupCalls.push(args)
                if (backupCalls.length === 1) {
                  return Promise.resolve()
                } else if (backupCalls.length === 2) {
                  return Promise.reject(new Error('boom!'))
                } else {
                  return Promise.resolve()
                }
              }
              const saveFile = () => {
                return Promise.resolve()
              }
              let loggedErrors = 0
              let loggedWarnings = 0
              let loggedInfos = 0
              const countingLogger = {
                info: (...args) => {
                  loggedInfos++
                },
                warn: (...args) => {
                  loggedWarnings++
                },
                error: (...args) => {
                  loggedErrors++
                },
              }
              const alwaysBusyRestarting = () => {
                return Promise.resolve(true)
              }
              const saver = Saver(
                getState,
                saveFile,
                backupFile,
                10000,
                100,
                countingLogger,
                DUMMY_ROLLBAR,
                DUMMY_SHOW_MESSAGE_BOX,
                DUMMY_SHOW_ERROR_BOX,
                alwaysBusyRestarting
              )
              assertGreaterThan(loggedInfos, 0)
              assertEqual(loggedWarnings, 0)
              assertEqual(loggedErrors, 0)
              new Promise((resolve) => {
                setTimeout(resolve, 110)
              }).then(() => {
                assertGreaterThan(loggedInfos, 0)
                assertEqual(loggedWarnings, 0)
                assertEqual(loggedErrors, 0)
                new Promise((resolve) => {
                  setTimeout(resolve, 110)
                }).then(() => {
                  assertGreaterThan(loggedInfos, 0)
                  assertEqual(loggedWarnings, 0)
                  assertEqual(loggedErrors, 0)
                  new Promise((resolve) => {
                    setTimeout(resolve, 110)
                  }).then(() => {
                    assertGreaterThan(loggedInfos, 0)
                    assertEqual(loggedWarnings, 0)
                    assertEqual(loggedErrors, 0)
                    new Promise((resolve) => {
                      setTimeout(resolve, 110)
                    }).then(() => {
                      assertGreaterThan(loggedInfos, 0)
                      assertEqual(loggedWarnings, 0)
                      assertEqual(loggedErrors, 0)
                      expectToMatchArrayLoosely(
                        backupCalls,
                        [
                          [
                            {
                              stateCounter: 1,
                            },
                          ],
                          [
                            {
                              stateCounter: 2,
                            },
                          ],
                          [
                            {
                              stateCounter: 3,
                            },
                          ],
                          [
                            {
                              stateCounter: 4,
                            },
                          ],
                        ],
                        1,
                        1
                      )
                      saver.cancelAllRemainingRequests()
                    })
                  })
                })
              })
            })
          })
        })
      })
      describe('and a 500ms interval', (describe, it) => {
        it('should attempt to backup the same thing 2 times in one second', () => {
          let stateCounter = 1
          const getState = () => {
            return {
              stateCounter: stateCounter++,
            }
          }
          const backupCalls = []
          const saveFile = () => {
            return Promise.resolve()
          }
          const backupFile = (...args) => {
            backupCalls.push(args)
            return Promise.resolve()
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            10000,
            500,
            NOP_LOGGER,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            DUMMY_SHOW_ERROR_BOX,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          new Promise((resolve) => {
            setTimeout(resolve, 1100)
          }).then(() => {
            expectToMatchArrayLoosely(
              backupCalls,
              [
                [
                  {
                    stateCounter: 1,
                  },
                ],
                [
                  {
                    stateCounter: 2,
                  },
                ],
              ],
              1,
              1
            )
            saver.cancelAllRemainingRequests()
          })
        })
      })
    })
    describe('given a getState function that produces a sequence of values', (describe, it) => {
      describe('and a 100ms interval', (describe, it) => {
        it('should attempt to backup ten different items in the right order', () => {
          let counter = 0
          const getState = () => {
            counter++
            return {
              counter,
            }
          }
          const backupCalls = []
          const saveFile = () => {
            return Promise.resolve()
          }
          const backupFile = (...args) => {
            backupCalls.push(args)
            return Promise.resolve()
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            10000,
            100,
            NOP_LOGGER,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            DUMMY_SHOW_ERROR_BOX,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          new Promise((resolve) => {
            setTimeout(resolve, 1100)
          }).then(() => {
            expectToMatchArrayLoosely(
              backupCalls,
              [
                [
                  {
                    counter: 1,
                  },
                ],
                [
                  {
                    counter: 2,
                  },
                ],
                [
                  {
                    counter: 3,
                  },
                ],
                [
                  {
                    counter: 4,
                  },
                ],
                [
                  {
                    counter: 5,
                  },
                ],
                [
                  {
                    counter: 6,
                  },
                ],
                [
                  {
                    counter: 7,
                  },
                ],
                [
                  {
                    counter: 8,
                  },
                ],
                [
                  {
                    counter: 9,
                  },
                ],
                [
                  {
                    counter: 10,
                  },
                ],
              ],
              3,
              3
            )
            saver.cancelAllRemainingRequests()
          })
        })
        describe('and a backup function that takes 200ms to complete', (describe, it) => {
          describe('and we cancel saving after 1 second', (describe, it) => {
            it('should still backup 5 times in 1 second (the socket server handles concurrent access errors)', () => {
              let counter = 0
              const getState = () => {
                counter++
                return {
                  counter,
                }
              }
              const backupCalls = []
              const saveFile = () => {
                return Promise.resolve()
              }
              const backupFile = (...args) => {
                backupCalls.push(args)
                return new Promise((resolve) => {
                  setTimeout(resolve, 200)
                })
              }
              const saver = Saver(
                getState,
                saveFile,
                backupFile,
                10000,
                100,
                NOP_LOGGER,
                DUMMY_ROLLBAR,
                DUMMY_SHOW_MESSAGE_BOX,
                DUMMY_SHOW_ERROR_BOX,
                DUMMY_SERVER_IS_BUSY_RESTARTING
              )
              new Promise((resolve) => {
                setTimeout(resolve, 1050)
              }).then(() => {
                saver.cancelAllRemainingRequests()
                expectToMatchArrayLoosely(
                  backupCalls,
                  [
                    [
                      {
                        counter: 1,
                      },
                    ],
                    [
                      {
                        counter: 2,
                      },
                    ],
                    [
                      {
                        counter: 3,
                      },
                    ],
                    [
                      {
                        counter: 4,
                      },
                    ],
                    [
                      {
                        counter: 5,
                      },
                    ],
                    [
                      {
                        counter: 6,
                      },
                    ],
                    [
                      {
                        counter: 7,
                      },
                    ],
                    [
                      {
                        counter: 8,
                      },
                    ],
                    [
                      {
                        counter: 9,
                      },
                    ],
                    [
                      {
                        counter: 10,
                      },
                    ],
                  ],
                  2,
                  2
                )
              })
            })
            it('should not backup after cancel is called', () => {
              let counter = 0
              const getState = () => {
                counter++
                return {
                  counter,
                }
              }
              const backupCalls = []
              const saveFile = () => {
                return Promise.resolve()
              }
              const backupFile = (...args) => {
                backupCalls.push(args)
                return new Promise((resolve) => {
                  setTimeout(resolve, 100)
                })
              }
              const saver = Saver(
                getState,
                saveFile,
                backupFile,
                10000,
                200,
                NOP_LOGGER,
                DUMMY_ROLLBAR,
                DUMMY_SHOW_MESSAGE_BOX,
                DUMMY_SHOW_ERROR_BOX,
                DUMMY_SERVER_IS_BUSY_RESTARTING
              )
              new Promise((resolve) => {
                setTimeout(resolve, 1050)
              }).then(() => {
                saver.cancelAllRemainingRequests()
                new Promise((resolve) => {
                  setTimeout(resolve, 1050)
                }).then(() => {
                  expectToMatchArrayLoosely(
                    backupCalls,
                    [
                      [
                        {
                          counter: 1,
                        },
                      ],
                      [
                        {
                          counter: 2,
                        },
                      ],
                      [
                        {
                          counter: 3,
                        },
                      ],
                      [
                        {
                          counter: 4,
                        },
                      ],
                      [
                        {
                          counter: 5,
                        },
                      ],
                    ],
                    2,
                    2
                  )
                })
              })
            })
          })
        })
      })
      describe('and a 500ms interval', (describe, it) => {
        it('should attempt to backup values in the correct order 2 times in one second', () => {
          let counter = 0
          const getState = () => {
            counter++
            return {
              counter,
            }
          }
          const backupCalls = []
          const saveFile = () => {
            return Promise.resolve()
          }
          const backupFile = (...args) => {
            backupCalls.push(args)
            return Promise.resolve()
          }
          const saver = Saver(
            getState,
            saveFile,
            backupFile,
            10000,
            500,
            NOP_LOGGER,
            DUMMY_ROLLBAR,
            DUMMY_SHOW_MESSAGE_BOX,
            DUMMY_SHOW_ERROR_BOX,
            DUMMY_SERVER_IS_BUSY_RESTARTING
          )
          new Promise((resolve) => {
            setTimeout(resolve, 1100)
          }).then(() => {
            expectToMatchArrayLoosely(
              backupCalls,
              [
                [
                  {
                    counter: 1,
                  },
                ],
                [
                  {
                    counter: 2,
                  },
                ],
              ],
              1,
              1
            )
            saver.cancelAllRemainingRequests()
          })
        })
      })
    })
  })
})
