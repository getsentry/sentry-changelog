import headerData from "./header.json";
import type { MenuItem } from "./types";

let counter = 0;

function generateId(item: Record<string, unknown>): string {
  const idx = ++counter;
  const base =
    (item.entryTitle as string) ||
    (item.label as string) ||
    (item.cta as string) ||
    "";
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "item"}-${idx}`;
}

function transformMenuItem(raw: Record<string, unknown>): MenuItem {
  const id = generateId(raw);
  const typename =
    raw.__typename === "NavigationMenuItem"
      ? "ContentfulNavigationMenuItem"
      : raw.__typename === "Button"
        ? "ContentfulButton"
        : (raw.__typename as string);

  const item: MenuItem = {
    ...raw,
    __typename: typename,
    sys: { id },
    contentful_id: id,
  } as MenuItem;

  if (item.columnsCollection?.items) {
    item.columnsCollection = {
      items: item.columnsCollection.items.map((child) =>
        transformMenuItem(child as unknown as Record<string, unknown>),
      ),
    };
  }

  if (item.menuItemsCollection?.items) {
    item.menuItemsCollection = {
      items: item.menuItemsCollection.items.map((child) =>
        transformMenuItem(child as unknown as Record<string, unknown>),
      ),
    };
  }

  if (raw.featuredContent && typeof raw.featuredContent === "object") {
    item.featuredContent = raw.featuredContent as MenuItem["featuredContent"];
  }

  return item;
}

const menuItems: MenuItem[] = (
  headerData as { menuItems: Record<string, unknown>[] }
).menuItems.map(transformMenuItem);

export function getHeaderMenuItems(): MenuItem[] {
  return menuItems;
}
