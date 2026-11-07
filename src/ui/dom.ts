type Child = HTMLElement | SVGElement | Text | string | number | null | undefined | false;

interface ElementProps {
  className?: string;
  id?: string;
  attrs?: Record<string, string | number | boolean>;
  style?: Partial<CSSStyleDeclaration>;
  on?: Partial<{
    [K in keyof HTMLElementEventMap]: (event: HTMLElementEventMap[K]) => void;
  }>;
}

/**
 * Safe DOM element factory without using innerHTML or insertAdjacentHTML.
 */
export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: ElementProps,
  ...children: Child[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);

  if (props?.className) {
    element.className = props.className;
  }

  if (props?.id) {
    element.id = props.id;
  }

  if (props?.attrs) {
    for (const [key, value] of Object.entries(props.attrs)) {
      if (typeof value === "boolean") {
        if (value) {
          element.setAttribute(key, "");
        }
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }

  if (props?.style) {
    Object.assign(element.style, props.style);
  }

  if (props?.on) {
    for (const [event, listener] of Object.entries(props.on)) {
      if (listener) {
        element.addEventListener(event, listener as EventListener);
      }
    }
  }

  for (const child of children) {
    if (child === null || child === undefined || child === false) {
      continue;
    }
    if (typeof child === "string" || typeof child === "number") {
      element.appendChild(document.createTextNode(String(child)));
    } else {
      element.appendChild(child);
    }
  }

  return element;
};

/**
 * Safely clears all children of a DOM element.
 */
export const clearElement = (node: HTMLElement): void => {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
};
