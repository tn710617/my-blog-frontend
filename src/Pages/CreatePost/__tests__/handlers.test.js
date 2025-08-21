import { vi } from 'vitest'
import { handleStorePostError } from '../handlers'
import toast from 'react-hot-toast'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn()
  }
}))

describe('CreatePost handlers', () => {
  const mockSetPostTitleValid = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleStorePostError', () => {
    it('handles duplicate title error correctly', () => {
      const error = {
        response: {
          data: {
            message: 'The post title has already been taken.'
          }
        }
      }

      handleStorePostError(error, mockSetPostTitleValid)

      expect(mockSetPostTitleValid).toHaveBeenCalledWith(false)
      expect(toast.error).toHaveBeenCalledWith('文章標題已經被使用')
    })

    it('handles required title error correctly', () => {
      const error = {
        response: {
          data: {
            message: 'The post title field is required.'
          }
        }
      }

      handleStorePostError(error, mockSetPostTitleValid)

      expect(mockSetPostTitleValid).toHaveBeenCalledWith(false)
      expect(toast.error).toHaveBeenCalledWith('文章標題不能為空')
    })

    it('handles unknown errors gracefully without crashing', () => {
      const error = {
        response: {
          data: {
            message: 'Some other error'
          }
        }
      }

      expect(() => {
        handleStorePostError(error, mockSetPostTitleValid)
      }).not.toThrow()

      // Should not call setPostTitleValid or toast for unknown errors
      expect(mockSetPostTitleValid).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
    })

    it('throws error with malformed error objects (current behavior)', () => {
      const malformedError = {
        response: {}
      }

      expect(() => {
        handleStorePostError(malformedError, mockSetPostTitleValid)
      }).toThrow('Cannot read properties of undefined')

      const noResponseError = {}

      expect(() => {
        handleStorePostError(noResponseError, mockSetPostTitleValid)
      }).toThrow('Cannot read properties of undefined')
    })

    it('validates setPostTitleValid is called only for title-related errors', () => {
      // Test both known error types set validation to false
      const duplicateError = {
        response: { data: { message: 'The post title has already been taken.' } }
      }
      
      const requiredError = {
        response: { data: { message: 'The post title field is required.' } }
      }

      handleStorePostError(duplicateError, mockSetPostTitleValid)
      expect(mockSetPostTitleValid).toHaveBeenCalledWith(false)
      
      mockSetPostTitleValid.mockClear()
      
      handleStorePostError(requiredError, mockSetPostTitleValid)
      expect(mockSetPostTitleValid).toHaveBeenCalledWith(false)
      
      // Non-title errors should not affect validation state
      const otherError = {
        response: { data: { message: 'Server error' } }
      }
      
      mockSetPostTitleValid.mockClear()
      handleStorePostError(otherError, mockSetPostTitleValid)
      expect(mockSetPostTitleValid).not.toHaveBeenCalled()
    })
  })
})