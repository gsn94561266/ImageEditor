import { AppProvider } from "./Context/AppContext";
import MainApp from "./MainApp";
import "./App.scss";

const App = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
