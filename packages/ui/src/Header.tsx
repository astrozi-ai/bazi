// A page's header on the desktops and the web (title centered, back on the left); iOS and Android show the system's, from the page's `title`.
import { Text, View } from "nsh";
import { Button } from "nsh/base";

/** `onBack`, when given, shows the back button; the app decides when there is somewhere to go back to. */
export function Header(props: { title: string; onBack?: (() => void) | undefined }) {
  return (
    <View class="h-11 flex-row items-center border-b border-border bg-background px-2">
      <View class="w-16">
        <If when={props.onBack}>
          {(back) => (
            <Button
              accessibilityLabel="返回"
              onPress={() => back()()}
              class="h-9 w-9 items-center justify-center rounded-(--radius) hover:bg-accent active:opacity-60"
            >
              <Text class="text-2xl text-primary">‹</Text>
            </Button>
          )}
        </If>
      </View>
      <Text class="flex-1 text-center text-base font-semibold text-foreground">{props.title}</Text>
      <View class="w-16" />
    </View>
  );
}
