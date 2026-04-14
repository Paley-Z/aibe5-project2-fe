import { useState } from 'react';
import SvelteButton from './SvelteButtonWrapper';

export default function ReactComponent() {
  const [message, setMessage] = useState('React Component Ready!');

  const handleSvelteClick = () => {
    setMessage('Svelte button clicked! 🎉');
  };

  return (
    <div className="react-component">
      <h2>React & Svelte Bridge</h2>
      <p>{message}</p>
      <SvelteButton label="Call from React" onClick={handleSvelteClick} />
    </div>
  );
}
