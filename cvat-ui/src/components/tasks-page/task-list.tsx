import React from 'react';
import { Row, Col } from 'antd/lib/grid';

import ModelRunnerModal from 'components/model-runner-modal/model-runner-dialog';
import MoveTaskModal from 'components/move-task-modal/move-task-modal';
import TaskItem from 'containers/tasks-page/task-item';

export interface Props {
    currentTasksIndexes: number[];
}

function TaskListComponent(props: Props): JSX.Element {
    const { currentTasksIndexes } = props;
    const taskViews = currentTasksIndexes.map((tid, id): JSX.Element => (
        <Col span={6} key={tid}>
            <TaskItem idx={id} taskID={tid} />
        </Col>
    ));

    return (
        <>
            <Row justify='center' align='middle'>
                <Col className='cvat-tasks-list' md={22} lg={20} xl={18} xxl={14}>
                    <Row className='cvat-tasks-lists' gutter={[32, 32]}>
                        {taskViews}
                    </Row>
                </Col>
            </Row>
            <ModelRunnerModal />
            <MoveTaskModal />
        </>
    );
}

export default React.memo(TaskListComponent, (prev: Props, cur: Props) => (
    prev.currentTasksIndexes.length !== cur.currentTasksIndexes.length || prev.currentTasksIndexes
        .some((val: number, idx: number) => val !== cur.currentTasksIndexes[idx])
));
