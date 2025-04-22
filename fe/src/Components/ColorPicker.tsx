import { useState, useEffect } from "react";
import { CgColorPicker, CgPen } from "react-icons/cg";
import { useAppContext } from "../Context/AppContext";
import transparentImage from "../assets/transparent.png";

const ColorPicker = () => {
  const { instance } = useAppContext();
  const [isPickingColor, setIsPickingColor] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [pickedColor, setPickedColor] = useState<string>("rgba(0, 0, 0, 0)");

  useEffect(() => {
    if (!instance) return;

    if (isDrawing) {
      instance.deactivateAll();
      instance.startDrawingMode("FREE_DRAWING", {
        width: 12,
        color: pickedColor,
      });
    } else {
      instance.stopDrawingMode();
    }
  }, [isDrawing, instance]);

  useEffect(() => {
    if (!instance || !isPickingColor) return;

    instance.changeSelectableAll(false);
    instance.deactivateAll();

    const handleMouseDown = (event: any, originPointer: any) => {
      const color = getColorAtPosition(
        parseInt(originPointer.x, 10),
        parseInt(originPointer.y, 10)
      );
      setPickedColor(color);
    };

    instance.on("mousedown", handleMouseDown);
    return () => {
      instance.changeSelectableAll(true);
      instance.off("mousedown", handleMouseDown);
    };
  }, [isPickingColor, instance]);

  const getColorAtPosition = (x: number, y: number) => {
    const canvas = instance._graphics.getCanvas();
    const ctx = canvas.getContext("2d");
    const pixelData = ctx.getImageData(x, y, 1, 1).data;

    return `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${
      pixelData[3] / 255
    })`;
  };

  const toggleDrawing = () => {
    if (isPickingColor) {
      setIsPickingColor(false);
    }
    setIsDrawing((prev) => !prev);
  };

  const toggleColorPicker = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
    setIsPickingColor((prev) => !prev);
  };

  const ColorIndicator = ({ color }: { color: string }) => (
    <div
      className="rounded-circle m-auto"
      style={{
        width: "30px",
        height: "30px",
        backgroundColor: color,
      }}
    >
      {color === "rgba(0, 0, 0, 0)" && (
        <img
          src={transparentImage}
          alt="Default"
          style={{ width: "100%", height: "100%", borderRadius: "50%" }}
        />
      )}
    </div>
  );

  return (
    <>
      <div className="position-fixed bottom-0 z-3 m-2">
        <ColorIndicator color={pickedColor} />
        <div>
          <button
            className={`btn px-2 py-1 my-2 ${
              isDrawing ? "btn-light" : "btn-link link-light"
            }`}
            onClick={toggleDrawing}
            title="Draw Picker Color"
          >
            <CgPen className="fs-4" />
          </button>
        </div>
        <div>
          <button
            className={`btn px-2 py-1 ${
              isPickingColor ? "btn-light" : "btn-link link-light"
            }`}
            onClick={toggleColorPicker}
            title="Color Picker"
          >
            <CgColorPicker className="fs-4 fs-light" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ColorPicker;
