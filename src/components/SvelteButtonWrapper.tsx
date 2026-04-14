import './SvelteButton.svelte'
import React from 'react'

interface SvelteButtonProps {
  label?: string
  onClick?: () => void
}

export default function SvelteButton({ label = 'Click me', onClick }: SvelteButtonProps) {
  return React.createElement('svelte-button', {
    label,
    onClick,
  })
}
