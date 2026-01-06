declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}

interface ModelViewerJSX {
  src?: string;
  alt?: string;
  'camera-controls'?: boolean | string;
  'auto-rotate'?: boolean | string;
  exposure?: string;
  'shadow-intensity'?: string;
  'shadow-softness'?: string;
  'environment-image'?: string;
  'skybox-image'?: string;
  poster?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'interaction' | 'manual';
  'ar'?: boolean | string;
  'ar-modes'?: string;
  'ar-scale'?: string;
  'camera-orbit'?: string;
  'camera-target'?: string;
  'field-of-view'?: string;
  'min-camera-orbit'?: string;
  'max-camera-orbit'?: string;
  'min-field-of-view'?: string;
  'max-field-of-view'?: string;
  'interaction-prompt'?: string;
  'interaction-prompt-threshold'?: string;
  'interaction-prompt-style'?: string;
  style?: React.CSSProperties;
}
