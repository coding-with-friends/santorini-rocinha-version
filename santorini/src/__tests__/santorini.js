import santorini, { initialState } from '../santorini'
import {
  invalidSetupPositionError,
  invalidPositionError,
  notVacantPositionError,
  notOnPhaseError,
  invalidMoveToLevelError,
  invalidRangeError,
  invalidBuildLevelError
} from '../errors'

describe('santorini', () => {
  describe('when "action" is "SETUP"', () => {
    const action = 'SETUP'

    it('set first player`s heroes', () => {
      const options = ['3,1', '3,2']

      expect(santorini(action, options)).toEqual({
        ...initialState,
        currentPlayer: 1,
        heroes: {
          ...initialState.heroes,
          '0,0': options[0],
          '0,1': options[1]
        }
      })
    })

    describe('when already has heroes set', () => {
      const currentState = {
        ...initialState,
        currentPlayer: 1,
        heroes: {
          ...initialState.heroes,
          '0,0': '3,1',
          '0,1': '3,2'
        }
      }

      it('Adds current player`s heroes', () => {
        const options = ['2,1', '2,3']

        expect(santorini(action, options, currentState)).toEqual({
          ...currentState,
          currentPlayer: 0,
          phase: 'MOVE_AND_BUILD',
          heroes: {
            ...currentState.heroes,
            '1,0': options[0],
            '1,1': options[1]
          }
        })
      })
    })

    describe('when game`s "phase" is different from "SETUP"', () => {
      const currentState = {
        ...initialState,
        phase: 'MOVE_AND_BUILD',
        heroes: {
          ...initialState.heroes,
          '0,0': '3,1',
          '0,1': '3,2',
          '1,0': '2,1',
          '1,1': '2,3'
        }
      }

      it('throws notOnPhaseError when trying to "SETUP"', () => {
        const options = ['3,2', '3,3']

        expect(() => santorini(action, options, currentState)).toThrow(notOnPhaseError)
      })
    })

    it('throws invalidSetupPositionError for "SETUP" with empty positions', () => {
      const options = []

      expect(() => santorini(action, options, initialState)).toThrow(invalidSetupPositionError)
    })

    it('throws invalidSetupPositionError when trying to "SETUP" with only one hero position', () => {
      const options = ['0,1', null]

      expect(() => santorini(action, options, initialState)).toThrow(invalidSetupPositionError)
    })

    it('throws invalidSetupPositionError when trying to set heroes on the same slot', () => {
      const options = ['2,1', '2,1']

      expect(() => santorini(action, options, initialState)).toThrow(invalidSetupPositionError)
    })

    it('throws invalidPositionError when trying to set position out of board`s boundaries', () => {
      const options = ['0,1', '9,10']

      expect(() => santorini(action, options, initialState)).toThrow(invalidPositionError)
    })

    it('throws notVacantPositionError when trying to set a hero on an already taken slot', () => {
      const options = ['2,2', '0,1']
      const currentState = {
        ...initialState,
        currentPlayer: 1,
        heroes: {
          ...initialState.heroes,
          '0,0': '0,1',
          '0,1': '0,2'
        }
      }

      expect(() => santorini(action, options, currentState)).toThrow(notVacantPositionError)
    })
  })

  describe('when "action" is "MOVE_AND_BUILD"', () => {
    const action = 'MOVE_AND_BUILD'
    const currentState = {
      ...initialState,
      phase: 'MOVE_AND_BUILD',
      currentPlayer: 0,
      heroes: {
        ...initialState.heroes,
        '0,0': '1,1',
        '0,1': '2,2',
        '1,0': '3,3',
        '1,1': '4,4'
      },
      board: {
        ...initialState.board,
        '0,0': 0, '1,0': 0, '2,0': 0
      }
    }

    it('sets new player`s position and build a level', () => {
      const options = { moveTo: '1,2', buildAt: '1,3', hero: 0 }

      expect(santorini(action, options, currentState)).toEqual({
        ...currentState,
        currentPlayer: 1,
        heroes: {
          ...currentState.heroes,
          '0,0': '1,2'
        },
        board: {
          ...currentState.board,
          '1,3': 1
        }
      })
    })

    describe('when game`s "phase" is different from "MOVE_AND_BUILD"', () => {
      const currentState = {
        ...initialState,
        phase: 'SETUP'
      }

      it('throws notOnPhaseError', () => {
        const options = ['1,2', '3,4']

        expect(() => santorini(action, options, currentState)).toThrow(notOnPhaseError)
      })
    })

    it('throws invalidPositionError if no move position is given', () => {
      const options = { buildAt: '2,2', hero: 0 }

      expect(() => santorini(action, options, currentState)).toThrow(invalidPositionError)
    })

    it('throws invalidPositionError when no build position is given', () => {
      const options = { moveTo: '2,2', hero: 0 }

      expect(() => santorini(action, options, currentState)).toThrow(invalidPositionError)
    })

    it('throws invalidPositionError if trying to move out of board`s boundaries', () => {
      const options = { moveTo: '10,10', buildAt: '2,2', hero: 0 }

      expect(() => santorini(action, options, currentState)).toThrow(invalidPositionError)
    })

    it('throws invalidPositionError when trying to build out of board`s boundaries', () => {
      const options = { moveTo: '1,1', buildAt: '20,20', hero: 0 }

      expect(() => santorini(action, options, currentState)).toThrow(invalidPositionError)
    })

    it('throws "notVacantPositionError" when move position is already taken', () => {
      const options = { moveTo: '2,2', buildAt: '2,3', hero: 0 }
      const currentState = {
        ...initialState,
        phase: 'MOVE_AND_BUILD',
        currentPlayer: 0,
        heroes: {
          ...initialState.heroes,
          '0,0': '1,1',
          '0,1': '2,2',
          '1,0': '3,3',
          '1,1': '4,4'
        }
      }

      expect(() => santorini(action, options, currentState)).toThrow(notVacantPositionError)
    })

    it('throws notVacantPositionError when build position is already taken', () => {
      const options = { moveTo: '1,2', buildAt: '2,2', hero: 0 }
      const currentState = {
        ...initialState,
        phase: 'MOVE_AND_BUILD',
        currentPlayer: 0,
        heroes: {
          ...initialState.heroes,
          '0,0': '1,1',
          '0,1': '2,2',
          '1,0': '3,3',
          '1,1': '4,4'
        }
      }

      expect(() => santorini(action, options, currentState)).toThrow(notVacantPositionError)
    })

    it('throws "invalidRangeError" when move position is out of range', () => {
      const options = { moveTo: '3,4', buildAt: '2,4', hero: 0 }
      const currentState = {
        ...initialState,
        phase: 'MOVE_AND_BUILD',
        currentPlayer: 0,
        heroes: {
          ...initialState.heroes,
          '0,0': '1,1',
          '0,1': '2,2',
          '1,0': '3,3',
          '1,1': '4,4'
        }
      }

      expect(() => santorini(action, options, currentState)).toThrow(invalidRangeError)
    })

    it('throws "invalidRangeError" when build position is out of range', () => {
      const options = { moveTo: '0,0', buildAt: '2,4', hero: 0 }
      const currentState = {
        ...initialState,
        phase: 'MOVE_AND_BUILD',
        currentPlayer: 0,
        heroes: {
          ...initialState.heroes,
          '0,0': '1,1',
          '0,1': '2,2',
          '1,0': '3,3',
          '1,1': '4,4'
        }
      }

      expect(() => santorini(action, options, currentState)).toThrow(invalidRangeError)
    })

    it('throws "invalidMoveToLevelError" when trying to step more than 1 level on a move', () => {
      const options = { moveTo: '2,1', buildAt: '3,1', hero: 0 }
      const currentState = {
        ...initialState,
        phase: 'MOVE_AND_BUILD',
        currentPlayer: 0,
        heroes: {
          ...initialState.heroes,
          '0,0': '1,1',
          '0,1': '2,2',
          '1,0': '3,3',
          '1,1': '4,4'
        },
        board: {
          ...initialState.board,
          '1,1': 0,
          '2,1': 2
        }
      }

      expect(() => santorini(action, options, currentState)).toThrow(invalidMoveToLevelError)
    })

    describe('when a slot is on the highest level', () => {
      it('throws "invalidMoveToLevelError" when trying to move on it', () => {
        const options = { moveTo: '1,2', buildAt: '2,3', hero: 0 }
        const currentState = {
          ...initialState,
          phase: 'MOVE_AND_BUILD',
          currentPlayer: 0,
          heroes: {
            ...initialState.heroes,
            '0,0': '1,1',
            '0,1': '2,2',
            '1,0': '3,3',
            '1,1': '4,4'
          },
          board: {
            ...initialState.board,
            '1,1': 3,
            '1,2': 4
          }
        }

        expect(() => santorini(action, options, currentState)).toThrow(invalidMoveToLevelError)
      })

      it('throws "invalidBuildLevelError" when trying to build on it', () => {
        const options = { moveTo: '1,2', buildAt: '1,3', hero: 0 }
        const currentState = {
          ...initialState,
          phase: 'MOVE_AND_BUILD',
          currentPlayer: 0,
          heroes: {
            ...initialState.heroes,
            '0,0': '1,1',
            '0,1': '2,2',
            '1,0': '3,3',
            '1,1': '4,4'
          },
          board: {
            ...initialState.board,
            '1,1': 2,
            '1,2': 3,
            '1,3': 4
          }
        }

        expect(() => santorini(action, options, currentState)).toThrow(invalidBuildLevelError)
      })
    })
  })
})
