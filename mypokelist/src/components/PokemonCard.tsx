import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, DoubleSide, Mesh } from 'three'

export function PokemonCard() {
  const meshRef = useRef<Mesh>(null)

  const [frontTexture, backTexture] = useLoader(TextureLoader, ['/card-front.jpg', '/card-back.jpg'], (loader) => {
    loader.setCrossOrigin('anonymous');
  });

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.5, 3.5]} />
      <meshStandardMaterial
        map={frontTexture}
        side={DoubleSide}
        attach="material-0"
      />
    </mesh>
  )
}

export function PokemonCardBack() {
  const meshRef = useRef<Mesh>(null)
  
  const backTexture = useLoader(TextureLoader, '/card-back.jpg', (loader) => {
    loader.setCrossOrigin('anonymous');
  })

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15
  })

  return (
    <mesh ref={meshRef} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[2.5, 3.5]} />
      <meshStandardMaterial map={backTexture} />
    </mesh>
  )
}