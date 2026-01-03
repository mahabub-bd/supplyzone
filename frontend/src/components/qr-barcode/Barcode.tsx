import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontOptions?: string;
  font?: string;
  textAlign?: string;
  textPosition?: string;
  textMargin?: number;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  margin?: number;
  className?: string;
}

const Barcode: React.FC<BarcodeProps> = ({
  value,
  format = 'CODE128',
  width = 2,
  height = 100,
  displayValue = true,
  fontOptions = '',
  font = 'monospace',
  textAlign = 'center',
  textPosition = 'bottom',
  textMargin = 2,
  fontSize = 20,
  background = '#ffffff',
  lineColor = '#000000',
  margin = 10,
  className = '',
}) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontOptions,
          font,
          textAlign,
          textPosition,
          textMargin,
          fontSize,
          background,
          lineColor,
          margin,
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [
    value,
    format,
    width,
    height,
    displayValue,
    fontOptions,
    font,
    textAlign,
    textPosition,
    textMargin,
    fontSize,
    background,
    lineColor,
    margin,
  ]);

  if (!value) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-500 text-sm ${className}`}>
        No barcode data
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <svg ref={barcodeRef} />
    </div>
  );
};

export default Barcode;