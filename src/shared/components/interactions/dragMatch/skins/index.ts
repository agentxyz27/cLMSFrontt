import { registerSkin, listSkins } from './registry'
import { defaultSkin } from './default'
import { animalFeedingSkin } from './animalFeeding'
import { chestSkin } from './chest'

registerSkin(defaultSkin)
registerSkin(animalFeedingSkin)
registerSkin(chestSkin)
console.log('skins registered:', listSkins().map(s => s.id))
