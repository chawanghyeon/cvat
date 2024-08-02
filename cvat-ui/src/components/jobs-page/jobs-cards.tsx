import './styles.scss';
import React, {
    useCallback, useEffect, useRef,
} from 'react';
import {
    Row, Col, Card, Typography, Carousel, Empty,
} from 'antd';
import { LeftCircleTwoTone, PlayCircleOutlined, RightCircleTwoTone } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { CombinedState } from 'reducers';
import { getTasksIssuesAsync } from 'actions/tasks-actions';

const { Text } = Typography;

interface CarouselData {
    imgUrl: string | null;
    task_id: number;
    task_name: string;
    job_id: number;
    frame: number;
    message: string;
    resolved: boolean;
}

function JobsCards(): JSX.Element {
    const history = useHistory();
    const dispatch = useDispatch();
    const carouselRef = useRef<any>(null);
    const { id, isStaff, isSuperuser } = useSelector((state: CombinedState) => state.auth.user);
    const rejectedJobs = useSelector((state: CombinedState) => state.tasks.issues);

    useEffect(() => {
        if (!isStaff && !isSuperuser && Number(id) > 0) dispatch(getTasksIssuesAsync(id));
    }, [id, isStaff, isSuperuser, dispatch]);

    const handlePrev = useCallback((): void => carouselRef.current.prev(), []);
    const handleNext = useCallback((): void => carouselRef.current.next(), []);

    const handleSlideShow = useCallback((all?:number):number => {
        let showNumber = 0;
        rejectedJobs.forEach((issue:any) => {
            if (issue.resolved === false) showNumber++;
        });
        if (all === 1) return showNumber;
        if (showNumber > 4) return 4;
        return showNumber;
    }, [rejectedJobs]);

    return (
        <>
            {!isStaff && !isSuperuser && handleSlideShow() > 0 && (
                <Row justify='center' align='middle'>
                    <Card
                        style={{ position: 'relative' }}
                        title={(
                            <Text className='cvat-text-color cvat-jobs-header'>
                                Rejected Jobs :&nbsp;&nbsp;
                                {rejectedJobs.length > 0 ? handleSlideShow(1) : 0}
                            </Text>
                        )}
                    >
                        <LeftCircleTwoTone
                            style={{
                                position: 'absolute', left: -50, top: '52%', fontSize: 45, zIndex: 100,
                            }}
                            twoToneColor='lightgray'
                            onClick={handlePrev}
                        />
                        <RightCircleTwoTone
                            style={{
                                position: 'absolute', right: -40, top: '52%', fontSize: 45, zIndex: 100,
                            }}
                            twoToneColor='lightgray'
                            onClick={handleNext}
                        />
                        <Carousel touchThreshold={50} effect='scrollx' slidesToShow={4} draggable ref={carouselRef}>
                            {rejectedJobs.length > 0 && handleSlideShow() > 0 && (
                                rejectedJobs.map((i:CarouselData, idx:number):any => (
                                    !i.resolved && (
                                        <Card
                                            key={idx}
                                            cover={(
                                                <div
                                                    style={{
                                                        width: '99.5%',
                                                        height: 220,
                                                        backgroundImage:
                                                            `linear-gradient(rgba(0, 0, 0, 0),
                                                            rgba(0, 0, 0, 0)),
                                                            url(
                                                            ${URL
                                                    .createObjectURL(
                                                        rejectedJobs[idx].imgUrl,
                                                    )}
                                                            )`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center center',
                                                        backgroundColor: 'white',
                                                        marginLeft: 1,
                                                        marginRight: 1,
                                                    }}
                                                />
                                            )}
                                            actions={[
                                                <Row
                                                    justify='center'
                                                    onClick={() => {
                                                        history.push(
                                                            `tasks/${i.task_id}/jobs/${i.job_id}/frame/${i.frame}`,
                                                        );
                                                    }}
                                                >
                                                    <span>
                                                        Action
                                                        &nbsp;&nbsp;&nbsp;
                                                    </span>
                                                    <PlayCircleOutlined />
                                                </Row>,
                                            ]}
                                        >
                                            <Row justify='center' align='middle' gutter={12}>
                                                <Col>
                                                    Job ID  :
                                                    <br />
                                                    Frame  :
                                                    <br />
                                                </Col>
                                                <Col>
                                                    {i.job_id}
                                                    <br />
                                                    {i.frame}
                                                    <br />
                                                </Col>
                                            </Row>
                                        </Card>
                                    )
                                ))
                            )}

                            {4 - handleSlideShow() > 0 && (
                                Array.from({ length: 4 - handleSlideShow() }, (_, index) => (
                                    <Card
                                        key={index}
                                        cover={(
                                            <div style={{ height: 300, verticalAlign: 'middle', color: 'white' }}>
                                                <Empty />
                                            </div>
                                        )}
                                    />
                                ))
                            )}
                        </Carousel>
                    </Card>
                </Row>
            )}
        </>
    );
}

export default JobsCards;
