import type { ChangeEvent } from 'react'

type UserSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function UserSearch({ value, onChange }: UserSearchProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.currentTarget.value)
  }

  return (
    <label className="search-field">
      <span>Поиск по имени</span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Например, lean"
        autoComplete="off"
      />
    </label>
  )
}
