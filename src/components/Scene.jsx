import React, {useRef, useEffect} from 'react'
import {useZustand} from '../store/useZustand'
import {World} from '../three/world'


let isFirstRender = true


export const Scene = () => {
  const {
    setWorld,
  } = useZustand()
  const sceneRef = useRef(null)


  useEffect(() => {
    if (!isFirstRender) {
      return
    }
    (async () => {
      const el = document.createElement('div')
      el.className = 'absolute w-screen h-screen'
      sceneRef.current.innerHTML = ''
      sceneRef.current.appendChild(el)
      const newWorld = new World()
      await newWorld.init({domEl: el})
      setWorld(newWorld)
    })()
    isFirstRender = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div
      className='absolute w-screen h-screen'
      ref={sceneRef}
    />
  )
}
