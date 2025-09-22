import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/user', () => {
    return HttpResponse.json({
      id: 'abc-123',
      firstName: 'John',
      lastName: 'Maverick',
    })
  }),
]
