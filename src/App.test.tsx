// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { fetchUsers } from './api/users'
import { testUsers } from './test/fixtures'
import type { User } from './types/user'

vi.mock('./api/users', () => ({ fetchUsers: vi.fn() }))

const fetchUsersMock = vi.mocked(fetchUsers)

beforeEach(() => {
  fetchUsersMock.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('User Directory', () => {
  it('показывает загрузку до завершения запроса', () => {
    fetchUsersMock.mockImplementationOnce(() => new Promise<User[]>(() => {}))

    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка…')
    expect(screen.queryByRole('list', { name: 'Пользователи' })).not.toBeInTheDocument()
  })

  it('показывает карточки после успешной загрузки', async () => {
    fetchUsersMock.mockResolvedValueOnce(testUsers)

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('leanne@example.com')).toBeInTheDocument()
    expect(screen.getByText('123-456')).toBeInTheDocument()
  })

  it('показывает ошибку и восстанавливает список через повторный запрос', async () => {
    const user = userEvent.setup()
    fetchUsersMock
      .mockRejectedValueOnce(new Error('Сервер вернул HTTP 500. Попробуй ещё раз.'))
      .mockResolvedValueOnce(testUsers)

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 500')
    await user.click(screen.getByRole('button', { name: 'Повторить загрузку' }))

    expect(await screen.findByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(fetchUsersMock).toHaveBeenCalledTimes(2)
  })

  it('отличает успешный пустой каталог от ошибки', async () => {
    fetchUsersMock.mockResolvedValueOnce([])

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Список пользователей пуст' }))
      .toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('ищет локально без учёта регистра и внешних пробелов', async () => {
    const user = userEvent.setup()
    fetchUsersMock.mockResolvedValueOnce(testUsers)
    render(<App />)
    await screen.findByRole('heading', { name: 'Leanne Graham' })

    await user.type(screen.getByRole('searchbox', { name: 'Поиск по имени' }), '  LEAN  ')

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ervin Howell' })).not.toBeInTheDocument()
    expect(fetchUsersMock).toHaveBeenCalledTimes(1)
  })

  it('показывает пустой поиск и позволяет очистить его', async () => {
    const user = userEvent.setup()
    fetchUsersMock.mockResolvedValueOnce(testUsers)
    render(<App />)
    await screen.findByRole('heading', { name: 'Leanne Graham' })

    await user.type(screen.getByRole('searchbox', { name: 'Поиск по имени' }), 'zzzz')

    expect(screen.getByRole('heading', { name: 'По запросу «zzzz» никто не найден' }))
      .toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Список пользователей пуст' }))
      .not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Очистить поиск' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(fetchUsersMock).toHaveBeenCalledTimes(1)
  })

  it('удаляет из базового списка запись, найденную поиском', async () => {
    const user = userEvent.setup()
    fetchUsersMock.mockResolvedValueOnce(testUsers)
    render(<App />)
    await screen.findByRole('heading', { name: 'Leanne Graham' })
    await user.type(screen.getByRole('searchbox', { name: 'Поиск по имени' }), 'ervin')

    await user.click(screen.getByRole('button', { name: 'Удалить Ervin Howell' }))
    await user.click(screen.getByRole('button', { name: 'Очистить поиск' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryByRole('heading', { name: 'Ervin Howell' })).not.toBeInTheDocument()
    expect(fetchUsersMock).toHaveBeenCalledTimes(1)
  })

  it('сохраняет локальное добавление и очищает поиск, чтобы показать новую карточку', async () => {
    const user = userEvent.setup()
    fetchUsersMock.mockResolvedValueOnce(testUsers)
    render(<App />)
    await screen.findByRole('heading', { name: 'Leanne Graham' })
    await user.type(screen.getByRole('searchbox', { name: 'Поиск по имени' }), 'zzzz')
    await user.type(screen.getByRole('textbox', { name: 'Имя' }), 'Новый пользователь')
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'new@example.com')

    await user.click(screen.getByRole('button', { name: 'Добавить' }))

    expect(screen.getByRole('heading', { name: 'Новый пользователь' })).toBeInTheDocument()
    expect(screen.getByText('Не указан')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Поиск по имени' })).toHaveValue('')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(fetchUsersMock).toHaveBeenCalledTimes(1)
  })

  it('отменяет незавершённый запрос при размонтировании', () => {
    fetchUsersMock.mockImplementationOnce(() => new Promise<User[]>(() => {}))
    const { unmount } = render(<App />)
    const signal = fetchUsersMock.mock.calls[0][0]
    expect(signal.aborted).toBe(false)

    unmount()

    expect(signal.aborted).toBe(true)
  })
})
