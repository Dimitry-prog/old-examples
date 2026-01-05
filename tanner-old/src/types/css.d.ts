declare module '*.css' {
  type CSSModuleClasses = Record<string, string>;
  const content: CSSModuleClasses;
  export default content;
}

declare module '*.scss' {
  type CSSModuleClasses = Record<string, string>;
  const content: CSSModuleClasses;
  export default content;
}

declare module '*.sass' {
  type CSSModuleClasses = Record<string, string>;
  const content: CSSModuleClasses;
  export default content;
}

declare module '*.less' {
  type CSSModuleClasses = Record<string, string>;
  const content: CSSModuleClasses;
  export default content;
}