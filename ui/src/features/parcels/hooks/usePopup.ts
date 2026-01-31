import { useState } from 'react';

export type PopupState = {
  x: number;
  y: number;
  props: any;
  visible: boolean;
};

export const usePopup = () => {
  const [popup, setPopup] = useState<PopupState>({ x: 0, y: 0, props: null, visible: false });

  const showPopup = (payload: any) => {
    const { feature, client } = payload || {};
    const x = client?.x ?? window.innerWidth / 2;
    const y = client?.y ?? window.innerHeight / 2;
    setPopup({ x, y, props: feature?.properties ?? null, visible: true });
  };

  const hidePopup = () => {
    setPopup((p) => ({ ...p, visible: false }));
  };

  return { popup, showPopup, hidePopup };
};
