import {
  APP_ID,
  Injectable,
  inject,
  setClassMetadata,
  ɵɵdefineInjectable
} from "./chunk-I2BJLRLX.js";

// node_modules/.pnpm/@angular+cdk@19.2.8_@angula_63d9855c7c5af69be0e67cd17f1726cb/node_modules/@angular/cdk/fesm2022/shadow-dom-318658ae.mjs
var shadowDomIsSupported;
function _supportsShadowDom() {
  if (shadowDomIsSupported == null) {
    const head = typeof document !== "undefined" ? document.head : null;
    shadowDomIsSupported = !!(head && (head.createShadowRoot || head.attachShadow));
  }
  return shadowDomIsSupported;
}
function _getShadowRoot(element) {
  if (_supportsShadowDom()) {
    const rootNode = element.getRootNode ? element.getRootNode() : null;
    if (typeof ShadowRoot !== "undefined" && ShadowRoot && rootNode instanceof ShadowRoot) {
      return rootNode;
    }
  }
  return null;
}
function _getFocusedElementPierceShadowDom() {
  let activeElement = typeof document !== "undefined" && document ? document.activeElement : null;
  while (activeElement && activeElement.shadowRoot) {
    const newActiveElement = activeElement.shadowRoot.activeElement;
    if (newActiveElement === activeElement) {
      break;
    } else {
      activeElement = newActiveElement;
    }
  }
  return activeElement;
}
function _getEventTarget(event) {
  return event.composedPath ? event.composedPath()[0] : event.target;
}

// node_modules/.pnpm/@angular+cdk@19.2.8_@angula_63d9855c7c5af69be0e67cd17f1726cb/node_modules/@angular/cdk/fesm2022/fake-event-detection-84590b88.mjs
function isFakeMousedownFromScreenReader(event) {
  return event.buttons === 0 || event.detail === 0;
}
function isFakeTouchstartFromScreenReader(event) {
  const touch = event.touches && event.touches[0] || event.changedTouches && event.changedTouches[0];
  return !!touch && touch.identifier === -1 && (touch.radiusX == null || touch.radiusX === 1) && (touch.radiusY == null || touch.radiusY === 1);
}

// node_modules/.pnpm/@angular+cdk@19.2.8_@angula_63d9855c7c5af69be0e67cd17f1726cb/node_modules/@angular/cdk/fesm2022/id-generator-0b91c6f7.mjs
var counters = {};
var _IdGenerator = class __IdGenerator {
  _appId = inject(APP_ID);
  /**
   * Generates a unique ID with a specific prefix.
   * @param prefix Prefix to add to the ID.
   */
  getId(prefix) {
    if (this._appId !== "ng") {
      prefix += this._appId;
    }
    if (!counters.hasOwnProperty(prefix)) {
      counters[prefix] = 0;
    }
    return `${prefix}${counters[prefix]++}`;
  }
  static ɵfac = function _IdGenerator_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || __IdGenerator)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: __IdGenerator,
    factory: __IdGenerator.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(_IdGenerator, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// node_modules/.pnpm/@angular+cdk@19.2.8_@angula_63d9855c7c5af69be0e67cd17f1726cb/node_modules/@angular/cdk/fesm2022/array-6239d2f8.mjs
function coerceArray(value) {
  return Array.isArray(value) ? value : [value];
}

export {
  _getShadowRoot,
  _getFocusedElementPierceShadowDom,
  _getEventTarget,
  isFakeMousedownFromScreenReader,
  isFakeTouchstartFromScreenReader,
  _IdGenerator,
  coerceArray
};
//# sourceMappingURL=chunk-3VLWJ52N.js.map
