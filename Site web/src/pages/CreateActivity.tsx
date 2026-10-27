import { Canvas } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import { Component, Suspense, useMemo, type ReactNode } from 'react'
import './CreateActivity.css'

// Réglages propres au deuxième téléphone, indépendants de ceux du hero.
const tailleCreation = 17.2
const hauteurCreation = 0
const angleCreation = 0

function PhoneCreate() {
  const { scene } = useGLTF('/models/smartphone.glb')
  // Le fichier GLB est mis en cache, mais cet objet 3D appartient à cette scène.
  const telephoneCreation = useMemo(() => scene.clone(true), [scene])

  return (
    <primitive
      object={telephoneCreation}
      scale={tailleCreation}
      position={[0, hauteurCreation, 0]}
      rotation={[0, angleCreation, 0]}
    />
  )
}

class PhoneCreateBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed
      ? <p role="status">Le téléphone 3D de création d’activité n’est pas disponible.</p>
      : this.props.children
  }
}

function PhoneCreatePreview() {
  return (
    <figure className="create-phone" aria-label="Téléphone 3D de création d’activité">
      <div className="create-phone-scene">
        <PhoneCreateBoundary>
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 35 }}
            dpr={[1, 1.5]}
            frameloop="demand"
            gl={{ alpha: true, antialias: true }}
            fallback={<p>La 3D n’est pas disponible dans ce navigateur.</p>}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <Suspense fallback={null}>
              <PhoneCreate />
              <Environment preset="studio" />
            </Suspense>
          </Canvas>
        </PhoneCreateBoundary>
      </div>
    </figure>
  )
}

export default function CreateActivity() {
  return (
    <section className="create_activiter" id="creer-activite" aria-labelledby="create-activity-title">
      <PhoneCreatePreview />
      <div className="create-activity-content">
        <p className="create-activity-eyebrow">Organise ta propre sortie</p>
        <h2 className="create-activity-title" id="create-activity-title">Crée ta propre activité</h2>
        <p className="create-activity-description">
          Choisis ton sport, le lieu, la date et le nombre de participants en quelques clics.
          Que ce soit une partie de tennis, un match de foot, une sortie trail ou plein
          d’autres activités, c’est simple et rapide.
        </p>
        <a className="create-activity-button" href="#telechargement">Créer une activité</a>
      </div>
    </section>
  )
}
