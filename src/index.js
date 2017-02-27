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

function* toggleAsync() {
  try {
    yield* toggleAsyncInner1();
  } finally {
    console.log((yield cancelled()) ? 'cancelled' : 'done', 0);
  }
}

function* toggleAsyncInner1() {
  try {
    yield call(delay, 1000);
    yield put({ type: 'ENABLE' });
    yield call(toggleAsyncInner2);
  } finally {
    console.log((yield cancelled()) ? 'cancelled' : 'done', 1);
  }
}

function* toggleAsyncInner2() {
  try {
    yield call(delay, 1000);
    yield put({ type: 'DISABLE' });
  } finally {
    console.log((yield cancelled()) ? 'cancelled' : 'done', 2);
  }
}

function* watchToggleAsync() {
  try {
    let asyncTask;

    while (yield take ('TOGGLE_ASYNC')) {
      asyncTask && (yield cancel(asyncTask));

      asyncTask = yield fork(toggleAsync);
    }
  } finally {
    if (yield cancelled()) {
      console.log('Nope');
    }
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

function* failRandomly() {
  yield Promise[Math.random() > 0.5 ? 'resolve' : 'reject']({});
}

function* rootSaga() {
  try {
    yield [
      watchToggleAsync(),
      logger(),
      failRandomly(),
    ];
  } catch (err) {
    console.log(err);
  }
}

sagaMiddleware.run(rootSaga);

window.addEventListener('click', () =>
    store.dispatch({ type: 'TOGGLE_ASYNC' }));
