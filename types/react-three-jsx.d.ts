// React 19 JSX namespace shim for React Three Fiber elements.
import "react";
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}
