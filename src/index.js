import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Default from './screens/defaultScreen';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import About from './screens/about';
import Contact from './screens/contact';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Default />}/>    
      <Route path='/about' element={<About />}/>    
      <Route path='/contact' element={<Contact />}/>    
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
