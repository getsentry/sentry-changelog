import { contentfulClient } from "./client";
import type {
  BlogGeneralSettingsEntry,
  BlogGeneralSettingsSkeleton,
  MenuItem,
} from "./types";
import { generateResponsiveSrcsets } from "./utils";

function transformMenuItem(
  menuItem: any,
  depth = 0,
  isHeaderDebug = false,
): MenuItem {
  const contentTypeId = menuItem.sys.contentType?.sys?.id || "";
  const __typename =
    contentTypeId === "button"
      ? "ContentfulButton"
      : contentTypeId === "navigationMenuItem"
        ? "ContentfulNavigationMenuItem"
        : contentTypeId;

  const transformed: MenuItem = {
    __typename,
    sys: {
      id: menuItem.sys.id,
    },
    contentful_id: menuItem.sys.id,
    ...menuItem.fields,
  };

  if (menuItem.fields.featuredContent?.fields) {
    const featuredContentFields = menuItem.fields.featuredContent.fields;

    transformed.featuredContent = {
      ...featuredContentFields,
      sys: {
        id: menuItem.fields.featuredContent.sys.id,
        contentType: {
          sys: {
            id: menuItem.fields.featuredContent.sys.contentType?.sys?.id || "",
          },
        },
      },
    };

    if (featuredContentFields.coverImage?.fields?.file?.url) {
      const coverImageUrl = featuredContentFields.coverImage.fields.file.url;
      const responsiveCoverImage = generateResponsiveSrcsets(
        coverImageUrl,
        "customerTile",
      );

      transformed.featuredContent.coverImage = {
        url: responsiveCoverImage.src,
        srcset: responsiveCoverImage.srcset,
        sizes: responsiveCoverImage.sizes,
        description: featuredContentFields.coverImage.fields.description || "",
        width:
          featuredContentFields.coverImage.fields.file.details?.image?.width,
        height:
          featuredContentFields.coverImage.fields.file.details?.image?.height,
      };
    }
  }

  if (menuItem.fields.icon?.fields?.file?.url) {
    const iconUrl = menuItem.fields.icon.fields.file.url;
    const responsiveIcon = generateResponsiveSrcsets(iconUrl, "buttonIcon");

    transformed.icon = {
      url: responsiveIcon.src,
      srcset: responsiveIcon.srcset,
      sizes: responsiveIcon.sizes,
      description: menuItem.fields.icon.fields.description || "",
    };
  }

  if (contentTypeId === "navigationMenuItem") {
    if (menuItem.fields.columns && Array.isArray(menuItem.fields.columns)) {
      transformed.columnsCollection = {
        items: menuItem.fields.columns.map((column: any) =>
          transformMenuItem(column, depth + 1, isHeaderDebug),
        ),
      };
    }

    if (menuItem.fields.menuItems && Array.isArray(menuItem.fields.menuItems)) {
      transformed.menuItemsCollection = {
        items: menuItem.fields.menuItems.map((item: any) =>
          transformMenuItem(item, depth + 1, isHeaderDebug),
        ),
      };
    }
  }

  return transformed;
}

function transformBlogGeneralSettingsItem(item: any): BlogGeneralSettingsEntry {
  return {
    entryTitle: item.fields.entryTitle,
    blogHomepageTitle: item.fields.blogHomepageTitle,
    blogHomepageMetaDescription: item.fields.blogHomepageMetaDescription,
    blogHomepageMetaImage:
      item.fields.blogHomepageMetaImage &&
      (() => {
        const metaImageUrl =
          item.fields.blogHomepageMetaImage.fields?.file?.url || "";
        if (metaImageUrl) {
          const responsiveMetaImage = generateResponsiveSrcsets(
            metaImageUrl,
            "customerTile",
          );
          return {
            description:
              item.fields.blogHomepageMetaImage.fields?.description || "",
            url: responsiveMetaImage.src,
            srcset: responsiveMetaImage.srcset,
            sizes: responsiveMetaImage.sizes,
          };
        }
        return {
          description:
            item.fields.blogHomepageMetaImage.fields?.description || "",
          url: "",
        };
      })(),
    globalFeaturedContent:
      item.fields.globalFeaturedContent?.map((entry: any) => ({
        sys: {
          id: entry.sys.id,
          contentType: {
            sys: {
              id: entry.sys.contentType?.sys?.id || "",
            },
          },
        },
        fields: entry.fields || {},
      })) || [],
    blogHomepageBottomBanner: item.fields.blogHomepageBottomBanner && {
      sys: {
        id: item.fields.blogHomepageBottomBanner.sys.id,
        contentType: {
          sys: {
            id:
              item.fields.blogHomepageBottomBanner.sys.contentType?.sys?.id ||
              "",
          },
        },
      },
      fields: item.fields.blogHomepageBottomBanner.fields || {},
    },
    menuItems:
      item.fields.menuItems?.map((menuItem: any) => {
        const isHeaderEntry = item.fields.entryTitle === "Global Header";
        return transformMenuItem(menuItem, 0, isHeaderEntry);
      }) || [],
  };
}

export async function getBlogGeneralSettingsByEntryTitle(
  entryTitle: string,
): Promise<BlogGeneralSettingsEntry | null> {
  if (!contentfulClient) {
    console.warn("Contentful client not initialized");
    return null;
  }

  try {
    const query: any = {
      content_type: "blogGeneralSettings",
      include: 10,
      limit: 1,
    };
    query["fields.entryTitle"] = entryTitle;

    const entries =
      await contentfulClient.getEntries<BlogGeneralSettingsSkeleton>(query);

    if (entries.items.length === 0) {
      return null;
    }

    return transformBlogGeneralSettingsItem(entries.items[0]);
  } catch (error) {
    console.error("Error fetching blog general settings:", error);
    return null;
  }
}
