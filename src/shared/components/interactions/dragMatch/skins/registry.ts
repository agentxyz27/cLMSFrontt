import type { DragMatchSkinPlugin } from './types'

const registry = new Map<string, DragMatchSkinPlugin>()

export function registerSkin(plugin: DragMatchSkinPlugin) {
  registry.set(plugin.id, plugin)
}

export function getSkin(id?: string): DragMatchSkinPlugin {
  return registry.get(id ?? 'default') ?? registry.get('default')!
}

export function listSkins(): DragMatchSkinPlugin[] {
  return Array.from(registry.values())
}