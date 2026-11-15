import { describe, expect, it } from 'vitest'
import { testUsers } from '../test/fixtures'
import { filterUsers } from './filterUsers'

describe('filterUsers', () => {
  it('возвращает всех пользователей для пустого запроса', () => {
    expect(filterUsers(testUsers, '')).toEqual(testUsers)
  })

  it('находит пользователя по части имени', () => {
    expect(filterUsers(testUsers, 'anne')).toEqual([testUsers[0]])
  })

  it('не зависит от регистра запроса', () => {
    expect(filterUsers(testUsers, 'LEANNE')).toEqual([testUsers[0]])
  })

  it('возвращает пустой массив, если совпадений нет', () => {
    expect(filterUsers(testUsers, 'zzzz')).toEqual([])
  })

  it('игнорирует пробелы в начале и конце запроса', () => {
    expect(filterUsers(testUsers, '  lean  ')).toEqual([testUsers[0]])
  })

  it('считает запрос из пробелов пустым', () => {
    expect(filterUsers(testUsers, '   ')).toEqual(testUsers)
  })

  it('работает с пустым исходным массивом', () => {
    expect(filterUsers([], 'lean')).toEqual([])
  })

  it('возвращает все совпадения в исходном порядке', () => {
    const users = [testUsers[2], testUsers[1], testUsers[0]]

    expect(filterUsers(users, 'a')).toEqual([testUsers[2], testUsers[0]])
  })

  it('не меняет исходный массив и объекты пользователей', () => {
    const users = Object.freeze(testUsers.map(user => Object.freeze({ ...user })))

    expect(filterUsers(users, 'LEAN')).toEqual([testUsers[0]])
    expect(users).toEqual(testUsers)
  })
})
