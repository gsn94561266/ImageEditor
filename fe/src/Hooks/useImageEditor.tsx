import { useState, useEffect, useRef, useCallback } from "react";
import { useAppContext } from "../Context/AppContext";
import ImageEditor from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";

const myTheme = {
  "common.bi.image": "",
  "common.bisize.width": "0",
  "common.bisize.height": "0",
  "common.backgroundImage": "none",
  "common.backgroundColor": "#ffffff",
  "common.border": "0px",

  // header
  "header.backgroundImage": "none",
  "header.backgroundColor": "transparent",
  "header.border": "0px",

  // load button
  "loadButton.backgroundColor": "#fff",
  "loadButton.border": "1px solid #ddd",
  "loadButton.color": "#222",
  "loadButton.fontFamily": "NotoSans, sans-serif",
  "loadButton.fontSize": "12px",

  // download button
  "downloadButton.backgroundColor": "#3ba26e",
  "downloadButton.border": "1px solid #3ba26e",
  "downloadButton.color": "#fff",
  "downloadButton.fontFamily": "NotoSans, sans-serif",
  "downloadButton.fontSize": "12px",

  // icons default
  "menu.normalIcon.color": "#8a8a8a",
  "menu.activeIcon.color": "#555555",
  "menu.disabledIcon.color": "#434343",
  "menu.hoverIcon.color": "#e9e9e9",
  "submenu.normalIcon.color": "#8a8a8a",
  "submenu.activeIcon.color": "#e9e9e9",

  "menu.iconSize.width": "24px",
  "menu.iconSize.height": "24px",
  "submenu.iconSize.width": "32px",
  "submenu.iconSize.height": "32px",

  // submenu primary color
  "submenu.backgroundColor": "#ffffff",
  "submenu.partition.color": "#858585",

  // submenu labels
  "submenu.normalLabel.color": "#000",
  "submenu.normalLabel.fontWeight": "bold",
  "submenu.activeLabel.color": "#000",
  "submenu.activeLabel.fontWeight": "bold",

  // checkbox style
  "checkbox.border": "1px solid #ccc",
  "checkbox.backgroundColor": "#fff",

  // rango style
  "range.pointer.color": "#3ba26e",
  "range.bar.color": "#666",
  "range.subbar.color": "#d1d1d1",

  "range.disabledPointer.color": "#ddd",
  "range.disabledBar.color": "#ddd",
  "range.disabledSubbar.color": "#ddd",

  "range.value.color": "#fff",
  "range.value.fontWeight": "lighter",
  "range.value.fontSize": "11px",
  "range.value.border": "1px solid #353535",
  "range.value.backgroundColor": "#151515",
  "range.title.color": "#fff",
  "range.title.fontWeight": "lighter",

  // colorpicker style
  "colorpicker.button.border": "1px solid #1e1e1e",
  "colorpicker.title.color": "#fff",
};

export const useImageEditor = () => {
  const { imageData, fileType, selectedPage, setInstance } = useAppContext();

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [editorHeight, setEditorHeight] = useState(window.innerHeight);
  const [editorWidth, setEditorWidth] = useState(window.innerWidth);

  const updateEditorHeight = useCallback(() => {
    setEditorHeight(window.innerHeight);
    setEditorWidth(window.innerWidth);
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
        // theme: myTheme,
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
      cssMaxWidth: editorWidth - 100,
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
  }, [imageData, selectedPage]);

  return editorRef;
};
