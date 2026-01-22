import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {OrbitControls, useGLTF, useTexture, useAnimations, useProgress} from '@react-three/drei'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Dog = () => {

  gsap.registerPlugin(useGSAP())
  gsap.registerPlugin(ScrollTrigger)

  const model = useGLTF('models/dog.drc.glb')

  useThree(({camera, scene, gl}) => {
    camera.position.z = 0.45;
    gl.toneMapping = THREE.ReinhardToneMapping
    gl.outputColorSpace = THREE.SRGBColorSpace
  })

  const {actions} = useAnimations(model.animations, model.scene)

  useEffect(() => {
    actions['Take 001'].play()
  }, [actions])

  const [normalMap] = (useTexture(['/dog_normals.jpg']))
    .map(textures => {
      textures.flipY = false
      textures.colorSpace = THREE.SRGBColorSpace
      return textures
    })
  
  const [branchMapNormal] = (useTexture(['/branches_diffuse.jpg', '/branches_normals.jpg']))
    .map(textures => {
      textures.flipY = true
      textures.colorSpace = THREE.SRGBColorSpace
      return textures
    })
  
  const [
    mat1, mat2, mat3, mat4, mat5, mat6, mat7, mat8, mat9, mat10,
    mat11, mat12, mat13, mat14, mat15, mat16, mat17, mat18, mat19, mat20
  ] = (useTexture([
    '/matcap/mat-1.png', '/matcap/mat-2.png', '/matcap/mat-3.png', '/matcap/mat-4.png',
    '/matcap/mat-5.png', '/matcap/mat-6.png', '/matcap/mat-7.png', '/matcap/mat-8.png',
    '/matcap/mat-9.png', '/matcap/mat-10.png', '/matcap/mat-11.png', '/matcap/mat-12.png',
    '/matcap/mat-13.png', '/matcap/mat-14.png', '/matcap/mat-15.png', '/matcap/mat-16.png',
    '/matcap/mat-17.png', '/matcap/mat-18.png', '/matcap/mat-19.png', '/matcap/mat-20.png',
  ]))
    .map(textures => {
      textures.flipY = true
      textures.colorSpace = THREE.SRGBColorSpace
      return textures
    })
  
  const material = useRef({
    uMatcap1: {value:mat2},
    uMatcap2: {value:mat1},
    uProgress: {value:0.4}
  })
  
  const dogMaterial = new THREE.MeshMatcapMaterial({
    normalMap: normalMap,
    matcap: mat2
  })

  const branchMaterial = new THREE.MeshMatcapMaterial({
    normalMap: branchMapNormal,
    matcap: mat2, // Changed from map to matcap to match material type
  })

  function onBeforeCompile(shader) {
        shader.uniforms.uMatcapTexture1 = material.current.uMatcap1
        shader.uniforms.uMatcapTexture2 = material.current.uMatcap2
        shader.uniforms.uProgress = material.current.uProgress

        shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `
        )

        shader.fragmentShader = shader.fragmentShader.replace(
            "vec4 matcapColor = texture2D( matcap, uv );",
            `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `
        )
    }

  dogMaterial.onBeforeCompile = onBeforeCompile // for dog texture 
  branchMaterial.onBeforeCompile = onBeforeCompile // for branch and leaf texture 
  

  model.scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = dogMaterial
    } else {
      child.material = branchMaterial
    }
    
  })

  const dogModal = useRef(model)

  // modal move on mousemove
  const canvas = document.querySelector("canvas");
  
  document.addEventListener('mousemove', mouseMoveFunc);
  function mouseMoveFunc(e) {
    const depth = 20;
    const moveX = ((e.pageX)-(window.innerWidth/2))/depth;
    const moveY = ((e.pageY)-(window.innerHeight/2))/depth;
    gsap.to(canvas, {
      duration: 1,
      x: moveX,
      y: moveY,
      ease: "slow",
      stagger: 0.008,
      overwrite: true
    });
  }



  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-1",
        endTrigger: "#section-4",
        start: "top top",
        end: "bottom bottom",
        markers: false,
        scrub: true
      }
    })
    
    tl
    .to(dogModal.current.scene.position, {
      y: "+=0.05",
      z: "-=0.5",
    })
    .to(dogModal.current.scene.rotation, {
      x: `+=${Math.PI / 15}`    
    })
    .to(dogModal.current.scene.rotation, {
      x: `-=${Math.PI / 15}`,
      y: `-=${Math.PI}`,
      z: `-=${Math.PI /20}`,
    }, "third")
      .to(dogModal.current.scene.position, {
        x: "-=0.4",
        y: "-=0.00",
        z: "+=0.25",
    }, "third")
    

  }, [])

  useEffect(() => {
    document.querySelector(`#section-2 a[img-title="tomorrowland"]`).addEventListener("mouseenter", () => {
      material.current.uMatcap1.value = mat19
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: ()=> {
          material.current.uMatcap2.value = material.current.uMatcap1.value
          material.current.uProgress.value = 1.0
          branchMaterial.matcap = mat19 // Update branch
        }
      })
    })

    document.querySelector(`#section-2 a[img-title="navy-pier"]`).addEventListener("mouseenter", () => {
      material.current.uMatcap1.value = mat8
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: ()=> {
          material.current.uMatcap2.value = material.current.uMatcap1.value
          material.current.uProgress.value = 1.0
          branchMaterial.matcap = mat8 // Update branch
        }
      })
    })

    document.querySelector(`#section-2 a[img-title="msi-chicago"]`).addEventListener("mouseenter", () => {
      material.current.uMatcap1.value = mat9
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: ()=> {
          material.current.uMatcap2.value = material.current.uMatcap1.value
          material.current.uProgress.value = 1.0
          branchMaterial.matcap = mat9 // Update branch
        }
      })
    })

    document.querySelector(`#section-2 a[img-title="phone"]`).addEventListener("mouseenter", () => {
      material.current.uMatcap1.value = mat12
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: ()=> {
          material.current.uMatcap2.value = material.current.uMatcap1.value
          material.current.uProgress.value = 1.0
          branchMaterial.matcap = mat12 // Update branch
        }
      })
    })

    document.querySelector(`#section-2 a[img-title="kikk"]`).addEventListener("mouseenter", () => {
      material.current.uMatcap1.value = mat10
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: ()=> {
          material.current.uMatcap2.value = material.current.uMatcap1.value
          material.current.uProgress.value = 1.0
          branchMaterial.matcap = mat10 // Update branch
        }
      })
    })

    document.querySelector(`#section-2 a[img-title="kennedy"]`).addEventListener("mouseenter", () => {
      material.current.uMatcap1.value = mat8
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: ()=> {
          material.current.uMatcap2.value = material.current.uMatcap1.value
          material.current.uProgress.value = 1.0
          branchMaterial.matcap = mat8 // Update branch
        }
      })
    })

    document.querySelector(`#section-2 a[img-title="opera"]`).addEventListener("mouseenter", () => {
      material.current.uMatcap1.value = mat13
      gsap.to(material.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: ()=> {
          material.current.uMatcap2.value = material.current.uMatcap1.value
          material.current.uProgress.value = 1.0
          branchMaterial.matcap = mat13 // Update branch
        }
      })
    })

    // reset effect after hover 
    document.querySelectorAll('#section-2 a').forEach(el => {
      el.addEventListener('mouseleave', () => {
        material.current.uMatcap1.value = mat2
        gsap.to(material.current.uProgress, {
          value: 0.0,
          duration: 0.3,
          onComplete: ()=> {
            material.current.uMatcap2.value = material.current.uMatcap1.value
            material.current.uProgress.value = 1.0
            branchMaterial.matcap = mat1 // Reset branch
          }
        })
      })
    })
    
  }, [])

  return (
    <>
      <primitive object={model.scene} position={[0.15, -0.65, 0.05]} rotation={[0,Math.PI/8,0]} />
      <directionalLight position={[0, 5, 5]} color={0xFFFFFF} intensity={5} />
    </>
  )
}

export default Dog