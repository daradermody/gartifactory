import { ICON_TYPES } from "@elastic/eui";
import { appendIconComponentCache } from "@elastic/eui/es/components/icon/icon";

import { icon as search } from "@elastic/eui/es/components/icon/assets/search";
import { icon as empty } from "@elastic/eui/es/components/icon/assets/empty";
import { icon as returnKey } from "@elastic/eui/es/components/icon/assets/return_key";
import { icon as check } from "@elastic/eui/es/components/icon/assets/check";
import { icon as copy } from "@elastic/eui/es/components/icon/assets/copy";
import { icon as cross } from "@elastic/eui/es/components/icon/assets/cross";

type IconComponentNameType = (typeof ICON_TYPES)[0];
type IconComponentCacheType = Partial<Record<IconComponentNameType, unknown>>;

const cachedIcons: IconComponentCacheType = {
  search, empty, returnKey, check, cross, copy
};

appendIconComponentCache(cachedIcons);
