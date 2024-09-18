import { useState, useEffect, useRef, useCallback } from "react";
import ImageEditor from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";

export const useImageEditor = (
  imageData: string[],
  fileType: string,
  selectedPage: number,
  setInstance: (instance: any) => void
) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editorHeight, setEditorHeight] = useState(window.innerHeight);

  const updateEditorHeight = useCallback(() => {
    setEditorHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    if (!imageData || selectedPage < 1 || selectedPage > imageData.length)
      return;

    window.addEventListener("resize", updateEditorHeight);

    const newInstance = new ImageEditor(editorRef.current as HTMLDivElement, {
      includeUI: {
        loadImage: {
          path: imageData[selectedPage - 1],
          name: "image",
        },
        menu:
          fileType !== "pdf"
            ? ["crop", "flip", "rotate", "draw", "shape", "text", "filter"]
            : ["flip", "draw", "shape", "text", "filter"],
        uiSize: {
          height: "100vh",
          width: "",
        },
        menuBarPosition: "left",
      },
      cssMaxHeight: editorHeight * 2,
      selectionStyle: {
        // cornerStyle: {},
        cornerSize: 20,
        cornerColor: "white",
        cornerStrokeColor: "blue",
        transparentCorners: false,
        lineWidth: 10,
        borderColor: "blue",
        rotatingPointOffset: 10,
      },
      usageStatistics: false,
    });

    setInstance(newInstance);

    return () => {
      window.removeEventListener("resize", updateEditorHeight);
      newInstance.destroy();
    };
  }, [
    imageData,
    selectedPage,
    editorHeight,
    fileType,
    editorRef,
    setInstance,
    updateEditorHeight,
  ]);

  useEffect(() => {
    window.addEventListener("resize", updateEditorHeight);
    return () => {
      window.removeEventListener("resize", updateEditorHeight);
    };
  }, [updateEditorHeight]);

  return editorRef;
};
