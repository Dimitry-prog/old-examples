/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace React {
  type HTMLAttributes<T> = AriaAttributes & DOMAttributes<T> & {
    className?: string;
  }
}

declare global {
  namespace JSX {
    type Element = React.ReactElement<any, any> | null;
    type ElementClass = React.Component<any>;
    type ElementAttributesProperty = { props: {} };
    type ElementChildrenAttribute = { children: {} };
    
    type LibraryManagedAttributes<C, P> = C extends React.MemoExoticComponent<infer T> | React.LazyExoticComponent<infer T>
      ? T extends React.MemoExoticComponent<infer U> | React.LazyExoticComponent<infer U>
        ? ReactManagedAttributes<U, P>
        : ReactManagedAttributes<T, P>
      : ReactManagedAttributes<C, P>;

    type IntrinsicAttributes = React.Attributes;
    type IntrinsicClassAttributes<T> = React.ClassAttributes<T>;
    
    type IntrinsicElements = {
      [K in keyof React.ReactHTML]: React.ReactHTML[K] extends React.DetailedHTMLFactory<infer P, infer T>
        ? React.ClassAttributes<T> & P
        : any;
    } & {
      [K in keyof React.ReactSVG]: React.ReactSVG[K] extends React.SVGFactory
        ? React.ClassAttributes<SVGElement> & React.SVGAttributes<SVGElement>
        : any;
    };
  }
}