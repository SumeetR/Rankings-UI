import ActionTypes from './constants';
import {} from './selectors';
import {
  addTableItems,
  setCategories,
  loadContestSuggestions,
  setContestSuggestions,
} from './actions';

import { takeLatest, call, put, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import {
  apiGetContestSuggestions,
  apiGetCategories,
  APIGetContestsRequest,
  apiGetContests,
  GetContestsResponse,
} from './api';
import { ISelectOption } from 'components/CategoriesFilters/types';
import { APIGetContestSuggestionsResponse } from 'api/contests/suggestions';
import { APIContestsCategoriesResponse } from 'api/contests/categories';

export function* getCategories() {
  try {
    const results: APIContestsCategoriesResponse = yield call(apiGetCategories);
    yield put(setCategories(results.items));
  } catch (err) {
    console.log('err: ', err);
  }
}

export function* getContestSuggestions(
  action: ReturnType<typeof loadContestSuggestions>,
) {
  yield call(delay, 500);
  const value = action.payload;
  try {
    const results: APIGetContestSuggestionsResponse = yield call(
      apiGetContestSuggestions,
      value,
    );
    const options = results.items.map(item => {
      const option: ISelectOption = {
        value: item.name,
        label: item.name,
      };
      return option;
    });
    yield put(setContestSuggestions(options));
  } catch (err) {
    console.log('err: ', err);
  }
}

export function* getContests() {
  // const username = yield select(selectSelectedSearchInput());

  const request: APIGetContestsRequest = {
    filters: [
      {
        id: '',
        name: '',
      },
    ],
    searchInput: '',
  };
  try {
    const results: GetContestsResponse = yield call(apiGetContests, request);
    yield put(addTableItems(results));
  } catch (err) {
    console.log('err: ', err);
  }
}

export default function* rankingsSaga() {
  yield takeLatest(ActionTypes.LOAD_CATEGORIES, getCategories);
  yield takeLatest(ActionTypes.LOAD_CONTEST_SUGGESTIONS, getContestSuggestions);
  yield takeLatest(ActionTypes.LOAD_TABLE_ITEMS, getContests);
  yield takeLatest(ActionTypes.LOAD_NEXT_TABLE_ITEMS, getContests);
}