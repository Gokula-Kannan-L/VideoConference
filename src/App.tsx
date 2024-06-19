import React from 'react';
import { ThemeProvider } from 'styled-components';
import {
  MeetingProvider,
  lightTheme,
  GlobalStyles,
  darkTheme,
} from 'amazon-chime-sdk-component-library-react';
import Home from './components/Home/Home';
import Meeting from './components/Meetings/Meetings';



const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
    <GlobalStyles />
    <MeetingProvider>
      <Home />
    </MeetingProvider>
  </ThemeProvider>
  );
};

export default App;
