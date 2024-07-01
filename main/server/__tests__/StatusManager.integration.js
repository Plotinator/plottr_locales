import { describe } from '../../../test/simpleIntegrationTest'
import StatusManager from '../StatusManager'

const CONSOLE_LOGGER = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
}

describe('StatusManager', (describe) => {
  describe('given one connection', (describe) => {
    describe('and one task', (describe, it) => {
      it('should notify that connection that work is done when the task completes', () => {
        const statusManager = new StatusManager(CONSOLE_LOGGER)
        const theTask = new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        statusManager
          .nextGeneration(null)
          .then(({ busy, generation }) => {
            if (busy) {
              throw new Error('Status manager should not be busy when no work is registered')
            } else if (generation !== 0) {
              throw new Error(`Expected generation to be 0 and got ${generation}`)
            } else {
              statusManager.registerTask(theTask, 'Example task')
            }
          })
          .then(() => {
            return statusManager.nextGeneration(0).then((secondResponse) => {
              if (!secondResponse.busy) {
                throw new Error('Status manager should become busy when work is registered')
              } else if (secondResponse.generation !== 1) {
                throw new Error(`Expected generation to be 1 and got ${secondResponse.generation}`)
              }
            })
          })
          .then(() => {
            return statusManager.nextGeneration(1).then((thirdResponse) => {
              if (thirdResponse.busy) {
                throw new Error('Status manager should become done from busy')
              } else if (thirdResponse.generation !== 2) {
                throw new Error(`Expected final generation of 2 got ${thirdResponse.generation}`)
              }
            })
          })
      })
      describe('and that task throws an error', (describe, it) => {
        it('should still broadcast that it is done', () => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          const theTask = new Promise((resolve, reject) => {
            reject(new Error('It failed!!'))
          })
          statusManager
            .nextGeneration(null)
            .then(({ busy, generation }) => {
              if (busy) {
                throw new Error('Status manager should not be busy when no work is registered')
              } else if (generation !== 0) {
                throw new Error(`Expected generation to be 0 and got ${generation}`)
              } else {
                statusManager.registerTask(theTask, 'Example task').catch((_error) => {})
              }
            })
            .then(() => {
              return statusManager.nextGeneration(0).then((secondResponse) => {
                if (!secondResponse.busy) {
                  throw new Error('Status manager should become busy when work is registered')
                } else if (secondResponse.generation !== 1) {
                  throw new Error(
                    `Expected generation to be 1 and got ${secondResponse.generation}`
                  )
                }
              })
            })
            .then(() => {
              return statusManager.nextGeneration(1).then((thirdResponse) => {
                if (thirdResponse.busy) {
                  throw new Error('Status manager should become done from busy')
                } else if (thirdResponse.generation !== 2) {
                  throw new Error(`Expected final generation of 2 got ${thirdResponse.generation}`)
                }
              })
            })
        })
      })
    })
    describe('and two tasks', (describe) => {
      describe('that overlap in time', (describe, it) => {
        it('should notify that connection that work is done when both tasks complete but not in between', () => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          const theFirstTask = new Promise((resolve) => {
            setTimeout(resolve, 500)
          })
          const theSecondTask = new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
          statusManager
            .nextGeneration(null)
            .then(({ busy, generation }) => {
              if (busy) {
                throw new Error('Status manager should not be busy when no work is registered')
              } else if (generation !== 0) {
                throw new Error(`Expected generation to be 0 and got ${generation}`)
              } else {
                statusManager.registerTask(theFirstTask, 'The first task')
                statusManager.registerTask(theSecondTask, 'The second task')
              }
            })
            .then(() => {
              return statusManager.nextGeneration(0).then((secondResponse) => {
                if (!secondResponse.busy) {
                  throw new Error('Status manager should become busy when work is registered')
                } else if (secondResponse.generation !== 2) {
                  throw new Error(
                    `Expected generation to be 2 and got ${secondResponse.generation}`
                  )
                }
              })
            })
            .then(() => {
              return statusManager.nextGeneration(2).then((thirdResponse) => {
                if (thirdResponse.busy) {
                  throw new Error('Status manager should become idle after both jobs complete')
                } else if (thirdResponse.generation !== 3) {
                  throw new Error(`Expected final generation of 3 got ${thirdResponse.generation}`)
                }
              })
            })
        })
      })
      describe('that do not overlap in time', (describe, it) => {
        it('should notify that connection that work is done when each task completes', () => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          const theFirstTask = new Promise((resolve) => {
            setTimeout(resolve, 500)
          })
          const theSecondTask = new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
          statusManager
            .nextGeneration(null)
            .then(({ busy, generation }) => {
              if (busy) {
                throw new Error('Status manager should not be busy when no work is registered')
              } else if (generation !== 0) {
                throw new Error(`Expected generation to be 0 and got ${generation}`)
              } else {
                statusManager.registerTask(theFirstTask, 'Example task')
                setTimeout(() => {
                  statusManager.registerTask(theSecondTask, 'Example task')
                }, 700)
              }
            })
            .then(() => {
              return statusManager.nextGeneration(0).then((secondResponse) => {
                if (!secondResponse.busy) {
                  throw new Error('Status manager should become busy when work is registered')
                } else if (secondResponse.generation !== 1) {
                  throw new Error(
                    `Expected generation to be 1 and got ${secondResponse.generation}`
                  )
                }
              })
            })
            .then(() => {
              return statusManager.nextGeneration(1).then((thirdResponse) => {
                if (thirdResponse.busy) {
                  throw new Error('Status manager should become idle when the first task finishes')
                } else if (thirdResponse.generation !== 2) {
                  throw new Error(`Expected final generation of 2 got ${thirdResponse.generation}`)
                }
              })
            })
            .then(() => {
              return statusManager.nextGeneration(2).then((thirdResponse) => {
                if (!thirdResponse.busy) {
                  throw new Error('Status manager should become busy after the second job starts')
                } else if (thirdResponse.generation !== 3) {
                  throw new Error(`Expected final generation of 3 got ${thirdResponse.generation}`)
                }
              })
            })
            .then(() => {
              return statusManager.nextGeneration(3).then((thirdResponse) => {
                if (thirdResponse.busy) {
                  throw new Error('Status manager should become idle after the second job finishes')
                } else if (thirdResponse.generation !== 4) {
                  throw new Error(`Expected final generation of 4 got ${thirdResponse.generation}`)
                }
              })
            })
        })
      })
    })
  })
  describe('given two connections', (describe) => {
    describe('and one task', (describe, it) => {
      it('should notify both connections that work is done when the task completes', () => {
        const statusManager = new StatusManager(CONSOLE_LOGGER)
        const theTask = new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        statusManager
          .nextGeneration(null)
          .then(({ busy, generation }) => {
            if (busy) {
              throw new Error('Status manager should not be busy when no work is registered')
            } else if (generation !== 0) {
              throw new Error(`Expected generation to be 0 and got ${generation}`)
            } else {
              statusManager.registerTask(theTask, 'Example task')
            }
          })
          .then(() => {
            return Promise.all([
              statusManager.nextGeneration(0),
              statusManager.nextGeneration(0),
            ]).then(([secondResponseOne, secondResponseTwo]) => {
              if (!secondResponseOne.busy || !secondResponseTwo.busy) {
                throw new Error('Status manager should become busy when work is registered')
              } else if (secondResponseOne.generation !== 1 || secondResponseTwo.generation !== 1) {
                throw new Error(
                  `Expected generation to be 1 and got ${[
                    secondResponseOne.generation,
                    secondResponseTwo.generation,
                  ]}`
                )
              }
            })
          })
          .then(() => {
            return Promise.all([
              statusManager.nextGeneration(1),
              statusManager.nextGeneration(1),
            ]).then(([thirdResponseOne, thirdResponseTwo]) => {
              if (thirdResponseOne.busy || thirdResponseTwo.busy) {
                throw new Error('Status manager should become done from busy')
              } else if (thirdResponseTwo.generation !== 2 || thirdResponseTwo.generation !== 2) {
                throw new Error(
                  `Expected final generation of 2 got ${[
                    thirdResponseOne.generation,
                    thirdResponseTwo.generation,
                  ]}`
                )
              }
            })
          })
      })
    })
    describe('and two tasks', (describe) => {
      describe('that overlap in time', (describe, it) => {
        it('should notify both connections that work is done when both tasks complete but not in between', () => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          const theFirstTask = new Promise((resolve) => {
            setTimeout(resolve, 500)
          })
          const theSecondTask = new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
          statusManager
            .nextGeneration(null)
            .then(({ busy, generation }) => {
              if (busy) {
                throw new Error('Status manager should not be busy when no work is registered')
              } else if (generation !== 0) {
                throw new Error(`Expected generation to be 0 and got ${generation}`)
              } else {
                statusManager.registerTask(theFirstTask, 'The first task')
                statusManager.registerTask(theSecondTask, 'The second task')
              }
            })
            .then(() => {
              return Promise.all([
                statusManager.nextGeneration(0),
                statusManager.nextGeneration(0),
              ]).then(([secondResponseOne, secondResponseTwo]) => {
                if (!secondResponseOne.busy || !secondResponseTwo.busy) {
                  throw new Error('Status manager should become busy when work is registered')
                } else if (
                  secondResponseOne.generation !== 2 ||
                  secondResponseTwo.generation !== 2
                ) {
                  throw new Error(
                    `Expected generation to be 2 and got ${[
                      secondResponseOne.generation,
                      secondResponseTwo.generation,
                    ]}`
                  )
                }
              })
            })
            .then(() => {
              return Promise.all([
                statusManager.nextGeneration(2),
                statusManager.nextGeneration(2),
              ]).then(([thirdResponseOne, thirdResponseTwo]) => {
                if (thirdResponseOne.busy || thirdResponseTwo.busy) {
                  throw new Error('Status manager should become idle when all work completes')
                } else if (thirdResponseOne.generation !== 3 || thirdResponseTwo.generation !== 3) {
                  throw new Error(
                    `Expected generation to be 3 and got ${[
                      thirdResponseOne.generation,
                      thirdResponseTwo.generation,
                    ]}`
                  )
                }
              })
            })
        })
      })
      describe('that do not overlap in time', (describe, it) => {
        it('should notify both connections that work is done when each task completes', () => {
          const statusManager = new StatusManager(CONSOLE_LOGGER)
          const theFirstTask = new Promise((resolve) => {
            setTimeout(resolve, 500)
          })
          const theSecondTask = new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
          statusManager
            .nextGeneration(null)
            .then(({ busy, generation }) => {
              if (busy) {
                throw new Error('Status manager should not be busy when no work is registered')
              } else if (generation !== 0) {
                throw new Error(`Expected generation to be 0 and got ${generation}`)
              } else {
                statusManager.registerTask(theFirstTask, 'The first task')
                setTimeout(() => {
                  statusManager.registerTask(theSecondTask, 'The second task')
                }, 700)
              }
            })
            .then(() => {
              return Promise.all([
                statusManager.nextGeneration(0),
                statusManager.nextGeneration(0),
              ]).then(([secondResponseOne, secondResponseTwo]) => {
                if (!secondResponseOne.busy || !secondResponseTwo.busy) {
                  throw new Error('Status manager should become busy when work is registered')
                } else if (
                  secondResponseOne.generation !== 1 ||
                  secondResponseTwo.generation !== 1
                ) {
                  throw new Error(
                    `Expected generation to be 1 and got ${[
                      secondResponseOne.generation,
                      secondResponseTwo.generation,
                    ]}`
                  )
                }
              })
            })
            .then(() => {
              return Promise.all([
                statusManager.nextGeneration(1),
                statusManager.nextGeneration(1),
              ]).then(([thirdResponseOne, thirdResponseTwo]) => {
                if (thirdResponseOne.busy || thirdResponseTwo.busy) {
                  throw new Error('Status manager should become idle when all work completes')
                } else if (thirdResponseOne.generation !== 2 || thirdResponseTwo.generation !== 2) {
                  throw new Error(
                    `Expected generation to be 2 and got ${[
                      thirdResponseOne.generation,
                      thirdResponseTwo.generation,
                    ]}`
                  )
                }
              })
            })
            .then(() => {
              return Promise.all([
                statusManager.nextGeneration(2),
                statusManager.nextGeneration(2),
              ]).then(([fourthResponseOne, fourthResponseTwo]) => {
                if (!fourthResponseOne.busy || !fourthResponseTwo.busy) {
                  throw new Error('Status manager should become busy when the second task starts')
                } else if (
                  fourthResponseOne.generation !== 3 ||
                  fourthResponseTwo.generation !== 3
                ) {
                  throw new Error(
                    `Expected generation to be 3 and got ${[
                      fourthResponseOne.generation,
                      fourthResponseTwo.generation,
                    ]}`
                  )
                }
              })
            })
            .then(() => {
              return Promise.all([
                statusManager.nextGeneration(3),
                statusManager.nextGeneration(3),
              ]).then(([fifthResponseOne, fifthResponseTwo]) => {
                if (fifthResponseOne.busy || fifthResponseTwo.busy) {
                  throw new Error('Status manager should become idle when the second task finishes')
                } else if (fifthResponseOne.generation !== 4 || fifthResponseTwo.generation !== 4) {
                  throw new Error(
                    `Expected generation to be 4 and got ${[
                      fifthResponseOne.generation,
                      fifthResponseTwo.generation,
                    ]}`
                  )
                }
              })
            })
        })
      })
    })
  })
})
