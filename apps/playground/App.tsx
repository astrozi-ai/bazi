// The app shell: the root and the navigation stack, no page logic.
import { mount, View } from "nsh";
import { NavStack } from "nsh/base";
import { nav } from "./nav";
import { ChartPage } from "./pages/ChartPage";
import { InputPage } from "./pages/InputPage";

function App() {
  return (
    <View class="flex-1 bg-background">
      <NavStack state={nav} class="flex-1">
        {(route) => {
          switch (route.name) {
            case "input":
              return <InputPage />;
            case "chart":
              return <ChartPage input={route.input} />;
          }
        }}
      </NavStack>
    </View>
  );
}

mount(App);
