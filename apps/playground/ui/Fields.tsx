// The birth form's controls: compact number columns, the 男 / 女 pair and switch rows.
import { Text, View } from "nsh";
import { NumberInput, Switch, Toggle, ToggleGroup } from "nsh/base";

/** One column of the date row: its label over a centered number field, no steppers. */
export function NumberColumn(props: {
  label: string;
  value: number | null;
  min: number;
  max: number;
  testID?: string;
  onChange: (value: number | null) => void;
}) {
  return (
    <View class="flex-1 gap-1.5">
      <Text class="text-center text-(length:--text-info) font-medium text-card-foreground">{props.label}</Text>
      <NumberInput
        testID={props.testID}
        accessibilityLabel={props.label}
        value={props.value}
        min={props.min}
        max={props.max}
        onChange={({ value }) => props.onChange(value)}
        class="h-10 flex-row items-center rounded-(--radius) border border-input bg-background focus-within:border-ring"
        inputClass="flex-1 px-1 text-center text-base font-bold text-foreground"
        decrementButtonClass="hidden"
        incrementButtonClass="hidden"
      />
    </View>
  );
}

/** Exactly one of two options, as two bordered buttons; the chosen one takes the action color. */
export function ChoicePair<T extends string>(props: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View class="gap-2">
      <Text class="text-(length:--text-info) font-medium text-card-foreground">{props.label}</Text>
      <ToggleGroup class="flex-row gap-3">
        <Each of={props.options}>
          {(option) => (
            <Toggle
              pressed={props.value === option().value}
              onChange={() => props.onChange(option().value)}
              class="group flex-1 items-center rounded-(--radius) border border-input bg-secondary py-3 aria-pressed:border-primary aria-pressed:bg-primary/8"
            >
              <Text class="text-base font-semibold text-card-foreground group-aria-pressed:text-primary">{option().label}</Text>
            </Toggle>
          )}
        </Each>
      </ToggleGroup>
    </View>
  );
}

/** A labelled row with a switch at its end. */
export function SwitchRow(props: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <View class="min-h-11 flex-row items-center justify-between">
      <Text class="text-base text-foreground">{props.label}</Text>
      <Switch
        accessibilityLabel={props.label}
        checked={props.checked}
        onChange={({ checked }) => props.onChange(checked)}
        trackClass="w-12 rounded-full bg-input p-0.5 transition-colors checked:bg-primary"
        thumbClass="size-6 rounded-full bg-card transition-transform checked:translate-x-5"
      />
    </View>
  );
}
