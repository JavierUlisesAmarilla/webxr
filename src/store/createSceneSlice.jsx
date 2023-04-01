export const createSceneSlice = (set, get) => {
  return {
    world: undefined,
    setWorld: (newWorld) => set(() => ({world: newWorld})),
  }
}
