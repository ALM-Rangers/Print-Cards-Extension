interface IQRCodeCanvas {
    generate(content, top, left, width, canvas): void;
}

declare var qrCodeCanvas: IQRCodeCanvas;

