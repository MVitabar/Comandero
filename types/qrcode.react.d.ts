declare module 'qrcode.react' {
    import React from 'react';
  
    interface QRCodeProps {
      value: string;
      size?: number;
      level?: 'L' | 'M' | 'Q' | 'H';
      includeMargin?: boolean;
      bgColor?: string;
      fgColor?: string;
    }
  
    export const QRCodeSVG: React.ComponentType<QRCodeProps>;
    export const QRCodeCanvas: React.ComponentType<QRCodeProps>;
  }