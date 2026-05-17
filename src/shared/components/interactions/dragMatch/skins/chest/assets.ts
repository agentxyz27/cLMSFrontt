import bc1Closed    from './bc1/IsClosed.png'
import bc1Open      from './bc1/IsOpen.png'
import bc1Anim      from './bc1/animation.gif'
import bc10Closed   from './bc10/IsClosed.png'
import bc10Open     from './bc10/IsOpen.png'
import bc10Anim     from './bc10/animation.gif'

export type ChestVariant = 'bc1' | 'bc10'

export const CHEST_ASSETS: Record<ChestVariant, {
  closed: string
  open: string
  animation: string
}> = {
  bc1:  { closed: bc1Closed,  open: bc1Open,  animation: bc1Anim  },
  bc10: { closed: bc10Closed, open: bc10Open, animation: bc10Anim },
}

export const CHEST_VARIANTS = Object.keys(CHEST_ASSETS) as ChestVariant[]