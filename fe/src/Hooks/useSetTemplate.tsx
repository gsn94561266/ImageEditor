import { useState } from 'react';
import { useAppContext } from '../Context/AppContext';

type UseTemplateSetting = [number, (data: any) => Promise<void>];

export const useSetTemplate = (): UseTemplateSetting => {
  const { instance } = useAppContext();
  const [selectedTemplateUid, setSelectedTemplateUid] = useState<number>(0);

  const handleTemplateSetting = async (data: any) => {
    if (data.id === selectedTemplateUid) {
      setSelectedTemplateUid(0);
      await instance.clearObjects();
      return;
    }

    setSelectedTemplateUid(data.id);
    const shapeData = JSON.parse(JSON.parse(data.content));
    const shapeArray: any[] = Object.values(shapeData);

    try {
      await instance.clearObjects();
      instance._graphics._objects = shapeData;
      for (const v of shapeArray) {
        if (['rect', 'circle', 'triangle'].includes(v.type)) {
          await instance.addShape(v.type, {
            fill: v.fill,
            stroke: v.stroke,
            strokeWidth: v.strokeWidth,
            width: v.width,
            height: v.height,
            rx: v.rx,
            ry: v.ry,
            left: v.left,
            top: v.top,
            isRegular: false,
          });
        } else if (v.type === 'i-text') {
          await instance.addText(v.text, {
            styles: {
              fill: v.fill,
              fontFamily: v.fontFamily,
              fontSize: v.fontSize,
              fontStyle: v.fontStyle,
              fontWeight: v.fontWeight,
              textAlign: v.textAlign,
              underline: v.underline,
            },
            position: {
              x: v.left,
              y: v.top,
            },
            autofocus: false,
          });
        } else if (v.type === 'path') {
          const halfStrokeWidth = v.strokeWidth / 2;
          const pathData = v.path;

          let pathString = pathData
            .map(
              (command: any[]) => `${command[0]} ${command.slice(1).join(' ')}`
            )
            .join(' ');

          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
            v.width + v.strokeWidth
          }" height="${v.height + v.strokeWidth}">
             <path d="${pathString.trim()}" 
          stroke="${v.stroke}" 
          fill="none" 
          stroke-width="${v.strokeWidth}" 
          transform="translate(-${v.left - v.width / 2 - halfStrokeWidth}, -${
            v.top - v.height / 2 - halfStrokeWidth
          })"/></svg>
        `;

          const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
          const svgUrl = URL.createObjectURL(svgBlob);
          await instance.addImageObject(svgUrl).then((objectProps: any) => {
            instance.setObjectPosition(objectProps.id, {
              x: v.left,
              y: v.top,
              originX: 'center',
              originY: 'center',
            });
          });
        } else if (v.type === 'line') {
          const halfStrokeWidth = v.strokeWidth / 2;
          const x1 = v.x1 < 0 ? v.width - halfStrokeWidth : halfStrokeWidth;
          const y1 = v.y1 > 0 ? halfStrokeWidth : v.height + halfStrokeWidth;
          const x2 = v.x1 > 0 ? v.width - halfStrokeWidth : halfStrokeWidth;
          const y2 = v.y1 < 0 ? halfStrokeWidth : v.height + halfStrokeWidth;

          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
            v.width
          }" height="${v.height + v.strokeWidth * 1.5}">
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                stroke="${v.stroke}" stroke-width="${v.strokeWidth}" /></svg>
        `;

          const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
          const svgUrl = URL.createObjectURL(svgBlob);
          await instance.addImageObject(svgUrl).then((objectProps: any) => {
            instance.setObjectPosition(objectProps.id, {
              x: v.left,
              y: v.top,
              originX: 'center',
              originY: 'center',
            });
          });
        }
      }

      instance.deactivateAll();
    } catch (error) {
      console.error('Error adding content:', error);
    }
  };

  return [selectedTemplateUid, handleTemplateSetting];
};
