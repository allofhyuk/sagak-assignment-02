import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('타이틀을 렌더한다', () => {
    render(<App />)
    expect(screen.getByText('sagak-assignment')).toBeInTheDocument()
  })
})
