import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware, { delay } from 'redux-saga';
import { call, put, take, select, fork, cancel, cancelled } from 'redux-saga/effects';

const rootReducer = combineReducers({
  foo(state = false, { type }) {
    switch (type) {
      case 'ENABLE':
        return true;
      case 'DISABLE':
        return false;
      default:
        return state;
    }
  },
});

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  applyMiddleware(sagaMiddleware)
);

store.subscribe(rocketScienceRenderingLogic);

function rocketScienceRenderingLogic() {
  const { foo } = store.getState();

  document.querySelector('#app').innerHTML = foo ? '<h1>💩</h1>' : '';
}

function* toggleAsyncInner() {
  yield call(delay, 1000);
  yield put({ type: 'ENABLE' });
  yield call(delay, 1000);
  yield put({ type: 'DISABLE' });
}

function* toggleAsync() {
  try {
    yield* toggleAsyncInner();
  } finally {
    console.log((yield cancelled()) ? 'cancelled' : 'done');
  }
}

function* watchToggleAsync() {
  let asyncTask;

  while (yield take ('TOGGLE_ASYNC')) {
    asyncTask && (yield cancel(asyncTask));

    asyncTask = yield fork(toggleAsync);
  }
}

function* logger() {
  while (true) {
    const { type } = yield take();
    const foo = yield select(({ foo }) => foo);

    if (type !== 'TOGGLE_ASYNC') {
      console.log(type, foo);
    }
  }
}

function* rootSaga() {
  yield [
    watchToggleAsync(),
    logger(),
  ];
}

sagaMiddleware.run(rootSaga);

window.addEventListener('click', () =>
    store.dispatch({ type: 'TOGGLE_ASYNC' }));
