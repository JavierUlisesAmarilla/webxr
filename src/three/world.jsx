import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

import {VRButton} from 'three/examples/jsm/webxr/VRButton.js'
import {
  LookingGlassWebXRPolyfill,
  LookingGlassConfig,
} from '@lookingglass/webxr'
import Stats from 'stats-js'
import TWEEN from '@tweenjs/tween.js'
import {assertDefined} from '../utils/assert'
import {
  BACK_COLOR,
  FOG_DENSITY,
  ENABLE_STATS,
  FOG_COLOR,
  LIGHT_A_COLOR,
  LIGHT_B_COLOR,
  LIGHT_C_COLOR,
} from '../utils/constants'
import {getThreeEnv} from '../utils/common'


const config = LookingGlassConfig
config.tileHeight = 512
config.numViews = 45
config.targetY = 0
config.targetZ = 0
config.targetDiam = 3
config.fovy = (40 * Math.PI) / 180
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

    // Static vars
    this.domEl = domEl

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(BACK_COLOR)
    this.scene.fog = new THREE.FogExp2(new THREE.Color(FOG_COLOR), FOG_DENSITY)

    // Lights
    const lightA = new THREE.DirectionalLight(new THREE.Color(LIGHT_A_COLOR))
    lightA.position.set(1, 1, 1)
    this.scene.add(lightA)
    const lightB = new THREE.DirectionalLight(new THREE.Color(LIGHT_B_COLOR))
    lightB.position.set(-1, -1, -1)
    this.scene.add(lightB)
    const lightC = new THREE.AmbientLight(new THREE.Color(LIGHT_C_COLOR))
    this.scene.add(lightC)

    // Camera
    const {domWidth, domHeight, aspect} = getThreeEnv({domEl})
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.001, 30)
    this.camera.position.setZ(10)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = false
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.setSize(domWidth, domHeight)
    this.renderer.xr.enabled = true
    domEl.appendChild(this.renderer.domElement)
    document.body.append(VRButton.createButton(this.renderer))

    // Orbit Controls
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)

    // Stats
    if (ENABLE_STATS) {
      this.stats = new Stats()
      domEl.appendChild(this.stats.dom)
    }

    // Main (Custom Mesh)
    const planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({
          color: 'red',
        }),
    )
    planeMesh.position.set(-10, 2, 0)
    this.scene.add(planeMesh)
    new TWEEN.Tween(planeMesh.position).to(new THREE.Vector3(0, 2, 0), 2000).easing(TWEEN.Easing.Exponential.InOut).start()

    // Main (Instanced Mesh)
    const planeInstMesh = new THREE.InstancedMesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({
          color: 'green',
        }),
        1,
    )
    this.scene.add(planeInstMesh)
    const srcMatrix4 = new THREE.Matrix4().multiplyMatrices(
        new THREE.Matrix4().setPosition(-10, -2, 0),
        new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(), 0),
    )
    const desMatrix4 = new THREE.Matrix4().multiplyMatrices(
        new THREE.Matrix4().setPosition(0, -2, 0),
        new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(), 0),
    )
    new TWEEN.Tween(srcMatrix4).to(desMatrix4, 2000).onUpdate(() => {
      planeInstMesh.setMatrixAt(0, srcMatrix4)
      planeInstMesh.instanceMatrix.needsUpdate = true
    }).easing(TWEEN.Easing.Exponential.InOut).start()

    // Animate
    this.animate()

    // Events
    window.addEventListener('resize', this.onWindowResize)
    domEl.addEventListener('mousedown', this.onMouseDown)
    domEl.addEventListener('mousemove', this.onMouseMove)
    domEl.addEventListener('mouseup', this.onMouseUp)
    domEl.addEventListener('mousewheel', this.onMouseWheel)
  }


  animate = () => {
    requestAnimationFrame((t) => {
      this.animate()
      if (this.stats) {
        this.stats.begin()
      }
      TWEEN.update()
      this.render()
      if (this.stats) {
        this.stats.end()
      }
    })
  }


  render = () => {
    this.renderer.render(this.scene, this.camera)
    this.orbitControls.update()
  }


  onWindowResize = () => {
    // TODO
  }


  onMouseDown = (event) => {
    // TODO
  }

  onMouseMove = (event) => {
    // TODO
  }


  onMouseUp = (event) => {
    // TODO
  }


  onMouseWheel = (event) => {
    // TODO
  }
}
