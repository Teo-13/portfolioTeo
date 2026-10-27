import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { MathUtils, type Group } from 'three'
import { usePhoneScroll, type PhoneScrollRef } from './usePhoneScroll'
import CreateActivity from './CreateActivity'
import './tele.css'

const assets = '/images/tele'
const angle_initial = 0
const taille = 17.2
const amplitude_flottement = 0.08
const angle_flottement = 25 * Math.PI / 180
const duree_flottement = 6
const agrandissement_scroll = 1.22
const fin_alignement_scroll = 0.20
const pos = 0

function PhoneModel({ mouvement, onReady }: { mouvement: PhoneScrollRef, onReady: (ready: boolean) => void }) {
  const { scene } = useGLTF('/models/smartphone.glb')
  // Chaque téléphone garde sa propre scène ; le modèle chargé reste intact.
  const modele = useMemo(() => scene.clone(true), [scene])
  const telephone = useRef<Group>(null)
  const flottement = useRef({ temps: 0, termine: false, hauteur: pos, angle: 0 })

  useEffect(() => {
    onReady(true)
    return () => onReady(false)
  }, [onReady])

  useFrame((_, delta) => {
    const modele = telephone.current
    if (!modele) return

    const animation = mouvement.current
    const repos = flottement.current

    if (animation.reduit) {
      modele.position.y = pos
      modele.rotation.set(0, angle_initial, 0)
      modele.scale.setScalar(taille)
      return
    }

    // Étape 1 : flotte verticalement et pivote gauche/droite, écran toujours visible.
    if (!animation.commence) {
      repos.temps += Math.min(delta, 0.1)
      const phase = repos.temps * Math.PI * 2 / duree_flottement
      modele.position.y = pos + Math.sin(phase) * amplitude_flottement
      modele.rotation.set(0, angle_initial + Math.sin(phase) * angle_flottement, 0)
      modele.scale.setScalar(taille)
      return
    }

    if (!repos.termine) {
      repos.termine = true
      repos.hauteur = modele.position.y
      repos.angle = modele.rotation.y
    }

    // Étape 2 : raccord depuis la pose flottante, puis un tour complet et +12 % de taille.
    // Tout dépend du scroll : aucune animation ne continue quand on arrête de défiler.
    const alignement = MathUtils.smoothstep(animation.progression, 0, fin_alignement_scroll)
    const tour = MathUtils.smoothstep(animation.progression, fin_alignement_scroll, 1)
    const agrandissement = MathUtils.smoothstep(animation.progression, 0, 1)
    modele.position.y = MathUtils.lerp(repos.hauteur, pos, alignement)
    modele.rotation.set(
      0,
      MathUtils.lerp(repos.angle, angle_initial, alignement) + tour * Math.PI * 2,
      0,
    )
    modele.scale.setScalar(taille * MathUtils.lerp(1, agrandissement_scroll, agrandissement))
    // Étape 3 à venir : on conserve pour l'instant cette pose finale, de face et agrandie.
  })

  return (
    <primitive
      ref={telephone}
      object={modele}
      scale={taille}
      position={[0, pos, 0]}
      rotation={[0, angle_initial, 0]}
    />
  )
}

class PhoneSceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed
      ? <p role="status">Le téléphone 3D n’est pas disponible.</p>
      : this.props.children
  }
}

function DownloadIcon() {
  return (
    <svg width="28" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhonePreview({ mouvement, telephone, onReady }: {
  mouvement: PhoneScrollRef
  telephone: RefObject<HTMLElement | null>
  onReady: (ready: boolean) => void
}) {
  return (
    <figure ref={telephone} className="tele-phone" aria-label="Téléphone 3D animé au défilement">
      <div className="tele-phone-scene">
        <PhoneSceneBoundary>
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 35 }}
            dpr={[1, 1.5]}
            frameloop="always"
            gl={{ alpha: true, antialias: true }}
            fallback={<p>La 3D n’est pas disponible dans ce navigateur.</p>}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <Suspense fallback={null}>
              <PhoneModel mouvement={mouvement} onReady={onReady} />
              <Environment preset="studio" />
            </Suspense>
          </Canvas>
        </PhoneSceneBoundary>
      </div>
    </figure>
  )
}


export default function Tele() {
  const { zone, hero, telephone, entete, mouvement, setPret } = usePhoneScroll()
  const [activitesEnPause, setActivitesEnPause] = useState(false)

  return (
    <main className="tele-page" id="accueil">
      <header ref={entete} className="tele-header">
        <a className="tele-logo" href="#accueil" aria-label="Ynot, accueil">
          <img src={`${assets}/ynot-logo.png`} width="205" height="137" alt="Ynot" />
        </a>
        <nav className="tele-nav" aria-label="Navigation principale">
          <a href="#">Fonctionnalités</a>
          <a href="#">Activités</a>
          <a href="#">Communauté</a>
          <a href="#">À propos</a>
        </nav>
        <a className="tele-header-download" href="#telechargement">Téléchargement</a>
      </header>

      <div ref={zone} className="tele-scroll-stage">
      <section ref={hero} className="tele-hero" id="fonctionnalites" aria-labelledby="tele-title">
        <div className="tele-shape tele-shape-top" aria-hidden="true" />
        <div className="tele-shape tele-shape-peach" aria-hidden="true" />
        <div className="tele-shape tele-shape-orange" aria-hidden="true" />
        <div className="tele-intro" id="a-propos">
          <p className="tele-eyebrow">SPORT - PRÈS DE CHEZ TOI</p>
          <h1 className="tele-title" id="tele-title">Trouve les bonnes personnes pour faire du sport</h1>
          <p className="tele-description" id="communaute">
            Ynot te connecte aux sorties sportives autour de toi. Découvre, rejoins
            ou crée une activité. Du badminton au trail, entre amis ou avec
            de nouvelles personnes.
          </p>
          <div className="tele-actions">
            <a className="tele-button tele-button-primary" href="#">
              <DownloadIcon />
              <span>Télécharger l’app</span>
            </a>
            <a className="tele-button tele-button-secondary" href="#">
              <span>Voir les activités</span>
              <svg width="20" height="28" viewBox="0 0 20 28" fill="none" aria-hidden="true">
                <path d="m5 3 11 11L5 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <div className="tele-stores" id="telechargement" aria-label="Téléchargement de l’application">
            <div className="tele-store tele-store-apple">
              <img src={`${assets}/apple-mark.png`} width="79" height="44" alt="" />
              <span><small>Disponible sur</small><strong>L’App Store</strong></span>
            </div>
            <div className="tele-store tele-store-google">
              <img src={`${assets}/google-play-mark.png`} width="39" height="44" alt="" />
              <span><small>Disponible sur</small><strong>Google Play</strong></span>
            </div>

          </div>
        </div>
        <PhonePreview mouvement={mouvement} telephone={telephone} onReady={setPret} />
      </section>
      </div>

      {/* Bandeau activités : structure, données et icônes réunies ici. */}
      <section className="bandeau_activiter" id="activites" aria-labelledby="activities-title">
        <div className="activities-inner">
          <h2 className="activities-title" id="activities-title">Trouve ta <span>prochaine activité</span></h2>
          <p className="activities-description">Découvre des sorties près de chez toi et rejoins d’autres sportifs.</p>

          <div
            className="activities-grid"
            id="activities-list"
            role="region"
            aria-label="Liste des activités"
            tabIndex={0}
            data-paused={activitesEnPause || undefined}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.scrollLeft = 0
            }}
          >
            <div className="activities-track">
              {[false, true].map((copie) => (
                <div className="activities-group" key={String(copie)} aria-hidden={copie || undefined}>
                  {/* Bowling */}
                  <article className="activity-card" aria-labelledby={`activity-bowling${copie ? '-copie' : ''}`}>
                    <div className="activity-cover">
                      <img className="activity-photo activity-photo-bowling" src="/images/activites/bowling.jpg" alt="Une boule et des quilles sur une piste de bowling" width="884" height="438" loading="lazy" decoding="async" />
                      <span className="activity-sport"><svg className="activity-icon activity-icon-bowling" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><g fill="#fee5df" stroke="none"><circle cx="12" cy="8" r="1.3" /><circle cx="16" cy="9" r="1.3" /><circle cx="14" cy="12.5" r="1.3" /></g></svg><span>Bowling</span></span>
                    </div>

                    <h3 className="activity-title" id={`activity-bowling${copie ? '-copie' : ''}`}>Bowling du vendredi soir</h3>
                    <div className="activity-details">
                      <p className="activity-location"><svg className="activity-icon activity-icon-location" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.8" /></svg><span>Bordeaux</span></p>
                      <p className="activity-date"><svg className="activity-icon activity-icon-calendar" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="17" rx="1.5" /><path d="M7 2v6M17 2v6M3 11h18M7 15h.01M12 15h.01M17 15h.01M7 19h.01M12 19h.01" /></svg><span>mar. 29 janv. - 19h30</span></p>
                      <span className="activity-level"><img src="/images/activites/niveau.png" width="34" height="36" alt="" loading="lazy" /><span>Tous niveaux</span></span>
                    </div>

                    <div className="activity-participants">

                      <p className="activity-player-count"><svg className="activity-icon activity-icon-players" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M1 21v-2a8 8 0 0 1 16 0v2M16 4a4 4 0 0 1 0 8M19 15a6 6 0 0 1 4 6" /></svg><span>5 / 8 joueurs</span></p>
                    </div>

                    <div className="activity-footer">
                      <a className="activity-join" href="#telechargement" tabIndex={copie ? -1 : undefined} aria-label="Rejoindre « Bowling du vendredi soir » dans l’application Ynot">
                        <span>Rejoindre</span><svg className="activity-icon activity-icon-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18m-8-8 8 8-8 8" /></svg>
                      </a>
                    </div>
                  </article>

                  {/* Padel */}
                  <article className="activity-card" aria-labelledby={`activity-padel${copie ? '-copie' : ''}`}>
                    <div className="activity-cover">
                      <img className="activity-photo activity-photo-padel" src="/images/activites/padel.jpg" alt="Un joueur de padel renvoie une balle sur un terrain bleu" width="884" height="438" loading="lazy" decoding="async" />
                      <span className="activity-sport"><svg className="activity-icon activity-icon-padel" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="10" cy="9" rx="6" ry="8" transform="rotate(40 10 9)" /><path d="m13 16 5 6 3-3-6-5M7 6h.01M10 5h.01M6 9h.01M10 9h.01M13 8h.01M9 12h.01" /></svg><span>Padel</span></span>
                    </div>

                    <h3 className="activity-title" id={`activity-padel${copie ? '-copie' : ''}`}>Petit padel</h3>
                    <div className="activity-details">
                      <p className="activity-location"><svg className="activity-icon activity-icon-location" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.8" /></svg><span>Lyon</span></p>
                      <p className="activity-date"><svg className="activity-icon activity-icon-calendar" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="17" rx="1.5" /><path d="M7 2v6M17 2v6M3 11h18M7 15h.01M12 15h.01M17 15h.01M7 19h.01M12 19h.01" /></svg><span>sam. 13 janv. - 14h30</span></p>
                      <span className="activity-level"><img src="/images/activites/niveau.png" width="34" height="36" alt="" loading="lazy" /><span>Niveau intermédiaire</span></span>
                    </div>

                    <div className="activity-participants">

                      <p className="activity-player-count"><svg className="activity-icon activity-icon-players" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M1 21v-2a8 8 0 0 1 16 0v2M16 4a4 4 0 0 1 0 8M19 15a6 6 0 0 1 4 6" /></svg><span>2 / 4 joueurs</span></p>
                    </div>

                    <div className="activity-footer">
                      <a className="activity-join" href="#telechargement" tabIndex={copie ? -1 : undefined} aria-label="Rejoindre « Petit padel » dans l’application Ynot">
                        <span>Rejoindre</span><svg className="activity-icon activity-icon-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18m-8-8 8 8-8 8" /></svg>
                      </a>
                    </div>
                  </article>

                  {/* Pétanque */}
                  <article className="activity-card" aria-labelledby={`activity-petanque${copie ? '-copie' : ''}`}>
                    <div className="activity-cover">
                      <img className="activity-photo activity-photo-petanque" src="/images/activites/petanque.jpg" alt="Des boules de pétanque sur un terrain ensoleillé" width="884" height="438" loading="lazy" decoding="async" />
                      <span className="activity-sport"><svg className="activity-icon activity-icon-petanque" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="14" r="6.5" /><circle cx="17" cy="15" r="5.5" /><path d="M8 7a6 6 0 0 1 11 2M3 12l9 6M4 9l10 6M14 11l6 8M17 10l5 7" /></svg><span>Pétanque</span></span>
                    </div>

                    <h3 className="activity-title" id={`activity-petanque${copie ? '-copie' : ''}`}>Tu tires ou tu pointes</h3>
                    <div className="activity-details">
                      <p className="activity-location"><svg className="activity-icon activity-icon-location" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.8" /></svg><span>Aubagne</span></p>
                      <p className="activity-date"><svg className="activity-icon activity-icon-calendar" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="17" rx="1.5" /><path d="M7 2v6M17 2v6M3 11h18M7 15h.01M12 15h.01M17 15h.01M7 19h.01M12 19h.01" /></svg><span>ven. 21 févr. - 17h00</span></p>
                      <span className="activity-level"><img src="/images/activites/niveau.png" width="34" height="36" alt="" loading="lazy" /><span>Tous niveaux</span></span>
                    </div>

                    <div className="activity-participants">

                      <p className="activity-player-count"><svg className="activity-icon activity-icon-players" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M1 21v-2a8 8 0 0 1 16 0v2M16 4a4 4 0 0 1 0 8M19 15a6 6 0 0 1 4 6" /></svg><span>9 / 12 joueurs</span></p>
                    </div>

                    <div className="activity-footer">
                      <a className="activity-join" href="#telechargement" tabIndex={copie ? -1 : undefined} aria-label="Rejoindre « Tu tires ou tu pointes » dans l’application Ynot">
                        <span>Rejoindre</span><svg className="activity-icon activity-icon-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18m-8-8 8 8-8 8" /></svg>
                      </a>
                    </div>
                  </article> 

                  {/* rando */}
                  <article className="activity-card" aria-labelledby={`activity-petanque-2${copie ? '-copie' : ''}`}>
                    <div className="activity-cover">
                      <img className="activity-photo activity-photo-petanque" src="/images/activites/fond_randos.webp" alt="Des boules de pétanque sur un terrain ensoleillé" width="884" height="438" loading="lazy" decoding="async" />
                      <span className="activity-sport"><svg className="activity-icon activity-icon-petanque" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="14" r="6.5" /><circle cx="17" cy="15" r="5.5" /><path d="M8 7a6 6 0 0 1 11 2M3 12l9 6M4 9l10 6M14 11l6 8M17 10l5 7" /></svg><span>Randonnée</span></span>
                    </div>

                    <h3 className="activity-title" id={`activity-petanque-2${copie ? '-copie' : ''}`}>Petit rando</h3>
                    <div className="activity-details">
                      <p className="activity-location"><svg className="activity-icon activity-icon-location" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.8" /></svg><span>Marseille</span></p>
                      <p className="activity-date"><svg className="activity-icon activity-icon-calendar" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="17" rx="1.5" /><path d="M7 2v6M17 2v6M3 11h18M7 15h.01M12 15h.01M17 15h.01M7 19h.01M12 19h.01" /></svg><span>dim. 24 mars. - 10h30</span></p>
                      <span className="activity-level"><img src="/images/activites/niveau.png" width="34" height="36" alt="" loading="lazy" /><span>Tous niveaux</span></span>
                    </div>

                    <div className="activity-participants">

                      <p className="activity-player-count"><svg className="activity-icon activity-icon-players" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M1 21v-2a8 8 0 0 1 16 0v2M16 4a4 4 0 0 1 0 8M19 15a6 6 0 0 1 4 6" /></svg><span>6 / 7 joueurs</span></p>
                    </div>

                    <div className="activity-footer">
                      <a className="activity-join" href="#telechargement" tabIndex={copie ? -1 : undefined} aria-label="Rejoindre « Tu tires ou tu pointes » dans l’application Ynot">
                        <span>Rejoindre</span><svg className="activity-icon activity-icon-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18m-8-8 8 8-8 8" /></svg>
                      </a>
                    </div>
                  </article>


                  {/* escalade */}
                  <article className="activity-card" aria-labelledby={`activity-petanque-2${copie ? '-copie' : ''}`}>
                    <div className="activity-cover">
                      <img className="activity-photo activity-photo-petanque" src="/images/activites/fond_escalade.webp" alt="Des boules de pétanque sur un terrain ensoleillé" width="884" height="438" loading="lazy" decoding="async" />
                      <span className="activity-sport"><svg className="activity-icon activity-icon-petanque" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="14" r="6.5" /><circle cx="17" cy="15" r="5.5" /><path d="M8 7a6 6 0 0 1 11 2M3 12l9 6M4 9l10 6M14 11l6 8M17 10l5 7" /></svg><span>Escalade</span></span>
                    </div>

                    <h3 className="activity-title" id={`activity-petanque-2${copie ? '-copie' : ''}`}>Qui pour grimper</h3>
                    <div className="activity-details">
                      <p className="activity-location"><svg className="activity-icon activity-icon-location" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.8" /></svg><span>Toulon</span></p>
                      <p className="activity-date"><svg className="activity-icon activity-icon-calendar" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="17" rx="1.5" /><path d="M7 2v6M17 2v6M3 11h18M7 15h.01M12 15h.01M17 15h.01M7 19h.01M12 19h.01" /></svg><span>mec. 04 jan. - 19h00</span></p>
                      <span className="activity-level"><img src="/images/activites/niveau.png" width="34" height="36" alt="" loading="lazy" /><span>Tous niveaux</span></span>
                    </div>

                    <div className="activity-participants">

                      <p className="activity-player-count"><svg className="activity-icon activity-icon-players" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M1 21v-2a8 8 0 0 1 16 0v2M16 4a4 4 0 0 1 0 8M19 15a6 6 0 0 1 4 6" /></svg><span>3 / 4 joueurs</span></p>
                    </div>

                    <div className="activity-footer">
                      <a className="activity-join" href="#telechargement" tabIndex={copie ? -1 : undefined} aria-label="Rejoindre « Tu tires ou tu pointes » dans l’application Ynot">
                        <span>Rejoindre</span><svg className="activity-icon activity-icon-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h18m-8-8 8 8-8 8" /></svg>
                      </a>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CreateActivity />
    </main>
  )
}
