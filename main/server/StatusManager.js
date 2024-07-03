import { v4 as uuid } from 'uuid'

class StatusManager {
  generation = 0
  tasks = []
  nextWatchers = []
  busy = false
  logger = {
    info: () => {},
    warn: () => {},
    error: (_error) => {},
  }

  constructor(logger) {
    if (logger) {
      this.logger = logger
    }
  }

  registerTask(work, name) {
    this.notifyBusy()
    const thisWorkId = uuid()
    this.tasks.push({ workId: thisWorkId, name })
    const deregisterThisWork = () => {
      this.tasks = this.tasks.filter(({ workId }) => {
        return workId !== thisWorkId
      })
      if (this.tasks.length === 0) {
        this.notifyDone()
      }
    }
    return work
      .then((result) => {
        deregisterThisWork()
        return result
      })
      .catch((error) => {
        deregisterThisWork()
        this.logger.error(`Error while working on task with id: ${thisWorkId} and name: ${name}`)
        return Promise.reject(error)
      })
  }

  nextGeneration(currentGeneration) {
    if ((!currentGeneration && currentGeneration !== 0) || currentGeneration < this.generation) {
      return Promise.resolve({
        busy: this.busy,
        generation: this.generation,
      })
    } else {
      return new Promise((resolve) => {
        this.nextWatchers.push(resolve)
      })
    }
  }

  notifyNextWatchers() {
    this.nextWatchers.forEach((resolve) => {
      resolve({
        busy: this.busy,
        generation: this.generation,
      })
    })
    this.nextWatchers = []
  }

  notifyBusy() {
    this.busy = true
    this.generation++
    this.notifyNextWatchers()
  }

  notifyDone() {
    this.busy = false
    this.generation++
    this.notifyNextWatchers()
  }
}

export default StatusManager
