import threejsConfig from '../static/js/threejsConfig.js'
import Stats from 'stats.js'
const stats = new Stats()

export default {
  methods: {
    /*****************************************
    // load obj files for three js
    *****************************************/
    loadOBJ (T) {
      return new Promise((resolve, reject) => {
        let objLoader = new THREE.OBJLoader()
        objLoader.load('static/3d/balloon.obj', (obj) => {
          // onloaded
          // console.log('loaded object: ', obj)
          T.balloonMesh = obj
          resolve()
        }, (xhr) => {
          // when loading is in progress
          // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        }, (error) => {
          // onerror
          console.error('An error happened', error)
          reject(error)
        })
      })
    },
    /*****************************************
    // setup three.js
    *****************************************/
    setupThreeJS () {
      const T = this.T

      this.setupEnv(T)
      this.setupLight(T)
      this.setupCamera(T)
      this.setupSphere(T)
      this.setupBalloons(T)
      this.setupObjectGroup(T)

      this.animate()
    },
    /*****************************************
    // three.js environmental settings
    *****************************************/
    setupEnv (T) {
      // renderer
      T.renderer = new THREE.WebGLRenderer()
      T.renderer.setSize(window.innerWidth, window.innerHeight)

      let el = document.getElementById('threejs-wrapper')
      el.appendChild(T.renderer.domElement)

      // scene
      T.scene = new THREE.Scene()
      T.scene.background = new THREE.Color('hsl(120, 40%, 20%)')

      // stats
      stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
      el.appendChild(stats.dom)

      // mouse event
      T.raycaster = new THREE.Raycaster()
      T.mouse = new THREE.Vector2()
    },
    /*****************************************
    // three.js light settings
    *****************************************/
    setupLight (T) {
      // let pLight = new THREE.PointLight(0xffffff, 1, 50, 1)
      // pLight.position.set(0, 10, 0)
      // T.scene.add(pLight)
    },
    /*****************************************
    // three.js camera settings
    *****************************************/
    setupCamera (T) {
      T.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
      T.camera.position.set(0, 0, 0.1)
      T.camera.lookAt(0, 0, 0)

      // controls
      // T.controls = new THREE.OrbitControls(T.camera, T.renderer.domElement)
    },
    /*****************************************
    // three.js sphere
    *****************************************/
    setupSphere (T) {
      let geometry = new THREE.SphereGeometry(10, 60, 40)
      geometry.scale(-1, 1, 1)

      var video = document.createElement('video')
      video.width = threejsConfig.VIDEO_WIDTH
      video.height = threejsConfig.VIDEO_HEIGHT
      video.autoplay = true
      video.loop = true
      video.src = threejsConfig.VIDEO_SRC
      video.display = 'none'

      var texture = new THREE.VideoTexture(video)
      texture.minFilter = THREE.LinearFilter

      var material = new THREE.MeshBasicMaterial({map: texture})

      T.sphere = new THREE.Mesh(geometry, material)
      T.sphere.position.set(0, 0, 0)
    },
    /*****************************************
    // three.js balloons
    *****************************************/
    setupBalloons (T) {
      // geometry
      // let geometry = new THREE.PlaneGeometry(1, 1, 32)
      // let geometry = T.roundedPlane

      for (let i = 0; i < this.pins.length; i++) {
        // determine color for material
        let color
        for (let j = 0; j < this.categories.length; j++) {
          // console.log('category: ' + this.pins[i].category + ', label: ' + this.categories[j].label)
          if (this.pins[i].category === this.categories[j].label) {
            color = this.categories[j].color
          }
        }

        // material
        let material = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.FrontSide
        })

        // create mesh
        // let plane = new THREE.Mesh(geometry, material)
        let myBalloon = T.balloonMesh.clone()
        myBalloon.traverse((child) => {
          child.material = material
        })
        myBalloon.position.set(9.5, 0, 0)
        myBalloon.name = this.pins[i].id

        // make a group to rotate the plane from the origin of the world (0, 0, 0)
        let pivot = new THREE.Group()
        pivot.add(myBalloon)
        pivot.rotateY(Math.degToRad(this.pins[i].angle.h))
        pivot.rotateZ(Math.degToRad(this.pins[i].angle.v))
        pivot.updateMatrixWorld()

        // re-calculate the absolute position of the plane
        let vector = new THREE.Vector3()
        vector.setFromMatrixPosition(pivot.children[0].matrixWorld)
        myBalloon.position.set(vector.x, vector.y, vector.z)
        myBalloon.lookAt(0, 0, 0)

        // additional properties
        myBalloon.initialY = vector.y
        myBalloon.seedNum = Math.random()
        myBalloon.initialColor = color
        // myBalloon.scale = new THREE.Vector3(this.pins[i].scale, this.pins[i].scale, this.pins[i].scale)
        myBalloon.scale.x = this.pins[i].scale
        myBalloon.scale.y = this.pins[i].scale
        myBalloon.scale.z = this.pins[i].scale

        // then add the plane to the world
        T.balloons.push(myBalloon)
      }
    },
    /*****************************************
    // three.js object group
    *****************************************/
    setupObjectGroup (T) {
      T.objectGroup = new THREE.Group()
      T.objectGroup.add(T.sphere)
      for (let i = 0; i < T.balloons.length; i++) {
        T.objectGroup.add(T.balloons[i])
      }

      T.objectGroup.position.set(0, 0, 0)
      T.scene.add(T.objectGroup)
    },
    /*****************************************
    // three.js animate loop
    *****************************************/
    animate (elapsedTime) {
      // loop
      requestAnimationFrame(this.animate)

      // limit the framerate
      let frameNumber = Math.round(elapsedTime / (1000 / threejsConfig.FRAMERATE))
      if (frameNumber === this.lastFrameNumber) {
        return
      }
      this.lastFrameNumber = frameNumber

      // stats
      stats.begin()
      const T = this.T

      // add floating effect to balloons
      this.floatBalloons(T, elapsedTime)

      // T.controls.update()
      T.renderer.render(T.scene, T.camera)
      stats.end()
    },
    /*****************************************
    // three.js floating effect
    *****************************************/
    floatBalloons (T, elapsedTime) {
      T.balloons.forEach((balloon) => {
        balloon.position.y = balloon.initialY + Math.sin(balloon.seedNum * 10 + elapsedTime * 0.005) * 0.05
      })
    },
    /*****************************************
    // when the threejs world is clicked
    *****************************************/
    threeClicked (event) {
      // determine if the mouse is clicked on any balloons in the world
      this.T.mouse.x = (event.clientX / this.T.renderer.domElement.clientWidth) * 2 - 1
      this.T.mouse.y = -(event.clientY / this.T.renderer.domElement.clientHeight) * 2 + 1
      this.T.raycaster.setFromCamera(this.T.mouse, this.T.camera)

      // get intersection of the mouse position and sphere
      // let intersect = this.T.raycaster.intersectObject(this.T.sphere)
      // if (intersect) {
      //   console.log('the clicked pos is: ', intersect)
      // }

      // prepare an array for plane objects of the ballons
      let planes = []
      for (let i = 0; i < this.T.balloons.length; i++) {
        let plane = this.T.balloons[i].getObjectByName('rounded-plane_Plane')
        planes.push(plane)
      }

      // search if there is any planes where you clicked at
      let intersects = this.T.raycaster.intersectObjects(planes)
      if (intersects.length > 0) {
        console.log('clicked on a balloon: ', intersects[0].object.parent.name)
        if (intersects[0].object.parent.visible) {
          intersects[0].object.parent.traverse((child) => {
            child.material.color.offsetHSL(0, 0.1, 0.1) // change color
          })
          this.isModalDisplayed = true
          this.selectedModalId = intersects[0].object.parent.name
        }
      }
    },
    /*****************************************
    // update pins to display when the selected category is changed
    *****************************************/
    updatePinsToDisplay () {
      // get labels of selected categories
      let selectedCategories = []
      for (let i = 0; i < this.categories.length; i++) {
        if (this.categories[i].selected === true) {
          selectedCategories.push(this.categories[i].label)
        }
      }

      // get ids of pins to display
      let pinsToDisplay = []
      for (let i = 0; i < this.pins.length; i++) {
        if (selectedCategories.includes(this.pins[i].category)) {
          pinsToDisplay.push(this.pins[i].id)
        }
      }

      console.log('selectedCategories', selectedCategories)
      console.log('pinsToDisplay', pinsToDisplay)

      // update visibility
      for (let i = 0; i < this.T.balloons.length; i++) {
        if (pinsToDisplay.includes(this.T.balloons[i].name)) {
          this.T.balloons[i].visible = true
        } else {
          this.T.balloons[i].visible = false
        }
      }
    }
  }
}
