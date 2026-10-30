export interface Climber {
  id: string
  name: string
  initials: string
  color: string
  photo?: string
}

// Las fotos se generan con `npm run climbers` en src/assets/climbers/<id>.jpg
const photos = import.meta.glob('../assets/climbers/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<
  string,
  string
>

const withPhoto = (c: Omit<Climber, 'photo'>): Climber => ({ ...c, photo: photos[`../assets/climbers/${c.id}.jpg`] })

export const CLIMBERS: Climber[] = [
  withPhoto({ id: 'ondra', name: 'Adam Ondra', initials: 'AO', color: '#3aa8e4' }),
  withPhoto({ id: 'sharma', name: 'Chris Sharma', initials: 'CS', color: '#f2392b' }),
  withPhoto({ id: 'janja', name: 'Janja Garnbret', initials: 'JG', color: '#99ff4a' }),
  withPhoto({ id: 'margo', name: 'Margo Hayes', initials: 'MH', color: '#b57cff' }),
  withPhoto({ id: 'andrada', name: 'Dani Andrada', initials: 'DA', color: '#ffff40' }),
  withPhoto({ id: 'josune', name: 'Josune Bereziartu', initials: 'JB', color: '#f2392b' }),
  withPhoto({ id: 'michaela', name: 'Michaela Kiersch', initials: 'MK', color: '#3aa8e4' }),
  withPhoto({ id: 'patxi', name: 'Patxi Usobiaga', initials: 'PU', color: '#99ff4a' }),
]

export function findClimber(id: string | undefined): Climber | undefined {
  return id ? CLIMBERS.find((c) => c.id === id) : undefined
}
