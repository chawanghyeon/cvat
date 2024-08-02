import '@testing-library/jest-dom'
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import JobsContentComponent from '../components/jobs-page/jobs-content';
import { exportActions } from 'actions/export-actions';

const mockDataSource:any[] = [
    {
        key: 1,
        job: 19,
        projectName: null,
        taskName: null,
        worker: null,
        checker: null,
        size: {
            stopFrame: 0,
            startFrame: 30,
        },
        state: {
            state:'new'
        },
        stage: {
            stage: 'annotation',
        },
        actions: {
            taskId: 1,
            id: 2
        },
        etc: {
            taskId: 1,
            projectId: 2
        }
    },
    {
        key: 2,
        job: 10,
        projectName: null,
        taskName: '3dtest2',
        worker: null,
        checker: null,
        size: {
            stopFrame: 0,
            startFrame: 30,
        },
        state: {
            state:'new'
        },
        stage: {
            stage: 'annotation',
        },
        actions: {
            taskId: 1,
            id: 2
        },
        etc: {
            taskId: 1,
            projectId: 2
        }
    },
    {
        key: 3,
        job: 9,
        projectName: 'a',
        taskName: '3dtest2',
        worker: null,
        checker: null,
        size: {
            stopFrame: 0,
            startFrame: 30,
        },
        state: {
            state:'new'
        },
        stage: {
            stage: 'annotation',
        },
        actions: {
            taskId: 1,
            id: 2
        },
        etc: {
            taskId: 1,
            projectId: 2
        }
    },
    {
        key: 4,
        job: 8,
        projectName: 'a',
        taskName: 'imgtest',
        worker: {
            id: 1,
            username: 'agile',
            email: null,
            firstName: '',
            lastName: '',
            groups: null,
            lastLogin: null,
            dateJoined: null,
            isStaff: null,
            isSuperuser: null,
            isActive: null,
            isVerified: true
        },
        checker: {
            id: 1,
            username: 'agile',
            email: null,
            firstName: '',
            lastName: '',
            groups: null,
            lastLogin: null,
            dateJoined: null,
            isStaff: null,
            isSuperuser: null,
            isActive: null,
            isVerified: true
        },
        size: {
            stopFrame: 0,
            startFrame: 30,
        },
        state: {
            state:'new'
        },
        stage: {
            stage: 'annotation',
        },
        actions: {
            taskId: 1,
            id: 2
        },
        etc: {
            taskId: 1,
            projectId: 2
        }
    }
]

jest.mock('actions/export-actions', () => {
    const mockExportActions = {openExportDatasetModal:jest.fn()};
    return {
      exportActions: mockExportActions
    };
});

jest.mock('icons', () => ({
    DataDownloadIcon: jest.fn().mockReturnValue('DataDownloadIcon'),
    ExitIcon: jest.fn().mockReturnValue('ExitIcon'),
    JobActionIcon: jest.fn().mockReturnValue('JobActionIcon'),
 }));

const mockHistory = { push: jest.fn() };
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => mockHistory
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch
}));

describe('JobsContent 컴포넌트 테스트', () => {
  window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
  };

  test('Table wrapper 컴포넌트를 렌더링한다.', async () => {
    const {container} = render(
        <JobsContentComponent dataSource={mockDataSource} />
    );
    await expect(container.getElementsByClassName('cvat-jobs-page-list').length > 0).toBeTruthy();
  });

  test('테이블 헤더를 렌더링한다.', async () => {
    const {getByText} = render(
        <JobsContentComponent dataSource={mockDataSource} />
    );
    await expect(getByText(/Project Name/i)).toBeInTheDocument();
    await expect(getByText(/Task Name/i)).toBeInTheDocument();
    await expect(getByText(/Worker/i)).toBeInTheDocument();
    await expect(getByText(/Checker/i)).toBeInTheDocument();
    await expect(getByText(/Size/i)).toBeInTheDocument();
    await expect(getByText(/Stage/i)).toBeInTheDocument();
    await expect(getByText(/State/i)).toBeInTheDocument();
  });

  test('Props를 정상적으로 받아온다.', async () => {
    const {container} = render(
        <JobsContentComponent dataSource={mockDataSource} />
    );
    await expect(container.getElementsByClassName('cvat-jobs-table-row').length === mockDataSource.length).toBeTruthy();
  });

  test('action icon을 클릭하면 이동한다.', async () => {
    const {getAllByText} = render(
        <JobsContentComponent dataSource={mockDataSource} />
    );

    const element = getAllByText(/JobActionIcon/i)[0];
    fireEvent.click(element);
    await expect(element).not.toBeNull();
    await expect(mockHistory.push).toHaveBeenCalledTimes(1);
  });

  test('Table의 sorter 함수를 호출한다.', async () => {
    const {getByText,container} = render(
        <JobsContentComponent dataSource={mockDataSource} />
    );
    await expect(container.getElementsByClassName('ant-table-column-sort').length === 0).toBeTruthy();

    const element1 = getByText(/Project Name/i);
    fireEvent.click(element1);
    await expect(container.getElementsByClassName('ant-table-column-sort').length > 0).toBeTruthy();

    const element2 = getByText(/Task Name/i);
    fireEvent.click(element2);
    await expect(container.getElementsByClassName('ant-table-column-sort').length > 0).toBeTruthy();
  });

  test('dropdown 컴포넌트를 렌더링한다.', async () => {
    const { getByText, container } = render(
        <JobsContentComponent dataSource={mockDataSource} />
    );
    const moreButton = container.getElementsByClassName('cvat-job-card-more-button');
    await expect(moreButton.length > 0).toBeTruthy();
    fireEvent.mouseOver(moreButton[0]);
    await waitFor(() => expect(getByText(/go to Task/i)).toBeTruthy());
  });

  test('dropdown 버튼 클릭시 다른 페이지로 이동한다.', async () => {
    const { getByText, container } = render(
        <JobsContentComponent dataSource={mockDataSource} />
    );

    const moreButton = container.getElementsByClassName('cvat-job-card-more-button');
    await expect(moreButton.length > 0).toBeTruthy();
    fireEvent.mouseOver(moreButton[0]);

    const goToTaskButton = await waitFor(() => getByText(/go to Task/i));
    fireEvent.click(goToTaskButton);

    const goToProjectButton = await waitFor(() => getByText(/go to Project/i));
    fireEvent.click(goToProjectButton);

    await expect(mockHistory.push).toHaveBeenCalledTimes(3);
  });

  test('dropdown 버튼 클릭시 dispatch와 exportActions 함수를 호출한다.', async () => {
    const { getByText, container } = render(
        <JobsContentComponent dataSource={mockDataSource} />
    );
    const moreButton = container.getElementsByClassName('cvat-job-card-more-button');
    await expect(moreButton.length > 0).toBeTruthy();
    fireEvent.mouseOver(moreButton[0]);

    const exportJobButton = await waitFor(() => getByText(/Export job/i));
    fireEvent.click(exportJobButton);

    await expect(mockDispatch).toHaveBeenCalledTimes(1);
    await expect(exportActions.openExportDatasetModal).toHaveBeenCalledTimes(1);
  });
});

