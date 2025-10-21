<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "radix-vue";

withDefaults(
  defineProps<{
    items: { label: string; value: string; icon?: string }[];
    menuAlign?: "start" | "end" | "center";
  }>(),
  { menuAlign: "center" }
);

defineEmits<{
  select: [{ label: string; value: string; icon?: string }];
}>();

const isTrackMenuOpen = ref(false);

defineExpose({
  isTrackMenuOpen,
});
</script>

<template>
  <DropdownMenuRoot v-model:open="isTrackMenuOpen" :modal="false">
    <DropdownMenuTrigger
      class="p-1 flex items-center justify-between select-none cursor-pointer focus-visible:outline-none focus-visible:ring focus-visible:ring-border-foreground h-9 w-9"
      data-control
      @click.stop="isTrackMenuOpen = !isTrackMenuOpen"
    >
      <slot />
    </DropdownMenuTrigger>

    <DropdownMenuPortal v-if="isTrackMenuOpen">
      <DropdownMenuContent
        :align="menuAlign"
        :side-offset="5"
        class="flex flex-col bg-modal shadow-sm text-foreground border border-border rounded-md select-none p-1 z-40 w-[var(--radix-dropdown-menu-trigger-width)] min-w-max max-h-[150px] overflow-auto"
        data-control
      >
        <DropdownMenuItem
          v-for="item in items"
          :key="item.value"
          class="[&:not(:first-child)]:mt-1 flex items-center text-sm rounded-md cursor-pointer w-full text-foreground px-2 py-1.5 gap-2 select-none hover:bg-foreground/10"
          @select="$emit('select', item)"
        >
          <div class="flex items-center gap-3">
            <Icon v-if="item.icon" :name="item.icon" />
            <p>
              {{ item.label }}
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
