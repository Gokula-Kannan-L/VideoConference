import React from 'react';
import { ThemeProvider } from 'styled-components';
import {
  MeetingProvider,
  lightTheme,
  GlobalStyles,
  darkTheme,
} from 'amazon-chime-sdk-component-library-react';
import Home from './components/Home/Home';



const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
    <GlobalStyles />
    <MeetingProvider>
      <Home />
    </MeetingProvider>
  </ThemeProvider>
  );
};

export default App;
