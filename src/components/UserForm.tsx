import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NewUser } from '../types/user'

type UserFormProps = {
  onAdd: (user: NewUser) => void
}

export function UserForm({ onAdd }: UserFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (!cleanName || !cleanEmail) {
      setValidationError('Заполни имя и email: одних пробелов недостаточно.')
      return
    }

    onAdd({ name: cleanName, email: cleanEmail })
    setName('')
    setEmail('')
    setValidationError('')
  }

  return (
    <section className="add-panel" aria-labelledby="add-heading">
      <h2 id="add-heading">Добавить пользователя</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-fields">
          <label>
            <span>Имя</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={event => setName(event.currentTarget.value)}
              autoComplete="name"
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={event => setEmail(event.currentTarget.value)}
              autoComplete="email"
              required
            />
          </label>
          <button type="submit">Добавить</button>
        </div>
        {validationError && <p className="form-error" role="alert">{validationError}</p>}
      </form>
    </section>
  )
}
