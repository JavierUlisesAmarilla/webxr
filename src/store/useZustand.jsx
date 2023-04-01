import {create} from 'zustand'
import {createSceneSlice} from './createSceneSlice'


export const useZustand = create((set, get) => ({
  ...createSceneSlice(set, get),
}))
