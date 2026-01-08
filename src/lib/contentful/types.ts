import type { EntryFields } from "contentful";

export interface BlogGeneralSettingsEntry {
  entryTitle?: string;
  blogHomepageTitle?: string;
  blogHomepageMetaDescription?: string;
  blogHomepageMetaImage?: {
    description: string;
    url: string;
    srcset?: string;
    sizes?: string;
  };
  globalFeaturedContent?: Array<{
    sys: {
      id: string;
      contentType: {
        sys: {
          id: string;
        };
      };
    };
    fields: Record<string, any>;
  }>;
  blogHomepageBottomBanner?: {
    sys: {
      id: string;
      contentType: {
        sys: {
          id: string;
        };
      };
    };
    fields: Record<string, any>;
  };
  menuItems?: MenuItem[];
}

export interface MenuItem {
  __typename: string;
  sys: {
    id: string;
  };
  contentful_id: string;
  label?: string;
  cta?: string;
  url?: string;
  destination?: string;
  layout?: string;
  className?: string;
  class?: string;
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
    sys: {
      id: string;
      contentType: {
        sys: {
          id: string;
        };
      };
    };
  };
  columnsCollection?: {
    items: MenuItem[];
  };
  menuItemsCollection?: {
    items: MenuItem[];
  };
}

export interface NavigationMenuItemSkeleton {
  fields: {
    label?: EntryFields.Text;
    className?: EntryFields.Text;
    layout?: EntryFields.Text;
    featuredContent?: Record<string, any>;
    columns?: EntryFields.Array<any>;
    menuItems?: EntryFields.Array<any>;
  };
  contentTypeId: "navigationMenuItem";
}

export interface ButtonSkeleton {
  fields: {
    cta?: EntryFields.Text;
    destination?: EntryFields.Text;
  };
  contentTypeId: "button";
}

export interface BlogGeneralSettingsSkeleton {
  fields: {
    entryTitle?: EntryFields.Text;
    blogHomepageTitle?: EntryFields.Text;
    blogHomepageMetaDescription?: EntryFields.Text;
    blogHomepageMetaImage?: any;
    globalFeaturedContent?: EntryFields.Array<any>;
    blogHomepageBottomBanner?: any;
    menuItems?: EntryFields.Array<any>;
  };
  contentTypeId: "blogGeneralSettings";
}
