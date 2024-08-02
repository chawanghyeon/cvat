import '@testing-library/jest-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useSelector } from 'react-redux';
import TopBarComponent from '../components/jobs-page/top-bar';

const mockProps = {
    query: {
        filter: null,
        page: 1,
        search: null,
        sort: null,
        username: 'agile',
    },
    onApplyFilter: (): void => {},
    onFilterDataSource: ([]: any): void => {},
    onApplySorting: (): void => {},
    onApplySearch: (): void => {},
};

const initialState = {
    jobs: {
        current: [
            {
                id: 1,
                projectName: 'testProject1',
                taskName: 'testTask1',
                worker: 'testWorker1',
                checker: 'testChecker1',
                state: 'new',
                stage: 'validation',
            },
            {
                id: 2,
                projectName: 'testProject2',
                taskName: 'testTas2k',
                worker: 'testWorker2',
                checker: 'testChecker2',
                state: 'new',
                stage: 'validation',
            },
        ],
    },
};
const mockStore = configureMockStore([thunk]);
const store = mockStore(initialState);

jest.mock('icons', () => ({
    FilterIcon: jest.fn().mockReturnValue('FilterIcon'),
    FilterSolidIcon: jest.fn().mockReturnValue('FilterSolidIcon'),
}));

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
}));

(useSelector as jest.Mock<any, any>).mockImplementation((callback) => {
    return callback(initialState);
});

describe('topBar 컴포넌트 테스트', () => {
    window.matchMedia =
        window.matchMedia ||
        function () {
            return {
                matches: false,
                addListener: function () {},
                removeListener: function () {},
            };
        };

    test('jobs 헤더와 필터링 버튼들을 렌더링한다.', async () => {
        const { container, getByText } = render(
            <Provider store={store}>
                <TopBarComponent {...mockProps} />
            </Provider>,
        );
        await expect(container.getElementsByClassName('ant-empty').length > 0).toBeFalsy();
        await expect(getByText(/jobs/i)).toBeInTheDocument();
        await expect(getByText(/stage/i)).toBeInTheDocument();
        await expect(getByText(/state/i)).toBeInTheDocument();
    });

    test('Stage 버튼을 클릭하면 드롭다운을 렌더링하고 checkbox를 클릭한 다음 ok버튼을 클릭하면 필터링되고 reset버튼을 누르면 초기화한다.', async () => {
        const { container, getByText } = render(
            <Provider store={store}>
                <TopBarComponent {...mockProps} />
            </Provider>,
        );

        const element1 = getByText(/stage/i);
        fireEvent.click(element1);
        const element2 = await waitFor(() => getByText(/annotation/i));
        fireEvent.click(element2);
        const element3 = await waitFor(() => getByText(/validation/i));
        fireEvent.click(element3);
        const element4 = await waitFor(() => getByText(/acceptance/i));
        fireEvent.click(element4);
        fireEvent.click(element4);
        const element5 = await waitFor(() => getByText(/ok/i));
        fireEvent.click(element5);
        await expect(container.getElementsByClassName('filtered').length > 0).toBeTruthy();
        fireEvent.click(element1);
        const element6 = await waitFor(() => getByText(/reset/i));
        fireEvent.click(element6);
        await expect(container.getElementsByClassName('filtered').length > 0).toBeFalsy();
    });

    test('state 버튼을 클릭하면 드롭다운을 렌더링하고 checkbox를 클릭한 다음 ok버튼을 클릭하면 필터링되고 reset버튼을 누르면 초기화한다.', async () => {
        const { container, getByText } = render(
            <Provider store={store}>
                <TopBarComponent {...mockProps} />
            </Provider>,
        );

        const element1 = getByText(/state/i);
        fireEvent.click(element1);
        const element2 = await waitFor(() => getByText(/new/i));
        fireEvent.click(element2);
        const element3 = await waitFor(() => getByText(/in progress/i));
        fireEvent.click(element3);
        const element4 = await waitFor(() => getByText(/rejected/i));
        fireEvent.click(element4);
        const element5 = await waitFor(() => getByText(/completed/i));
        fireEvent.click(element5);
        fireEvent.click(element5);
        const element6 = await waitFor(() => getByText(/ok/i));
        fireEvent.click(element6);
        await expect(container.getElementsByClassName('filtered').length > 0).toBeTruthy();
        fireEvent.click(element1);
        const element7 = await waitFor(() => getByText(/reset/i));
        fireEvent.click(element7);
        await expect(container.getElementsByClassName('filtered').length > 0).toBeFalsy();
    });

    test('Stage 버튼을 클릭 후 Checkbox를 클릭하지 않고 ok버튼을 누르면 필터링 되지않는다.', async () => {
        const { container, getByText } = render(
            <Provider store={store}>
                <TopBarComponent {...mockProps} />
            </Provider>,
        );

        const element1 = getByText(/stage/i);
        fireEvent.click(element1);
        const element2 = await waitFor(() => getByText(/ok/i));
        fireEvent.click(element2);
        await expect(container.getElementsByClassName('filtered').length > 0).toBeFalsy();
    });

    test('State 버튼을 클릭 후 Checkbox를 클릭하지 않고 ok버튼을 누르면 필터링 되지않는다.', async () => {
        const { container, getByText } = render(
            <Provider store={store}>
                <TopBarComponent {...mockProps} />
            </Provider>,
        );
        const element1 = getByText(/state/i);
        fireEvent.click(element1);
        const element2 = await waitFor(() => getByText(/ok/i));
        fireEvent.click(element2);
        await expect(container.getElementsByClassName('filtered').length > 0).toBeFalsy();
    });
});
