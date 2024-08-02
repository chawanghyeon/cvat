import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useSelector } from "react-redux";
import JobsCards from '../components/jobs-page/jobs-cards';
import { getTasksIssuesAsync } from 'actions/tasks-actions';

const initialState = {
  auth: {
    user: {
      id: '1',
      isStaff: false,
      isSuperuser: false,
    },
  },
  tasks: {
    issues: [
      {
        frame: 0,
        job_id: 5,
        message: "test22",
        resolved: false,
        task_id: 7,
        task_name: "test",
        imgUrl: new Blob()
      },
      {
        frame: 1,
        job_id: 5,
        message: "test11",
        resolved: false,
        task_id: 8,
        task_name: "test",
        imgUrl: new Blob()
      },
      {
        frame: 1,
        job_id: 5,
        message: "testMessageOver10LengthCheck",
        resolved: true,
        task_id: 8,
        task_name: "test",
        imgUrl: new Blob()
      }
    ],
  },
};
const mockStore = configureMockStore([thunk]);
const store = mockStore(initialState);

jest.mock('actions/tasks-actions', () => ({
  getTasksIssuesAsync: jest.fn(),
}));

const mockHistory = { push: jest.fn() };
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => mockHistory
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch
}));

URL.createObjectURL = jest.fn();

(useSelector as jest.Mock<any,any>).mockImplementation(
  (callback) => {
    return callback(initialState);
  }
);

describe('JobsCards 컴포넌트 테스트', () => {
  window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
  };

  test('rejected job 헤더를 렌더링한다.', async () => {
    const {container, getByText} = render(
      <Provider store={store}>
          <JobsCards />
      </Provider>
    );
    await expect(getByText(/rejected job/i)).toBeInTheDocument();
  });

  test('Carousel 컴포넌트를 렌더링한다.', async () => {
    const {container} = render(
      <Provider store={store}>
          <JobsCards />
      </Provider>
    );
    await expect(container.getElementsByClassName('ant-carousel').length > 0).toBeTruthy();
  });

  test('getTasksIssuesAsync 함수를 호출한다.', async () => {
    const result = render(
      <Provider store={store}>
          <JobsCards />
      </Provider>
    );
    await expect(getTasksIssuesAsync).toHaveBeenCalled();
  });

  test('반환된 이미지를 클릭하면 이동한다.', async () => {
    const {getAllByText} = render(
        <Provider store={store}>
            <JobsCards />
        </Provider>
    );

    const cardElements = getAllByText(/action/i)[0];

    fireEvent.click(cardElements);
    await expect(cardElements).not.toBeNull();
    await expect(mockHistory.push).toHaveBeenCalledTimes(1);
  });

  test('데이터가 없으면 empty 컴포넌트를 렌더링한다.', async () => {
    const emptyState = {
      auth: {
        user: {
          id: '1',
          isStaff: false,
          isSuperuser: false,
        },
      },
      tasks: {
        issues: [[], []],
      },
    };

    (useSelector as jest.Mock<any,any>).mockImplementation(
      (callback) => {
        return callback(emptyState);
      }
    );

    const emptyStore = mockStore(emptyState);

    const {container} = render(
      <Provider store={emptyStore}>
          <JobsCards />
      </Provider>
    );
    await expect(container.getElementsByClassName('empty-header').length > 0).toBeTruthy();
  });

  test('슈퍼계정이거나 매니저면 렌더링하지 않는다.', async () => {
    const superState = {
      auth: {
        user: {
          id: '1',
          isStaff: true,
          isSuperuser: true,
        },
      },
      tasks: {
        issues: [[], []],
      },
    };

    (useSelector as jest.Mock<any,any>).mockImplementation(
      (callback) => {
        return callback(superState);
      }
    );

    const emptyStore = mockStore(superState);

    const {container} = render(
      <Provider store={emptyStore}>
          <JobsCards />
      </Provider>
    );
    await expect(container.getElementsByClassName('cvat-text-color').length === 0).toBeTruthy();
  });
});

