import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import { Container } from '@material-ui/core';
import { createTheme, responsiveFontSizes } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import indigo from '@material-ui/core/colors/indigo';

import 'typeface-roboto';
import 'typeface-lobster';
import './index.css';

import Contacts from './components/Contacts';
import AddEditContact from './components/AddEditContact';
import NotFound from './components/NotFound';
import * as serviceWorker from './serviceWorker';
import { upsertContact, getContactBySlug } from './storage';
import { slugify } from './utils';

const theme = createTheme({
  typography: {
    h1: {
      fontSize: '4rem',
      fontFamily: 'lobster',
      textAlign: 'center',
      color: '#3F00FF',
      letterSpacing: '0.3rem',
      margin: '50px 0',
    },
  },
  palette: {
    primary: indigo
  }
});

function AppRouter(): JSX.Element {
  return (
    <ThemeProvider theme={responsiveFontSizes(theme)}>
      <Container maxWidth="md">
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Contacts />} />
          <Route path="/add" element={<AddEditContact />} />
            <Route path="/edit/:id" element={<AddEditContact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </ThemeProvider>
  );
}

ReactDOM.render(<AppRouter />, document.getElementById('root'));

serviceWorker.unregister();
