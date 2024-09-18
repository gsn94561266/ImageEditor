export const DataURLToBlob = (dataURL: string): Blob => {
  const [header, data] = dataURL.split(",");
  const byteString = atob(data);
  const mimeString = header.split(":")[1].split(";")[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([intArray], { type: mimeString });
};
