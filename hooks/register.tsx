import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { horizonScene } from './scene'

// Far Horizon: a film-trailer look. Dusty beige and peach by day with steel-blue ink;
// deep blue dusk by night.
export const ARGS = {
  label: 'Far Horizon',
  roles: { accent: '#3f6f99', danger: '#b4452f', success: '#647a3a', warning: '#b8862c', pro: '#5d6aa8' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#e6dbc9',
        'surface-1': '#ede4d5',
        'surface-2': '#f4eee3',
        'text-primary': '#26232b',
        'text-secondary': '#48434f',
        'text-muted': '#615b68',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#13161d',
        'surface-1': '#1a1d26',
        'surface-2': '#20242e',
        'surface-3': '#272b36',
        'text-primary': '#efe8dc',
        'text-secondary': '#cbc4d4',
        'text-muted': '#a39cad',
      },
    },
  },
} as const

const { theme, problems } = makeColors(ARGS)

const SCENE_ID = 'far-horizon'

const LOOK: ThemeSetArgs = {
  colors: theme,
  // Clearer, softer glass so the panels (the sidebars too) let the sky and horizon glow through.
  backdrop: { scene: SCENE_ID, glass: { blur: 20, opacity: 0.32 } },
}

const SCENE = horizonScene()

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.scene !== SCENE_ID || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="A curved steel-blue horizon under a peach sky, with hikers walking its edge" isInteractive />
  })
}
