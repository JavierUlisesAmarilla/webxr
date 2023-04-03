import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js'
import {
  LookingGlassWebXRPolyfill,
  LookingGlassConfig,
} from '@lookingglass/webxr'
import {assertDefined} from '../utils/assert'
import {LIGHT_A_COLOR, LIGHT_B_COLOR, LIGHT_C_COLOR} from '../utils/constants'


const config = LookingGlassConfig
config.tileHeight = 512
config.numViews = 45
config.targetY = 0
config.targetZ = 0
config.targetDiam = 3
config.fovy = (14 * Math.PI) / 180
new LookingGlassWebXRPolyfill()


/**
 * World - three.js entry point
 */
export class World extends THREE.EventDispatcher {
  /**
   * @param {HTMLElement} domEl
   */
  init = ({domEl}) => {
    assertDefined(domEl, window)

    this.scene = new THREE.Scene()

    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 0.1),
        new THREE.MeshStandardMaterial({color: 'red'}),
    )
    this.scene.add(cube)

    const lightA = new THREE.DirectionalLight(new THREE.Color(LIGHT_A_COLOR))
    lightA.position.set(1, 1, 1)
    this.scene.add(lightA)
    const lightB = new THREE.DirectionalLight(new THREE.Color(LIGHT_B_COLOR))
    lightB.position.set(-1, -1, -1)
    this.scene.add(lightB)
    const lightC = new THREE.AmbientLight(new THREE.Color(LIGHT_C_COLOR))
    this.scene.add(lightC)

    this.renderer = new THREE.WebGLRenderer({antialias: true})
    domEl.append(this.renderer.domElement)
    this.renderer.xr.enabled = true

    this.camera = new THREE.PerspectiveCamera()
    this.camera.position.z = 3

    this.renderer.setAnimationLoop(() => {
      cube.rotation.z += 0.01
      cube.rotation.x += 0.02
      this.renderer.render(this.scene, this.camera)
      this.orbitControls.update()
    })
    domEl.append(VRButton.createButton(this.renderer))

    // Orbit Controls
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)

    const resize = () => {
      this.renderer.setSize(innerWidth, innerHeight)
      this.camera.aspect = innerWidth / innerHeight
      this.camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)
  }
}
