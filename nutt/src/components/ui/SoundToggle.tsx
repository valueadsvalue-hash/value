'use client';
import { useState } from 'react';
import { audio } from '@/utils/audio';
import { set } from '@/utils/store';
import { IconSound } from '../brand/Icons';

/** Som nunca começa sozinho: só após este clique explícito. */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  const toggle = async () => {
    if (on) {
      audio.disable();
      setOn(false);
      set('sound', false);
    } else {
      await audio.enable();
      setOn(true);
      set('sound', true);
      audio.tick(1);
    }
  };
  return (
    <button className="sound-toggle" aria-pressed={on} onClick={toggle} data-cursor={on ? 'SILÊNCIO' : 'OUVIR'}>
      <IconSound on={on} />
      <span className="sound-toggle__text">{on ? 'Experiência sonora ativa' : 'Ativar experiência sonora'}</span>
      {on && (
        <span className="sound-toggle__bars" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}
    </button>
  );
}
