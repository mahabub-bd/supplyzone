import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  className?: string;
}

const CustomQRCode: React.FC<QRCodeProps> = ({
  value,
  size = 128,
  level = 'M',
  bgColor = '#ffffff',
  fgColor = '#000000',
  includeMargin = true,
  className = '',
}) => {
  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 text-sm ${className}`}
        style={{ width: size, height: size }}
      >
        No QR data
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <div style={{ background: bgColor, padding: includeMargin ? '16px' : '0' }}>
        <QRCode
          value={value}
          size={size}
          level={level}
          bgColor={bgColor}
          fgColor={fgColor}
        />
      </div>
    </div>
  );
};

export default CustomQRCode;