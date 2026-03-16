import '@testing-library/jest-dom/vitest'
import { vi, afterEach } from 'vitest'

// Mock API client for testing
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number
    errors?: Record<string, string[]>
    constructor(message: string, status: number, errors?: Record<string, string[]>) {
      super(message)
      this.status = status
      this.errors = errors
    }
  },
}))

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})
