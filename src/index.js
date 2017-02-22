import { createStore, combineReducers, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import createSagaMiddleware, { delay } from 'redux-saga';
import { put, takeEvery } from 'redux-saga/effects';

const rootReducer = combineReducers({
  foo(state = false, { type }) {
    console.log('from reducer', type);
    switch (type) {
      case 'ENABLE':
        return true;
      default:
        return state;
    }
  },
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  applyMiddleware(
    createLogger(),
    sagaMiddleware
  )
);

function* enableAsync() {
  yield delay(1000);
  yield put({ type: 'ENABLE'});
}

function* watchEnableAsync() {
  yield takeEvery('ENABLE_ASYNC', enableAsync);
}

function* rootSaga() {
  yield [
    watchEnableAsync(),
  ];
}

window.addEventListener('click', () =>
    store.dispatch({ type: 'ENABLE_ASYNC' }));

sagaMiddleware.run(rootSaga);
