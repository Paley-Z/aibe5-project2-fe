import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'svelte-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string
        onClick?: () => void
      }
    }
  }
}

export {}
