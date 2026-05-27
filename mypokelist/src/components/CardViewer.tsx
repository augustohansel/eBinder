import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, RoundedBox } from '@react-three/drei'
import { TextureLoader, Group } from 'three'
import type { Card } from '../data/collections'
import { CardInfoSidebar } from './CardInfoSidebar'

interface CardMeshProps {
  card: Card & { cardBack?: string }
}

function CardMesh({ card }: CardMeshProps) {
  const groupRef = useRef<Group>(null)

  const proxiedFrontImage = `http://localhost:3333/proxy-image?url=${encodeURIComponent(card.frontImage)}`
  const backTexturePath = `/backs/${card.cardBack || 'pokemon'}.jpg`

  const [frontTexture, backTexture] = useLoader(TextureLoader, [proxiedFrontImage, backTexturePath], (loader) => {
    loader.setCrossOrigin('anonymous')
  })

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15
  })

  return (
    <group ref={groupRef}>
      <RoundedBox args={[2.8, 3.8, 0.04]} radius={0.14} smoothness={12} position={[0, 0, -0.01]}>
        <meshStandardMaterial color="#c8c4d4" roughness={0.5} metalness={0.25} />
      </RoundedBox>

      <RoundedBox args={[2.6, 3.6, 0.06]} radius={0.12} smoothness={12}>
        <meshStandardMaterial color="#d1cdda" roughness={0.5} metalness={0.2} />
      </RoundedBox>

      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[2.36, 3.36]} />
        <meshStandardMaterial
          map={frontTexture}
          transparent={true}
          roughness={0.55}
          metalness={0.08}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.035]}>
        <planeGeometry args={[2.36, 3.36]} />
        <meshStandardMaterial
          map={backTexture}
          roughness={0.55}
          metalness={0.08}
          transparent={true}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
    </group>
  )
}

function Fallback() {
  return (
    <RoundedBox args={[2.6, 3.6, 0.06]} radius={0.12} smoothness={12}>
      <meshStandardMaterial color="#ede9f8" wireframe />
    </RoundedBox>
  )
}

interface CardViewerProps {
  card: Card;
  onClose?: () => void;
}

export function CardViewer({ card, onClose }: CardViewerProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        
        <ambientLight intensity={0.75} />

        <directionalLight position={[2, 3, 5]} intensity={0.5} color="#ffffff" />

        <pointLight position={[0, 4, 3]} intensity={0.4} color="#ffffff" distance={12} decay={2} />

        <directionalLight position={[-2, -1, -3]} intensity={0.12} color="#c4b5fd" />

        <Suspense fallback={<Fallback />}>
          <CardMesh key={card.id} card={card} />
          <Environment preset="warehouse" environmentIntensity={0.5} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={9}
          autoRotate={false}
        />
      </Canvas>

      <CardInfoSidebar card={card} onClose={onClose} />
      
    </div>
  )
}