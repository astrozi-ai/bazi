// A wheel column: the platform's own scroll view snapping to rows, the middle row chosen.
import type { ScrollRef } from "nsh";
import { effect, Scroll, Text, View } from "nsh";
import { Button } from "nsh/base";

const ROW = 40;

export interface WheelItem {
  key: string;
  label: string;
}

export function Wheel(props: { label: string; items: WheelItem[]; value: string; onChange: (key: string) => void }) {
  let scroll: ScrollRef | undefined;
  let shown = -1;
  const index = () => Math.max(0, props.items.findIndex((item) => item.key === props.value));
  // A value set from outside (a sample, a shorter month) scrolls the wheel to it.
  effect(() => {
    const target = index();
    if (scroll && target !== shown) {
      shown = target;
      scroll.scrollTo({ y: target * ROW, animated: false });
    }
  });
  const settle = (offsetY: number) => {
    const target = Math.min(props.items.length - 1, Math.max(0, Math.round(offsetY / ROW)));
    shown = target;
    const item = props.items[target];
    if (item && item.key !== props.value) props.onChange(item.key);
  };
  return (
    <View class="flex-1 gap-1.5">
      <Text class="text-center text-(length:--text-info) font-medium text-card-foreground">{props.label}</Text>
      <View class="h-30 overflow-hidden">
        <View class="absolute inset-x-1 top-10 h-10 rounded-(--radius) border border-primary/40 bg-primary/5" />
        <Scroll
          ref={(ref: ScrollRef) => {
            scroll = ref;
          }}
          class="h-30"
          contentClass="py-10"
          contentOffset={{ y: index() * ROW }}
          snapToInterval={ROW}
          decelerationRate="fast"
          scrollbar={false}
          onScrollEnd={({ offset }) => settle(offset.y)}
        >
          <Each of={props.items} key="index">
            {(item) => (
              <Button
                accessibilityLabel={`${props.label} ${item().label}`}
                selected={item().key === props.value}
                onPress={() => props.onChange(item().key)}
                class="group h-10 items-center justify-center"
              >
                <Text class="text-(length:--text-wheel) text-muted-foreground group-selected:font-bold group-selected:text-foreground">
                  {item().label}
                </Text>
              </Button>
            )}
          </Each>
        </Scroll>
      </View>
    </View>
  );
}
