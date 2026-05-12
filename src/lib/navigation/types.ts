export interface MenuItem {
  __typename: string;
  sys: {
    id: string;
  };
  contentful_id: string;
  entryTitle?: string;
  label?: string;
  cta?: string;
  url?: string;
  destination?: string;
  variant?: string;
  layout?: string;
  className?: string;
  class?: string;
  order?: number;
  columnWidths?: string;
  target?: string[];
  mobileMergeWithPrevious?: boolean;
  mobileSubdropdownInsertAfterCta?: string;
  icon?: {
    url: string;
    srcset?: string;
    sizes?: string;
    description?: string;
  };
  featuredContent?: {
    coverImage?: {
      url: string;
      srcset?: string;
      sizes?: string;
      description?: string;
      width?: number;
      height?: number;
    };
    title: string;
    description?: string;
    link?: string;
    cta?: string;
    className?: string;
  };
  columnsCollection?: {
    items: MenuItem[];
  };
  menuItemsCollection?: {
    items: MenuItem[];
  };
}
