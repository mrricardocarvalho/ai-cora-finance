import { celebrate } from '../lib/utils/celebrate'

describe('celebrate()', ()=>{
  beforeEach(()=> jest.resetModules())
  test('dispatches cora:celebrate and calls confetti once under cooldown', async ()=>{
    const mockConfetti = jest.fn()
    // Mock canvas-confetti default export
    jest.doMock('canvas-confetti', ()=>({ default: mockConfetti }))
    const { celebrate: celebrateFn } = await import('../lib/utils/celebrate')
    const spy = jest.spyOn(window, 'dispatchEvent')
    await celebrateFn()
    expect(mockConfetti).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalled()
    // call again immediately; should be throttled
    await celebrateFn()
    expect(mockConfetti).toHaveBeenCalledTimes(1)
  })
})
