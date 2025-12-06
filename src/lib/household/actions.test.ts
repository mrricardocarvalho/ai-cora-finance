import { createHousehold, createInvite, acceptInvite } from './actions'
import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Mocks
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

describe('Household Actions', () => {
  const mockFrom = jest.fn()
  const mockUser = { id: 'user-1', email: 'test@example.com' }
  
  const createChain = (data: any, error: any = null) => {
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data, error }),
      then: (resolve: any) => resolve({ data, error })
    }
    return chain
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } })
      },
      from: mockFrom
    })
  })

  describe('createHousehold', () => {
    it('creates household and adds admin', async () => {
      const mockHousehold = { id: 'hh-1', name: 'Test House' }
      
      mockFrom.mockImplementation((table) => {
        if (table === 'households') return createChain(mockHousehold)
        if (table === 'household_members') return createChain(null) // Insert success
        return createChain(null)
      })

      const result = await createHousehold('Test House')
      
      expect(result).toEqual(mockHousehold)
      expect(mockFrom).toHaveBeenCalledWith('households')
      expect(mockFrom).toHaveBeenCalledWith('household_members')
      expect(revalidatePath).toHaveBeenCalledWith('/settings/household')
    })
  })

  describe('createInvite', () => {
    it('creates invite if admin', async () => {
      // Mock admin check
      mockFrom.mockImplementationOnce(() => createChain({ role: 'admin' }))
      // Mock invite insert
      mockFrom.mockImplementationOnce(() => createChain({ token: 'abc' }))

      await createInvite('hh-1', 'invitee@example.com')
      
      expect(mockFrom).toHaveBeenCalledWith('household_invites')
    })

    it('fails if not admin', async () => {
      mockFrom.mockImplementationOnce(() => createChain({ role: 'member' }))
      
      await expect(createInvite('hh-1', 'test@test.com'))
        .rejects.toThrow('Only admins can invite members')
    })
  })

  describe('acceptInvite', () => {
    it('adds member and marks invite accepted', async () => {
      const mockInvite = { id: 'inv-1', household_id: 'hh-1' }
      
      // Mock invite check
      mockFrom.mockImplementationOnce(() => createChain(mockInvite))
      // Mock member insert
      mockFrom.mockImplementationOnce(() => createChain(null))
      // Mock invite update
      mockFrom.mockImplementationOnce(() => createChain(null))

      await acceptInvite('valid-token')
      
      expect(mockFrom).toHaveBeenCalledWith('household_members')
      expect(redirect).toHaveBeenCalledWith('/settings/household')
    })
  })
})
