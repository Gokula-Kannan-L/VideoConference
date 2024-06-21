import React from 'react';
import { ThemeProvider } from 'styled-components';
import {
  MeetingProvider,
  lightTheme,
  GlobalStyles,
  darkTheme,
} from 'amazon-chime-sdk-component-library-react';
import Home from './components/Home/Home';
import { Route, Routes } from 'react-router-dom';
import Meeting from './components/Meetings/Meeting';



const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
    <GlobalStyles />
    <MeetingProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meeting" element={<Meeting/>}/>
      </Routes>
    </MeetingProvider>
  </ThemeProvider>
  );
};

export default App;
