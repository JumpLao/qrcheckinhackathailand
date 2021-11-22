import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { LiffProvider } from 'react-liff';
import liff from '@line/liff'

const liffId = process.env.REACT_APP_LINE_LIFF_ID;
const liffConfig = {
  liffId
}
liff.init(liffConfig).then(() => {
  ReactDOM.render(
    <LiffProvider liffId={liffId} stubEnabled={{
      ...liff,
      login: () => {
        return liff.login({
          redirectUri: window.location.origin
        })
      }
    }}>
      <App />
    </LiffProvider>,
    document.getElementById('root')
  );
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
