import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CoraAvatar from '../components/shared/cora-avatar'

describe('CoraAvatar', ()=>{
  test('reacts to cora:celebrate event', ()=>{
    jest.useFakeTimers()
    render(<CoraAvatar state="idle" size={40} />)
    const wrapper = screen.getByTestId('cora-avatar-root')
    // Fire event
    window.dispatchEvent(new CustomEvent('cora:celebrate'))
    // Expect data attribute temporary state equals happy
    expect(wrapper.getAttribute('data-cora-state')).toBe('happy')
    // After timeout, state resets
    jest.advanceTimersByTime(1300)
    expect(wrapper.getAttribute('data-cora-state')).toBe('idle')
    jest.useRealTimers()
  })
})
