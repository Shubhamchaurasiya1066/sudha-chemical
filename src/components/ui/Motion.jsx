import { createElement, Fragment } from "react";

const motionProps = new Set([
  "animate",
  "exit",
  "initial",
  "layout",
  "transition",
  "variants",
  "viewport",
  "whileHover",
  "whileInView",
  "whileTap",
]);

function motionElement(tag) {
  return function MotionElement({ children, className = "", transition, ...props }) {
    const htmlProps = {};

    for (const [key, value] of Object.entries(props)) {
      if (!motionProps.has(key)) htmlProps[key] = value;
    }

    const delay = Number(transition?.delay || 0);
    const style = {
      ...htmlProps.style,
      ...(delay > 0 ? { animationDelay: `${delay}s` } : {}),
    };

    return createElement(
      tag,
      {
        ...htmlProps,
        className: `${className} motion-lite`.trim(),
        style,
      },
      children
    );
  };
}

export const motion = {
  article: motionElement("article"),
  div: motionElement("div"),
  h1: motionElement("h1"),
  nav: motionElement("nav"),
  p: motionElement("p"),
};

export function AnimatePresence({ children }) {
  return createElement(Fragment, null, children);
}
