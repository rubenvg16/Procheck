// node_modules/.pnpm/@angular+cdk@19.2.8_@angula_63d9855c7c5af69be0e67cd17f1726cb/node_modules/@angular/cdk/fesm2022/css-pixel-value-5d0cae55.mjs
function coerceCssPixelValue(value) {
  if (value == null) {
    return "";
  }
  return typeof value === "string" ? value : `${value}px`;
}

// node_modules/.pnpm/@angular+cdk@19.2.8_@angula_63d9855c7c5af69be0e67cd17f1726cb/node_modules/@angular/cdk/fesm2022/coercion.mjs
function coerceBooleanProperty(value) {
  return value != null && `${value}` !== "false";
}

export {
  coerceCssPixelValue,
  coerceBooleanProperty
};
//# sourceMappingURL=chunk-YKENRNSC.js.map
