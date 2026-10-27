import { useEffect, useRef, useState, type RefObject } from 'react'

export type PhoneScroll = {
  progression: number
  commence: boolean
  reduit: boolean
}

export type PhoneScrollRef = RefObject<PhoneScroll>

// Le scroll natif avance dans cette zone, tandis que le contenu reste fixé.
export function usePhoneScroll() {
  const zone = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLElement>(null)
  const telephone = useRef<HTMLElement>(null)
  const entete = useRef<HTMLElement>(null)
  const mouvement = useRef<PhoneScroll>({ progression: 0, commence: false, reduit: false })
  const [pret, setPret] = useState(false)

  useEffect(() => {
    const zoneElement = zone.current
    const heroElement = hero.current
    const telephoneElement = telephone.current
    const enteteElement = entete.current
    if (!zoneElement || !heroElement || !telephoneElement || !enteteElement) return

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let debut = 0
    let distance = 1
    let actif = false

    const suivreScroll = () => {
      const scrollY = Math.max(0, window.scrollY)
      if (scrollY > 0) mouvement.current.commence = true
      mouvement.current.progression = actif
        ? Math.max(0, Math.min(1, (scrollY - debut) / distance))
        : 0
    }

    const mesurer = () => {
      mouvement.current.reduit = preference.matches
      actif = pret && !preference.matches

      // Pas de zone bloquée si la 3D charge, échoue, ou si les animations sont réduites.
      if (!actif) {
        zoneElement.removeAttribute('data-phone-pinned')
        zoneElement.style.removeProperty('height')
        zoneElement.style.removeProperty('--tele-pin-top')
        suivreScroll()
        return
      }

      const hauteurEntete = enteteElement.getBoundingClientRect().height
      const mobile = window.matchMedia('(max-width: 650px)').matches
      const decalageTelephone = mobile ? telephoneElement.offsetTop : 0
      const hautFixe = hauteurEntete - decalageTelephone
      const hautZone = zoneElement.getBoundingClientRect().top + window.scrollY
      const hauteurHero = heroElement.getBoundingClientRect().height
      // Remplit aussi les grands écrans pour ne pas dévoiler la suite trop tôt.
      const margeBasse = Math.max(0, window.innerHeight - hautFixe - hauteurHero)

      debut = hautZone - hautFixe
      // Une zone dédiée au tour complet ; la section reste fixe jusqu'à sa fin.
      distance = Math.max(1000, window.innerHeight * 1.5)
      zoneElement.style.setProperty('--tele-pin-top', `${hautFixe}px`)
      zoneElement.style.height = `${hauteurHero + distance + margeBasse}px`
      zoneElement.setAttribute('data-phone-pinned', '')
      suivreScroll()
    }

    mesurer()
    const observer = new ResizeObserver(mesurer)
    observer.observe(heroElement)
    observer.observe(telephoneElement)
    observer.observe(enteteElement)
    window.addEventListener('scroll', suivreScroll, { passive: true })
    window.addEventListener('resize', mesurer)
    preference.addEventListener('change', mesurer)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', suivreScroll)
      window.removeEventListener('resize', mesurer)
      preference.removeEventListener('change', mesurer)
      zoneElement.removeAttribute('data-phone-pinned')
      zoneElement.style.removeProperty('height')
      zoneElement.style.removeProperty('--tele-pin-top')
    }
  }, [pret])

  return { zone, hero, telephone, entete, mouvement, setPret }
}
