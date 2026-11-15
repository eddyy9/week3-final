import { beforeEach, describe, expect, it, vi } from 'vitest'
import { testUsers } from '../test/fixtures'
import { fetchUsers } from './users'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('fetchUsers', () => {
  it('получает пользователей и передаёт сигнал отмены в fetch', async () => {
    const controller = new AbortController()
    fetchMock.mockResolvedValueOnce(Response.json(testUsers))

    const users = await fetchUsers(controller.signal)

    expect(users).toEqual(testUsers)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/users',
      { signal: controller.signal },
    )
  })

  it('считает пустой массив успешным результатом', async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]))

    await expect(fetchUsers(new AbortController().signal)).resolves.toEqual([])
  })

  it('превращает HTTP 500 в ошибку', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Internal error', { status: 500 }))

    await expect(fetchUsers(new AbortController().signal)).rejects.toThrow('HTTP 500')
  })

  it('передаёт сетевую ошибку вызывающему коду', async () => {
    const error = new TypeError('Failed to fetch')
    fetchMock.mockRejectedValueOnce(error)

    await expect(fetchUsers(new AbortController().signal)).rejects.toBe(error)
  })

  it.each([
    { scenario: 'объект вместо массива', data: { message: 'Unexpected response' } },
    { scenario: 'неверный тип поля', data: [{ ...testUsers[0], id: '1' }] },
    { scenario: 'неполную запись', data: [{ id: 1, name: 'Leanne', email: 'a@example.com' }] },
  ])('отклоняет $scenario', async ({ data }) => {
    fetchMock.mockResolvedValueOnce(Response.json(data))

    await expect(fetchUsers(new AbortController().signal)).rejects.toThrow(
      'неожиданном формате',
    )
  })

  it('отклоняет повторяющиеся идентификаторы', async () => {
    fetchMock.mockResolvedValueOnce(Response.json([testUsers[0], testUsers[0]]))

    await expect(fetchUsers(new AbortController().signal)).rejects.toThrow(
      'повторяются идентификаторы',
    )
  })

  it('не подменяет некорректный JSON пустым списком', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Not JSON</html>'))

    await expect(fetchUsers(new AbortController().signal)).rejects.toBeInstanceOf(SyntaxError)
  })
})
